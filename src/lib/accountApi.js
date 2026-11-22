// Shared helpers for the /api/account/* routes added with Account v2.
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getUserById } from "@/database/db";
import { ACCOUNT_V2 } from "@/lib/flags";

// Returns { user } for a signed-in user, or { error: Response } to send back.
// With the feature flag off these routes behave as if they do not exist.
export async function requireUser() {
    if (!ACCOUNT_V2) {
        return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
    }
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }
    const user = await getUserById(session.user.id);
    if (!user) {
        return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }
    return { user };
}

export function tooMany(retryAfter) {
    return NextResponse.json(
        { error: "rate_limited", retryAfter },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
}

// One-line event log. Callers pass counts and status only: never ids, emails or contents.
export function logEvent(name, data = {}) {
    console.info(name, JSON.stringify(data));
}

export async function readJson(request) {
    try {
        return await request.json();
    } catch {
        return null;
    }
}

export const noStore = { "Cache-Control": "no-store" };
