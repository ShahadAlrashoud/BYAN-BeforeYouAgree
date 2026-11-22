import { NextResponse } from "next/server";
import { requireUser, tooMany, logEvent } from "@/lib/accountApi";
import { exportUserData, takeToken, hashKey } from "@/database/accountDb";

// Defaults can be tuned without a code change
const MAX = Number(process.env.EXPORT_RATE_MAX) || 3;
const WINDOW = Number(process.env.EXPORT_RATE_WINDOW_SECONDS) || 3600;

// GET: a JSON file with the signed-in user's own profile fields, settings and saved results.
// The query is built from the session's user id only, so no other user's data can be included.
export async function GET() {
    const started = Date.now();
    const { user, error } = await requireUser();
    if (error) return error;

    const limit = await takeToken(hashKey(user.id), "export", MAX, WINDOW);
    if (!limit.ok) {
        logEvent("ACCOUNT_EXPORT", { status: 429 });
        return tooMany(limit.retryAfter);
    }

    try {
        const data = await exportUserData(user.id);
        const file = {
            exportedAt: new Date().toISOString(),
            profile: data.profile
                ? {
                      username: data.profile.username ?? null,
                      displayName: data.profile.display_name ?? null,
                      email: data.profile.email,
                      createdAt: data.profile.created_at,
                  }
                : null,
            settings: data.settings,
            savedResults: data.results.map((r) => ({
                id: r.id,
                title: r.title,
                url: r.query,
                summary: r.result,
                riskScore: r.risk_score,
                riskLevel: r.risk_level,
                savedAt: r.created_at,
            })),
        };

        // Log the fact of the request and its size only, never the contents
        logEvent("ACCOUNT_EXPORT", { status: 200, results: file.savedResults.length, ms: Date.now() - started });

        return new NextResponse(JSON.stringify(file, null, 2), {
            status: 200,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Content-Disposition": 'attachment; filename="byan-my-data.json"',
                "Cache-Control": "no-store",
            },
        });
    } catch (err) {
        console.error("ACCOUNT_EXPORT failed", err?.name || "error");
        return NextResponse.json({ error: "server" }, { status: 500 });
    }
}
