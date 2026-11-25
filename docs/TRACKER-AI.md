# TRACKER-AI: AI reliability, cost controls, popular analyses

Status values: TODO, DONE, HIDDEN (done, behind a flag that is off), BLOCKED (with reason).
Every new feature is behind a flag, default off. Nothing in this tracker has been run against a database.

## Setup

| # | Item | Status | Notes |
|---|------|--------|-------|
| S1 | Inspect repository | DONE | analyze route, analysisService.js, ResultsClient.js, translate route, src/database/*, migrations/ |
| S2 | Create this tracker | DONE | |
| S3 | Measure tokens for one analysis on the dev branch | BLOCKED | Needs approval to run the app (only tsc, lint, build are allowed) and a dev-branch connection. See the questions in the Setup summary. |
| S4 | Summary and plan approved | TODO | Waiting for approval before any code change |

## Phase 1: reliability and cost

| # | Item | Status | Flag (default off) | Notes |
|---|------|--------|--------------------|-------|
Gate confirmed by the user before Phase 2: tsc, lint and build passed; the Phase 1 test script passed on the development branch; migrations 002 and 003 were applied to the development branch only. The assistant did not observe these runs itself.

| # | Item | Status | Flag (default off) | Notes |
|---|------|--------|--------------------|-------|
| 1 | Visible method: record ai or keyword and the reason; show notice on results page (EN + AR) | HIDDEN | FLAG_SHOW_METHOD | Written, unverified. Record gets analysisMethod + analysisReason. Old notice stays when the flag is off. |
| 2a | Retry on HTTP 429 (retry-after, up to 2 retries) | HIDDEN | FLAG_AI_RELIABILITY | src/lib/aiClient.js. A retry-after over 20 s is not waited for. |
| 2b | Busy response (EN + AR) with retry suggestion; no keyword result on 429 | HIDDEN | FLAG_AI_RELIABILITY | Status 429 + Retry-After header. Written, unverified. |
| 2c | Keyword fallback kept, but only runs when allow_keyword_fallback is on | HIDDEN | ALLOW_KEYWORD_FALLBACK | Kept. With FLAG_AI_RELIABILITY on it never runs for 429 and runs for other errors only if this flag is on. With FLAG_AI_RELIABILITY off, behaviour is unchanged (old fallback). TEAM DECISION needed. |
| 3a | ANALYSIS_VERSION constant ("v1") and documentation | DONE | n/a (constant) | src/lib/aiConfig.js. Must be bumped whenever analysis code changes. |
| 3b | URL normalization for the cache key | HIDDEN | FLAG_RESULT_CACHE | src/lib/urlKey.js. Keeps only the hl parameter (approved). |
| 3c | Result cache with CACHE_TTL_DAYS (default 7); cache check at start of analyze route | HIDDEN | FLAG_RESULT_CACHE | Only AI results are cached; never keyword, empty, busy, failed or screenshot results. Unverified. |
| 3d | Results page: "Analyzed on [date]" and cached or fresh (EN + AR) | HIDDEN | FLAG_RESULT_CACHE | Unverified. |
| 3e | Migration: cache table (up and down) | BLOCKED | n/a | migrations/002_analysis_cache.sql + .down.sql written. Not run: waiting for SQL approval. |
| 4a | Record usage (prompt, completion, total tokens, date, method, URL hash) | HIDDEN | FLAG_TOKEN_BUDGET | Unverified. |
| 4b | DAILY_TOKEN_BUDGET check before each model call; cached results still load | BLOCKED | FLAG_TOKEN_BUDGET | Code written. Budget default is unset (no limit) until the token figure is measured and approved. |
| 4c | /api/translate cap: TRANSLATE_DAILY_LIMIT (200) and 10 per minute per IP, separate counter | HIDDEN | FLAG_TRANSLATE_LIMITS | Unverified. Also removed the log line that printed AI output. |
| 4d | Migration: usage table (up and down) | BLOCKED | n/a | migrations/003_ai_usage.sql + .down.sql written. Not run: waiting for SQL approval. |
| 5 | Analysis rate limits per IP: 10 per minute, 30 per hour; cache hits counted separately; trusted proxy header | HIDDEN | FLAG_ANALYSIS_RATE_LIMITS | Header from TRUSTED_IP_HEADER (default x-vercel-forwarded-for). Needs rate_events from migration 001. |
| 6 | Tests: 5x same URL, version change, forced 429, budget at limit | BLOCKED | n/a | scripts/test-phase1.mjs written (uses a local mock, no real model call). Not run: needs migrations applied on the dev branch and approval to run a dev server and node. |

## Phase 2: popular analyses (starts only after Phase 1 approval)

| # | Item | Status | Flag (default off) | Notes |
|---|------|--------|--------------------|-------|
| 7 | /popular page: >= 5 analyses in 30 days, top 20, neutral wording, no identifiers | TODO | popular_page | |
| 8 | Show cached result on paste, with date, "Re-run analysis" button, notice | TODO | reuse_cached | |
| 9 | Link /popular from header or footer only when the flag is on; no sitemap entry until it has entries | TODO | popular_page | |
| 10 | Tests: 5x appears with the right count; 1x does not; paste shows cache with no model call; re-run costs one call; no IP, user ID or search text on the page | TODO | n/a | |

## Arabic strings awaiting review

All are  (marked in code comments only, not shown to users). Line numbers are as written, before any later edits.

| File | Line | English |
|------|------|---------|
| src/lib/aiMessages.js | 8 | The AI service is busy right now. Please wait a minute and try again. |
| src/lib/aiMessages.js | 13 | We have reached today's limit for new analyses... |
| src/lib/aiMessages.js | 18 | AI analysis is unavailable right now. Please try again in a moment. |
| src/lib/aiMessages.js | 23 | You are sending requests too quickly... |
| src/lib/aiMessages.js | 28 | Too many translation requests... |
| src/lib/aiMessages.js | 33 | Translation is unavailable for the rest of today... |
| src/app/results/ResultsClient.js | about 1220 | Analyzed on |
| src/app/results/ResultsClient.js | about 1224 | Served from the cache |
| src/app/results/ResultsClient.js | about 1225 | New analysis |
| src/app/results/ResultsClient.js | about 1469 | This result used a basic check because the AI service was busy. |
| src/app/results/ResultsClient.js | about 1473 | This result used a basic check because the AI service was unavailable. |
