import { NextResponse } from "next/server";
import crypto from "crypto";
import { ACCOUNT_V2 } from "@/lib/flags";
import { getUserById } from "@/database/db";
import { findEmailChange, applyEmailChange, takeToken, hashKey } from "@/database/accountDb";
import { sendMail, escapeHtml } from "@/lib/mail";
import { readJson, tooMany, logEvent, noStore } from "@/lib/accountApi";

// POST { token }: this is the ONLY place users.email changes.
// It is a POST (not a GET link action) so email scanners that pre-open links cannot trigger it.
export async function POST(request) {
    if (!ACCOUNT_V2) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await readJson(request);
    const token = typeof body?.token === "string" ? body.token : "";
    if (!/^[a-f0-9]{64}$/.test(token)) {
        return NextResponse.json({ error: "invalid_or_expired" }, { status: 400 });
    }

    // Slow down anyone trying many tokens
    const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
    const limit = await takeToken(hashKey(ip), "email_confirm", 20, 3600);
    if (!limit.ok) return tooMany(limit.retryAfter);

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const change = await findEmailChange(tokenHash);
    if (!change) {
        return NextResponse.json({ error: "invalid_or_expired" }, { status: 400 });
    }

    const before = await getUserById(change.userId);
    if (!before) return NextResponse.json({ error: "invalid_or_expired" }, { status: 400 });
    const oldEmail = before.email;

    const changed = await applyEmailChange({ userId: change.userId, newEmail: change.newEmail });
    if (!changed) {
        // The address was taken by another account in the meantime
        return NextResponse.json({ error: "email_taken" }, { status: 409 });
    }

    // Notice to the OLD address, now that the change is complete
    const isAr = change.lang === "ar";
    //  Arabic email text below
    await sendMail({
        to: oldEmail,
        subject: isAr ? "تم تغيير البريد الإلكتروني لحسابك في بيان" : "The email address on your BYAN account was changed",
        html: isAr
            ? `<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.7"><p>نُعلمك بأنه تم تغيير البريد الإلكتروني لحسابك في بيان إلى <strong>${escapeHtml(change.newEmail)}</strong>.</p><p>إذا لم تكن أنت من طلب ذلك، يُرجى التواصل معنا فورًا.</p></div>`
            : `<div style="font-family:Arial,sans-serif;line-height:1.7"><p>This is to let you know that the email address on your BYAN account was changed to <strong>${escapeHtml(change.newEmail)}</strong>.</p><p>If you didn't make this change, please contact us right away.</p></div>`,
    });

    logEvent("ACCOUNT_EMAIL_CHANGE_DONE", { status: 200 });
    return NextResponse.json({ ok: true }, { headers: noStore });
}
