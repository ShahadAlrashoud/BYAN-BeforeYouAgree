import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { runAnalysisForUrl, runAnalysisForText, lookupCachedAnalysis } from "../analysisService";
import { aiFlags, aiLimits, ALLOWANCE_PER_DAY, ALLOWANCE_WINDOW_SECONDS } from "@/lib/aiConfig";
import { aiMessage } from "@/lib/aiMessages";
import { AiError } from "@/lib/aiClient";
import { getClientIp } from "@/lib/clientIp";
import { hashKey } from "@/database/accountDb";
import { takeAnalysisSlot, noteCacheServe, takeDailyAllowance } from "@/database/aiDb";
import { providerFor, PROVIDER_COOKIE } from "@/lib/providerAccess";

// The "busy" answer: nothing was analyzed and no keyword result is returned.
function busyResponse(code, lang, retryAfterSeconds) {
    const retryAfter = Math.max(1, Math.ceil(retryAfterSeconds || 60));
    return NextResponse.json(
        {
            error: aiMessage(code, lang),
            code: "busy",
            reason: code,
            retryAfterSeconds: retryAfter,
        },
        {
            // "daily_allowance" is a limit on this visitor (429), not a fault of the service
            status: code === "budget" || code === "unavailable" ? 503 : 429,
            headers: { "Retry-After": String(retryAfter) },
        }
    );
}

export async function POST(request) {
    let preferredLang = "en"; // also used by the busy message in the catch block
    try {
        const body = await request.json();
        const url = body?.url?.trim();
        const text = body?.text?.trim();
        preferredLang = body?.lang === "ar" ? "ar" : "en";

        if (!url && !text) {
            return NextResponse.json(
                { error: "URL or text is required." },
                { status: 400 }
            );
        }

        // "free" is the default. "full" needs the access cookie, checked here on the server.
        // The page's picker only decides what is sent; this check is what enforces it.
        const tier = body?.tier === "full" ? "full" : "free";
        if (tier === "full" && providerFor(request.cookies.get(PROVIDER_COOKIE)?.value) !== "openai") {
            return NextResponse.json(
                { error: "Access code required.", code: "access_required" },
                { status: 403 }
            );
        }

        const session = await getServerSession(authOptions);
        const userId = session?.user?.id || null;

        // 1) Cache check FIRST: before any rate limit, fetch or model call. Cached results always load,
        //    even when the daily budget is used up. Screenshots (text) are never cached.
        // Re-run (REUSE_CACHED on): skips the cache READ only. It still goes through the per-IP limit, the daily
        // budget and the AI call below, and the cache entry is replaced only after a successful AI result
        // (buildAndSaveRecord), so a failed re-run leaves the existing entry unchanged. Flag off: ignored.
        const rerun = body?.rerun === true && aiFlags().reuseCached;

        if (!text && !rerun) {
            const cached = await lookupCachedAnalysis(url, preferredLang, userId, tier);
            if (cached.record) {
                // Counted under a separate kind, so cache hits never count toward the AI limits
                if (aiFlags().analysisRateLimits) {
                    try {
                        await noteCacheServe(hashKey(getClientIp(request)));
                    } catch {
                        console.error("CACHE HIT COUNT FAILED");
                    }
                }
                return NextResponse.json({ id: cached.record.id, fromCache: true }, { status: 200 });
            }
        }

        // 2a) Daily allowance (DAILY_ALLOWANCE): 1 real analysis per visitor per 24 hours, hashed IP.
        //     It sits AFTER the cache check, so cached results never use it, and it covers every path that reaches
        //     this point: a web address, pasted text, screenshots (which post text) and Compare (which posts
        //     addresses). The demo never calls this route. It fails open if the counter cannot be read, as the
        //     per-IP limits below do. Shared networks share one allowance (accepted by the owner).
        //     The allowance is used when the analysis STARTS: a run that then fails still counts. That is the
        //     simple, abuse-resistant choice, and it is stated here so it is a known behaviour.
        if (aiFlags().dailyAllowance) {
            let allowance = { ok: true };
            try {
                allowance = await takeDailyAllowance(
                    hashKey(getClientIp(request)),
                    ALLOWANCE_PER_DAY,
                    ALLOWANCE_WINDOW_SECONDS
                );
            } catch {
                console.error("DAILY ALLOWANCE CHECK FAILED");
            }
            if (!allowance.ok) return busyResponse("daily_allowance", preferredLang, allowance.retryAfter);
        }

        // 2) Per-IP limits on analyses that need the AI (FLAG_ANALYSIS_RATE_LIMITS). Fails open if the
        //    counter cannot be read.
        if (aiFlags().analysisRateLimits) {
            const { analysisPerMinute, analysisPerHour } = aiLimits();
            let slot = { ok: true };
            try {
                slot = await takeAnalysisSlot(hashKey(getClientIp(request)), analysisPerMinute, analysisPerHour);
            } catch {
                console.error("ANALYSIS RATE LIMIT CHECK FAILED");
            }
            if (!slot.ok) return busyResponse("ip_limit", preferredLang, slot.retryAfter);
        }

        const result = text
            ? await runAnalysisForText(text, preferredLang, userId, tier)
            : await runAnalysisForUrl(url, preferredLang, userId, tier);

        return NextResponse.json({ id: result.id, fromCache: false }, { status: 200 });
    } catch (error) {
        // Busy / budget / AI unavailable: a clear message, no keyword result
        if (error instanceof AiError) {
            const reason = error.kind === "budget" ? "budget" : error.kind === "rate_limited" ? "busy" : "unavailable";
            console.error("ANALYSIS API ERROR:", error.kind);
            return busyResponse(reason, preferredLang, error.retryAfterSeconds);
        }
        console.error("ANALYSIS API ERROR:", error);

        return NextResponse.json(
            {
                error: error instanceof Error
                    ? error.message
                    : "An unknown server error occurred."
            },
            { status: 500 }
        );
    }
}