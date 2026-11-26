// Configuration for the AI reliability and cost controls (server side only).
// Every new feature is behind a flag that is OFF unless the environment variable is exactly "true".
// Flags and limits are read at call time, so changing them needs a restart but not a rebuild.

// ---------------------------------------------------------------------------------------------
// ANALYSIS_VERSION: part of the cache key.
// IT MUST BE BUMPED (v1 -> v2 -> ...) WHENEVER ANALYSIS CODE CHANGES: the AI prompts, the
// extraction code, the scoring formula, clause weights, risk labels, MAX_AI_CHARS, the model.
// If it is not bumped, people keep receiving cached results made by the old logic.
// Old cache rows are simply never read again after a bump; they are not deleted.
// ---------------------------------------------------------------------------------------------
// (ANALYSIS_VERSION_TEST exists only so the "version change bypasses the cache" test can run without a code
// edit. It is ignored when NODE_ENV is "production".)
export const ANALYSIS_VERSION =
    (process.env.NODE_ENV !== "production" && process.env.ANALYSIS_VERSION_TEST) || "v1";

// Default for DAILY_TOKEN_BUDGET. Left unset (no limit enforced) until the team approves a figure
// based on the measured usage of one real analysis. The environment variable still overrides it.
export const DEFAULT_DAILY_TOKEN_BUDGET = null;

const isOn = (name) => process.env[name] === "true";

function intEnv(name, fallback) {
    const raw = process.env[name];
    if (raw === undefined || String(raw).trim() === "") return fallback;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
}

export function aiFlags() {
    return {
        // Item 1: record the method + reason on each result and show it on the results page
        showMethod: isOn("FLAG_SHOW_METHOD"),
        // Item 2: retry 429 (retry-after, 2 more tries), then return a busy response instead of keyword results
        aiReliability: isOn("FLAG_AI_RELIABILITY"),
        // Item 2: only used together with aiReliability. When off, no keyword result is ever returned.
        allowKeywordFallback: isOn("ALLOW_KEYWORD_FALLBACK"),
        // Item 3: result cache (also records the analysis date and cached/new on each result)
        resultCache: isOn("FLAG_RESULT_CACHE"),
        // Item 4: usage recording + daily token budget
        tokenBudget: isOn("FLAG_TOKEN_BUDGET"),
        // Item 4: /api/translate caps
        translateLimits: isOn("FLAG_TRANSLATE_LIMITS"),
        // Item 5: per-IP limits on analyses
        analysisRateLimits: isOn("FLAG_ANALYSIS_RATE_LIMITS"),
        // Phase 2: the /popular page, its footer link and its dynamic sitemap entry. Needs FLAG_RESULT_CACHE
        // (that is what fills analysis_cache and analysis_events).
        popularPage: isOn("POPULAR_PAGE"),
        // Phase 2: a result served from the cache shows its date, the "policies can change" notice and a
        // "Re-run analysis" button, and the re-run request is honoured. Needs FLAG_RESULT_CACHE.
        reuseCached: isOn("REUSE_CACHED"),
        // Home brief: the welcome homepage, the demo, the homepage popular cards, the new header (one menu
        // button) AND every results-page change (category only, age note, characters analyzed, re-run rule).
        // Off: all of these stay exactly as they were.
        newHome: isOn("NEW_HOME"),
        // Home brief: the print-friendly view (saved as PDF by the browser) and the public share page.
        exportShare: isOn("EXPORT_SHARE"),
        // Home brief: 1 real analysis per visitor per 24 hours (hashed IP). Cache hits and the demo do not count.
        dailyAllowance: isOn("DAILY_ALLOWANCE"),
    };
}

// The daily allowance rule (fixed, not configurable): each visitor gets ALLOWANCE_PER_DAY real analyses per
// ALLOWANCE_WINDOW_SECONDS. It uses the existing hashed-IP counter (rate_events), so no new table is needed.
// Shared networks share one allowance (accepted by the owner). Compare uses the same counter.
export const ALLOWANCE_PER_DAY = 1;
export const ALLOWANCE_WINDOW_SECONDS = 24 * 60 * 60;

// DAILY_TOKEN_BUDGET is NOT set in code. The owner sets it in the hosting environment (Vercel), for example
// 100000, and can raise it for an event day. See DEFAULT_DAILY_TOKEN_BUDGET above (null = no budget enforced).

// The /popular page rule (fixed, not configurable): an entry needs at least POPULAR_MIN_EVENTS rows in
// analysis_events within the last POPULAR_WINDOW_DAYS days (cache hits included); the list shows the top POPULAR_LIMIT.
export const POPULAR_MIN_EVENTS = 5;
export const POPULAR_WINDOW_DAYS = 30;
export const POPULAR_LIMIT = 20;

export function aiLimits() {
    const budget = intEnv("DAILY_TOKEN_BUDGET", DEFAULT_DAILY_TOKEN_BUDGET);
    return {
        cacheTtlDays: intEnv("CACHE_TTL_DAYS", 7),
        dailyTokenBudget: budget ? budget : null, // null or 0 = no budget enforced
        translateDailyLimit: intEnv("TRANSLATE_DAILY_LIMIT", 200),
        translatePerMinutePerIp: intEnv("TRANSLATE_PER_MINUTE_PER_IP", 10),
        analysisPerMinute: intEnv("ANALYSIS_RATE_PER_MINUTE", 10),
        analysisPerHour: intEnv("ANALYSIS_RATE_PER_HOUR", 30),
        // A retry-after longer than this is not waited for (a serverless request cannot wait that long)
        maxRetryWaitSeconds: intEnv("AI_MAX_RETRY_WAIT_SECONDS", 20),
    };
}

const GROQ_DEFAULT_URL = "https://api.groq.com/openai/v1/chat/completions";

// GROQ_API_URL exists only so tests can point the app at a local mock. It is ignored in production.
export function groqUrl() {
    if (process.env.NODE_ENV !== "production" && process.env.GROQ_API_URL) return process.env.GROQ_API_URL;
    return GROQ_DEFAULT_URL;
}
