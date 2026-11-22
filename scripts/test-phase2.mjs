// Phase 2 checks. NOT run automatically. DEVELOPMENT BRANCH ONLY.
//
// WRITES to the dev branch (test rows only) and DELETES them again at the end. It refuses to run unless
// CONFIRM_DEV_WRITES=yes is set. Test rows use url_key starting "https://phase2-test-" (list mode) or
// "http://localhost:4011/" (reuse / rerun modes). It uses a local MOCK model (no real Groq call, no tokens).
//
// Start a dev server yourself, with DATABASE_URL set to the value of CLINE_DATABASE_URL for that process only:
//   GROQ_API_URL=http://localhost:4011/v1/chat/completions
//   FLAG_RESULT_CACHE=true POPULAR_PAGE=true REUSE_CACHED=true FLAG_AI_RELIABILITY=true
//   (do NOT set ALLOW_KEYWORD_FALLBACK)
//   next dev
//
// Usage: CONFIRM_DEV_WRITES=yes node scripts/test-phase2.mjs <list|reuse|rerun> [BASE_URL]
//   list    5 events appear with the right count; 1 event does not; 5 events older than 30 days do not count;
//           the /popular output contains no full URL, IP, user id or search text; the SQL file is scanned too
//   reuse   a cached URL pasted again shows the cached result with its date, 0 model calls, 1 new cache event
//   rerun   a re-run makes exactly 1 model call and replaces the cache entry; a re-run that fails (mock 429)
//           leaves the cache entry unchanged
// Only counts and PASS/FAIL are printed. No URL with a query string, IP, user id or analysis text is printed.
import http from "node:http";
import fs from "node:fs";
import { neon } from "@neondatabase/serverless";

const mode = process.argv[2];
const base = process.argv[3] || "http://localhost:3000";
const VERSION = process.env.ANALYSIS_VERSION_TEST || "v1"; // must match the server's ANALYSIS_VERSION
const PORT = 4011;

if (process.env.CONFIRM_DEV_WRITES !== "yes") {
    console.log("Refusing to run: set CONFIRM_DEV_WRITES=yes (this script writes and deletes test rows on the dev branch).");
    process.exit(2);
}
if (!process.env.CLINE_DATABASE_URL) {
    console.log("Refusing to run: CLINE_DATABASE_URL (development branch) is not set.");
    process.exit(2);
}
const sql = neon(process.env.CLINE_DATABASE_URL);

const results = [];
const check = (name, ok, detail = "") => {
    results.push(ok);
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  (" + detail + ")" : ""}`);
};

/* ---------- mock model + policy page ---------- */
const SENTENCE = "We may sell your personal information to third party advertisers and data brokers for profit.";
const PAGE = `<html><body><h1>Privacy Policy</h1><p>${SENTENCE} We keep your data for as long as we like.</p><p>${"Filler text so this page is long enough to be treated as a policy. ".repeat(4)}</p></body></html>`;
let modelCalls = 0;
let mockMode = "ok"; // "ok" | "429"
const mock = http.createServer((req, res) => {
    if (req.method === "POST" && req.url.startsWith("/v1/chat/completions")) {
        req.resume();
        req.on("end", () => {
            modelCalls++;
            if (mockMode === "429") {
                res.writeHead(429, { "retry-after": "1", "content-type": "application/json" });
                return res.end("{}");
            }
            const content = JSON.stringify({
                summary: "Mock summary.",
                findings: [{
                    category: "Third-party sharing", clauseRef: null, evidenceQuote: SENTENCE,
                    plainExplanation: "They may sell your data.", riskReason: "It says sell.",
                    suggestedAction: "Opt out if you can.", severity: "high",
                }],
            });
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ choices: [{ message: { content } }], usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 } }));
        });
        return;
    }
    res.writeHead(200, { "content-type": "text/html" });
    res.end(PAGE);
});

