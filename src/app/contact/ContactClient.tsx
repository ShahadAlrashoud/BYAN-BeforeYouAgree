"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import Link from "@/app/components/LocalizedLink";
import { useTheme } from "../providers";

const CONTACT_EMAIL = "contact@byan.website";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MESSAGE_MAX = 2000;
const REQUEST_TIMEOUT_MS = 15_000;

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
        namePlaceholder: "Your name",
        emailPlaceholder: "you@example.com",
        messagePlaceholder: "Tell us how we can help. If you're reporting a result, include the website URL.",
        send: "Send message",
        sending: "Sending…",
        errors: {
            summary: "Please check the highlighted fields.",
            name: "Please enter your name.",
            emailRequired: "Please enter your email address.",
            email: "Please enter a valid email address.",
            message: "Please write a message."
        },
        sentTitle: "Message sent",
        sentOk: "Thanks for reaching out. We'll get back to you by email.",
        failed: "Something went wrong. Please try again, or email us directly at",
        directTitle: "Prefer email?",
        directText: "Write to us directly at",
        backLink: "← Back to homepage"
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
        namePlaceholder: "اسمك",
        emailPlaceholder: "you@example.com",
        messagePlaceholder: "أخبرنا كيف يمكننا مساعدتك. إذا كنت تبلّغ عن نتيجة، فأرفق رابط الموقع.",
        send: "إرسال الرسالة",
        sending: "جارٍ الإرسال…",
        errors: {
            summary: "يرجى مراجعة الحقول المحددة.",
            name: "يرجى إدخال اسمك.",
            emailRequired: "يرجى إدخال بريدك الإلكتروني.",
            email: "يرجى إدخال بريد إلكتروني صحيح.",
            message: "يرجى كتابة رسالتك."
        },
        sentTitle: "تم إرسال الرسالة",
        sentOk: "شكرًا لتواصلك معنا. سنرد عليك عبر البريد الإلكتروني.",
        failed: "حدث خطأ ما. يرجى المحاولة مرة أخرى، أو راسلنا مباشرة على",
        directTitle: "تفضّل البريد الإلكتروني؟",
        directText: "راسلنا مباشرة على",
        backLink: "→ العودة إلى الصفحة الرئيسية"
    }
};

type Copy = (typeof content)["en"];
type Field = "name" | "email" | "message";
type FieldErrors = Partial<Record<Field, string>>;

type FormState = {
    name: string;
    email: string;
    topic: number;
    message: string;
    website: string; // honeypot: hidden from people, filled in by most bots
};

const EMPTY_FORM: FormState = { name: "", email: "", topic: 0, message: "", website: "" };

function validate(form: FormState, t: Copy): FieldErrors {
    const errors: FieldErrors = {};
    if (!form.name.trim()) errors.name = t.errors.name;

    const email = form.email.trim();
    if (!email) errors.email = t.errors.emailRequired;
    else if (!EMAIL_PATTERN.test(email)) errors.email = t.errors.email;

    if (!form.message.trim()) errors.message = t.errors.message;
    return errors;
}

