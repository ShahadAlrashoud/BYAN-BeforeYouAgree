"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "../providers";

const CONTACT_EMAIL = "contact@byan.website";

const content = {
    en: {
        eyebrow: "Contact",
        title: "Get in touch",
        subtitle: "Questions, feedback, or a result that doesn't look right? We'd like to hear from you.",
        name: "Name",
        email: "Email",
        topic: "Topic",
        message: "Message",
        topics: ["General question", "Feedback", "Report an incorrect result", "Partnership"],
        messagePlaceholder: "Tell us how we can help. If you're reporting a result, include the website URL.",
        send: "Send message",
        sending: "Sending...",
        errors: {
            required: "Please fill in all fields.",
            email: "Please enter a valid email address."
        },
        sentOk: "Thanks! Your message has been sent.",
        failed: "Something went wrong. Please try again or email us directly.",
        directTitle: "Prefer email?",
        directText: "Write to us directly at",
        backLink: "← Back to Homepage"
    },
    ar: {
        eyebrow: "تواصل معنا",
        title: "تواصل معنا",
        subtitle: "لديك سؤال أو ملاحظة أو نتيجة تبدو غير صحيحة؟ يسعدنا أن نسمع منك.",
        name: "الاسم",
        email: "البريد الإلكتروني",
        topic: "الموضوع",
        message: "الرسالة",
        topics: ["سؤال عام", "ملاحظات", "الإبلاغ عن نتيجة غير صحيحة", "شراكة"],
        messagePlaceholder: "أخبرنا كيف يمكننا مساعدتك. إذا كنت تبلّغ عن نتيجة، فأرفق رابط الموقع.",
        send: "إرسال الرسالة",
        sending: "جارٍ الإرسال...",
        errors: {
            required: "يرجى تعبئة جميع الحقول.",
            email: "يرجى إدخال بريد إلكتروني صحيح."
        },
        sentOk: "شكرًا لك! تم إرسال رسالتك.",
        failed: "حدث خطأ ما. يرجى المحاولة مرة أخرى أو مراسلتنا مباشرة.",
        directTitle: "تفضّل البريد الإلكتروني؟",
        directText: "راسلنا مباشرة على",
        backLink: "→ العودة إلى الصفحة الرئيسية"
    }
};

