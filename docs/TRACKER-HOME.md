# TRACKER-HOME: homepage, daily allowance, results, export and share, header

Status values: TODO, DONE, HIDDEN (done, behind a flag that is off), BLOCKED (with reason).
Rules that stay in force: do not change analysis logic, prompts, scoring, clause weights, risk labels,
the 12,000-character limit, the Privacy Policy, the Terms or the Disclaimer. Every new feature is behind a flag,
default off, read at call time. Schema changes only as migration files with a matching down step, never run
without approval. Dev branch only (CLINE_DATABASE_URL). Commands: tsc, lint, build only.

Decisions received from the owner: three existing risk labels (no fourth), re-run when older than CACHE_TTL_DAYS
(setting unchanged, "old result" warning from 30 days), Compare counts toward the allowance, flag DAILY_ALLOWANCE,
DAILY_TOKEN_BUDGET is owner-set in Vercel (not in code), NEW_HOME controls all results-page changes, print view saved
as PDF by the browser (no library), share links by anyone who can open a result with no revocation, frozen snapshot.

Build order: 1 flags and helpers, 2 header, 3 homepage, 4 results page, 5 allowance, 6 print view, 7 share page.

## Flags

| Flag | Default | Controls |
|------|---------|----------|
| NEW_HOME | off | welcome homepage, demo, homepage popular cards, new header (and, if confirmed, the results-page changes) |
| EXPORT_SHARE | off | print view, PDF, public share page |
| POPULAR_PAGE | off (exists) | /popular, footer link, menu item, homepage cards |
| DAILY_ALLOWANCE (proposed, needs a decision) | off | the 1-real-analysis-per-day limit |

## Items

| # | Item | Status | Notes |
|---|------|--------|-------|
| 0 | Step 1: flags (NEW_HOME, EXPORT_SHARE, DAILY_ALLOWANCE), resultDisplay.js helpers, takeDailyAllowance, .env.example | DONE | tsc exit code 0 (owner confirmed). No page uses them yet. NEAR_HIGH_POINTS = 5 is an assumption |
| 1 | Welcome homepage and free demo | HIDDEN | Step 3. Written behind NEW_HOME (src/app/welcome/*, branch in src/app/page.tsx). HomeClient is untouched and still renders when the flag is off. tsc exit code 0. Not viewed in a browser |
| 1b | /analyze input page: Link, Screenshots (existing ImageAnalyzer), Paste text | HIDDEN | Behind NEW_HOME and only when there is no ?url=. The run path for ?url= is unchanged. New: AnalyzeInput.tsx, inputStrings.ts, FlagsProvider.tsx (server flags passed to client pages from layout.tsx). tsc exit code 0 |
| 2 | Daily allowance (1 real analysis per day, hashed IP, 24 h, Compare counts) | HIDDEN | Step 5. Behind DAILY_ALLOWANCE in /api/analyze, after the cache check and before the per-IP limits. Covers link, pasted text, screenshots and Compare because they all post to this route. Cache hits and the demo do not count. Counted when the analysis starts, so a run that fails still uses it. Fails open if the counter is unreadable. tsc exit code 0. Not run against a database |
| 3 | Popular cards on the homepage (max 3, "View all") | HIDDEN | Step 3. Behind NEW_HOME and POPULAR_PAGE. Read on the server from getPopularEntries; only domain, existing label, date, count and result id reach the page. No score |
| 4 | Results page: category not number, near-boundary note, age note, characters analyzed | HIDDEN | Step 4, behind NEW_HOME in ResultsClient.js. The ring still fills to the score; the number is not printed and the spoken label names the category. Not covered: the Compare panel, the comparison columns, the share bar, the badge image and the saved list still show numbers. Not viewed in a browser. tsc exit code 0 |
| 5 | Re-run when older than CACHE_TTL_DAYS; "old result" warning from 30 days | HIDDEN | Step 4, behind NEW_HOME. Needs the analysis date and a web address (screenshot and pasted-text results have none). Cache setting not changed |
| 6a | Export: print-friendly view saved as PDF by the browser | TODO | Step 6, behind EXPORT_SHARE. No library |
| 6b | Share: public read-only page by random token | BLOCKED | Step 7. Migration 004_share_tokens: SQL must be shown and approved before anything runs |
| 7 | Header: one menu button at every width, new menu items, language switch and theme toggle at the bottom | HIDDEN | Step 2. Written behind NEW_HOME. tsc result: see the chat report. Not visually checked. No screenshot received |
| 8 | Arabic strings, each marked [AR review pending] | TODO | Ongoing |
| 9 | Tests on dev | TODO | Needs a dev server started from the owner's terminal |

## Arabic strings awaiting review

| File | Line | English |
|------|------|---------|
| src/app/components/Header.tsx | 111 | Try it (menu item) |
| src/app/components/Header.tsx | 112 | Analyzed websites (menu item) |
| src/app/analyze/inputStrings.ts | the whole `ar` block | Input page: title, intro, tab names, labels, placeholders, buttons, errors, daily limit message, privacy link |
| src/lib/aiMessages.js | line 28 (`daily_allowance`) | You have used today's analysis. You can still open results that were analyzed before, or try again tomorrow. |
| src/app/results/ResultsClient.js | search "AR review pending" in the NEW_HOME block and ScoreCircle | Risk category (spoken label), analysis made today, N days old, old-result warning, close to the High Risk boundary, characters analyzed, older-than-N-days re-run text |
| src/app/welcome/strings.ts | the whole `ar` block (from the `// [AR review pending]` comment) | Welcome page: title, intro, steps, allowance sentence, Try it, demo title and label ("Example, not a real analysis"), fictional site, summary, two fictional findings with quotes, demo note, disclaimer link, popular cards heading and note, View all |
