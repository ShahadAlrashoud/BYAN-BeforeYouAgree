// Database helpers for the AI cost controls: result cache, usage log, per-IP analysis limits.
// Needs migrations/002_analysis_cache.sql and migrations/003_ai_usage.sql (and 001 for rate_events).
// Nothing here logs urls, ip addresses, user ids, emails or result contents.
import { neon } from "@neondatabase/serverless";
import crypto from "crypto";
import { saveResult, createAnalysis } from "./db";
import { countEvents, recordEvent } from "./accountDb";

const sql = neon(process.env.DATABASE_URL);

/* ---------- Result cache ---------- */

// The cached record (a user-less copy) if one exists for this key + version and is younger than ttlDays.
export async function findCachedRecord(urlKey, version, ttlDays) {
    const rows = await sql`
    SELECT r.record
    FROM analysis_cache c
    JOIN analysis_results r ON r.id::text = c.result_id
    WHERE c.url_key = ${urlKey}
      AND c.analysis_version = ${version}
      AND c.created_at > now() - (${ttlDays} * interval '1 day')
    LIMIT 1`;
    return rows[0]?.record || null;
}

// Stores a user-less copy of a successful result as the cache entry for this key + version.
// The copy has userId null, so deleting someone's account can never delete a shared cached result.
export async function storeCachedRecord({ urlKey, version, record }) {
    const copy = { ...record, id: crypto.randomUUID(), userId: null, fromCache: false };
    const previous = await sql`
    SELECT result_id FROM analysis_cache WHERE url_key = ${urlKey} AND analysis_version = ${version} LIMIT 1`;

    await saveResult(copy);
    let domain = "";
    try {
        domain = new URL(urlKey).hostname.toLowerCase();
    } catch {
        domain = "";
    }
    await sql`
    INSERT INTO analysis_cache (url_key, analysis_version, result_id, domain, risk_score, risk_level, lang, created_at)
    VALUES (${urlKey}, ${version}, ${copy.id}, ${domain}, ${record.riskScore}, ${record.riskLevel},
            ${record.lang ?? null}, now())
    ON CONFLICT (url_key, analysis_version) DO UPDATE SET
        result_id = EXCLUDED.result_id,
        domain = EXCLUDED.domain,
        risk_score = EXCLUDED.risk_score,
        risk_level = EXCLUDED.risk_level,
        lang = EXCLUDED.lang,
        created_at = now()`;

    // The replaced cache copy is referenced by nothing else (users always get their own copy), so remove it
    const oldId = previous[0]?.result_id;
    if (oldId && oldId !== copy.id) {
        await sql`DELETE FROM analysis_results WHERE id::text = ${String(oldId)}`;
    }
    return copy.id;
}

// A cache hit gets its own record, so the results link, the saved list and account deletion work as usual.
// The URL the user typed is kept as `url`; the analysis date stays the original one.
export async function serveCachedRecord(cached, { url, preferredLang, userId }) {
    const served = {
        ...cached,
        id: crypto.randomUUID(),
        userId,
        url,
        preferredLang,
        fromCache: true,
        analyzedAt: cached.analyzedAt || cached.createdAt,
        createdAt: new Date().toISOString(),
    };
    await saveResult(served);
    if (userId) {
        await createAnalysis({
            id: served.id,
            userId,
            title: served.resolvedUrl || served.url,
            query: served.url,
            result: served.summaryEn,
            riskScore: served.riskScore,
            riskLevel: served.riskLevel,
        });
    }
    return served;
}

// source: "model" (a model call produced the cached result) or "cache" (served from the cache)
export async function logAnalysisEvent(urlKey, version, source) {
    await sql`INSERT INTO analysis_events (url_key, analysis_version, source) VALUES (${urlKey}, ${version}, ${source})`;
    if (Math.random() < 0.05) {
        await sql`DELETE FROM analysis_events WHERE created_at < now() - interval '60 days'`;
    }
}

/* ---------- AI usage ---------- */

export async function recordUsage({ kind, method, urlHash, usage }) {
    const prompt = Number(usage?.prompt_tokens) || 0;
    const completion = Number(usage?.completion_tokens) || 0;
    const total = Number(usage?.total_tokens) || prompt + completion;
    await sql`
    INSERT INTO ai_usage (kind, method, url_hash, prompt_tokens, completion_tokens, total_tokens)
    VALUES (${kind}, ${method}, ${urlHash ?? null}, ${prompt}, ${completion}, ${total})`;
    return { prompt, completion, total };
}

// Today's (UTC) totals for one kind. "analysis" and "translate" are separate counters.
export async function getTodayUsage(kind) {
    const rows = await sql`
    SELECT COALESCE(SUM(total_tokens), 0)::float AS tokens, COUNT(*)::int AS requests
    FROM ai_usage
    WHERE kind = ${kind} AND usage_date = ((now() AT TIME ZONE 'utc')::date)`;
    return { tokens: rows[0]?.tokens || 0, requests: rows[0]?.requests || 0 };
}

/* ---------- Per-IP limits (uses rate_events from migration 001; keys are hashes) ---------- */

// "At most perMinute per minute AND perHour per hour". Records the event when allowed.
export async function takeAnalysisSlot(key, perMinute, perHour) {
    if (perMinute > 0) {
        const m = await countEvents(key, "analysis_ai", 60);
        if (m.count >= perMinute) return { ok: false, retryAfter: m.retryAfter };
    }
    if (perHour > 0) {
        const h = await countEvents(key, "analysis_ai", 3600);
        if (h.count >= perHour) return { ok: false, retryAfter: h.retryAfter };
    }
    await recordEvent(key, "analysis_ai");
    return { ok: true, retryAfter: 0 };
}

// Cache hits are recorded under their own kind, so they never count toward the AI limits above.
export async function noteCacheServe(key) {
    await recordEvent(key, "analysis_cache");
}
