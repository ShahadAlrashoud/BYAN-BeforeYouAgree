// Read-only query for the /popular page. Needs migrations/002_analysis_cache.sql.
//
// PRIVACY: this is the only query behind the page, and it reads only these columns:
//   analysis_events: url_key, analysis_version, created_at   (url_key is used to GROUP and JOIN only)
//   analysis_cache : url_key, analysis_version, domain, risk_score, risk_level, created_at, result_id
// It never touches users, analyses, rate_events or ai_usage, so no user id, IP address or search term can reach
// the page. The function returns domain, score, level, date, count and result id. It never returns url_key,
// so a full URL (path or query) cannot be shown. scripts/test-phase2.mjs scans this file for forbidden words.
import { neon } from "@neondatabase/serverless";
import { ANALYSIS_VERSION, POPULAR_MIN_EVENTS, POPULAR_WINDOW_DAYS, POPULAR_LIMIT } from "@/lib/aiConfig";

const sql = neon(process.env.DATABASE_URL);

// Counts per normalized URL key (cache hits included), keeps keys with enough events in the window, then shows
// one row per domain: the key with the highest count (ties: the most recent). Current ANALYSIS_VERSION only.
export async function getPopularEntries() {
    const rows = await sql`
    WITH counts AS (
        SELECT url_key, analysis_version, COUNT(*)::int AS n
        FROM analysis_events
        WHERE analysis_version = ${ANALYSIS_VERSION}
          AND created_at > now() - (${POPULAR_WINDOW_DAYS} * interval '1 day')
        GROUP BY url_key, analysis_version
        HAVING COUNT(*) >= ${POPULAR_MIN_EVENTS}
    )
    SELECT d.domain, d.risk_score, d.risk_level, d.created_at, d.result_id, d.n
    FROM (
        SELECT DISTINCT ON (c.domain) c.domain, c.risk_score, c.risk_level, c.created_at, c.result_id, k.n
        FROM counts k
        JOIN analysis_cache c ON c.url_key = k.url_key AND c.analysis_version = k.analysis_version
        ORDER BY c.domain, k.n DESC, c.created_at DESC
    ) d
    ORDER BY d.n DESC, d.created_at DESC
    LIMIT ${POPULAR_LIMIT}`;

    return rows.map((r) => ({
        domain: String(r.domain),
        riskScore: Number(r.risk_score),
        riskLevel: String(r.risk_level),
        analyzedAt: new Date(r.created_at).toISOString(),
        count: Number(r.n),
        resultId: String(r.result_id),
    }));
}
