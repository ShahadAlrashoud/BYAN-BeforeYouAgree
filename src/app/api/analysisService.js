import { detectRiskClauses } from "../../../nlp/extractClauses";
import { scoreRisk } from "../../../nlp/riskScorer";
import { createAnalysis, saveResult } from "@/database/db";
import { validateFindings, scoreFromFindings } from "../../../nlp/evidenceValidator";

const MAX_AI_CHARS = 12000;

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

async function assessWithAI(policyText, lang) {
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

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: "openai/gpt-oss-120b",
            temperature: 0,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: policyText.slice(0, MAX_AI_CHARS) }
            ],
            response_format: { type: "json_object" }
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("AI returned an unexpected response.");

    return JSON.parse(content);
}

// Shared by URL and text analysis: scores, builds the record, and saves it
async function buildAndSaveRecord({ policyText, url, resolvedUrl, preferredLang, userId }) {
    const lang = detectLanguage(policyText);

    let ai = null;
    try {
        ai = await assessWithAI(policyText, lang);
    } catch (error) {
        console.error("AI ANALYSIS ERROR:", error);
    }

    let analysisSource = "ai";
    let rawFindings = Array.isArray(ai?.findings) ? ai.findings : null;
    let summary = typeof ai?.summary === "string" ? ai.summary.trim() : "";

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
        coverage: {
            analyzedChars: Math.min(policyText.length, MAX_AI_CHARS),
            totalChars: policyText.length
        },
        createdAt: new Date().toISOString()
    };

    await saveResult(record);

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

export async function runAnalysisForUrl(rawUrl, preferredLang = "en", userId = null) {
    const url = normalizeUrl(rawUrl);

    if (!isValidHttpUrl(url)) {
        throw new Error("Invalid URL");
    }

    const { text: policyText, resolvedUrl } = await fetchPolicyText(url);

    return buildAndSaveRecord({ policyText, url, resolvedUrl, preferredLang, userId });
}

export async function runAnalysisForText(text, preferredLang = "en", userId = null) {
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
        userId
    });
}