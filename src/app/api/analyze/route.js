import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { runAnalysisForUrl, runAnalysisForText, lookupCachedAnalysis } from "../analysisService";
import { aiFlags, aiLimits } from "@/lib/aiConfig";
import { aiMessage } from "@/lib/aiMessages";
import { AiError } from "@/lib/aiClient";
import { getClientIp } from "@/lib/clientIp";
import { hashKey } from "@/database/accountDb";
import { takeAnalysisSlot, noteCacheServe } from "@/database/aiDb";

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

        const session = await getServerSession(authOptions);
        const userId = session?.user?.id || null;

        // 1) Cache check FIRST: before any rate limit, fetch or model call. Cached results always load,
        //    even when the daily budget is used up. Screenshots (text) are never cached.
        // Re-run (REUSE_CACHED on): skips the cache READ only. It still goes through the per-IP limit, the daily
        // budget and the AI call below, and the cache entry is replaced only after a successful AI result
        // (buildAndSaveRecord), so a failed re-run leaves the existing entry unchanged. Flag off: ignored.
        const rerun = body?.rerun === true && aiFlags().reuseCached;

        if (!text && !rerun) {
            const cached = await lookupCachedAnalysis(url, preferredLang, userId);
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
            ? await runAnalysisForText(text, preferredLang, userId)
            : await runAnalysisForUrl(url, preferredLang, userId);

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