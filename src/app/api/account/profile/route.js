import { NextResponse } from "next/server";
import { requireUser, readJson, noStore } from "@/lib/accountApi";
import { updateDisplayName } from "@/database/accountDb";

const MAX_NAME = 60;

// GET: the signed-in user's own profile fields. The user id is never returned.
export async function GET() {
    const { user, error } = await requireUser();
    if (error) return error;
    return NextResponse.json(
        { displayName: user.displayName, email: user.email, hasPassword: Boolean(user.passwordHash) },
        { headers: noStore }
    );
}

// PATCH { displayName }: set or clear (empty string) the display name
export async function PATCH(request) {
    const { user, error } = await requireUser();
    if (error) return error;

    const body = await readJson(request);
    if (!body || typeof body.displayName !== "string") {
        return NextResponse.json({ error: "invalid" }, { status: 400 });
    }

    // Collapse whitespace; reject control characters and angle brackets (the name is shown in the UI and in emails)
    const name = body.displayName.replace(/\s+/g, " ").trim();
    if (name.length > MAX_NAME || /[\u0000-\u001f<>]/.test(name)) {
        return NextResponse.json({ error: "invalid" }, { status: 400 });
    }

    const saved = await updateDisplayName(user.id, name || null);
    return NextResponse.json({ displayName: saved ?? null }, { headers: noStore });
}
