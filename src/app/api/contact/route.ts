import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function POST(req: Request) {
    try {
        const { name, email, topic, message } = await req.json();

        if (!name || !email || !topic || !message) {
            return NextResponse.json({ error: "required" }, { status: 400 });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: "email" }, { status: 400 });
        }
        if (!process.env.RESEND_API_KEY || !process.env.CONTACT_TO_EMAIL || !process.env.CONTACT_FROM_EMAIL) {
            console.error("Missing Resend env vars");
            return NextResponse.json({ error: "config" }, { status: 500 });
        }

        // 1) Message to you
        const { error } = await resend.emails.send({
            from: process.env.CONTACT_FROM_EMAIL,
            to: process.env.CONTACT_TO_EMAIL,
            replyTo: email,
            subject: `[BYAN Contact] ${topic} - ${name}`,
            html: `
                <p><strong>Name:</strong> ${escapeHtml(name)}</p>
                <p><strong>Email:</strong> ${escapeHtml(email)}</p>
                <p><strong>Topic:</strong> ${escapeHtml(topic)}</p>
                <p><strong>Message:</strong></p>
                <p>${escapeHtml(message).replace(/\n/g, "<​br/>")}</p>
            `
        });

        // Resend returns errors instead of throwing
        if (error) {
            console.error("Resend error:", error);
            return NextResponse.json({ error: "send" }, { status: 502 });
        }

        // 2) Confirmation to the visitor (failure here must not fail the request)
        const { error: confirmError } = await resend.emails.send({
            from: process.env.CONTACT_FROM_EMAIL,
            to: email,
            subject: "We received your message | BYAN",
            html: `
                <p>Hi ${escapeHtml(name)},</p>
                <p>Thanks for contacting BYAN. We received your message and will get back to you soon.</p>
                <p><strong>Your message:</strong></p>
                <p>${escapeHtml(message).replace(/\n/g, "<​br/>")}</p>
                <p>— BYAN</p>
            `
        });
        if (confirmError) {
            console.error("Confirmation email error:", confirmError);
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("Contact route error:", err);
        return NextResponse.json({ error: "server" }, { status: 500 });
    }
}