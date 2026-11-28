import { detectRiskClauses } from "../../../nlp/extractClauses";
import { scoreRisk } from "../../../nlp/riskScorer";
import { createAnalysis, saveResult } from "@/database/db";
import { validateFindings, scoreFromFindings } from "../../../nlp/evidenceValidator";
import { ANALYSIS_VERSION, aiFlags, aiLimits, providerConfig, TIERS, tierVersion } from "@/lib/aiConfig";
import { AiError, callAiChat } from "@/lib/aiClient";
import { urlCacheKey, urlHash } from "@/lib/urlKey";
import {
    findCachedRecord,
    storeCachedRecord,
    serveCachedRecord,
    logAnalysisEvent,
    recordUsage,
    getTodayUsage,
} from "@/database/aiDb";

function secondsUntilUtcMidnight() {
    const now = new Date();
    const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
    return Math.max(60, Math.ceil((next - now.getTime()) / 1000));
}

// Before each model call: stops when today's analysis tokens reached DAILY_TOKEN_BUDGET.
// Only active when FLAG_TOKEN_BUDGET is on and a budget is set. If the usage table cannot be read,
// it lets the request through (and logs that it failed) instead of taking the whole site down.
// Note: requests that run at the same moment can overshoot the budget slightly; that is why the budget
// must leave headroom under the provider's daily limit.
async function assertWithinBudget(flags) {
    if (!flags.tokenBudget) return;
    const { dailyTokenBudget } = aiLimits();
    if (!dailyTokenBudget) return;
    let used;
    try {
        used = (await getTodayUsage("analysis")).tokens;
    } catch {
        console.error("AI BUDGET CHECK FAILED");
        return;
    }
    if (used >= dailyTokenBudget) {
        throw new AiError("budget", "Daily token budget reached.", { retryAfterSeconds: secondsUntilUtcMidnight() });
    }
}

// Records the tokens of one model response (FLAG_TOKEN_BUDGET). Never stores text or the full URL.
async function logUsage(flags, { usage, method, hash }) {
    if (!flags.tokenBudget || !usage) return;
    try {
        await recordUsage({ kind: "analysis", method, urlHash: hash, usage });
    } catch {
        console.error("AI USAGE LOG FAILED");
    }
}

function isValidHttpUrl(value) {
    try {
        const parsed = new URL(value);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        return false;
    }
}

function normalizeUrl(value) {
    let input = (value || "").trim();
    if (!input) return input;

    // Handle protocol-relative URLs like //example.com
    if (input.startsWith("//")) input = "https:" + input;

    // Add https:// when no scheme is given
    if (!/^[a-z][a-z\d+\-.]*:\/\//i.test(input)) {
        input = "https://" + input;
    }

    return input;
}

const POLICY_KEYWORDS = [
    "terms of service",
    "terms and conditions",
    "terms of use",
    "privacy policy",
    "privacy notice",
    "tos",
    "legal",
    "privacy"
];

const FALLBACK_PATHS = [
    "/privacy",
    "/privacy-policy",
    "/legal/privacy",
    "/terms",
    "/terms-of-service",
    "/tos",
    "/legal/terms",
    "/legal"
];

function buildHeaders(url) {
    const isArabicHint = /[?&]hl=ar\b/i.test(url) || /\/ar\//i.test(url);
    return {
        "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": isArabicHint ? "ar,en;q=0.5" : "en-US,en;q=0.9"
    };
}

async function fetchHtml(url) {
    let response;
    try {
        response = await fetch(url, { headers: buildHeaders(url) });
    } catch {
        throw new Error("BLOCKED: This site could not be reached automatically.");
    }

    if (!response.ok) {
        if ([403, 429, 503].includes(response.status)) {
            throw new Error("BLOCKED: This site is blocking automated requests.");
        }
        throw new Error(`Could not fetch the page (status ${response.status}).`);
    }
    return response.text();
}

function htmlToText(html) {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

// Decodes common HTML entities found in attribute values (e.g. &amp; -> &)
function decodeHtmlEntities(str) {
    return str
        .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
        .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
        .replace(/&quot;/gi, '"')
        .replace(/&apos;/gi, "'")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&amp;/gi, "&");
}

