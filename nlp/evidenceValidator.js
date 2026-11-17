// Verifies that every finding is backed by text that really exists in the policy.

const MIN_QUOTE_CHARS = 25;
const MIN_QUOTE_TOKENS = 5;
const FUZZY_THRESHOLD = 0.85; // 85% of the quote's words must appear in one window of the policy
const MAX_FINDINGS = 30;

// Sentence extension limits
const MAX_EXTEND_CHARS = 400;   // how far to look back/forward for a sentence boundary
const MAX_EVIDENCE_CHARS = 700; // if the full sentence is longer, keep the original quote

// The server decides the weights, not the AI
export const SEVERITY_WEIGHTS = { high: 20, medium: 10, low: 4 };

const STRIP_CHARS = /[\p{M}\u0640\u200c-\u200f]/u; // diacritics, tatweel, zero-width chars
const WORD_CHAR = /[\p{L}\p{N}]/u;

function foldChar(ch) {
    if ("أإآٱ".includes(ch)) return "ا";
    if (ch === "ى") return "ي";
    if (ch === "ة") return "ه";
    return ch.toLowerCase();
}

// Normalizes text and maps each normalized char back to its position in the original
export function normalizeWithMap(input = "") {
    let norm = "";
    const map = [];
    let lastWasSpace = true;

    for (let i = 0; i < input.length; i++) {
        const raw = input[i];
        if (STRIP_CHARS.test(raw)) continue;
        const folded = foldChar(raw);

        if (!WORD_CHAR.test(folded)) {
            if (!lastWasSpace) {
                norm += " ";
                map.push(i);
                lastWasSpace = true;
            }
            continue;
        }
        for (const c of folded) {
            norm += c;
            map.push(i);
        }
        lastWasSpace = false;
    }

    if (norm.endsWith(" ")) {
        norm = norm.slice(0, -1);
        map.pop();
    }
    return { norm, map };
}

function tokenize(norm) {
    const tokens = [];
    const re = /\S+/g;
    let m;
    while ((m = re.exec(norm)) !== null) {
        tokens.push({ t: m[0], start: m.index, end: m.index + m[0].length });
    }
    return tokens;
}

function createPolicyIndex(text) {
    const { norm, map } = normalizeWithMap(text);
    return { original: text, norm, map, tokens: tokenize(norm) };
}

// Converts a normalized range to [start, end) offsets in the original policy text
function originalOffsets(index, startNorm, endNorm) {
    return {
        start: index.map[startNorm],
        end: index.map[endNorm - 1] + 1
    };
}

// ---------- Sentence extension ----------

