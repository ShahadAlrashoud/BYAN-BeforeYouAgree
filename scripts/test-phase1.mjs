// Phase 1 checks. NOT run automatically. Run only against the DEVELOPMENT branch.
//
// It starts a local MOCK of the Groq API and of a policy page (no real model call, no real tokens),
// then sends requests to a dev server that you start yourself, pointed at the mock:
//
//   DATABASE_URL=<value of CLINE_DATABASE_URL>  GROQ_API_URL=http://localhost:4010/v1/chat/completions
//   FLAG_RESULT_CACHE=true FLAG_AI_RELIABILITY=true FLAG_TOKEN_BUDGET=true FLAG_SHOW_METHOD=true
//   next dev            (+ per mode, see below)
//
// Usage:  node scripts/test-phase1.mjs <mode> [BASE_URL]      (BASE_URL default http://localhost:3000)
//   cache    same URL 5x: 1 model call, 4 cache hits (confirms the hit count in analysis_events)
//   version  start the server with ANALYSIS_VERSION_TEST=v2, run AFTER "cache" with the same TEST_PATH:
//            the cache is bypassed (1 model call)
//   429      mock always answers 429 (retry-after: 1): busy message, no keyword result.
//            Start the server with ALLOW_KEYWORD_FALLBACK unset. Uses a new URL.
//   budget   start the server with DAILY_TOKEN_BUDGET=1, run AFTER "cache" with the same TEST_PATH:
//            the cached URL still loads, a new URL gets the busy answer with no model call
//
// Set TEST_PATH to reuse one URL across modes (printed at the start). Only counts and status codes are printed.
// Needs CLINE_DATABASE_URL in the environment (development branch) for the cache hit count.
import http from "node:http";
import crypto from "node:crypto";
import { neon } from "@neondatabase/serverless";

const mode = process.argv[2];
const base = process.argv[3] || "http://localhost:3000";
const PORT = 4010;
const path = process.env.TEST_PATH || `/privacy-${crypto.randomBytes(4).toString("hex")}`;

const SENTENCE = "We may sell your personal information to third party advertisers and data brokers for profit.";
const FILLER = "This paragraph is filler so the page is long enough to be treated as a policy. ".repeat(4);
const PAGE = `<html><body><h1>Privacy Policy</h1><p>${SENTENCE} We keep your data for as long as we like, and we can change these terms at any time without telling you.</p><p>${FILLER}</p></body></html>`;

let modelCalls = 0;
const server = http.createServer((req, res) => {
    if (req.method === "POST" && req.url.startsWith("/v1/chat/completions")) {
        req.resume();
        req.on("end", () => {
            modelCalls++;
            if (mode === "429") {
                res.writeHead(429, { "retry-after": "1", "content-type": "application/json" });
                return res.end(JSON.stringify({ error: { message: "rate limit" } }));
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
            res.end(JSON.stringify({
                choices: [{ message: { content } }],
                usage: { prompt_tokens: 3000, completion_tokens: 500, total_tokens: 3500 },
            }));
        });
        return;
    }
    res.writeHead(200, { "content-type": "text/html" });
    res.end(PAGE);
});

const analyze = async (p) => {
    const res = await fetch(`${base}/api/analyze`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: `http://localhost:${PORT}${p}`, lang: "en" }),
    });
    return { status: res.status, body: await res.json().catch(() => ({})) };
};

const results = [];
const check = (name, ok, detail = "") => {
    results.push(ok);
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  (" + detail + ")" : ""}`);
};

async function eventCount(p, source) {
    const sql = neon(process.env.CLINE_DATABASE_URL);
    const key = `http://localhost:${PORT}${p}`;
    const rows = await sql`SELECT count(*)::int AS n FROM analysis_events WHERE url_key = ${key} AND source = ${source}`;
    return rows[0].n;
}


await new Promise((r) => server.listen(PORT, r));
console.log(`mode=${mode} TEST_PATH=${path}`);
// Diagnostic: the origin only (scheme, host, port), so no path or query string is ever printed
try {
    console.log(`base=${new URL(base).origin}`);
} catch {
    console.log("base=(not a valid URL)");
}

try {
    if (mode === "cache") {
        const out = [];
        for (let i = 0; i < 5; i++) out.push(await analyze(path));
        // Diagnostic: the HTTP status of each request, on one line, before the checks
        console.log(`statuses: ${out.map((o) => o.status).join(",")}`);
        check("all 5 requests succeeded", out.every((o) => o.status === 200 && o.body.id));
        check("model called exactly once", modelCalls === 1, `model calls: ${modelCalls}`);
        check("first is new, next four from cache",
            out[0].body.fromCache === false && out.slice(1).every((o) => o.body.fromCache === true),
            `fromCache flags: ${out.map((o) => o.body.fromCache).join(",")}`);
        const hits = await eventCount(path, "cache");
        check("cache hit count in analysis_events is 4", hits === 4, `cache hits: ${hits}`);
    } else if (mode === "version") {
        const o = await analyze(path);
        check("request succeeded", o.status === 200);
        check("cache bypassed: model called once", modelCalls === 1 && o.body.fromCache === false, `model calls: ${modelCalls}`);
    } else if (mode === "429") {
        const o = await analyze(path);
        check("busy status 429", o.status === 429, `status: ${o.status}`);
        check("busy response with retry suggestion", o.body.code === "busy" && o.body.retryAfterSeconds > 0);
        check("no keyword result returned (no result id)", !o.body.id);
        check("tried 1 + 2 retries = 3 model calls", modelCalls === 3, `model calls: ${modelCalls}`);
    } else if (mode === "budget") {
        const cached = await analyze(path);
        check("cached URL still loads", cached.status === 200 && cached.body.fromCache === true, `status: ${cached.status}`);
        const fresh = await analyze(path + "-new");
        check("new URL gets the busy answer", fresh.status === 503 && fresh.body.reason === "budget", `status: ${fresh.status}`);
        check("no model call was made", modelCalls === 0, `model calls: ${modelCalls}`);
    } else {
        console.log("Unknown mode. Use: cache | version | 429 | budget");
        process.exitCode = 2;
    }
} finally {
    server.close();
}

if (results.length) {
    console.log(`${results.filter(Boolean).length}/${results.length} checks passed`);
    if (results.some((r) => !r)) process.exitCode = 1;
}