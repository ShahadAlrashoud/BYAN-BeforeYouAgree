# TRACKER-PHASE2: popular analyses page and cached-result reuse

Status values: TODO, DONE, HIDDEN (done, behind a flag that is off), BLOCKED (with reason).
Every new feature is behind its flag, default off. Flags are read at call time (src/lib/aiConfig.js).
Nothing here has been run against any database. The development branch (CLINE_DATABASE_URL) is the only database allowed.

## Gate

| Check | Status | Notes |
|-------|--------|-------|
| tsc, lint and build passed | CONFIRMED BY USER | Not observed by the assistant (tsc output was never captured) |
| Phase 1 test script passed on the dev branch | CONFIRMED BY USER | Not observed by the assistant |
| Migrations 002 and 003 applied to the dev branch only | CONFIRMED BY USER | Production must NOT get Phase 2 flags until 002 and 003 are applied there |

## Items

| # | Item | Status | Flag (default off) | Notes |
|---|------|--------|--------------------|-------|
Code is written. Verification so far:
- tsc: exit code 0, no errors.
- lint: exit code 1, 59 problems project-wide (49 errors, 10 warnings). None are in the new Phase 2 files. In files Phase 2 edited: Footer.tsx has 1 warning (unused `heading`, existing code) and ResultsClient.js has 7 "setState synchronously within an effect" errors in code Phase 2 did not add (no effect was added). Not compared against a baseline, so "pre-existing" is an inference.
- build: started with NODE_OPTIONS=--max-old-space-size=4096. Next printed "Environments: .env.local" (its own loader). The result was not observed: the log stopped at "Creating an optimized production build".
- Phase 2 tests: BLOCKED. CLINE_DATABASE_URL is not set in the assistant's shell, so the dev server and test script were not started.

| # | Item | Status | Flag (default off) | Notes |
|---|------|--------|--------------------|-------|
| 1 | Counting rule: all analysis_events rows in 30 days per url_key + analysis_version (cache hits included); eligible at 5 or more; count per URL key, show domain only | HIDDEN | POPULAR_PAGE | src/database/popularDb.js. Current ANALYSIS_VERSION only. One row per domain (the URL key with the highest count). Unverified. |
| 2 | /popular page: top 20, domain, latest score and level, date, "analyzed N times", neutral wording, disclaimer, no user ID / IP / search term / full URL | HIDDEN | POPULAR_PAGE | src/app/popular/*. 404 when the flag is off. Disclaimer is on the page itself and on the result page when opened from /popular. Unverified. |
| 3 | Footer link only when POPULAR_PAGE is on; /popular in the sitemap only when it has an entry; empty-state message (EN + AR) | HIDDEN | POPULAR_PAGE | Footer flag is read in layout.tsx (server) and passed down. sitemap.ts is now async and dynamic. Unverified. |
| 4 | Reuse of a cached result on paste: date, notice, "Re-run analysis" button, no model call, cache event recorded | HIDDEN | REUSE_CACHED | DIFFERENT FROM THE PLAN: no preview route and no change to /analyze. The existing cache path in /api/analyze serves the record and logs the cache event; the results page shows the notice and button for records marked reusedCached. Unverified. |
| 5 | Re-run path: bypasses cache read, goes through rate limits and budget, writes the cache only on success, failed re-run leaves the entry unchanged | HIDDEN | REUSE_CACHED | /api/analyze accepts rerun:true (ignored when the flag is off). Unverified. |
| 6 | Privacy and retention: report exact columns used, no new user or IP column, retention notes, no cleanup job without approval | DONE (report) | n/a | No new column. A cleanup job is NEEDED and was NOT added: see the final report. |
| 7 | Tests on the dev branch with flags on (scripts/test-phase2.mjs) | BLOCKED | n/a | Script written. Not run: needs approval for a dev server, node, and test-row writes on the dev branch (CONFIRM_DEV_WRITES=yes). |
| 8 | Measurement: report Phase 1 token figures, do not change DAILY_TOKEN_BUDGET | DONE (report) | n/a | No figure was measured by the assistant. DAILY_TOKEN_BUDGET unchanged (unset). |
| 9 | Final report | DONE | n/a | See the chat report. |

## Arabic strings awaiting review

All are [AR review pending], marked in code comments only (not shown to users). Lines as of the last edit.

| File | Line | English |
|------|------|---------|
| src/app/popular/strings.ts | 21 to 36 (whole `ar` block) | page title, intro, disclaimer, empty state, "analyzed N times", labels |
| src/app/components/Footer.tsx | 42 | Analyzed websites (footer link) |
| src/app/results/ResultsClient.js | about 1282 | This result is from [date]. Policies can change. Re-run the analysis for the latest version. |
| src/app/results/ResultsClient.js | about 1292 | Re-running... |
| src/app/results/ResultsClient.js | about 1293 | Re-run analysis |
| src/app/results/ResultsClient.js | about 1317 | Results may not reflect the current policy. Re-run the analysis for the latest version. |
