import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Resend } from "resend";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getUserById, deleteUserAccount } from "@/database/db";
import { ACCOUNT_V2 } from "@/lib/flags";
import { checkReauth } from "@/lib/reauth";
import { tooMany } from "@/lib/accountApi";

const escapeHtml = (s) =>
    String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

// The user must type their email address or the word DELETE
function isConfirmed(input, email) {
    const typed = String(input ?? "").trim().toLowerCase();
    if (!typed) return false;
    return typed === "delete" || typed === String(email ?? "").trim().toLowerCase();
}

// Returns true if the email was sent. Never throws: the account is already deleted by now.
async function sendDeletionEmail({ to, username, lang }) {
    const from = process.env.EMAIL_FROM || process.env.CONTACT_FROM_EMAIL;
    if (!process.env.RESEND_API_KEY || !from) {
        console.error("DELETE ACCOUNT: missing RESEND_API_KEY or EMAIL_FROM / CONTACT_FROM_EMAIL");
        return false;
    }

    const isAr = lang === "ar";
    const name = escapeHtml(username || "");

    const subject = isAr
        ? "تم حذف حسابك في بيان"
        : "Your BYAN account has been deleted";

    const html = isAr
        ? `<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.7">
            <p>مرحبًا ${name}،</p>
            <p>نؤكد لك أنه تم حذف حسابك في بيان نهائيًا، ويشمل ذلك ملفك الشخصي وبيانات تسجيل الدخول وجميع نتائج التحليل المحفوظة. وقد تم تسجيل خروجك من جميع الأجهزة.</p>
            <p>إذا لم تطلب حذف الحساب، يُرجى التواصل معنا في أقرب وقت.</p>
            <p>— بيان</p>
          </div>`
        : `<div style="font-family:Arial,sans-serif;line-height:1.7">
            <p>Hi ${name},</p>
            <p>This confirms that your BYAN account has been permanently deleted. This includes your profile, your sign-in details and all of your saved analysis results. You have been signed out on all devices.</p>
            <p>If you didn't ask to delete your account, please contact us as soon as possible.</p>
            <p>— BYAN</p>
          </div>`;

    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { error } = await resend.emails.send({ from, to, subject, html });
        if (error) {
            console.error("DELETE ACCOUNT EMAIL ERROR:", error);
            return false;
        }
        return true;
    } catch (err) {
        console.error("DELETE ACCOUNT EMAIL ERROR:", err);
        return false;
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let body = {};
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: "Invalid request." }, { status: 400 });
        }

        // Use the stored account, not the (possibly stale) token, as the source of truth
        const user = await getUserById(session.user.id);
        if (!user) {
            return NextResponse.json({ error: "Account not found." }, { status: 404 });
        }

        if (!isConfirmed(body.confirmation, user.email)) {
            return NextResponse.json({ error: "Confirmation does not match." }, { status: 400 });
        }

        // Account v2: the typed confirmation is not enough. The person must also re-authenticate
        // (password, or a fresh sign-in if the account has no password). This cannot be skipped.
        if (ACCOUNT_V2) {
            const reauth = await checkReauth({ user, session, password: body.password });
            if (!reauth.ok) {
                if (reauth.status === 429) return tooMany(reauth.retryAfter);
                return NextResponse.json({ error: reauth.error }, { status: reauth.status });
            }
        }

        const deleted = await deleteUserAccount(user.id);
        if (!deleted) {
            return NextResponse.json({ error: "Account not found." }, { status: 404 });
        }

        // Deletion is complete: now send the confirmation email
        const emailSent = await sendDeletionEmail({
            to: user.email,
            username: user.username,
            lang: body.lang === "ar" ? "ar" : "en",
        });

        return NextResponse.json({ success: true, emailSent }, { status: 200 });
    } catch (err) {
        console.error("DELETE ACCOUNT ERROR:", err);
        return NextResponse.json({ error: "Could not delete the account." }, { status: 500 });
    }
}
