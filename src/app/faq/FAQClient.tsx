"use client";

import { useState } from "react";
import Link from "@/app/components/LocalizedLink";
import { useTheme } from "../providers";
import { FAQ } from "@/data/faq";

const content = {
    en: {
        eyebrow: "FAQ",
        title: "Frequently asked questions",
        subtitle: "Everything you need to know about how BYAN analyzes Terms of Service and Privacy Policies.",
        faqs: FAQ.en,
        stillTitle: "Still have questions?",
        stillText: "We're happy to help.",
        contact: "Contact us",
        backLink: "← Back to Homepage"
    },
    ar: {
        eyebrow: "الأسئلة الشائعة",
        title: "الأسئلة الشائعة",
        subtitle: "كل ما تحتاج معرفته عن طريقة تحليل بيان لشروط الخدمة وسياسات الخصوصية.",
        faqs: FAQ.ar,
        stillTitle: "لديك أسئلة أخرى؟",
        stillText: "يسعدنا مساعدتك.",
        contact: "تواصل معنا",
        backLink: "→ العودة إلى الصفحة الرئيسية"
    }
};

export default function FAQPage() {
    const { theme, lang, colors: themeColors } = useTheme();
    const isDark = theme === "dark";
    const isAr = lang === "ar";
    const t = content[lang];
    const align = isAr ? "right" : "left";
    const [open, setOpen] = useState<number | null>(0);

    // Page-specific neutral tokens + accent-derived tokens (all from themeColors)
    const colors = {
        bg: isDark ? "linear-gradient(180deg, #0a0e1a 0%, #111827 100%)" : "#ffffff",
        heading: isDark ? "#f1f1f1" : "#1e293b",
        body: isDark ? "#94a3b8" : "#64748b",
        line: isDark ? "#1e293b" : "#e2e8f0",
        soft: themeColors.accentSoft,
        softBorder: `color-mix(in srgb, ${themeColors.accent} ${isDark ? 40 : 25}%, transparent)`
    };

    return (
        <main
            dir={isAr ? "rtl" : "ltr"}
            style={{ minHeight: "100vh", background: colors.bg, fontFamily: "Segoe UI, Arial, sans-serif", color: colors.heading }}
        >
            <div style={{ maxWidth: 760, margin: "0 auto", padding: "72px 24px", textAlign: align }}>
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
                <p style={{ margin: "0 0 40px", color: colors.body, fontSize: "1.05rem", lineHeight: 1.7 }}>{t.subtitle}</p>

                <div style={{ borderTop: `1px solid ${colors.line}` }}>
                    {t.faqs.map((item, i) => {
                        const isOpen = open === i;
                        return (
                            <div key={i} style={{ borderBottom: `1px solid ${colors.line}` }}>
                                <button
                                    type="button"
                                    onClick={() => setOpen(isOpen ? null : i)}
                                    aria-expanded={isOpen}
                                    aria-controls={`faq-${i}`}
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: 16,
                                        padding: "20px 0",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        color: isOpen ? themeColors.accentText : colors.heading,
                                        fontSize: "1.02rem",
                                        fontWeight: 600,
                                        fontFamily: "inherit",
                                        textAlign: align
                                    }}
                                >
                                    <span>{item.q}</span>
                                    <span
                                        aria-hidden="true"
                                        style={{
                                            flexShrink: 0,
                                            fontSize: "1.4rem",
                                            lineHeight: 1,
                                            color: themeColors.accentText,
                                            transform: isOpen ? "rotate(45deg)" : "none",
                                            transition: "transform 0.2s ease"
                                        }}
                                    >
                                        +
                                    </span>
                                </button>
                                {isOpen && (
                                    <p id={`faq-${i}`} style={{ margin: "0 0 20px", color: colors.body, lineHeight: 1.8 }}>
                                        {item.a}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div
                    style={{
                        marginTop: 48,
                        padding: "24px",
                        borderRadius: 12,
                        background: colors.soft,
                        border: `1px solid ${colors.softBorder}`,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 16,
                        flexWrap: "wrap"
                    }}
                >
                    <div>
                        <h2 style={{ margin: "0 0 4px", fontSize: "1.1rem" }}>{t.stillTitle}</h2>
                        <p style={{ margin: 0, color: colors.body }}>{t.stillText}</p>
                    </div>
                    <Link
                        href="/contact"
                        style={{
                            padding: "11px 24px",
                            borderRadius: 10,
                            background: themeColors.accent,
                            color: themeColors.onAccent,
                            fontWeight: 700,
                            textDecoration: "none"
                        }}
                    >
                        {t.contact}
                    </Link>
                </div>

                <Link href="/" style={{ display: "inline-block", marginTop: 36, color: themeColors.accentText, fontWeight: 600, textDecoration: "none" }}>
                    {t.backLink}
                </Link>
            </div>
        </main>
    );
}