export default function ContactPage() {
    const { theme, lang, colors: themeColors } = useTheme();
    const isDark = theme === "dark";
    const isAr = lang === "ar";
    const t = content[lang];
    const align = isAr ? "right" : "left";

    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [formError, setFormError] = useState("");
    const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
    const [focused, setFocused] = useState<string | null>(null);

    const colors = {
        bg: isDark ? "linear-gradient(180deg, #0a0e1a 0%, #111827 100%)" : "#ffffff",
        panel: isDark ? "rgba(17, 24, 39, 0.7)" : "#ffffff",
        panelBorder: isDark ? "#1f2937" : "#e2e8f0",
        heading: isDark ? "#f1f1f1" : "#1e293b",
        body: isDark ? "#94a3b8" : "#64748b",
        muted: isDark ? "#64748b" : "#94a3b8",
        line: isDark ? "#334155" : "#cbd5e1",
        input: isDark ? "#0b1220" : "#f8fafc",
        danger: isDark ? "#f87171" : "#dc2626",
        success: isDark ? "#6ee7b7" : "#2f7d57",
        successSoft: isDark ? "rgba(110, 231, 183, 0.08)" : "rgba(47, 125, 87, 0.07)",
        soft: themeColors.accentSoft,
        softBorder: `color-mix(in srgb, ${themeColors.accent} ${isDark ? 40 : 25}%, transparent)`,
        ring: `color-mix(in srgb, ${themeColors.accent} 30%, transparent)`
    };

    const labelStyle: CSSProperties = {
        display: "block",
        margin: "0 0 6px",
        fontSize: "0.85rem",
        fontWeight: 600,
        color: colors.heading
    };

    const errorStyle: CSSProperties = {
        margin: "6px 0 0",
        color: colors.danger,
        fontSize: "0.82rem",
        lineHeight: 1.5
    };

    function inputStyle(id: string, hasError: boolean, extra?: CSSProperties): CSSProperties {
        const isFocused = focused === id;
        return {
            width: "100%",
            boxSizing: "border-box",
            padding: "11px 14px",
            borderRadius: 8,
            border: `1px solid ${hasError ? colors.danger : isFocused ? themeColors.accent : colors.line}`,
            background: colors.input,
            color: colors.heading,
            fontSize: "0.95rem",
            fontFamily: "inherit",
            textAlign: align,
            outline: "none",
            boxShadow: isFocused ? `0 0 0 3px ${colors.ring}` : "none",
            transition: "border-color 120ms ease, box-shadow 120ms ease",
            ...extra
        };
    }

    function update<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((f) => ({ ...f, [key]: value }));
        if (key === "name" || key === "email" || key === "message") {
            setErrors((prev) => ({ ...prev, [key]: undefined }));
        }
        setFormError("");
        if (status !== "sending") setStatus("idle");
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (status === "sending") return;

        const found = validate(form, t);
        setErrors(found);
        setFormError("");

        const firstInvalid = (Object.keys(found) as Field[])[0];
        if (firstInvalid) {
            setFormError(t.errors.summary);
            document.getElementById(firstInvalid)?.focus();
            return;
        }

        // Honeypot: pretend success so bots get no signal to adapt against.
        if (form.website) {
            setStatus("sent");
            setForm(EMPTY_FORM);
            return;
        }

        setStatus("sending");
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                signal: controller.signal,
                body: JSON.stringify({
                    name: form.name.trim(),
                    email: form.email.trim(),
                    topic: content.en.topics[form.topic], // email to the team is always in English
                    message: form.message.trim()
                })
            });
            if (!res.ok) throw new Error(`Request failed: ${res.status}`);
            setStatus("sent");
            setForm(EMPTY_FORM);
        } catch {
            setStatus("error");
        } finally {
            clearTimeout(timer);
        }
    }

    const fieldProps = (id: Field) => ({
        id,
        "aria-invalid": Boolean(errors[id]),
        "aria-describedby": errors[id] ? `${id}-error` : undefined,
        "aria-required": true,
        onFocus: () => setFocused(id),
        onBlur: () => setFocused(null)
    });

    return (
        <main
            dir={isAr ? "rtl" : "ltr"}
            style={{
                minHeight: "100vh",
                background: colors.bg,
                fontFamily: "Segoe UI, Arial, sans-serif",
                color: colors.heading
            }}
        >
            <div style={{ maxWidth: 680, margin: "0 auto", padding: "64px 20px 80px", textAlign: align }}>
                <header style={{ marginBottom: 32 }}>
                    <p
                        style={{
                            margin: "0 0 10px",
                            color: themeColors.accentText,
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            letterSpacing: isAr ? 0 : "0.12em",
                            textTransform: "uppercase"
                        }}
                    >
                        {t.eyebrow}
                    </p>
                    <h1 style={{ margin: "0 0 12px", fontSize: "clamp(2rem, 5vw, 2.6rem)", fontWeight: 800, lineHeight: 1.15 }}>
                        {t.title}
                    </h1>
                    <p style={{ margin: 0, color: colors.body, fontSize: "1.05rem", lineHeight: 1.7, maxWidth: 560 }}>
                        {t.subtitle}
                    </p>
                </header>

                <div
                    style={{
                        padding: "clamp(20px, 4vw, 32px)",
                        borderRadius: 16,
                        background: colors.panel,
                        border: `1px solid ${colors.panelBorder}`,
                        boxShadow: isDark ? "none" : "0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.04)"
                    }}
                >
                    <form
                        onSubmit={handleSubmit}
                        noValidate
                        style={{ position: "relative", display: "flex", flexDirection: "column", gap: 20 }}
                    >
                        {/* Honeypot: off-screen, skipped by keyboard and screen readers. */}
                        <div aria-hidden="true" style={{ position: "absolute", left: -10000, width: 1, height: 1, overflow: "hidden" }}>
                            <label htmlFor="website">Website</label>
                            <input
                                id="website"
                                name="website"
                                type="text"
                                tabIndex={-1}
                                autoComplete="off"
                                value={form.website}
                                onChange={(e) => update("website", e.target.value)}
                            />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
                            <div>
                                <label htmlFor="name" style={labelStyle}>{t.name}</label>
                                <input
                                    {...fieldProps("name")}
                                    type="text"
                                    autoComplete="name"
                                    maxLength={100}
                                    placeholder={t.namePlaceholder}
                                    value={form.name}
                                    onChange={(e) => update("name", e.target.value)}
                                    style={inputStyle("name", Boolean(errors.name))}
                                />
                                {errors.name && <p id="name-error" style={errorStyle}>{errors.name}</p>}
                            </div>

                            <div>
                                <label htmlFor="email" style={labelStyle}>{t.email}</label>
                                <input
                                    {...fieldProps("email")}
                                    type="email"
                                    dir="ltr"
                                    autoComplete="email"
                                    inputMode="email"
                                    maxLength={254}
                                    placeholder={t.emailPlaceholder}
                                    value={form.email}
                                    onChange={(e) => update("email", e.target.value)}
                                    style={inputStyle("email", Boolean(errors.email), { textAlign: "left" })}
                                />
                                {errors.email && <p id="email-error" style={errorStyle}>{errors.email}</p>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="topic" style={labelStyle}>{t.topic}</label>
                            <select
                                id="topic"
                                value={form.topic}
                                onChange={(e) => update("topic", Number(e.target.value))}
                                onFocus={() => setFocused("topic")}
                                onBlur={() => setFocused(null)}
                                style={inputStyle("topic", false)}
                            >
                                {t.topics.map((topic, i) => (
                                    <option key={topic} value={i}>{topic}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                                <label htmlFor="message" style={labelStyle}>{t.message}</label>
                                <span
                                    aria-hidden="true"
                                    style={{ fontSize: "0.78rem", color: colors.muted, fontVariantNumeric: "tabular-nums" }}
                                >
                                    {form.message.length}/{MESSAGE_MAX}
                                </span>
                            </div>
                            <textarea
                                {...fieldProps("message")}
                                rows={6}
                                maxLength={MESSAGE_MAX}
                                placeholder={t.messagePlaceholder}
                                value={form.message}
                                onChange={(e) => update("message", e.target.value)}
                                style={inputStyle("message", Boolean(errors.message), { resize: "vertical", lineHeight: 1.6 })}
                            />
                            {errors.message && <p id="message-error" style={errorStyle}>{errors.message}</p>}
                        </div>

                        <div aria-live="assertive">
                            {formError && <p style={{ ...errorStyle, margin: 0 }}>{formError}</p>}
                            {status === "error" && (
                                <p style={{ ...errorStyle, margin: 0 }}>
                                    {t.failed}{" "}
                                    <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: themeColors.accentText, fontWeight: 600 }}>
                                        {CONTACT_EMAIL}
                                    </a>
                                </p>
                            )}
                        </div>

                        <div aria-live="polite">
                            {status === "sent" && (
                                <div
                                    style={{
                                        padding: "14px 16px",
                                        borderRadius: 10,
                                        background: colors.successSoft,
                                        border: `1px solid ${colors.success}`,
                                        color: colors.success
                                    }}
                                >
                                    <p style={{ margin: "0 0 4px", fontWeight: 700 }}>{t.sentTitle}</p>
                                    <p style={{ margin: 0, fontSize: "0.92rem", lineHeight: 1.6 }}>{t.sentOk}</p>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={status === "sending"}
                            aria-busy={status === "sending"}
                            style={{
                                alignSelf: isAr ? "flex-end" : "flex-start",
                                border: "none",
                                borderRadius: 10,
                                padding: "13px 30px",
                                background: themeColors.accent,
                                color: themeColors.onAccent,
                                fontWeight: 700,
                                fontSize: "0.95rem",
                                fontFamily: "inherit",
                                cursor: status === "sending" ? "wait" : "pointer",
                                opacity: status === "sending" ? 0.7 : 1,
                                transition: "opacity 120ms ease"
                            }}
                        >
                            {status === "sending" ? t.sending : t.send}
                        </button>
                    </form>
                </div>

                <aside
                    style={{
                        marginTop: 28,
                        padding: "18px 22px",
                        borderRadius: 12,
                        background: colors.soft,
                        border: `1px solid ${colors.softBorder}`
                    }}
                >
                    <h2 style={{ margin: "0 0 4px", fontSize: "1rem", fontWeight: 700 }}>{t.directTitle}</h2>
                    <p style={{ margin: 0, color: colors.body, fontSize: "0.92rem", lineHeight: 1.6 }}>
                        {t.directText}{" "}
                        <a
                            href={`mailto:${CONTACT_EMAIL}`}
                            style={{ color: themeColors.accentText, fontWeight: 600, textDecoration: "none" }}
                        >
                            {CONTACT_EMAIL}
                        </a>
                    </p>
                </aside>

                <Link
                    href="/"
                    style={{
                        display: "inline-block",
                        marginTop: 36,
                        color: themeColors.accentText,
                        fontWeight: 600,
                        textDecoration: "none"
                    }}
                >
                    {t.backLink}
                </Link>
            </div>
        </main>
    );
}