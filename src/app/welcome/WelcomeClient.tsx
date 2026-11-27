"use client";

// The welcome homepage (NEW_HOME). The demo is fixed text: no request, no model call, nothing saved.
import Link from "@/app/components/LocalizedLink";
import { useTheme } from "../providers";
import TermsBackground from "../components/TermsBackground";
import { popularStrings } from "../popular/strings";
import { welcomeStrings } from "./strings";

export default function WelcomeClient({
    showAllowance,
    showPopular,
}: {
    showAllowance: boolean; // DAILY_ALLOWANCE is on: the sentence is only true while the limit exists
    showPopular: boolean; // POPULAR_PAGE is on: the link only appears while /popular exists
}) {
    const { theme, lang, colors: c } = useTheme();
    const isDark = theme === "dark";
    const isAr = lang === "ar";
    const L = isAr ? "ar" : "en";
    const t = welcomeStrings[L];
    const p = popularStrings[L];

    const heading = isDark ? "#f1f1f1" : "#1e293b";
    const body = isDark ? "#94a3b8" : "#64748b";

    const card = {
        padding: "16px 18px",
        borderRadius: 16,
        background: c.card,
        border: `1px solid ${c.border}`,
    } as const;

    const sectionTitle = {
        margin: "0 0 14px",
        fontSize: "1.25rem",
        fontWeight: 800,
        color: heading,
    } as const;

    // The demo is always "moderate", so only that tier is needed here
    const badge = {
        display: "inline-block",
        padding: "3px 12px",
        borderRadius: 999,
        border: `1px solid ${c.medium}`,
        color: c.medium,
        fontSize: "0.82rem",
        fontWeight: 700,
    } as const;

    // The demo shows one finding. Enough to show what the tool does, without a wall of text.
    const demoFinding = t.demoFindings[0];

    return (
        <div
            dir={isAr ? "rtl" : "ltr"}
            style={{
                background: isDark ? "linear-gradient(180deg, #0a0e1a 0%, #111827 100%)" : "#ffffff",
                color: heading,
            }}
        >
            {/* Hero: one message, one action */}
            <div style={{ position: "relative", overflow: "hidden", width: "100%" }}>
                <TermsBackground />
                <div
                    style={{
                        position: "relative",
                        zIndex: 1,
                        maxWidth: 760,
                        margin: "0 auto",
                        padding: "72px 24px 48px",
                        textAlign: "center",
                    }}
                >
                    <h1
                        style={{
                            fontSize: "clamp(2rem, 4.5vw, 3rem)",
                            fontWeight: 800,
                            margin: "0 0 16px",
                            lineHeight: 1.2,
                        }}
                    >
                        {t.title}
                    </h1>
                    <p
                        style={{
                            margin: "0 auto 28px",
                            maxWidth: 560,
                            color: body,
                            fontSize: "1.05rem",
                            lineHeight: 1.7,
                        }}
                    >
                        {t.intro}
                    </p>
                    <Link
                        href="/analyze"
                        style={{
                            display: "inline-block",
                            borderRadius: 12,
                            padding: "13px 30px",
                            background: c.accent,
                            color: c.onAccent,
                            fontWeight: 700,
                            fontSize: "1rem",
                            textDecoration: "none",
                            boxShadow: `0 0 0 6px ${c.accentSoft}`,
                        }}
                    >
                        {t.tryIt}
                    </Link>
                    {showAllowance && (
                        <p
                            style={{
                                margin: "22px auto 0",
                                maxWidth: 520,
                                color: body,
                                fontSize: "0.92rem",
                                lineHeight: 1.7,
                            }}
                        >
                            {t.allowance}
                        </p>
                    )}
                </div>
            </div>

            <div
                style={{
                    maxWidth: 760,
                    margin: "0 auto",
                    padding: "8px 24px 72px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 44,
                }}
            >
                {/* Sample analysis: fixed text, one finding */}
                <section aria-labelledby="welcome-demo">
                    <h2 id="welcome-demo" style={sectionTitle}>
                        {t.demoTitle}
                    </h2>
                    <div style={card}>
                        <span
                            style={{
                                display: "inline-block",
                                marginBottom: 10,
                                padding: "3px 12px",
                                borderRadius: 999,
                                background: c.accentSoft,
                                color: c.accentText,
                                fontSize: "0.8rem",
                                fontWeight: 700,
                            }}
                        >
                            {t.demoLabel}
                        </span>
                        <h3 style={{ margin: "0 0 8px", fontSize: "1.05rem", fontWeight: 700 }}>
                            {t.demoSite}
                        </h3>
                        <p style={{ margin: "0 0 12px" }}>
                            <span style={badge}>{p.levels.moderate}</span>
                        </p>
                        <p style={{ margin: "0 0 16px", color: body, lineHeight: 1.7 }}>{t.demoSummary}</p>

                        <p style={{ margin: "0 0 4px", fontWeight: 700 }}>{demoFinding.category}</p>
                        <p style={{ margin: "0 0 4px", color: body, fontSize: "0.85rem" }}>{t.demoQuoteLabel}</p>
                        <blockquote
                            style={{
                                margin: "0 0 4px",
                                paddingInlineStart: 12,
                                borderInlineStart: `3px solid ${c.border}`,
                                color: heading,
                                lineHeight: 1.7,
                            }}
                        >
                            {demoFinding.quote}
                        </blockquote>
                        <p style={{ margin: 0, color: body, fontSize: "0.9rem" }}>{demoFinding.plain}</p>

                        <p style={{ margin: "16px 0 0", color: body, fontSize: "0.82rem", lineHeight: 1.6 }}>
                            {t.demoNote}{" "}
                            <Link href="/disclaimer" style={{ color: c.accentText, fontWeight: 700 }}>
                                {t.disclaimerLink}
                            </Link>
                        </p>
                    </div>
                </section>

                {/* Popular: one link to the page that already exists */}
                {showPopular && (
                    <p style={{ margin: 0 }}>
                        <Link href="/popular" style={{ color: c.accentText, fontWeight: 700 }}>
                            {t.viewAll}
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
}