const analyze = async (path, extra = {}) => {
    const res = await fetch(`${base}/api/analyze`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: `http://localhost:${PORT}${path}`, lang: "en", ...extra }),
    });
    return { status: res.status, body: await res.json().catch(() => ({})) };
};
const cacheRow = async (path) => {
    const rows = await sql`SELECT result_id, created_at FROM analysis_cache
        WHERE url_key = ${`http://localhost:${PORT}${path}`} AND analysis_version = ${VERSION}`;
    return rows[0] || null;
};
const eventCount = async (path, source) => {
    const rows = await sql`SELECT count(*)::int AS n FROM analysis_events
        WHERE url_key = ${`http://localhost:${PORT}${path}`} AND analysis_version = ${VERSION} AND source = ${source}`;
    return rows[0].n;
};
async function cleanup() {
    await sql`DELETE FROM analysis_events WHERE url_key LIKE 'https://phase2-test-%' OR url_key LIKE ${`http://localhost:${PORT}/%`}`;
    const ids = await sql`SELECT result_id FROM analysis_cache WHERE url_key LIKE 'https://phase2-test-%' OR url_key LIKE ${`http://localhost:${PORT}/%`}`;
    await sql`DELETE FROM analysis_cache WHERE url_key LIKE 'https://phase2-test-%' OR url_key LIKE ${`http://localhost:${PORT}/%`}`;
    for (const r of ids) await sql`DELETE FROM analysis_results WHERE id::text = ${String(r.result_id)}`;
}

/* ---------- list mode ---------- */
async function seed(urlKey, domain, events, daysAgo) {
    await sql`INSERT INTO analysis_cache (url_key, analysis_version, result_id, domain, risk_score, risk_level, lang)
        VALUES (${urlKey}, ${VERSION}, ${"phase2-test-" + domain}, ${domain}, 42, 'Moderate Risk', 'en')
        ON CONFLICT (url_key, analysis_version) DO NOTHING`;
    for (let i = 0; i < events; i++) {
        await sql`INSERT INTO analysis_events (url_key, analysis_version, source, created_at)
            VALUES (${urlKey}, ${VERSION}, ${i % 2 ? "cache" : "model"}, now() - (${daysAgo} * interval '1 day') - (${i} * interval '1 minute'))`;
    }
}

async function runList() {
    await seed("https://phase2-test-a.example/privacy", "phase2-test-a.example", 5, 1); // 5 recent  -> listed, count 5
    await seed("https://phase2-test-b.example/privacy", "phase2-test-b.example", 1, 1); // 1 recent   -> not listed
    await seed("https://phase2-test-c.example/privacy", "phase2-test-c.example", 5, 40); // 5 old     -> not counted
    await seed("https://phase2-test-d.example/privacy", "phase2-test-d.example", 6, 1); // same domain, two keys
    await seed("https://phase2-test-d.example/terms", "phase2-test-d.example", 5, 1); //  -> ONE row, count 6

    const res = await fetch(`${base}/popular`);
    const html = await res.text();
    const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
    const main = mainMatch ? mainMatch[1] : "";
    check("/popular answers 200 (POPULAR_PAGE on)", res.status === 200, `status: ${res.status}`);

    check("5 events in 30 days: listed with 'analyzed 5 times'",
        main.includes("phase2-test-a.example") && /phase2-test-a\.example[\s\S]*?analyzed 5 times/.test(main));
    check("1 event: not listed", !main.includes("phase2-test-b.example"));
    check("5 events older than 30 days: not listed", !main.includes("phase2-test-c.example"));
    const dCount = (main.match(/phase2-test-d\.example/g) || []).length;
    check("two URL keys on one domain: one row, count of the busiest key (6)",
        dCount === 1 && /phase2-test-d\.example[\s\S]*?analyzed 6 times/.test(main), `rows for that domain: ${dCount}`);

    // Rendered output scan. Link targets are removed first (the result link has an id and from=popular).
    const text = main.replace(/href="[^"]*"/g, "");
    check("no full URL (no http/https, no path after a domain)",
        !/https?:\/\//i.test(text) && !/phase2-test-[a-d]\.example\//.test(text));
    check("no IP address", !/\b\d{1,3}(\.\d{1,3}){3}\b/.test(text) && !/\b[0-9a-f]{1,4}(:[0-9a-f]{1,4}){5,7}\b/i.test(text));
    check("no user id or other uuid in the text",
        !/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i.test(text));
    check("no email address, search box or query text", !/@/.test(text) && !/<input/i.test(main) && !/[?&](q|query|search)=/i.test(text));
    check("neutral wording: no 'popular', 'most trusted', 'best'", !/popular|most trusted|best/i.test(text));

    // The only query behind the page
    const src = fs.readFileSync(new URL("../src/database/popularDb.js", import.meta.url), "utf8");
    const start = src.indexOf("await sql`");
    const query = src.slice(start, src.indexOf("`;", start));
    const finalSelect = query.slice(query.indexOf("SELECT d.domain"), query.indexOf("FROM (", query.indexOf("SELECT d.domain")));
    check("SQL reads only analysis_events and analysis_cache",
        /FROM analysis_events/.test(query) && /JOIN analysis_cache/.test(query) &&
        !/\b(users|analyses|rate_events|ai_usage|password_reset_tokens|email_change_requests|user_settings)\b/i.test(query));
    check("SQL has no user, ip, email, search or query-text field", !/user|ip_|_ip|email|search|\bq\b|query_text/i.test(query));
    check("SQL never returns url_key", finalSelect.length > 0 && !/url_key/.test(finalSelect));
}
/* ---------- reuse / rerun modes ---------- */
async function runReuse() {
    const path = `/reuse-${Date.now()}`;
    const typed = `http://localhost:${PORT}${path}?utm_source=phase2test`;

    const first = await analyze(path);
    check("first analysis succeeded with 1 model call", first.status === 200 && modelCalls === 1, `model calls: ${modelCalls}`);
    modelCalls = 0;

    const hit = await analyze(path);
    const hitTyped = await fetch(`${base}/api/analyze`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: typed, lang: "en" }),
    }).then(async (r) => ({ status: r.status, body: await r.json().catch(() => ({})) }));
    check("pasting a cached URL: served from the cache", hit.body.fromCache === true && hitTyped.body.fromCache === true);
    check("no model call was made", modelCalls === 0, `model calls: ${modelCalls}`);
    const modelEvents = await eventCount(path, "model");
    const cacheEvents = await eventCount(path, "cache");
    check("events table: 1 model event, 2 cache events", modelEvents === 1 && cacheEvents === 2,
        `model: ${modelEvents}, cache: ${cacheEvents}`);

    const rec = await fetch(`${base}/api/result/${hitTyped.body.id}`).then((r) => r.json());
    check("record shows the analysis date and is marked reused (REUSE_CACHED on)", Boolean(rec.analyzedAt) && rec.reusedCached === true);
    check("the URL the visitor typed is kept exactly", rec.url === typed);
}

