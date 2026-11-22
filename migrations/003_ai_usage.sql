-- Migration 003: AI token usage log (daily token budget, translate counter).
-- NOT run automatically. Review it, then run it once on the DEVELOPMENT branch first.
-- Safe to run more than once (every statement is IF NOT EXISTS). Matching down step: 003_ai_usage.down.sql
-- Nothing here changes or deletes existing data.
-- The per-IP rate limits reuse the existing rate_events table from migration 001 (hashed keys only).
-- Contains no IP addresses, user ids, emails or policy text: url_hash is a SHA-256 of the normalized URL.

-- One row per model call (analysis) or per translate request.
--   kind: 'analysis' counts toward DAILY_TOKEN_BUDGET. 'translate' is a SEPARATE counter
--         (TRANSLATE_DAILY_LIMIT counts its rows) and never counts toward the analysis budget.
--   method: which method produced the final result ('ai' or 'keyword').
--   usage_date: the UTC date, so "today" is the same for everyone.
CREATE TABLE IF NOT EXISTS ai_usage (
    id                bigserial PRIMARY KEY,
    usage_date        date NOT NULL DEFAULT ((now() AT TIME ZONE 'utc')::date),
    kind              text NOT NULL CHECK (kind IN ('analysis', 'translate')),
    method            text NOT NULL CHECK (method IN ('ai', 'keyword')),
    url_hash          text,
    prompt_tokens     integer NOT NULL DEFAULT 0,
    completion_tokens integer NOT NULL DEFAULT 0,
    total_tokens      integer NOT NULL DEFAULT 0,
    created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ai_usage_day_idx ON ai_usage (kind, usage_date);
