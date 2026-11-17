import { NextResponse } from "next/server";

// Only these fields are sent to the AI. Evidence / original policy text is NEVER translated.
const TRANSLATABLE_FIELDS = ["category", "text", "plainExplanation", "riskReason", "suggestedAction"];
const MAX_CLAUSES = 40;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Calls Groq. On a 429, waits as long as Groq asks and retries, up to a limit.
async function callGroq(payload, { maxRetries = 2, maxWaitMs = 25000 } = {}) {
    for (let attempt = 0; ; attempt++) {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) return response.json();

        const errorText = await response.text();
        if (response.status !== 429 || attempt >= maxRetries) {
            throw new Error(`Translate API error (${response.status}): ${errorText}`);
        }

        const headerSec = Number(response.headers.get("retry-after"));
        const msgMatch = errorText.match(/try again in ([\d.]+)s/i);
        const waitSec = headerSec || (msgMatch ? parseFloat(msgMatch[1]) : 5);
        const waitMs = Math.ceil((waitSec + 0.5) * 1000);

        if (waitMs > maxWaitMs) throw new Error(`Translate API error (429): ${errorText}`);
        console.warn(`Groq rate limit (translate), retrying in ${waitMs}ms (attempt ${attempt + 1})`);
        await sleep(waitMs);
    }
}

function pickTranslatable(clause) {
    const out = {};
    for (const key of TRANSLATABLE_FIELDS) {
        if (typeof clause?.[key] === "string" && clause[key].trim()) out[key] = clause[key];
    }
    return out;
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { summaryEn, clauses, targetLang } = body || {};

        if (!["ar", "en"].includes(targetLang) || !Array.isArray(clauses) || typeof summaryEn !== "string") {
            return NextResponse.json(
                { error: "summaryEn (string), clauses (array), and targetLang ('ar' | 'en') are required." },
                { status: 400 }
            );
        }

        const safeClauses = clauses.slice(0, MAX_CLAUSES);

        if (!summaryEn.trim() && safeClauses.length === 0) {
            return NextResponse.json({ summaryEn: "", clauses: [] }, { status: 200 });
        }

        const languageName = targetLang === "ar" ? "Arabic (Modern Standard Arabic)" : "English";

        const payload = {
            summary: summaryEn,
            items: safeClauses.map((c, i) => ({ i, ...pickTranslatable(c) }))
        };

        const data = await callGroq({
            model: "openai/gpt-oss-120b",
            temperature: 0,
            reasoning_effort: "low",
            max_completion_tokens: 4000,
            messages: [
                {
                    role: "system",
                    content: `You are a professional translator for privacy-policy analysis results. Translate the given JSON into ${languageName}.

RULES:
- Translate ONLY the string values of: "summary", "category", "text", "plainExplanation", "riskReason", "suggestedAction".
- Keep every item's "i" value exactly as given (as a number). Do not add, remove, merge, or reorder items.
- If a field is missing in an item, leave it missing. Do not invent content.
- Keep the meaning exact. Do not add commentary, opinions, or new information.
- Use simple, clear everyday language.
- Keep proper nouns, company names, product names, URLs, and section numbers unchanged.

Return ONLY valid JSON in this format:
{
  "summary": string,
  "items": [
    { "i": number, "category": string, "text": string, "plainExplanation": string, "riskReason": string, "suggestedAction": string }
  ]
}`
                },
                { role: "user", content: JSON.stringify(payload) }
            ],
            response_format: { type: "json_object" }
        });

        const content = data.choices?.[0]?.message?.content;
        if (!content) throw new Error("Translation returned an empty response.");

        let parsed;
        try {
            parsed = JSON.parse(content);
        } catch {
            throw new Error("Translation returned invalid JSON.");
        }

        // Map translations back by index (accepts "i": 0 or "i": "0")
        const byIndex = new Map();
        for (const item of Array.isArray(parsed.items) ? parsed.items : []) {
            const i = Number(item?.i);
            if (Number.isInteger(i)) byIndex.set(i, item);
        }

        if (safeClauses.length > 0 && byIndex.size === 0) {
            console.warn("TRANSLATE: AI returned no usable items:", content.slice(0, 300));
        }

        const translatedClauses = safeClauses.map((orig, i) => {
            const tr = byIndex.get(i) || {};
            const out = { riskWeight: orig.riskWeight, severity: orig.severity };
            for (const key of TRANSLATABLE_FIELDS) {
                out[key] = typeof tr[key] === "string" && tr[key].trim() ? tr[key] : orig[key];
            }
            return out;
        });

        const summary =
            typeof parsed.summary === "string" && parsed.summary.trim() ? parsed.summary : summaryEn;

        return NextResponse.json({ summaryEn: summary, clauses: translatedClauses }, { status: 200 });
    } catch (error) {
        console.error("TRANSLATE ERROR:", error);
        const message = error instanceof Error ? error.message : "";
        const isRateLimit = message.includes("(429)");
        return NextResponse.json(
            {
                error: isRateLimit
                    ? "Translation service is busy. Please try again in a few seconds."
                    : "Translation failed."
            },
            { status: isRateLimit ? 429 : 500 }
        );
    }
}