// Scans the homepage HTML for a link that looks like a ToS / Privacy Policy page
function findPolicyLink(html, baseUrl) {
    const anchorRegex = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    const candidates = [];

    while ((match = anchorRegex.exec(html)) !== null) {
        const href = decodeHtmlEntities(match[1]);
        const text = match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
        const hrefLower = href.toLowerCase();

        const score = POLICY_KEYWORDS.reduce((acc, kw) => {
            if (text.includes(kw)) acc += 2;
            if (hrefLower.includes(kw.replace(/\s+/g, ""))) acc += 1;
            if (hrefLower.includes(kw.replace(/\s+/g, "-"))) acc += 1;
            return acc;
        }, 0);

        if (score > 0) {
            candidates.push({ href, score });
        }
    }

    if (candidates.length === 0) return null;

    candidates.sort((a, b) => b.score - a.score || a.href.length - b.href.length);

    try {
        return new URL(candidates[0].href, baseUrl).toString();
    } catch {
        return null;
    }
}

// Tries a list of common policy URL paths against the site's origin
async function tryFallbackPaths(baseUrl) {
    let origin;
    try {
        origin = new URL(baseUrl).origin;
    } catch {
        return null;
    }

    for (const path of FALLBACK_PATHS) {
        const candidateUrl = origin + path;
        try {
            const response = await fetch(candidateUrl, {
                method: "GET",
                headers: buildHeaders(candidateUrl)
            });
            if (response.ok) {
                const html = await response.text();
                if (html && html.length > 200) {
                    return { url: candidateUrl, html };
                }
            }
        } catch {
            // Ignore and try the next path
        }
    }

    return null;
}

async function fetchPolicyText(url) {
    const homepageHtml = await fetchHtml(url);

    const policyUrl = findPolicyLink(homepageHtml, url);

    if (policyUrl && policyUrl !== url) {
        try {
            const policyHtml = await fetchHtml(policyUrl);
            return { text: htmlToText(policyHtml), resolvedUrl: policyUrl };
        } catch {
            // Fall back to trying common paths below
        }
    }

    const fallback = await tryFallbackPaths(url);
    if (fallback) {
        return { text: htmlToText(fallback.html), resolvedUrl: fallback.url };
    }

    return { text: htmlToText(homepageHtml), resolvedUrl: url };
}

function detectLanguage(text) {
    const arabicMatches = text.match(/[\u0600-\u06FF]/g) || [];
    const ratio = arabicMatches.length / Math.max(text.length, 1);
    return ratio > 0.08 ? "ar" : "en";
}

// tier: "free" (Groq, first FREE_MAX_CHARS characters) or "full" (OpenAI, up to FULL_MAX_CHARS).
async function assessWithAI(policyText, lang, tier = "free") {
    const { provider, maxChars } = TIERS[tier];

    const languageInstruction =
        lang === "ar"
            ? `Write "summary", "category", "plainExplanation", "riskReason" and "suggestedAction" in Modern Standard Arabic. "evidenceQuote" must stay EXACTLY as written in the policy.`
            : `Write "summary", "category", "plainExplanation", "riskReason" and "suggestedAction" in English. "evidenceQuote" must stay EXACTLY as written in the policy.`;

    const systemPrompt = `You are a privacy-policy risk analyst. You ONLY report risks that are explicitly stated in the policy text provided by the user.

${languageInstruction}

STRICT EVIDENCE RULES:
1. Every finding MUST include "evidenceQuote": an exact, verbatim, contiguous copy of 1-3 sentences from the policy (max 400 characters), in the policy's original language. Do NOT paraphrase, translate, shorten with "...", merge separate sentences, or fix typos.
2. If you cannot point to an exact sentence that supports a risk, DO NOT include that risk.
3. Do NOT infer, assume or speculate. Do not report risks based on what the policy does NOT mention, on general industry practice, or on what the company "might" do. Missing information is not a finding.
4. "clauseRef" must be a section number or heading exactly as visible in the policy, or null. Never invent one.
5. Report each distinct practice only once.
6. The summary must only describe the findings you listed.
7. If no risks are supported by the text, return an empty "findings" array.

SEVERITY GUIDE:
- high: selling personal data; sharing with third parties for advertising/profiling; cross-site tracking; indefinite retention; collecting or sharing sensitive data (health, biometrics, precise location, children's data); waiving user rights; changing terms without notice.
- medium: sharing with partners/affiliates; analytics/advertising cookies; vague or long retention; transfers to other countries; limited user control over data.
- low: minor or common practices that still deserve the user's attention.

FIELD GUIDANCE:
- plainExplanation: 1-2 short sentences in simple everyday language explaining what the clause means for the user.
- riskReason: why THIS wording is a risk, referring to specific words in the quote.
- suggestedAction: one concrete action or question for the user (e.g. "Turn off ad personalization in account settings" or "Ask the company: which third parties receive my location data?").

Return ONLY valid JSON in this exact format:
{
  "summary": string,
  "findings": [
    {
      "category": string,
      "clauseRef": string | null,
      "evidenceQuote": string,
      "plainExplanation": string,
      "riskReason": string,
      "suggestedAction": string,
      "severity": "low" | "medium" | "high"
    }
  ]
}`;

    // Same request for either provider; callAiChat adds the 429 retry when FLAG_AI_RELIABILITY is on
    const body = {
        model: providerConfig(provider).model,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: policyText.slice(0, maxChars) }
        ],
        response_format: { type: "json_object" }
    };
    // temperature is sent to Groq only; some reasoning models reject it
    if (provider === "groq") body.temperature = 0;
    // OpenAI only, optional: none | low | medium | high | xhigh | max
    if (provider === "openai" && process.env.OPENAI_REASONING_EFFORT) {
        body.reasoning_effort = process.env.OPENAI_REASONING_EFFORT;
    }

    const data = await callAiChat(body, provider);

    const usage = data?.usage || null;
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
        const err = new AiError("invalid_response", "AI returned an unexpected response.");
        err.usage = usage; // the tokens were spent even though the answer is unusable
        throw err;
    }

    try {
        return { parsed: JSON.parse(content), usage };
    } catch {
        const err = new AiError("invalid_response", "AI returned invalid JSON.");
        err.usage = usage;
        throw err;
    }
}

