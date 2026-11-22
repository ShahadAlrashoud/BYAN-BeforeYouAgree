// Database helpers for the Account v2 features. Needs migrations/001_account_v2.sql.
// Nothing here logs emails, user ids or result contents.
import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

const sql = neon(process.env.DATABASE_URL);

export const hashKey = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");

/* ---------- Profile ---------- */

export async function updateDisplayName(userId, displayName) {
    const rows = await sql`
    UPDATE users SET display_name = ${displayName}
    WHERE id::text = ${String(userId)} RETURNING display_name`;
    return rows.length ? rows[0].display_name : undefined;
}

/* ---------- Settings ---------- */

export async function getSettings(userId) {
    const rows = await sql`
    SELECT ui_lang, text_size, result_lang FROM user_settings
    WHERE user_id::text = ${String(userId)} LIMIT 1`;
    const r = rows[0];
    return r ? { uiLang: r.ui_lang, textSize: r.text_size, resultLang: r.result_lang } : null;
}

// Fields left as null keep their saved value
export async function saveSettings(userId, { uiLang = null, textSize = null, resultLang = null }) {
    await sql`
    INSERT INTO user_settings (user_id, ui_lang, text_size, result_lang, updated_at)
    VALUES (${String(userId)}::uuid, ${uiLang}, ${textSize}, ${resultLang}, now())
    ON CONFLICT (user_id) DO UPDATE SET
        ui_lang = COALESCE(EXCLUDED.ui_lang, user_settings.ui_lang),
        text_size = COALESCE(EXCLUDED.text_size, user_settings.text_size),
        result_lang = COALESCE(EXCLUDED.result_lang, user_settings.result_lang),
        updated_at = now()`;
}

/* ---------- Saved results (the "saved list" only) ---------- */

export async function countSavedResults(userId) {
    const rows = await sql`SELECT count(*)::int AS n FROM analyses WHERE user_id::text = ${String(userId)}`;
    return rows[0]?.n || 0;
}

// Deletes the user's saved-list rows. It does NOT touch analysis_results (the stored result
// records), because share links and other users' identical cached results depend on them.
export async function clearSavedResults(userId) {
    const rows = await sql`DELETE FROM analyses WHERE user_id::text = ${String(userId)} RETURNING id`;
    return rows.length;
}

/* ---------- Export: only this user's own data ---------- */

export async function exportUserData(userId) {
    const id = String(userId);
    const [profile] = await sql`
    SELECT username, display_name, email, created_at FROM users WHERE id::text = ${id} LIMIT 1`;
    const results = await sql`
    SELECT id, title, query, result, risk_score, risk_level, created_at
    FROM analyses WHERE user_id::text = ${id} ORDER BY created_at DESC`;
    const settings = await getSettings(id);
    return { profile: profile || null, settings, results };
}

/* ---------- Sessions ---------- */

export async function setSessionsValidAfter(userId, date) {
    await sql`UPDATE users SET sessions_valid_after = ${date.toISOString()} WHERE id::text = ${String(userId)}`;
}

/* ---------- Email change ---------- */

export async function createEmailChange({ userId, newEmail, tokenHash, expiresAt, lang }) {
    const id = String(userId);
    await sql.transaction([
        sql`DELETE FROM email_change_requests WHERE user_id::text = ${id}`,
        sql`INSERT INTO email_change_requests (user_id, new_email, token_hash, expires_at, lang)
            VALUES (${id}::uuid, ${newEmail}, ${tokenHash}, ${expiresAt.toISOString()}, ${lang})`,
    ]);
}

export async function findEmailChange(tokenHash) {
    const rows = await sql`
    SELECT user_id, new_email, lang FROM email_change_requests
    WHERE token_hash = ${tokenHash} AND expires_at > now() LIMIT 1`;
    const r = rows[0];
    return r ? { userId: String(r.user_id), newEmail: r.new_email, lang: r.lang } : null;
}

// Changes users.email only if no OTHER account already uses the new address.
// The request is consumed either way. Returns true if the email was changed.
export async function applyEmailChange({ userId, newEmail }) {
    const id = String(userId);
    const lower = String(newEmail).toLowerCase().trim();
    const results = await sql.transaction([
        sql`UPDATE users SET email = ${lower}
            WHERE id::text = ${id}
              AND NOT EXISTS (SELECT 1 FROM users u2 WHERE lower(u2.email) = ${lower} AND u2.id::text <> ${id})
            RETURNING id`,
        sql`DELETE FROM email_change_requests WHERE user_id::text = ${id}`,
    ]);
    return Array.isArray(results[0]) && results[0].length > 0;
}

/* ---------- Rate limiting ---------- */

export async function countEvents(key, kind, windowSeconds) {
    const rows = await sql`
    SELECT count(*)::int AS n,
           EXTRACT(EPOCH FROM (now() - min(created_at)))::float AS oldest_age
    FROM rate_events
    WHERE key = ${key} AND kind = ${kind}
      AND created_at > now() - (${windowSeconds} * interval '1 second')`;
    const n = rows[0]?.n || 0;
    const age = rows[0]?.oldest_age || 0;
    return { count: n, retryAfter: n ? Math.max(1, Math.ceil(windowSeconds - age)) : 0 };
}

export async function recordEvent(key, kind) {
    await sql`INSERT INTO rate_events (key, kind) VALUES (${key}, ${kind})`;
    await sql`DELETE FROM rate_events WHERE created_at < now() - interval '2 days'`;
}

export async function clearEvents(key, kind) {
    await sql`DELETE FROM rate_events WHERE key = ${key} AND kind = ${kind}`;
}

// "At most `max` per window": records the event when allowed
export async function takeToken(key, kind, max, windowSeconds) {
    const { count, retryAfter } = await countEvents(key, kind, windowSeconds);
    if (count >= max) return { ok: false, retryAfter };
    await recordEvent(key, kind);
    return { ok: true, retryAfter: 0 };
}