const TERMINATORS = ".!?؟";
const CLOSERS = /["'”’»)\]]/;
const ABBREVIATION = /(?:\b(?:e\.g|i\.e|etc|vs|inc|ltd|corp|mr|mrs|ms|dr|u\.s|u\.k)|\b[A-Za-z])$/i;

// True if the character at position i ends a sentence
function isBoundary(text, i) {
    const ch = text[i];
    if (ch === "\n") return true;
    if (!TERMINATORS.includes(ch)) return false;

    const next = text[i + 1];
    // "3.5", "snap.com", "e.g.x" are not sentence ends
    if (next !== undefined && !/\s/.test(next) && !CLOSERS.test(next)) return false;
    // "e.g.", "Inc.", "U.S." are not sentence ends
    if (ch === "." && ABBREVIATION.test(text.slice(Math.max(0, i - 6), i))) return false;
    return true;
}

// Extends [start, end) to the full sentence(s) that contain it. Returns null if no clean boundary is found.
function expandToSentence(text, start, end) {
    let s = start;
    const minS = Math.max(0, start - MAX_EXTEND_CHARS);
    while (s > minS && !isBoundary(text, s - 1)) s--;
    if (s === minS && minS > 0 && !isBoundary(text, s - 1)) return null;

    let e = end;
    const maxE = Math.min(text.length, end + MAX_EXTEND_CHARS);
    while (e < maxE && !isBoundary(text, e - 1)) e++;
    if (e === maxE && maxE < text.length && !isBoundary(text, e - 1)) return null;

    // Include closing quotes/brackets right after the terminator
    while (e < text.length && CLOSERS.test(text[e])) e++;

    return { start: s, end: e };
}

// Returns the evidence text: the full sentence when possible, otherwise the exact matched span
function buildEvidence(index, startNorm, endNorm) {
    const { start, end } = originalOffsets(index, startNorm, endNorm);
    const exact = index.original.slice(start, end).trim();

    const sentence = expandToSentence(index.original, start, end);
    if (!sentence) return { evidence: exact, expanded: false };

    const full = index.original.slice(sentence.start, sentence.end).replace(/\s+/g, " ").trim();
    if (!full || full.length > MAX_EVIDENCE_CHARS) return { evidence: exact, expanded: false };

    return { evidence: full, expanded: full.length > exact.length };
}

// ---------- Matching ----------

// Sliding window over policy words: finds the window that best matches the quote's words
function fuzzyFind(index, quoteTokens) {
    const n = quoteTokens.length;
    const P = index.tokens;
    if (P.length < n) return null;

    const need = new Map();
    for (const t of quoteTokens) need.set(t, (need.get(t) || 0) + 1);

    const have = new Map();
    let matches = 0;
    const add = (t) => {
        const h = have.get(t) || 0;
        if (h < (need.get(t) || 0)) matches++;
        have.set(t, h + 1);
    };
    const remove = (t) => {
        const h = have.get(t) - 1;
        have.set(t, h);
        if (h < (need.get(t) || 0)) matches--;
    };

    let best = { score: 0, at: -1 };
    for (let i = 0; i < P.length; i++) {
        add(P[i].t);
        if (i >= n) remove(P[i - n].t);
        if (i >= n - 1) {
            const score = matches / n;
            if (score > best.score) best = { score, at: i - n + 1 };
        }
    }

    if (best.score < FUZZY_THRESHOLD) return null;
    return {
        score: best.score,
        startNorm: P[best.at].start,
        endNorm: P[best.at + n - 1].end
    };
}

function verifyEvidence(index, quote) {
    const q = normalizeWithMap(String(quote || "")).norm;
    const qTokens = q ? q.split(" ") : [];

    if (q.length < MIN_QUOTE_CHARS || qTokens.length < MIN_QUOTE_TOKENS) {
        return { verified: false, reason: "quote_too_short" };
    }

    const at = index.norm.indexOf(q);
    if (at !== -1) {
        const { evidence, expanded } = buildEvidence(index, at, at + q.length);
        return { verified: true, matchType: "exact", matchScore: 1, evidence, expanded };
    }

    const fuzzy = fuzzyFind(index, qTokens);
    if (fuzzy) {
        const { evidence, expanded } = buildEvidence(index, fuzzy.startNorm, fuzzy.endNorm);
        return {
            verified: true,
            matchType: "fuzzy",
            matchScore: Math.round(fuzzy.score * 100) / 100,
            evidence,
            expanded
        };
    }

    return { verified: false, reason: "not_found_in_policy" };
}

function severityFromWeight(w) {
    const n = Number(w) || 0;
    if (n >= 15) return "high";
    if (n >= 8) return "medium";
    return "low";
}

function sanitizeFinding(raw) {
    if (!raw || typeof raw !== "object") return null;
    const str = (v, max = 600) => (typeof v === "string" ? v.trim().slice(0, max) : "");

    const sev = String(raw.severity || "").toLowerCase();
    const severity = ["high", "medium", "low"].includes(sev) ? sev : severityFromWeight(raw.riskWeight);

    return {
        category: str(raw.category, 80) || "Other",
        clauseRef: str(raw.clauseRef, 80) || null,
        evidenceQuote: str(raw.evidenceQuote, 800),
        plainExplanation: str(raw.plainExplanation),
        riskReason: str(raw.riskReason),
        suggestedAction: str(raw.suggestedAction),
        severity,
        riskWeight: SEVERITY_WEIGHTS[severity]
    };
}

export function validateFindings(policyText, rawFindings = []) {
    const index = createPolicyIndex(policyText);
    const verified = [];
    const rejected = [];
    const seen = new Set();

    const findings = (Array.isArray(rawFindings) ? rawFindings : [])
        .map(sanitizeFinding)
        .filter(Boolean)
        .sort((a, b) => b.riskWeight - a.riskWeight) // keep the most severe when duplicates exist
        .slice(0, MAX_FINDINGS);

    for (const f of findings) {
        const check = verifyEvidence(index, f.evidenceQuote);

        if (!check.verified) {
            rejected.push({ ...f, verified: false, rejectReason: check.reason });
            continue;
        }

        // Two quotes from the same sentence now count as one finding (most severe kept)
        const key = normalizeWithMap(check.evidence).norm;
        if (seen.has(key)) continue;
        seen.add(key);

        verified.push({
            ...f,
            verified: true,
            evidence: check.evidence, // full sentence taken from the policy itself
            evidenceExpanded: check.expanded,
            matchType: check.matchType,
            matchScore: check.matchScore
        });
    }

    return { verified, rejected };
}

// Only verified findings reach this function
export function scoreFromFindings(verifiedFindings = []) {
    const total = verifiedFindings.reduce((sum, f) => sum + (f.riskWeight || 0), 0);
    const riskScore = Math.min(100, Math.round(total));
    const riskLevel = riskScore >= 60 ? "High Risk" : riskScore >= 30 ? "Moderate Risk" : "Safe";
    return { riskScore, riskLevel };
}