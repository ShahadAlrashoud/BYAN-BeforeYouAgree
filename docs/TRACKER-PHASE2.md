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
| 1 | Counting rule: all analysis_events rows in 30 days per url_key + analysis_version (cache hits included); eligible at 5 or more; count per URL key, show domain only | TODO | POPULAR_PAGE | Waiting for plan approval. Open question: one entry per domain or per URL key |
| 2 | /popular page: top 20, domain, latest score and level, date, "analyzed N times", neutral wording, disclaimer on the linked result, no user ID / IP / search term / full URL, test of rendered page and SQL | TODO | POPULAR_PAGE | No schema change needed |
| 3 | Footer link only when POPULAR_PAGE is on; /popular added to the sitemap dynamically only when it has an entry; empty-state message (EN + AR) | TODO | POPULAR_PAGE | Footer is a client component: the flag is read in layout.tsx (server) and passed down, so it stays a call-time flag |
| 4 | Reuse of a cached result on paste: date, notice, "Re-run analysis" button, no model call, cache event recorded | TODO | REUSE_CACHED | Needs FLAG_RESULT_CACHE on as well |
| 5 | Re-run path: bypasses cache read, goes through rate limits and budget, writes the cache only on success, failed re-run leaves the entry unchanged | TODO | REUSE_CACHED | |
| 6 | Privacy and retention: report exact columns used, no new user or IP column, retention notes, no cleanup job without approval | TODO | n/a | A cleanup job is needed (see the plan summary); not added |
| 7 | Tests on the dev branch with flags on (scripts/test-phase2.mjs) | TODO | n/a | Needs approval to run a dev server and node |
| 8 | Measurement: report Phase 1 token figures, do not change DAILY_TOKEN_BUDGET | TODO | n/a | No real token figure has been measured by the assistant |
| 9 | Final report | TODO | n/a | |

## Arabic strings awaiting review

None yet. Every new Arabic string will be marked [AR review pending] and listed here with file and line.
