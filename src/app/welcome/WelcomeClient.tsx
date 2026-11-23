"use client";

// The welcome homepage (NEW_HOME). The demo below is fixed text: it makes no request, calls no model and writes
// nothing. The popular cards arrive as props, already limited to 3 and stripped of scores and keys on the server.
import Link from "@/app/components/LocalizedLink";
import { useTheme } from "../providers";
import TermsBackground from "../components/TermsBackground";
import { popularStrings } from "../popular/strings";
import { welcomeStrings } from "./strings";

export type WelcomeCard = {
    domain: string;
    riskLevel: string;
    analyzedAt: string;
    count: number;
    resultId: string;
};

// Same level detection the results and popular pages use (the stored English level name is never changed)
function levelTier(level: string): "safe" | "moderate" | "high" {
    const l = level.toLowerCase();
    if (l.includes("safe")) return "safe";
    if (l.includes("high")) return "high";
    return "moderate";
}

export default function WelcomeClient({
    cards,
    showCards,
    showAllowance,
}: {
    cards: WelcomeCard[];
    showCards: boolean; // POPULAR_PAGE is on
    showAllowance: boolean; // DAILY_ALLOWANCE is on: the sentence is only true while the limit exists
}) {
    const { theme, lang, colors: themeColors } = useTheme();
    const isDark = theme === "dark";
    const isAr = lang === "ar";
    const L = isAr ? "ar" : "en";
    const t = welcomeStrings[L];
    const p = popularStrings[L];

    const heading = isDark ? "#f1f1f1" : "#1e293b";
    const body = isDark ? "#94a3b8" : "#64748b";
    const tierColor = { safe: themeColors.low, moderate: themeColors.medium, high: themeColors.high };

    // UTC so the server render and the browser always print the same date
    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString(isAr ? "ar-SA-u-ca-gregory" : "en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: "UTC",
        });

    const card = {
        padding: "16px 18px",
        borderRadius: 16,
        background: themeColors.card,
        border: `1px solid ${themeColors.border}`,
    } as const;

    const sectionTitle = { margin: "0 0 14px", fontSize: "1.25rem", fontWeight: 800, color: heading } as const;

    const badge = (tier: "safe" | "moderate" | "high") =>
        ({
            display: "inline-block",
            padding: "3px 12px",
            borderRadius: 999,
            border: `1px solid ${tierColor[tier]}`,
            color: tierColor[tier],
            fontSize: "0.82rem",
            fontWeight: 700,
        }) as const;

    return (
        <div
            dir={isAr ? "rtl" : "ltr"}
            style={{
                background: isDark ? "linear-gradient(180deg, #0a0e1a 0%, #111827 100%)" : "#ffffff",
                color: heading,
            }}
        >
            {/* Welcome */}
            <div style={{ position: "relative", overflow: "hidden", width: "100%" }}>
                <TermsBackground />
                <div
                    style={{
                        position: "relative",
                        zIndex: 1,
                        maxWidth: 760,
                        margin: "0 auto",
                        padding: "72px 24px 40px",
                        textAlign: "center",
                    }}
                >
                    <h1 style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)", fontWeight: 800, margin: "0 0 16px", lineHeight: 1.2 }}>
                        {t.title}
                    </h1>
                    <p style={{ margin: "0 auto 28px", maxWidth: 560, color: body, fontSize: "1.05rem", lineHeight: 1.7 }}>
                        {t.intro}
                    </p>
                    <Link
                        href="/analyze"
                        style={{
                            display: "inline-block",
                            borderRadius: 12,
                            padding: "13px 30px",
                            background: themeColors.accent,
                            color: themeColors.onAccent,
                            fontWeight: 700,
                            fontSize: "1rem",
                            textDecoration: "none",
                            boxShadow: `0 0 0 6px ${themeColors.accentSoft}`,
                        }}
                    >
                        {t.tryIt}
                    </Link>
                    {showAllowance && (
                        <p style={{ margin: "22px auto 0", maxWidth: 520, color: body, fontSize: "0.92rem", lineHeight: 1.7 }}>
                            {t.allowance}
                        </p>
                    )}
                </div>
            </div>

            <div style={{ maxWidth: 760, margin: "0 auto", padding: "8px 24px 72px", display: "flex", flexDirection: "column", gap: 44 }}>
                {/* How it works */}
                <section aria-labelledby="welcome-steps">
                    <h2 id="welcome-steps" style={sectionTitle}>{t.stepsTitle}</h2>
                    <ol style={{ margin: 0, paddingInlineStart: 22, color: body, lineHeight: 1.9 }}>
                        {t.steps.map((s) => (
                            <li key={s}>{s}</li>
                        ))}
                    </ol>
                </section>

                {/* Free demo: fixed text, no request, no model call, nothing saved */}
                <section aria-labelledby="welcome-demo">
                    <h2 id="welcome-demo" style={sectionTitle}>{t.demoTitle}</h2>
                    <div style={card}>
                        <span
                            style={{
                                display: "inline-block",
                                marginBottom: 10,
                                padding: "3px 12px",
                                borderRadius: 999,
                                background: themeColors.accentSoft,
                                color: themeColors.accentText,
                                fontSize: "0.8rem",
                                fontWeight: 700,
                            }}
                        >
                            {t.demoLabel}
                        </span>
                        <h3 style={{ margin: "0 0 8px", fontSize: "1.05rem", fontWeight: 700 }}>{t.demoSite}</h3>
                        <p style={{ margin: "0 0 12px" }}>
                            <span style={badge("moderate")}>{p.levels.moderate}</span>
                        </p>
                        <p style={{ margin: "0 0 16px", color: body, lineHeight: 1.7 }}>{t.demoSummary}</p>
                        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                            {t.demoFindings.map((f) => (
                                <li key={f.category}>
                                    <p style={{ margin: "0 0 4px", fontWeight: 700 }}>{f.category}</p>
                                    <p style={{ margin: "0 0 4px", color: body, fontSize: "0.85rem" }}>{t.demoQuoteLabel}</p>
                                    <blockquote
                                        style={{
                                            margin: "0 0 4px",
                                            paddingInlineStart: 12,
                                            borderInlineStart: `3px solid ${themeColors.border}`,
                                            color: heading,
                                            lineHeight: 1.7,
                                        }}
                                    >
                                        {f.quote}
                                    </blockquote>
                                    <p style={{ margin: 0, color: body, fontSize: "0.9rem" }}>{f.plain}</p>
                                </li>
                            ))}
                        </ul>
                        <p style={{ margin: "16px 0 0", color: body, fontSize: "0.82rem", lineHeight: 1.6 }}>
                            {t.demoNote}{" "}
                            <Link href="/disclaimer" style={{ color: themeColors.accentText, fontWeight: 700 }}>
                                {t.disclaimerLink}
                            </Link>
                        </p>
                    </div>
                </section>

                {/* Popular cards (POPULAR_PAGE): up to 3, category only, no keys, scores, IPs or user data */}
                {showCards && cards.length > 0 && (
                    <section aria-labelledby="welcome-cards">
                        <h2 id="welcome-cards" style={sectionTitle}>{t.cardsTitle}</h2>
                        <p style={{ margin: "0 0 14px", color: body, fontSize: "0.9rem" }}>{t.cardsNote}</p>
                        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                            {cards.slice(0, 3).map((c) => {
                                const tier = levelTier(c.riskLevel);
                                return (
                                    <li key={c.resultId} style={card}>
                                        <h3 dir="ltr" style={{ margin: "0 0 6px", fontSize: "1.05rem", fontWeight: 700, textAlign: isAr ? "right" : "left" }}>
                                            {c.domain}
                                        </h3>
                                        <p style={{ margin: "0 0 6px" }}>
                                            <span style={badge(tier)}>{p.levels[tier]}</span>
                                        </p>
                                        <p style={{ margin: "0 0 4px", color: body, fontSize: "0.9rem" }}>
                                            {p.lastAnalyzed}: <time dateTime={c.analyzedAt}>{formatDate(c.analyzedAt)}</time>
                                        </p>
                                        <p style={{ margin: "0 0 10px", color: body, fontSize: "0.9rem" }}>{p.analyzedTimes(c.count)}</p>
                                        <Link
                                            href={`/results?id=${encodeURIComponent(c.resultId)}&from=popular`}
                                            style={{ color: themeColors.accentText, fontWeight: 700, fontSize: "0.9rem" }}
                                        >
                                            {p.view}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                        <p style={{ margin: "14px 0 0" }}>
                            <Link href="/popular" style={{ color: themeColors.accentText, fontWeight: 700 }}>
                                {t.viewAll}
                            </Link>
                        </p>
                    </section>
                )}
            </div>
        </div>
    );
}


