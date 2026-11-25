// Returns the parsed JSON response (it includes the `usage` object).
// Flag FLAG_AI_RELIABILITY off: a single attempt, exactly like before.
// Flag on: on HTTP 429, waits for retry-after and retries up to 2 more times, then throws
// AiError("rate_limited"). A retry-after longer than AI_MAX_RETRY_WAIT_SECONDS is not waited for.
export async function callGroqChat(body) {
    const maxRetries = aiFlags().aiReliability ? 2 : 0;
    const { maxRetryWaitSeconds } = aiLimits();

    // OpenAI settings are checked once, before any request is sent,
    // so a missing key or model shows its own clear message.
    let openAiUrl = null;
    let openAiKey = null;
    let openAiModel = null;
    if (AI_PROVIDER === "openai") {
        openAiUrl = process.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions";
        openAiKey = process.env.OPENAI_API_KEY;
        openAiModel = process.env.OPENAI_MODEL;
        if (!openAiKey) {
            throw new AiError("provider_error", "OpenAI API key not set.");
        }
        if (!openAiModel) {
            throw new AiError("provider_error", "OpenAI model name not set. Set OPENAI_MODEL environment variable.");
        }
    }

    for (let attempt = 0; ; attempt++) {
        let response;
        try {
            if (AI_PROVIDER === "openai") {
                response = await fetch(openAiUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${openAiKey}`,
                    },
                    // Replace the Groq model name with the OpenAI one. The rest of the body is unchanged.
                    body: JSON.stringify({ ...body, model: openAiModel }),
                });
            } else {
                response = await fetch(groqUrl(), {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                    },
                    body: JSON.stringify(body),
                });
            }
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