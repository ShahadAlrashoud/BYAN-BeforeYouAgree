"use client";

import Link from "next/link";
import { useTheme } from "../providers";
import { popularStrings } from "./strings";

type Entry = {
    domain: string;
    riskScore: number;
    riskLevel: string;
    analyzedAt: string;
    count: number;
    resultId: string;
};

// Same level detection the results page uses (the stored English level name is never changed)
function levelTier(level: string): "safe" | "moderate" | "high" {
    const l = level.toLowerCase();
    if (l.includes("safe")) return "safe";
    if (l.includes("high")) return "high";
    return "moderate";
}

export default function PopularClient({ entries, unavailable }: { entries: Entry[]; unavailable: boolean }) {
    const { theme, lang, colors: themeColors } = useTheme();
    const isDark = theme === "dark";
    const isAr = lang === "ar";
    const t = popularStrings[isAr ? "ar" : "en"];

    const heading = isDark ? "#f1f1f1" : "#1e293b";
    const body = isDark ? "#94a3b8" : "#64748b";

    // UTC so the server render and the browser always print the same date
    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString(isAr ? "ar-SA-u-ca-gregory" : "en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: "UTC",
        });

    return (
        <div
            dir={isAr ? "rtl" : "ltr"}
            style={{
                background: isDark ? "linear-gradient(180deg, #0a0e1a 0%, #111827 100%)" : "#ffffff",
                color: heading,
            }}
        >
            <div style={{ maxWidth: 760, margin: "0 auto", padding: "64px 24px 72px" }}>
                <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 800, margin: "0 0 14px" }}>{t.title}</h1>
                <p style={{ margin: "0 0 12px", color: body, lineHeight: 1.7 }}>{t.intro}</p>
                <p
                    role="note"
                    style={{
                        margin: "0 0 28px",
                        padding: "10px 12px",
                        borderRadius: 10,
                        background: themeColors.accentSoft,
                        color: themeColors.accentText,
                        fontSize: "0.88rem",
                    }}
                >
                    {t.disclaimer}
                </p>

                {unavailable ? (
                    <p role="alert" style={{ color: body }}>{t.unavailable}</p>
                ) : entries.length === 0 ? (
                    <p style={{ color: body }}>{t.empty}</p>
                ) : (
                    <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                        {entries.map((e) => (
                            <li
                                key={e.resultId}
                                style={{
                                    padding: "16px 18px",
                                    borderRadius: 16,
                                    background: themeColors.card,
                                    border: `1px solid ${themeColors.border}`,
                                }}
                            >
                                <h2 dir="ltr" style={{ margin: "0 0 6px", fontSize: "1.1rem", fontWeight: 700, textAlign: isAr ? "right" : "left" }}>
                                    {e.domain}
                                </h2>
                                <p style={{ margin: "0 0 4px", color: body, fontSize: "0.9rem" }}>
                                    {t.score}: {e.riskScore}/100 · {t.levels[levelTier(e.riskLevel)]}
                                </p>
                                <p style={{ margin: "0 0 4px", color: body, fontSize: "0.9rem" }}>
                                    {t.lastAnalyzed}: <time dateTime={e.analyzedAt}>{formatDate(e.analyzedAt)}</time>
                                </p>
                                <p style={{ margin: "0 0 10px", color: body, fontSize: "0.9rem" }}>{t.analyzedTimes(e.count)}</p>
                                <Link
                                    href={`/results?id=${encodeURIComponent(e.resultId)}&from=popular`}
                                    style={{ color: themeColors.accentText, fontWeight: 700, fontSize: "0.9rem" }}
                                >
                                    {t.view}
                                </Link>
                            </li>
                        ))}
                    </ol>
                )}
            </div>
        </div>
    );
}