async function runRerun() {
    const path = `/rerun-${Date.now()}`;
    await analyze(path);
    const before = await cacheRow(path);
    check("setup: first analysis cached", Boolean(before));
    const modelEventsBefore = await eventCount(path, "model");
    await new Promise((r) => setTimeout(r, 50));

    modelCalls = 0;
    const ok = await analyze(path, { rerun: true });
    const after = await cacheRow(path);
    check("re-run makes exactly 1 model call", ok.status === 200 && ok.body.fromCache === false && modelCalls === 1, `model calls: ${modelCalls}`);
    check("re-run updated the cache entry",
        Boolean(after) && after.result_id !== before.result_id && new Date(after.created_at) > new Date(before.created_at));
    check("re-run recorded one more model event", (await eventCount(path, "model")) === modelEventsBefore + 1);

    // A failed re-run (the mock answers 429 every time) must leave the entry unchanged
    mockMode = "429";
    modelCalls = 0;
    const kept = await cacheRow(path);
    const modelEvents = await eventCount(path, "model");
    const failed = await analyze(path, { rerun: true });
    const unchanged = await cacheRow(path);
    mockMode = "ok";
    check("failed re-run returns the busy answer, no result", failed.status === 429 && failed.body.code === "busy" && !failed.body.id, `status: ${failed.status}`);
    check("failed re-run did call the model (the cache was not read)", modelCalls >= 1, `model calls: ${modelCalls}`);
    check("failed re-run left the cache entry unchanged",
        Boolean(unchanged) && unchanged.result_id === kept.result_id &&
        new Date(unchanged.created_at).getTime() === new Date(kept.created_at).getTime());
    check("failed re-run recorded no event", (await eventCount(path, "model")) === modelEvents);
}

/* ---------- main ---------- */
await new Promise((r) => mock.listen(PORT, r));
console.log(`mode=${mode}`);
try {
    if (mode === "list") await runList();
    else if (mode === "reuse") await runReuse();
    else if (mode === "rerun") await runRerun();
    else {
        console.log("Unknown mode. Use: list | reuse | rerun");
        process.exitCode = 2;
    }
} finally {
    await cleanup().catch(() => console.log("cleanup failed: remove rows with url_key like 'https://phase2-test-%' or 'http://localhost:4011/%' by hand"));
    mock.close();
}
if (results.length) {
    console.log(`${results.filter(Boolean).length}/${results.length} checks passed`);
    if (results.some((r) => !r)) process.exitCode = 1;
}