export default function ContactPage() {
    const { theme, lang, colors: themeColors } = useTheme();
    const isDark = theme === "dark";
    const isAr = lang === "ar";
    const t = content[lang];
    const align = isAr ? "right" : "left";

    const [form, setForm] = useState({ name: "", email: "", topic: 0, message: "" });
    const [error, setError] = useState("");
    const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

    // Page-specific neutral tokens + accent-derived tokens (all from themeColors)
    const colors = {
        bg: isDark ? "linear-gradient(180deg, #0a0e1a 0%, #111827 100%)" : "#ffffff",
        heading: isDark ? "#f1f1f1" : "#1e293b",
        body: isDark ? "#94a3b8" : "#64748b",
        line: isDark ? "#334155" : "#e2e8f0",
        input: isDark ? "#111827" : "#f8fafc",
        soft: themeColors.accentSoft,
        softBorder: `color-mix(in srgb, ${themeColors.accent} ${isDark ? 40 : 25}%, transparent)`
    };

    const labelStyle = { display: "block", margin: "0 0 6px", fontSize: "0.85rem", fontWeight: 600, color: colors.heading };
    const inputStyle = {
        width: "100%",
        boxSizing: "border-box" as const,
        padding: "11px 14px",
        borderRadius: 8,
        border: `1px solid ${colors.line}`,
        background: colors.input,
        color: colors.heading,
        fontSize: "0.95rem",
        fontFamily: "inherit",
        outline: "none",
        textAlign: align as "left" | "right"
    };

    function update(field: string, value: string | number) {
        setForm((f) => ({ ...f, [field]: value }));
        setError("");
        setStatus("idle");
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (status === "sending") return;

        if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
            setError(t.errors.required);
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            setError(t.errors.email);
            return;
        }

        setError("");
        setStatus("sending");
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name.trim(),
                    email: form.email.trim(),
                    topic: content.en.topics[form.topic], // always English in the email you receive
                    message: form.message.trim()
                })
            });
            if (!res.ok) throw new Error();
            setStatus("sent");
            setForm({ name: "", email: "", topic: 0, message: "" });
        } catch {
            setStatus("error");
        }
    }

    return (
        <main
            dir={isAr ? "rtl" : "ltr"}
            style={{ minHeight: "100vh", background: colors.bg, fontFamily: "Segoe UI, Arial, sans-serif", color: colors.heading }}
        >
            <div style={{ maxWidth: 640, margin: "0 auto", padding: "72px 24px", textAlign: align }}>
                <p
                    style={{
                        margin: "0 0 12px",
                        color: themeColors.accentText,
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        letterSpacing: isAr ? 0 : "0.12em",
                        textTransform: "uppercase"
                    }}
                >
                    {t.eyebrow}
                </p>
                <h1 style={{ margin: "0 0 14px", fontSize: "clamp(2rem, 5vw, 2.6rem)", fontWeight: 800 }}>{t.title}</h1>
                <p style={{ margin: "0 0 36px", color: colors.body, fontSize: "1.05rem", lineHeight: 1.7 }}>{t.subtitle}</p>

                <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
                        <div>
                            <label htmlFor="name" style={labelStyle}>{t.name}</label>
                            <input id="name" type="text" value={form.name} onChange={(e) => update("name", e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                            <label htmlFor="email" style={labelStyle}>{t.email}</label>
                            <input
                                id="email"
                                type="email"
                                dir="ltr"
                                value={form.email}
                                onChange={(e) => update("email", e.target.value)}
                                style={{ ...inputStyle, textAlign: "left" }}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="topic" style={labelStyle}>{t.topic}</label>
                        <select id="topic" value={form.topic} onChange={(e) => update("topic", Number(e.target.value))} style={inputStyle}>
                            {t.topics.map((topic, i) => (
                                <option key={topic} value={i}>{topic}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="message" style={labelStyle}>{t.message}</label>
                        <textarea
                            id="message"
                            rows={6}
                            value={form.message}
                            onChange={(e) => update("message", e.target.value)}
                            placeholder={t.messagePlaceholder}
                            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                        />
                    </div>

                    {error && <p style={{ margin: 0, color: "#dc2626", fontSize: "0.88rem" }}>{error}</p>}
                    {status === "sent" && (
                        <p style={{ margin: 0, color: "#4a8f68", fontSize: "0.88rem", lineHeight: 1.6 }}>{t.sentOk}</p>
                    )}
                    {status === "error" && (
                        <p style={{ margin: 0, color: "#dc2626", fontSize: "0.88rem", lineHeight: 1.6 }}>
                            {t.failed}{" "}
                            <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: themeColors.accentText }}>{CONTACT_EMAIL}</a>
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={status === "sending"}
                        style={{
                            alignSelf: isAr ? "flex-end" : "flex-start",
                            border: "none",
                            borderRadius: 10,
                            padding: "13px 30px",
                            background: themeColors.accent,
                            color: themeColors.onAccent,
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            cursor: status === "sending" ? "not-allowed" : "pointer",
                            opacity: status === "sending" ? 0.7 : 1
                        }}
                    >
                        {status === "sending" ? t.sending : t.send}
                    </button>
                </form>

                <div
                    style={{
                        marginTop: 40,
                        padding: "20px 22px",
                        borderRadius: 12,
                        background: colors.soft,
                        border: `1px solid ${colors.softBorder}`
                    }}
                >
                    <h2 style={{ margin: "0 0 6px", fontSize: "1rem" }}>{t.directTitle}</h2>
                    <p style={{ margin: 0, color: colors.body, fontSize: "0.92rem" }}>
                        {t.directText}{" "}
                        <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: themeColors.accentText, fontWeight: 600, textDecoration: "none" }}>
                            {CONTACT_EMAIL}
                        </a>
                    </p>
                </div>

                <Link href="/" style={{ display: "inline-block", marginTop: 36, color: themeColors.accentText, fontWeight: 600, textDecoration: "none" }}>
                    {t.backLink}
                </Link>
            </div>
        </main>
    );
}