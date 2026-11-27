import { NextResponse } from "next/server";
import { accessToken, checkCode, providerFor, PROVIDER_COOKIE } from "@/lib/providerAccess";

// Does this visitor have the access cookie? The picker uses this to show the full option as unlocked.
export async function GET(request) {
    const unlocked = providerFor(request.cookies.get(PROVIDER_COOKIE)?.value) === "openai";
    return NextResponse.json({ unlocked });
}

// Checks the code and sets the cookie.
export async function POST(request) {
    const body = await request.json().catch(() => null);
    if (!checkCode(body?.code)) {
        return NextResponse.json({ error: "Invalid code." }, { status: 403 });
    }
    const response = NextResponse.json({ ok: true });
    response.cookies.set(PROVIDER_COOKIE, accessToken(), {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
    });
    return response;
}

export async function DELETE() {
    const response = NextResponse.json({ ok: true });
    response.cookies.delete(PROVIDER_COOKIE);
    return response;
}