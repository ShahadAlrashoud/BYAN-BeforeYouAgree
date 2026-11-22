import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import crypto from "crypto";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { requireUser, readJson, tooMany, logEvent, noStore } from "@/lib/accountApi";
import { checkReauth, takeToken } from "@/lib/reauth";
import { getUserByEmail } from "@/database/db";
import { createEmailChange, hashKey } from "@/database/accountDb";
import { sendMail, escapeHtml } from "@/lib/mail";

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
const MAX = Number(process.env.EMAIL_CHANGE_MAX) || 3;
const WINDOW = Number(process.env.EMAIL_CHANGE_WINDOW_SECONDS) || 3600;
const LINK_HOURS = Number(process.env.EMAIL_CHANGE_LINK_HOURS) || 24;

// POST { newEmail, password }: sends a verification link to the NEW address.
// users.email is NOT changed here. It only changes when the link is used (see /confirm).
export async function POST(request) {
    const { user, error } = await requireUser();
    if (error) return error;

    const body = await readJson(request);
    const newEmail = String(body?.newEmail ?? "").toLowerCase().trim();
    if (!EMAIL_RE.test(newEmail) || newEmail.length > 254) {
        return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }
    const lang = body?.lang === "ar" ? "ar" : "en";

    const limit = await takeToken(hashKey(user.id), "email_change", MAX, WINDOW);
    if (!limit.ok) return tooMany(limit.retryAfter);

    // Changing the sign-in email is sensitive: ask for the password again
    const session = await getServerSession(authOptions);
    const reauth = await checkReauth({ user, session, password: body?.password });
    if (!reauth.ok) {
        if (reauth.status === 429) return tooMany(reauth.retryAfter);
        return NextResponse.json({ error: reauth.error }, { status: reauth.status });
    }

    if (newEmail === String(user.email).toLowerCase()) {
        return NextResponse.json({ error: "same_email" }, { status: 400 });
    }

    // Same answer whether or not the address is taken, so this cannot be used to discover accounts
    const taken = await getUserByEmail(newEmail);
    if (!taken) {
        const token = crypto.randomBytes(32).toString("hex");
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
        await createEmailChange({
            userId: user.id,
            newEmail,
            tokenHash,
            expiresAt: new Date(Date.now() + LINK_HOURS * 3600 * 1000),
            lang,
        });

        const base = process.env.NEXT_PUBLIC_APP_URL || "";
        const link = `${base}/account/confirm-email?token=${token}`;
        const isAr = lang === "ar";
        // [AR review pending] Arabic email text below
        await sendMail({
            to: newEmail,
            subject: isAr ? "تأكيد عنوان بريدك الإلكتروني الجديد في بيان" : "Confirm your new BYAN email address",
            html: isAr
                ? `<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.7"><p>طلب أحدهم تغيير البريد الإلكتروني لحساب في بيان إلى هذا العنوان. لتأكيد التغيير، اضغط على الرابط التالي (صالح لمدة ${LINK_HOURS} ساعة):</p><p><a href="${escapeHtml(link)}">${escapeHtml(link)}</a></p><p>إذا لم تطلب ذلك، تجاهل هذه الرسالة ولن يتغير شيء.</p></div>`
                : `<div style="font-family:Arial,sans-serif;line-height:1.7"><p>Someone asked to change the email address of a BYAN account to this address. To confirm the change, open the link below (valid for ${LINK_HOURS} hours):</p><p><a href="${escapeHtml(link)}">${escapeHtml(link)}</a></p><p>If you didn't ask for this, ignore this message and nothing will change.</p></div>`,
        });
    }

    logEvent("ACCOUNT_EMAIL_CHANGE_REQUEST", { status: 200 });
    return NextResponse.json({ ok: true }, { headers: noStore });
}