// Shared by URL and text analysis: scores, builds the record, and saves it
// cacheKey is set only for URL analyses (never for screenshots) and is used to store the result in the cache.
async function buildAndSaveRecord({ policyText, url, resolvedUrl, preferredLang, userId, cacheKey = null, tier = "free" }) {
    const lang = detectLanguage(policyText);
    const flags = aiFlags();
    const hash = urlHash(cacheKey);
    const { maxChars } = TIERS[tier];

    // Daily token budget: when it is reached this throws and NO model call is made
    await assertWithinBudget(flags);

    let ai = null;
    let usage = null;
    let aiFailure = null;
    try {
        const out = await assessWithAI(policyText, lang, tier);
        ai = out.parsed;
        usage = out.usage;
    } catch (error) {
        aiFailure = error;
        usage = error?.usage || null;
        // Only the kind and status are logged: never the provider's error body or any analysis text
        console.error("AI ANALYSIS ERROR:", error?.kind || "unknown", error?.status || "");
    }

    let analysisSource = "ai";
    let analysisReason = "ai";
    let rawFindings = Array.isArray(ai?.findings) ? ai.findings : null;
    let summary = typeof ai?.summary === "string" ? ai.summary.trim() : "";

    // FLAG_AI_RELIABILITY on: a 429 that survived the retries returns the busy response, and any other
    // AI error returns "unavailable" unless ALLOW_KEYWORD_FALLBACK is on. No keyword result otherwise.
    const mustFail = !rawFindings && flags.aiReliability && (aiFailure?.kind === "rate_limited" || !flags.allowKeywordFallback);
    if (!rawFindings) {
        analysisReason = !aiFailure
            ? "fallback_used"
            : aiFailure.kind === "rate_limited" ? "rate_limited" : "provider_error";
    }

    // Tokens are recorded even when the answer was unusable, because the provider counted them
    await logUsage(flags, { usage, method: rawFindings || mustFail ? "ai" : "keyword", hash });

    if (mustFail) {
        throw aiFailure instanceof AiError ? aiFailure : new AiError("provider_error", "AI analysis failed.");
    }

    // Fallback: keyword detection, which goes through the same evidence check
    if (!rawFindings) {
        analysisSource = "keyword";
        const keywordClauses = detectRiskClauses(policyText);
        rawFindings = keywordClauses.map((c) => ({
            category: c.category,
            evidenceQuote: c.text,
            riskWeight: c.riskWeight,
            plainExplanation: "",
            riskReason: "",
            suggestedAction: ""
        }));
        summary = scoreRisk(keywordClauses).summaryEn || "";
    }

    const { verified, rejected } = validateFindings(policyText, rawFindings);
    const { riskScore, riskLevel } = scoreFromFindings(verified);

    // "clauses" keeps its old shape (category/text/riskWeight) so the comparison and translation still work
    const clauses = verified.map((f) => ({
        ...f,
        text: f.plainExplanation || f.evidence
    }));

    const record = {
        id: crypto.randomUUID(),
        userId,
        url,
        resolvedUrl,
        lang,
        preferredLang,
        riskScore,
        riskLevel,
        summaryEn: summary,
        clauses,                      // verified only, counted in the score
        rejectedFindings: rejected,   // no textual evidence, NOT counted
        analysisSource,
        analysisTier: tier,
        // FLAG_SHOW_METHOD: which method made this result and why
        ...(flags.showMethod ? { analysisMethod: analysisSource, analysisReason } : {}),
        // FLAG_RESULT_CACHE: the date of the analysis, and whether it was served from the cache
        ...(flags.resultCache ? { analyzedAt: new Date().toISOString(), fromCache: false, analysisVersion: ANALYSIS_VERSION } : {}),
        coverage: {
            analyzedChars: Math.min(policyText.length, maxChars),
            totalChars: policyText.length
        },
        createdAt: new Date().toISOString()
    };

    await saveResult(record);

    // Cache only a good AI result: not a keyword (degraded) result, not an empty one, never a screenshot
    const isEmptyResult = policyText.length < 50 || (clauses.length === 0 && !summary);
    if (flags.resultCache && cacheKey && analysisSource === "ai" && !isEmptyResult) {
        try {
            await storeCachedRecord({ urlKey: cacheKey, version: tierVersion(tier), record });
            await logAnalysisEvent(cacheKey, tierVersion(tier), "model");
        } catch {
            console.error("RESULT CACHE STORE FAILED");
        }
    }

    if (userId) {
        await createAnalysis({
            id: record.id,
            userId: record.userId,
            title: record.resolvedUrl || record.url,
            query: record.url,
            result: record.summaryEn,
            riskScore: record.riskScore,
            riskLevel: record.riskLevel,
        });
    }

    return record;
}

