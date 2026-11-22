// Sends one email through Resend. Returns true/false and never throws.
// Logs only the error type, never the recipient, subject or body.
import { Resend } from "resend";

export async function sendMail({ to, subject, html }) {
    const from = process.env.EMAIL_FROM || process.env.CONTACT_FROM_EMAIL;
    if (!process.env.RESEND_API_KEY || !from) {
        console.error("MAIL: not configured (RESEND_API_KEY or EMAIL_FROM missing)");
        return false;
    }
    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { error } = await resend.emails.send({ from, to, subject, html });
        if (error) {
            console.error("MAIL: send failed", error.name || "error");
            return false;
        }
        return true;
    } catch (err) {
        console.error("MAIL: send threw", err?.name || "error");
        return false;
    }
}

export const escapeHtml = (s) =>
    String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
