import { NextResponse } from "next/server";
import { requireUser, readJson, logEvent, noStore } from "@/lib/accountApi";
import { countSavedResults, clearSavedResults } from "@/database/accountDb";

// GET: how many saved results the signed-in user has (the number shown in the confirmation)
export async function GET() {
    const { user, error } = await requireUser();
    if (error) return error;
    return NextResponse.json({ count: await countSavedResults(user.id) }, { headers: noStore });
}

// DELETE { confirmCount }: removes the user's SAVED LIST entries only.
// The account is not touched, and the stored result records behind share links are not touched.
// The number the person confirmed must match the current count; if it changed, nothing is deleted.
export async function DELETE(request) {
    const { user, error } = await requireUser();
    if (error) return error;

    const body = await readJson(request);
    if (!body || !Number.isInteger(body.confirmCount) || body.confirmCount < 0) {
        return NextResponse.json({ error: "invalid" }, { status: 400 });
    }

    const current = await countSavedResults(user.id);
    if (current !== body.confirmCount) {
        return NextResponse.json({ error: "count_changed", count: current }, { status: 409 });
    }

    const deleted = await clearSavedResults(user.id);
    logEvent("ACCOUNT_CLEAR_SAVED", { deleted });
    return NextResponse.json({ deleted }, { headers: noStore });
}