// The cache check. The analyze route calls this FIRST, before any fetch, model call or AI rate limit.
// Returns { url, cacheKey, record }: record is the new result served from the cache, or null.
// Any cache error is treated as a miss, so a cache problem never blocks an analysis.
// Each tier reads only its own cache entries, so a free visitor never receives a full result.
export async function lookupCachedAnalysis(rawUrl, preferredLang = "en", userId = null, tier = "free") {
    const url = normalizeUrl(rawUrl);
    if (!isValidHttpUrl(url)) return { url, cacheKey: null, record: null };

    const cacheKey = urlCacheKey(url);
    if (!cacheKey || !aiFlags().resultCache) return { url, cacheKey, record: null };

    try {
        const cached = await findCachedRecord(cacheKey, tierVersion(tier), aiLimits().cacheTtlDays);
        if (!cached) return { url, cacheKey, record: null };
        const record = await serveCachedRecord(cached, {
            url,
            preferredLang,
            userId,
            reused: aiFlags().reuseCached,
        });
        await logAnalysisEvent(cacheKey, tierVersion(tier), "cache");
        return { url, cacheKey, record };
    } catch {
        console.error("RESULT CACHE LOOKUP FAILED");
        return { url, cacheKey, record: null };
    }
}

export async function runAnalysisForUrl(rawUrl, preferredLang = "en", userId = null, tier = "free") {
    const url = normalizeUrl(rawUrl);

    if (!isValidHttpUrl(url)) {
        throw new Error("Invalid URL");
    }

    const cacheKey = aiFlags().resultCache ? urlCacheKey(url) : null;

    const { text: policyText, resolvedUrl } = await fetchPolicyText(url);

    return buildAndSaveRecord({ policyText, url, resolvedUrl, preferredLang, userId, cacheKey, tier });
}

export async function runAnalysisForText(text, preferredLang = "en", userId = null, tier = "free") {
    const policyText = (text || "").replace(/\s+/g, " ").trim();

    if (policyText.length < 50) {
        throw new Error("Not enough text to analyze.");
    }

    // Screenshots have no URL, so use a placeholder label
    const label = "Screenshot";

    return buildAndSaveRecord({
        policyText,
        url: label,
        resolvedUrl: label,
        preferredLang,
        userId,
        tier
    });
}