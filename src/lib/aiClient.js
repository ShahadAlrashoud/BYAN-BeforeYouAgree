// The one place that calls the chat completions endpoint for analyses.
// Groq is the default; a visitor with a valid access cookie is sent to OpenAI (chosen in analysisService.js).
// The request body is built by the caller (analysisService.js) and is passed through unchanged.
import { aiFlags, aiLimits, providerConfig } from "./aiConfig";

// kind: "rate_limited" (HTTP 429) | "provider_error" | "invalid_response" | "budget"
export class AiError extends Error {
    constructor(kind, message, { status = null, retryAfterSeconds = null } = {}) {
        super(message);
        this.name = "AiError";
        this.kind = kind;
        this.status = status;
        this.retryAfterSeconds = retryAfterSeconds;
    }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Seconds from the retry-after header (a number of seconds, or an HTTP date). null if absent/unusable.
function readRetryAfter(response) {
    const raw = response.headers.get("retry-after");
    if (!raw) return null;
    const seconds = Number(raw);
    if (Number.isFinite(seconds) && seconds >= 0) return seconds;
    const date = Date.parse(raw);
    if (!Number.isNaN(date)) return Math.max(0, (date - Date.now()) / 1000);
    return null;
}

const DEFAULT_RETRY_AFTER_SECONDS = 5;

// Returns the parsed JSON response (it includes the `usage` object).
// provider: "groq" (default) or "openai". The URL and API key come from providerConfig(provider).
// Flag FLAG_AI_RELIABILITY off: a single attempt, exactly like before.
// Flag on: on HTTP 429, waits for retry-after and retries up to 2 more times, then throws
// AiError("rate_limited"). A retry-after longer than AI_MAX_RETRY_WAIT_SECONDS is not waited for.
export async function callAiChat(body, provider = "groq") {
    const maxRetries = aiFlags().aiReliability ? 2 : 0;
    const { maxRetryWaitSeconds } = aiLimits();
    const { url, key } = providerConfig(provider);

    for (let attempt = 0; ; attempt++) {
        let response;
        try {
            response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${key}`,
                },
                body: JSON.stringify(body),
            });
        } catch {
            throw new AiError("provider_error", "AI request could not be sent.");
        }

        if (response.ok) return response.json();

        // The error body is read and dropped on purpose: it is never logged or returned.
        await response.text().catch(() => "");

        if (response.status === 429) {
            const retryAfter = readRetryAfter(response);
            const waitSeconds = retryAfter ?? DEFAULT_RETRY_AFTER_SECONDS;
            if (attempt < maxRetries && waitSeconds <= maxRetryWaitSeconds) {
                await sleep(Math.ceil(waitSeconds * 1000) + 250);
                continue;
            }
            throw new AiError("rate_limited", "AI API error (429).", {
                status: 429,
                retryAfterSeconds: Math.ceil(waitSeconds),
            });
        }

        throw new AiError("provider_error", `AI API error (${response.status}).`, { status: response.status });
    }
}