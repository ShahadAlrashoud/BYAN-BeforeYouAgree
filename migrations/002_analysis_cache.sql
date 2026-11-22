-- Migration 002: result cache and analysis event log.
-- NOT run automatically. Review it, then run it once on the DEVELOPMENT branch first.
-- Safe to run more than once (every statement is IF NOT EXISTS). Matching down step: 002_analysis_cache.down.sql
-- Nothing here changes or deletes existing data.
-- Contains no IP addresses, user ids, emails or policy text.

-- 1) One row per (normalized URL, analysis version): the newest cached result.
--    url_key: lowercase host, no trailing slash, query string removed (only "hl" is kept, because it
--             changes the language the site is fetched in), no fragment.
--    result_id: id of a stored copy in analysis_results that belongs to NO user (record.userId is null),
--               so deleting a user's account never removes a result that other people are served.
--    A different analysis_version never matches, so bumping ANALYSIS_VERSION bypasses all older rows.
CREATE TABLE IF NOT EXISTS analysis_cache (
    url_key          text NOT NULL,
    analysis_version text NOT NULL,
    result_id        text NOT NULL,
    domain           text NOT NULL,
    risk_score       integer NOT NULL,
    risk_level       text NOT NULL,
    lang             text,
    created_at       timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (url_key, analysis_version)
);
CREATE INDEX IF NOT EXISTS analysis_cache_created_idx ON analysis_cache (created_at);

-- 2) One row each time a cacheable URL analysis was served: by a model call ('model') or from the cache ('cache').
--    Used to count "analyzed N times" for the popular page (Phase 2) and to confirm cache hits in tests.
--    No IP, no user id, no search term. Rows older than 60 days are removed by the app.
CREATE TABLE IF NOT EXISTS analysis_events (
    id               bigserial PRIMARY KEY,
    url_key          text NOT NULL,
    analysis_version text NOT NULL,
    source           text NOT NULL CHECK (source IN ('model', 'cache')),
    created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS analysis_events_url_idx ON analysis_events (url_key, analysis_version, created_at);
CREATE INDEX IF NOT EXISTS analysis_events_created_idx ON analysis_events (created_at);
