-- Account v2 migration. NOT run automatically: review it, then run it once on the database.
-- Safe to run more than once (every statement is IF NOT EXISTS).
-- Assumption: users.id is a uuid (the code already casts analyses.user_id with ::uuid).
-- Nothing here deletes or rewrites existing data.

-- 1) Profile: optional display name, and the "sign out of all devices" cut-off time
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS sessions_valid_after timestamptz;

-- 2) Saved preferences (language, text size, default result language)
CREATE TABLE IF NOT EXISTS user_settings (
    user_id     uuid PRIMARY KEY,
    ui_lang     text CHECK (ui_lang IN ('en', 'ar')),
    text_size   integer CHECK (text_size IN (100, 115, 130, 150)),
    result_lang text CHECK (result_lang IN ('policy', 'my')),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 3) Pending email changes. Only a hash of the token is stored.
--    The users.email column is NOT touched until the link is used.
CREATE TABLE IF NOT EXISTS email_change_requests (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    uuid NOT NULL,
    new_email  text NOT NULL,
    token_hash text NOT NULL,
    lang       text NOT NULL DEFAULT 'en',
    expires_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS email_change_requests_user_idx ON email_change_requests (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS email_change_requests_token_idx ON email_change_requests (token_hash);

-- 4) Small shared counter for rate limits (export, email change, failed password checks).
--    "key" is a SHA-256 hash, never a raw user id, email or IP address.
--    Rows older than 2 days are removed automatically by the app.
CREATE TABLE IF NOT EXISTS rate_events (
    key        text NOT NULL,
    kind       text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS rate_events_lookup_idx ON rate_events (key, kind, created_at);
