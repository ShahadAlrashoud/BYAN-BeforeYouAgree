"use client";
import { useTheme } from "../providers";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ACCOUNT_V2 } from "@/lib/flags";
import { readResultLang } from "@/lib/prefs";
import TermsBackground from "../components/TermsBackground";
import { useFlags } from "../components/FlagsProvider";
import { isNearHighBoundary, resultAge, displayRiskLabel } from "@/lib/resultDisplay";

/* ---------- Risk colors (light + dark) ---------- */
// Light-mode text colors darkened to reach 4.5:1 contrast on their backgrounds

const RISK_LIGHT = {
    safe: { ring: "#86d9a4", bg: "#eafcf1", text: "#2b6b49" },
    moderate: { ring: "#f2c96b", bg: "#fdf6e3", text: "#7a5c12" },
    high: { ring: "#f19a9a", bg: "#fdecec", text: "#a03636" }
};

const RISK_DARK = {
    low: { ring: "#86d9a4", bg: "rgba(134,217,164,0.12)", text: "#86d9a4" },
    moderate: { ring: "#f2c96b", bg: "rgba(242,201,107,0.12)", text: "#f2c96b" },
    high: { ring: "#f19a9a", bg: "rgba(241,154,154,0.12)", text: "#f19a9a" }
};

// Symbols so risk is never shown by color alone
const TIER_SYMBOL = { low: "✓", moderate: "!", high: "▲" };

function getRiskTier(riskLevel) {
    if (!riskLevel) return "moderate";
    const level = riskLevel.toLowerCase();
    if (level.includes("low")) return "low";
    if (level.includes("high")) return "high";
    return "moderate";
}

function weightTier(weight) {
    if (weight >= 15) return "high";
    if (weight >= 8) return "moderate";
    return "low";
}

function getHostname(url) {
    try {
        return new URL(url).hostname.replace(/^www\./, "");
    } catch {
        return url || "";
    }
}

const SEVERITY_TIER = { high: "high", medium: "moderate", low: "low" };
const SEVERITY_LABEL = {
    high: { en: "High", ar: "عالي" },
    medium: { en: "Medium", ar: "متوسط" },
    low: { en: "Low", ar: "منخفض" }
};
const TRANSLATABLE_FIELDS = ["category", "text", "plainExplanation", "riskReason", "suggestedAction"];

const TOUR_KEY = "byan_results_tour_v1";

// All four sides set explicitly (avoids React shorthand/longhand warnings on RTL/LTR toggle)
function borders(color, width = 1) {
    const v = `${width}px solid ${color}`;
    return { borderTop: v, borderRight: v, borderBottom: v, borderLeft: v };
}

// Same tokens as the homepage; accents come from the theme provider
function usePalette() {
    const { theme, colors: tc } = useTheme();
    const isDark = theme === "dark";
    return {
        isDark,
        pageBg: isDark ? "linear-gradient(180deg, #0a0e1a 0%, #111827 100%)" : "#ffffff",
        altBg: isDark ? "#0f172a" : "#f8fafc",
        heading: isDark ? "#f1f1f1" : "#1e293b",
        body: isDark ? "#94a3b8" : "#64748b",
        text: isDark ? "#cbd5e1" : "#334155",
        muted: isDark ? "#94a3b8" : "#64748b",
        line: isDark ? "#1e293b" : "#e2e8f0",
        track: isDark ? "#1e293b" : "#e5e7eb",
        shadow: isDark ? "0 10px 30px rgba(0,0,0,0.35)" : "0 10px 30px rgba(15,23,42,0.08)",
        card: tc.card,
        border: tc.border,
        input: tc.input,
        inputText: tc.heading,
        accent: tc.accent,
        accentSoft: tc.accentSoft,
        accentText: tc.accentText,
        onAccent: tc.onAccent,
        error: tc.high,
        risk: isDark ? RISK_DARK : RISK_LIGHT
    };
}

function usePrefersReducedMotion() {
    const [reduced, setReduced] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReduced(mq.matches);
        const onChange = (e) => setReduced(e.matches);
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);
    return reduced;
}

async function copyText(text) {
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch {
        /* fall through to legacy path */
    }
    try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
    } catch {
        return false;
    }
}

// Returns a formatted date string, or "" if the record has no usable date
function formatCheckedDate(raw, isArabic) {
    if (!raw) return "";
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString(isArabic ? "ar-SA-u-ca-gregory" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

/* ---------- Finding card ---------- */

function FindingCard({ finding, isArabic, index }) {
    const p = usePalette();
    const severity =
        finding.severity ||
        (finding.riskWeight >= 15 ? "high" : finding.riskWeight >= 8 ? "medium" : "low");
    const tier = SEVERITY_TIER[severity];
    const c = p.risk[tier];
    const t = (en, ar) => (isArabic ? ar : en);

    const labelStyle = {
        display: "block",
        fontSize: "0.72rem",
        fontWeight: 700,
        letterSpacing: 0.5,
        textTransform: "uppercase",
        color: p.body,
        marginBottom: 4
    };
    const blockStyle = { marginBottom: 12 };
    const bodyStyle = { margin: 0, color: p.text, fontSize: "0.9rem", lineHeight: 1.6 };

    return (
        <div
            className="byan-fade"
            style={{
                borderTop: `1px solid ${p.border}`,
                borderBottom: `1px solid ${p.border}`,
                borderLeft: isArabic ? `1px solid ${p.border}` : `4px solid ${c.ring}`,
                borderRight: isArabic ? `4px solid ${c.ring}` : `1px solid ${p.border}`,
                borderRadius: 14,
                padding: "16px 18px",
                marginBottom: 16,
                background: p.card,
                animationDelay: `${Math.min(index, 8) * 60}ms`
            }}
        >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
                <div>
                    <strong style={{ color: p.heading, fontSize: "0.98rem" }}>{finding.category}</strong>
                    {finding.clauseRef && (
                        <span style={{ marginInlineStart: 8, color: p.muted, fontSize: "0.8rem" }}>
                            {t("Clause", "البند")}: {finding.clauseRef}
                        </span>
                    )}
                </div>
                <span style={{ padding: "3px 12px", borderRadius: 999, background: c.bg, color: c.text, fontWeight: 600, fontSize: "0.78rem" }}>
                    <span aria-hidden="true">{TIER_SYMBOL[tier]} </span>
                    {t("Risk", "الخطورة")}: {SEVERITY_LABEL[severity][isArabic ? "ar" : "en"]}
                </span>
            </div>

            {/* Original text next to the analysis */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                <div>
                    <span style={labelStyle}>{t("Original text from the policy", "النص الأصلي من السياسة")}</span>
                    <blockquote
                        dir="auto"
                        style={{
                            margin: 0,
                            padding: "12px 14px",
                            background: p.altBg,
                            ...borders(p.line),
                            borderRadius: 10,
                            color: p.heading,
                            fontSize: "0.88rem",
                            lineHeight: 1.65,
                            fontStyle: "italic"
                        }}
                    >
                        “{finding.evidence || finding.evidenceQuote}”
                    </blockquote>
                    {finding.verified && (
                        <span style={{ display: "inline-block", marginTop: 6, fontSize: "0.75rem", color: p.risk.safe.text, fontWeight: 600 }}>
                            ✓ {finding.matchType === "exact"
                                ? t("Verified: exact match in the policy", "تم التحقق: مطابق تمامًا لنص السياسة")
                                : t(`Verified: close match (${Math.round((finding.matchScore || 0) * 100)}%)`,
                                    `تم التحقق: تطابق قريب (${Math.round((finding.matchScore || 0) * 100)}%)`)}
                        </span>
                    )}
                </div>

                <div>
                    {finding.plainExplanation && (
                        <div style={blockStyle}>
                            <span style={labelStyle}>{t("What it means", "ماذا يعني")}</span>
                            <p style={bodyStyle}>{finding.plainExplanation}</p>
                        </div>
                    )}
                    {finding.riskReason && (
                        <div style={blockStyle}>
                            <span style={labelStyle}>{t("Why it's a risk", "لماذا يُعد خطرًا")}</span>
                            <p style={bodyStyle}>{finding.riskReason}</p>
                        </div>
                    )}
                    {finding.suggestedAction && (
                        <div style={{ background: p.accentSoft, borderRadius: 10, padding: "10px 12px" }}>
                            <span style={{ ...labelStyle, color: p.accentText }}>{t("What you can do", "الإجراء المقترح")}</span>
                            <p style={{ ...bodyStyle, color: p.heading, fontWeight: 500 }}>{finding.suggestedAction}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function normalizeUrl(value) {
    const trimmed = value.trim();
    if (!trimmed) return "";
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

// Groups clauses from both results by category so they can be compared row by row
function buildCategoryComparison(clausesA = [], clausesB = []) {
    const map = new Map();

    function add(clauses, side) {
        for (const c of clauses) {
            const label = (c.category || "Other").trim();
            const key = label.toLowerCase();
            if (!map.has(key)) {
                map.set(key, {
                    label,
                    a: { count: 0, weight: 0 },
                    b: { count: 0, weight: 0 }
                });
            }
            const entry = map.get(key);
            entry[side].count += 1;
            entry[side].weight += Number(c.riskWeight) || 0;
        }
    }

    add(clausesA, "a");
    add(clausesB, "b");

    return Array.from(map.values()).sort(
        (x, y) =>
            Math.max(y.a.weight, y.b.weight) - Math.max(x.a.weight, x.b.weight)
    );
}

/* ---------- Score circle ---------- */

// hideNumber (NEW_HOME): the ring still fills to the score, but no number is printed and the spoken label
// names the category instead. The category itself is shown by the label pill under the circle.
function ScoreCircle({ score, tier, size = 180, isArabic = false, hideNumber = false }) {
    const p = usePalette();
    const reduced = usePrefersReducedMotion();
    const colors = p.risk[tier];
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const [progress, setProgress] = useState(0);
    const scale = size / 180;

    useEffect(() => {
        if (reduced) {
            setProgress(score);
            return undefined;
        }
        const timeout = setTimeout(() => setProgress(score), 100);
        return () => clearTimeout(timeout);
    }, [score, reduced]);

    const offset = circumference - (progress / 100) * circumference;
    const label = hideNumber
        ? isArabic
            ? "تصنيف المخاطر" // [AR review pending]
            : "Risk category"
        : isArabic
            ? `درجة المخاطر ${score} من 100`
            : `Risk score ${score} out of 100`;

    return (
        <div style={{ position: "relative", width: size, height: size }} role="img" aria-label={label}>
            <svg aria-hidden="true" width={size} height={size} viewBox="0 0 180 180">
                <circle cx="90" cy="90" r={radius} fill="none" stroke={p.track} strokeWidth="14" />
                <circle
                    cx="90"
                    cy="90"
                    r={radius}
                    fill="none"
                    stroke={colors.ring}
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    transform="rotate(-90 90 90)"
                    style={{ transition: reduced ? "none" : "stroke-dashoffset 1s ease-out" }}
                />
            </svg>
            <div
                aria-hidden="true"
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                {hideNumber ? (
                    <span style={{ fontSize: `${2 * scale}rem`, fontWeight: 800, color: colors.text }}>{TIER_SYMBOL[tier]}</span>
                ) : (
                    <>
                        <span style={{ fontSize: `${2.2 * scale}rem`, fontWeight: 800, color: p.heading }}>{score}</span>
                        <span style={{ fontSize: `${Math.max(0.85 * scale, 0.7)}rem`, color: p.body }}>/ 100</span>
                    </>
                )}
            </div>
        </div>
    );
}

/* ---------- Comparison ---------- */

function SiteColumn({ data, tier, label, host, isArabic }) {
    const p = usePalette();
    const colors = p.risk[tier];
    return (
        <div
            style={{
                flex: "1 1 220px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "18px 12px",
                ...borders(p.border),
                borderRadius: 14,
                background: p.altBg
            }}
        >
            <span style={{ fontSize: "0.75rem", color: p.body, textTransform: "uppercase", letterSpacing: 1 }}>
                {label}
            </span>
            <span
                style={{
                    margin: "4px 0 12px",
                    fontWeight: 700,
                    color: p.heading,
                    wordBreak: "break-all",
                    textAlign: "center"
                }}
                title={data.url}
            >
                {host}
            </span>
            <ScoreCircle score={data.riskScore} tier={tier} size={130} isArabic={isArabic} />
            <span
                style={{
                    marginTop: 12,
                    padding: "4px 14px",
                    borderRadius: 999,
                    background: colors.bg,
                    color: colors.text,
                    fontWeight: 600,
                    fontSize: "0.85rem"
                }}
            >
                <span aria-hidden="true">{TIER_SYMBOL[tier]} </span>
                {displayRiskLabel(data.riskLevel)}
            </span>
        </div>
    );
}

function ComparisonPanel({ current, other, isArabic, onClear }) {
    const p = usePalette();
    const tierA = getRiskTier(current.riskLevel);
    const tierB = getRiskTier(other.riskLevel);
    const hostA = getHostname(current.url);
    const hostB = getHostname(other.url);

    const diff = other.riskScore - current.riskScore;
    const absDiff = Math.abs(diff);
    const SIMILAR_THRESHOLD = 5;

    let verdict;
    let verdictTier;
    if (absDiff <= SIMILAR_THRESHOLD) {
        verdictTier = "moderate";
        verdict = isArabic
            ? `مستوى المخاطر متقارب (فرق ${absDiff} نقاط).`
            : `Both sites have a similar risk level (${absDiff} point difference).`;
    } else if (diff > 0) {
        verdictTier = "low";
        verdict = isArabic
            ? `${hostA} أكثر أمانًا بفارق ${absDiff} نقطة.`
            : `${hostA} is safer by ${absDiff} points.`;
    } else {
        verdictTier = "high";
        verdict = isArabic
            ? `${hostB} أكثر أمانًا بفارق ${absDiff} نقطة.`
            : `${hostB} is safer by ${absDiff} points.`;
    }

    const clausesA = current.clauses || [];
    const clausesB = other.clauses || [];
    const highA = clausesA.filter((c) => c.riskWeight >= 15).length;
    const highB = clausesB.filter((c) => c.riskWeight >= 15).length;
    const categories = buildCategoryComparison(clausesA, clausesB);

    const stats = [
        {
            label: isArabic ? "درجة المخاطر" : "Risk score",
            a: current.riskScore,
            b: other.riskScore,
            lowerIsBetter: true
        },
        {
            label: isArabic ? "البنود المكتشفة" : "Clauses detected",
            a: clausesA.length,
            b: clausesB.length,
            lowerIsBetter: true
        },
        {
            label: isArabic ? "بنود عالية الخطورة" : "High-risk clauses",
            a: highA,
            b: highB,
            lowerIsBetter: true
        }
    ];

    const cellStyle = {
        padding: "10px 8px",
        borderBottom: `1px solid ${p.line}`,
        fontSize: "0.9rem",
        textAlign: "center",
        color: p.text
    };
    const labelCellStyle = {
        ...cellStyle,
        textAlign: isArabic ? "right" : "left",
        fontWeight: 500
    };
    const headCell = { ...cellStyle, color: p.body, fontWeight: 600 };
    const headLabelCell = { ...labelCellStyle, color: p.body, fontWeight: 600 };

    function better(a, b, lowerIsBetter) {
        if (a === b) return { a: false, b: false };
        const aWins = lowerIsBetter ? a < b : a > b;
        return { a: aWins, b: !aWins };
    }

    return (
        <div style={{ marginTop: 8 }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 14,
                    gap: 12,
                    flexWrap: "wrap"
                }}
            >
                <h2 style={{ margin: 0, color: p.heading, fontSize: "1.05rem", fontWeight: 800 }}>
                    {isArabic ? "المقارنة" : "Comparison"}
                </h2>
                <button
                    type="button"
                    onClick={onClear}
                    style={{
                        padding: "6px 14px",
                        borderRadius: 10,
                        ...borders(p.border),
                        background: "transparent",
                        color: p.body,
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer"
                    }}
                >
                    {isArabic ? "إزالة المقارنة" : "Remove comparison"}
                </button>
            </div>

            {/* Side-by-side scores */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
                <SiteColumn data={current} tier={tierA} label={isArabic ? "هذا الموقع" : "This site"} host={hostA} isArabic={isArabic} />
                <SiteColumn data={other} tier={tierB} label={isArabic ? "الموقع المقارن" : "Compared site"} host={hostB} isArabic={isArabic} />
            </div>

            {/* Verdict */}
            <div
                style={{
                    background: p.risk[verdictTier].bg,
                    color: p.risk[verdictTier].text,
                    borderRadius: 12,
                    padding: "12px 16px",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    marginBottom: 20,
                    textAlign: "center"
                }}
            >
                {verdict}
            </div>

            {/* Stats table */}
            <div style={{ overflowX: "auto", marginBottom: 24 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ background: p.altBg }}>
                            <th scope="col" style={headLabelCell}>{isArabic ? "المقياس" : "Metric"}</th>
                            <th scope="col" style={headCell}>{hostA}</th>
                            <th scope="col" style={headCell}>{hostB}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.map((s) => {
                            const win = better(s.a, s.b, s.lowerIsBetter);
                            return (
                                <tr key={s.label}>
                                    <th scope="row" style={labelCellStyle}>{s.label}</th>
                                    <td style={{ ...cellStyle, fontWeight: win.a ? 700 : 400, color: win.a ? p.risk.safe.text : p.text }}>
                                        {s.a}{win.a ? <span aria-hidden="true"> ✓</span> : null}
                                    </td>
                                    <td style={{ ...cellStyle, fontWeight: win.b ? 700 : 400, color: win.b ? p.risk.safe.text : p.text }}>
                                        {s.b}{win.b ? <span aria-hidden="true"> ✓</span> : null}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Category breakdown */}
            <h3 style={{ margin: "0 0 10px", color: p.heading, fontSize: "0.95rem" }}>
                {isArabic ? "مقارنة الفئات" : "Category breakdown"}
            </h3>
            {categories.length === 0 ? (
                <p style={{ color: p.body, fontSize: "0.9rem" }}>
                    {isArabic ? "لا توجد بنود للمقارنة." : "No clauses to compare."}
                </p>
            ) : (
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: p.altBg }}>
                                <th scope="col" style={headLabelCell}>{isArabic ? "الفئة" : "Category"}</th>
                                <th scope="col" style={headCell}>{hostA}</th>
                                <th scope="col" style={headCell}>{hostB}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat) => (
                                <tr key={cat.label}>
                                    <th scope="row" style={labelCellStyle}>{cat.label}</th>
                                    {["a", "b"].map((side) => {
                                        const v = cat[side];
                                        return (
                                            <td key={side} style={cellStyle}>
                                                {v.count === 0 ? (
                                                    <span style={{ color: p.muted }}>
                                                        {isArabic ? "غير موجود" : "Not found"}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: p.risk[weightTier(v.weight)].text, fontWeight: 600 }}>
                                                        {v.weight}
                                                        {v.count > 1 && (
                                                            <span style={{ color: p.muted, fontWeight: 400, fontSize: "0.8rem" }}>
                                                                {" "}({v.count})
                                                            </span>
                                                        )}
                                                    </span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p style={{ margin: "8px 0 0", color: p.muted, fontSize: "0.8rem" }}>
                        {isArabic
                            ? "الأرقام تمثل مجموع أوزان المخاطر لكل فئة، وعدد البنود بين قوسين."
                            : "Numbers show the total risk weight per category; clause count in parentheses."}
                    </p>
                </div>
            )}
        </div>
    );
}

/* ---------- Share + badge ---------- */

function ShareBar({ resultId, isArabic, onStatus }) {
    const p = usePalette();
    const [origin, setOrigin] = useState("");
    const [showEmbed, setShowEmbed] = useState(false);
    const [canShare, setCanShare] = useState(false);
    const t = (en, ar) => (isArabic ? ar : en);

    useEffect(() => {
        setOrigin(window.location.origin);
        setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
    }, []);

    const shareUrl = origin ? `${origin}/results?id=${encodeURIComponent(resultId)}` : "";
    const badgeUrl = origin ? `${origin}/api/badge/${encodeURIComponent(resultId)}` : "";
    const embedCode = origin
        ? `<a href="${shareUrl}"><img src="${badgeUrl}" alt="BYAN risk score" width="150" height="22"></a>`
        : "";

    async function handleCopy(text, okMsg) {
        const ok = await copyText(text);
        onStatus(ok ? okMsg : t("Could not copy. Select the text and copy it manually.", "تعذّر النسخ. حدّد النص وانسخه يدويًا."));
    }

    async function handleNativeShare() {
        try {
            await navigator.share({
                title: t("BYAN policy analysis", "تحليل سياسة عبر بيان"),
                url: shareUrl
            });
        } catch {
            /* user cancelled */
        }
    }

    const smallButton = {
        padding: "8px 16px",
        borderRadius: 10,
        ...borders(p.border),
        background: "transparent",
        color: p.accentText,
        fontWeight: 700,
        fontSize: "0.82rem",
        cursor: "pointer"
    };

    return (
        <div style={{ marginTop: 18, width: "100%", textAlign: "center" }}>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                <button
                    type="button"
                    style={smallButton}
                    onClick={() => handleCopy(shareUrl, t("Link copied.", "تم نسخ الرابط."))}
                    disabled={!shareUrl}
                >
                    {t("Copy link", "نسخ الرابط")}
                </button>
                {canShare && (
                    <button type="button" style={smallButton} onClick={handleNativeShare}>
                        {t("Share", "مشاركة")}
                    </button>
                )}
                <button
                    type="button"
                    style={smallButton}
                    aria-expanded={showEmbed}
                    aria-controls="byan-embed-panel"
                    onClick={() => setShowEmbed((v) => !v)}
                >
                    {t("Embed badge", "تضمين الشارة")}
                </button>
            </div>

            {showEmbed && (
                <div
                    id="byan-embed-panel"
                    style={{
                        marginTop: 14,
                        padding: "14px 16px",
                        background: p.altBg,
                        ...borders(p.border),
                        borderRadius: 12,
                        textAlign: isArabic ? "right" : "left"
                    }}
                >
                    <p style={{ margin: "0 0 10px", color: p.body, fontSize: "0.82rem", lineHeight: 1.6 }}>
                        {t(
                            "Paste this on a blog or website. The badge shows the current score and links back to this result.",
                            "الصق هذا الكود في مدونة أو موقع. تعرض الشارة الدرجة الحالية وتربط بهذه النتيجة."
                        )}
                    </p>
                    <div dir="ltr" style={{ marginBottom: 10 }}>
                        {badgeUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={badgeUrl} alt={t("Badge preview: BYAN risk score", "معاينة الشارة: درجة المخاطر في بيان")} width="150" height="22" />
                        )}
                    </div>
                    <label htmlFor="byan-embed-code" style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: p.body, marginBottom: 4 }}>
                        {t("Embed code", "كود التضمين")}
                    </label>
                    <textarea
                        id="byan-embed-code"
                        dir="ltr"
                        readOnly
                        value={embedCode}
                        rows={3}
                        onFocus={(e) => e.target.select()}
                        style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "10px 12px",
                            borderRadius: 10,
                            ...borders(p.border),
                            background: p.input,
                            color: p.inputText,
                            fontSize: "0.78rem",
                            fontFamily: "monospace",
                            resize: "vertical"
                        }}
                    />
                    <button
                        type="button"
                        style={{ ...smallButton, marginTop: 8 }}
                        onClick={() => handleCopy(embedCode, t("Embed code copied.", "تم نسخ كود التضمين."))}
                    >
                        {t("Copy code", "نسخ الكود")}
                    </button>
                </div>
            )}
        </div>
    );
}

/* ---------- Page ---------- */

function ResultsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get("id");
    const compareId = searchParams.get("compare");
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const { data: session } = useSession();
    const [saveStatus, setSaveStatus] = useState("");
    const [showAuthPrompt, setShowAuthPrompt] = useState(false);
    const p = usePalette();
    const reducedMotion = usePrefersReducedMotion();

    // Translation state
    const [displayLang, setDisplayLang] = useState(null); // set once result loads
    const [translatedData, setTranslatedData] = useState(null); // cached translation
    const [translating, setTranslating] = useState(false);
    const [translateError, setTranslateError] = useState("");

    // Comparison state
    const [compareInput, setCompareInput] = useState("");
    const [compareResult, setCompareResult] = useState(null);
    const [comparing, setComparing] = useState(false);
    const [compareError, setCompareError] = useState("");

    // Help + tour + share status
    const [helpOpen, setHelpOpen] = useState(false);
    const [tourStep, setTourStep] = useState(-1); // -1 = not running
    const [liveStatus, setLiveStatus] = useState("");

    // NEW_HOME: category only, age note, characters analyzed, re-run when older than the cache window.
    // With the flag off none of these show and the page is exactly as before.
    const { newHome, cacheTtlDays } = useFlags();

    // Phase 2 (REUSE_CACHED): re-run a result that was served from the cache
    const [rerunning, setRerunning] = useState(false);
    const [rerunError, setRerunError] = useState("");
    // Phase 2 (POPULAR_PAGE): the visitor arrived from the /popular list
    const fromPopular = searchParams.get("from") === "popular";

    const fetchedIdRef = useRef(null);

    useEffect(() => {
        if (!id) {
            setError("Missing result ID.");
            setLoading(false);
            return;
        }

        // Only fetch once per ID (blocks Strict Mode's double run in dev)
        if (fetchedIdRef.current === id) return;
        fetchedIdRef.current = id;

        async function fetchResult() {
            try {
                const res = await fetch(`/api/result/${id}`);
                const data = await res.json();

                if (!res.ok) {
                    setError(data.error || "Result not found.");
                    return;
                }

                setResult(data);
                setDisplayLang(data.lang === "ar" ? "ar" : "en");
            } catch {
                setError("Could not load result.");
            } finally {
                setLoading(false);
            }
        }

        fetchResult();
    }, [id]);

    // Load an existing comparison from the URL (?compare=<id>) so refresh/share keeps it
    useEffect(() => {
        if (!compareId) {
            setCompareResult(null);
            return;
        }
        if (compareResult?.id === compareId) return;

        let cancelled = false;
        async function loadCompare() {
            setComparing(true);
            setCompareError("");
            try {
                const res = await fetch(`/api/result/${compareId}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Comparison result not found.");
                if (!cancelled) setCompareResult(data);
            } catch (err) {
                if (!cancelled) {
                    setCompareError(err instanceof Error ? err.message : "Could not load comparison.");
                }
            } finally {
                if (!cancelled) setComparing(false);
            }
        }
        loadCompare();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [compareId]);

    // First-visit tour: starts once per browser after the first result loads
    useEffect(() => {
        if (!result) return;
        try {
            if (!localStorage.getItem(TOUR_KEY)) setTourStep(0);
        } catch {
            /* storage unavailable: skip the tour */
        }
    }, [result?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    function endTour() {
        setTourStep(-1);
        try {
            localStorage.setItem(TOUR_KEY, "1");
        } catch {
            /* ignore */
        }
    }

    function replayTour() {
        setHelpOpen(false);
        setTourStep(0);
    }

    // The floating "?" button (HelpButton in the layout) toggles this page's help panel
    useEffect(() => {
        function onToggle() {
            setHelpOpen((v) => !v);
        }
        window.addEventListener("byan:toggle-results-help", onToggle);
        return () => window.removeEventListener("byan:toggle-results-help", onToggle);
    }, []);

    // Esc closes help and the tour
    useEffect(() => {
        function onKey(e) {
            if (e.key !== "Escape") return;
            if (helpOpen) setHelpOpen(false);
            if (tourStep >= 0) endTour();
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [helpOpen, tourStep]);

    // Scroll the highlighted section into view during the tour
    const TOUR_TARGETS = ["tour-score", "tour-summary", "tour-findings"];
    useEffect(() => {
        if (tourStep < 0) return;
        const el = document.getElementById(TOUR_TARGETS[tourStep]);
        if (el) el.scrollIntoView({ block: "center", behavior: reducedMotion ? "auto" : "smooth" });
    }, [tourStep, reducedMotion]); // eslint-disable-line react-hooks/exhaustive-deps

    // Clear the status message after a few seconds
    useEffect(() => {
        if (!liveStatus) return undefined;
        const timer = setTimeout(() => setLiveStatus(""), 4000);
        return () => clearTimeout(timer);
    }, [liveStatus]);

    async function handleSave() {
        if (!result?.id) return;

        // Signed-out visitors: this is the only place Log in / Sign up are offered
        if (!session?.user) {
            setShowAuthPrompt(true);
            return;
        }

        setSaveStatus("saving");
        try {
            const res = await fetch("/api/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    analysisId: result.id,
                    title: result.resolvedUrl || result.url,
                    query: result.url,
                    result: result.summaryEn,
                    riskScore: result.riskScore,
                    riskLevel: result.riskLevel,
                })
            });
            if (!res.ok) throw new Error();
            setSaveStatus("saved");
        } catch {
            setSaveStatus("error");
        }
    }

    async function handleCompare(e) {
        e.preventDefault();
        if (!result || comparing) return;

        const url = normalizeUrl(compareInput);
        if (!url) {
            setCompareError(isArabic ? "يرجى إدخال رابط." : "Please enter a URL.");
            return;
        }
        if (getHostname(url) === getHostname(result.url)) {
            setCompareError(
                isArabic ? "يرجى إدخال رابط لموقع مختلف." : "Please enter a URL for a different site."
            );
            return;
        }

        setComparing(true);
        setCompareError("");
        try {
            const analyzeRes = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url, lang: displayLang })
            });
            const analyzeData = await analyzeRes.json();
            if (!analyzeRes.ok) throw new Error(analyzeData.error || "Analysis failed.");

            const res = await fetch(`/api/result/${analyzeData.id}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Could not load comparison result.");

            setCompareResult(data);
            setCompareInput("");
            router.replace(`/results?id=${id}&compare=${data.id}`, { scroll: false });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Comparison failed.";
            setCompareError(message.replace(/^BLOCKED:\s*/, ""));
        } finally {
            setComparing(false);
        }
    }

    // Runs a fresh analysis of the URL the visitor typed. The server applies the same per-IP limits and daily
    // token budget as any new analysis, and only replaces the cache entry if the new analysis succeeds.
    async function handleRerun() {
        if (!result?.url || rerunning) return;
        setRerunning(true);
        setRerunError("");
        try {
            const res = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: result.url, lang: displayLang === "ar" ? "ar" : "en", rerun: true })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.id) {
                const message = String(data.error || "Analysis failed.").replace(/^BLOCKED:\s*/, "");
                setRerunError(message);
                return;
            }
            // Load the new result: reset what belongs to the old one, then change the id in the URL
            setTranslatedData(null);
            setResult(null);
            setLoading(true);
            router.replace(`/results?id=${data.id}`);
        } catch {
            setRerunError(displayLang === "ar" ? "تعذر الاتصال بالخادم." : "Could not connect to the server.");
        } finally {
            setRerunning(false);
        }
    }

    function handleClearComparison() {
        setCompareResult(null);
        setCompareError("");
        router.replace(`/results?id=${id}`, { scroll: false });
    }

    const { lang: siteLang } = useTheme();
    const translatingRef = useRef(false);

    async function switchLanguage(targetLang) {
        if (!result || translatingRef.current) return;
        if (targetLang === displayLang) return;

        const originalLang = result.lang === "ar" ? "ar" : "en";
        if (targetLang === originalLang) {
            setDisplayLang(targetLang);
            return;
        }
        if (translatedData && translatedData.lang === targetLang) {
            setDisplayLang(targetLang);
            return;
        }

        translatingRef.current = true;
        setTranslating(true);
        setTranslateError("");
        try {
            const res = await fetch("/api/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    summaryEn: result.summaryEn,
                    clauses: result.clauses,
                    targetLang
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Translation failed.");

            setTranslatedData({ ...data, lang: targetLang });
            setDisplayLang(targetLang);
        } catch (err) {
            setTranslateError(err instanceof Error ? err.message : "Translation failed.");
        } finally {
            translatingRef.current = false;
            setTranslating(false);
        }
    }

    function handleToggleLanguage() {
        switchLanguage(displayLang === "ar" ? "en" : "ar");
    }

    // Follow the site-wide EN/AR switch in the navbar.
    // Account v2 setting "Default result language": "policy" opens a result in the policy's own
    // language; "my" (the default, and the behaviour before this setting existed) follows the site language.
    useEffect(() => {
        if (!result || (siteLang !== "ar" && siteLang !== "en")) return;
        const policyLang = result.lang === "ar" ? "ar" : "en";
        const target = ACCOUNT_V2 && readResultLang() === "policy" ? policyLang : siteLang;
        switchLanguage(target);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [siteLang, result?.id]);

    const tier = result ? getRiskTier(result.riskLevel) : "moderate";
    const colors = p.risk[tier];

    const originalLang = result?.lang === "ar" ? "ar" : "en";
    const isShowingTranslated = displayLang && displayLang !== originalLang;
    const activeSummary = isShowingTranslated && translatedData ? translatedData.summaryEn : result?.summaryEn;

    // Merge translations by position: only text fields are swapped.
    // evidence, verified, matchType, matchScore, severity and riskWeight always come from the original.
    const baseClauses = result?.clauses || [];
    const activeClauses =
        isShowingTranslated && Array.isArray(translatedData?.clauses)
            ? baseClauses.map((orig, i) => {
                const tr = translatedData.clauses[i] || {};
                const merged = { ...orig };
                for (const key of TRANSLATABLE_FIELDS) {
                    if (typeof tr[key] === "string" && tr[key].trim()) merged[key] = tr[key];
                }
                return merged;
            })
            : baseClauses;

    const isArabic = displayLang === "ar";
    const dir = isArabic ? "rtl" : "ltr";
    const textAlign = isArabic ? "right" : "left";
    const t = (en, ar) => (isArabic ? ar : en);

    // "Last checked" comes from the saved record; nothing is shown if the record has no date
    const checkedDate = result
        ? formatCheckedDate(result.analyzedAt || result.checkedAt || result.createdAt, isArabic)
        : "";
    const checkedIso = result
        ? (() => {
            const raw = result.analyzedAt || result.checkedAt || result.createdAt;
            const d = raw ? new Date(raw) : null;
            return d && !Number.isNaN(d.getTime()) ? d.toISOString() : undefined;
        })()
        : undefined;

    // NEW_HOME: age facts, near-boundary note and characters analyzed. Display only: no label or score is changed.
    const age = newHome && result
        ? resultAge({ analyzedAt: result.analyzedAt || result.checkedAt || result.createdAt, ttlDays: cacheTtlDays })
        : null;
    const nearHigh = newHome && result ? isNearHighBoundary(result.riskScore, result.riskLevel) : false;
    const coverage =
        newHome && result?.coverage &&
        Number.isFinite(Number(result.coverage.analyzedChars)) &&
        Number.isFinite(Number(result.coverage.totalChars))
            ? result.coverage
            : null;
    // Re-run needs a real web address: screenshot and pasted-text results have none
    const canRerunUrl = Boolean(result?.url) && /^https?:\/\//i.test(String(result.url));
    const ageText = !age?.known
        ? ""
        : age.days === 0
            ? t("This analysis was made today.", "أُجري هذا التحليل اليوم.") // [AR review pending]
            : t(
                `This analysis is ${age.days} ${age.days === 1 ? "day" : "days"} old.`,
                `عمر هذا التحليل ${age.days} يوم.` // [AR review pending]
            );

    const tourSteps = [
        {
            id: "tour-score",
            title: t("Your risk score", "درجة المخاطر"),
            text: t(
                "A 0–100 estimate. Higher means more risky clauses were found. It is an automated estimate, not legal advice.",
                "تقدير من 0 إلى 100. كلما ارتفعت الدرجة زادت البنود الخطرة المكتشفة. هذا تقدير آلي وليس استشارة قانونية."
            )
        },
        {
            id: "tour-summary",
            title: t("Plain-language summary", "ملخص مبسّط"),
            text: t(
                "A short overview of what the policy says and what stands out.",
                "نظرة سريعة على ما تقوله السياسة وأبرز ما فيها."
            )
        },
        {
            id: "tour-findings",
            title: t("Findings and evidence", "النتائج والأدلة"),
            text: t(
                "Each finding quotes the policy word for word, so you can check it yourself.",
                "كل نتيجة تقتبس نص السياسة حرفيًا لتتمكن من التحقق بنفسك."
            )
        }
    ];

    // Visible outline on the section the tour is pointing at
    function highlight(targetId) {
        if (tourStep < 0 || tourSteps[tourStep]?.id !== targetId) return {};
        return { outline: `3px solid ${p.accent}`, outlineOffset: 6, borderRadius: 14 };
    }

    const sectionTitle = { margin: "0 0 6px", color: p.heading, fontSize: "1.05rem", fontWeight: 800 };

    const accentButton = {
        display: "inline-block",
        border: "none",
        borderRadius: 12,
        padding: "12px 24px",
        background: p.accent,
        color: p.onAccent,
        fontWeight: 700,
        fontSize: "0.92rem",
        textDecoration: "none",
        cursor: "pointer",
        boxShadow: `0 0 0 6px ${p.accentSoft}`
    };

    const pillButton = {
        padding: "7px 16px",
        borderRadius: 999,
        border: "none",
        background: p.accentSoft,
        color: p.accentText,
        fontWeight: 700,
        fontSize: "0.82rem",
        cursor: "pointer"
    };

    return (
        <div dir={dir} lang={isArabic ? "ar" : "en"} style={{ background: p.pageBg, color: p.heading }}>
            <style>{`
                @keyframes byanFadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
                .byan-fade { animation: byanFadeUp 0.45s ease-out both; }
                @media (prefers-reduced-motion: reduce) {
                    .byan-fade { animation: none !important; }
                }
            `}</style>

            {/* Status messages for screen readers (copy, share) */}
            <div role="status" aria-live="polite" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>
                {liveStatus}
            </div>

            <div style={{ position: "relative", overflow: "hidden", width: "100%" }}>
                <TermsBackground />

                <div
                    style={{
                        position: "relative",
                        zIndex: 1,
                        maxWidth: 760,
                        margin: "0 auto",
                        width: "100%",
                        padding: "64px 20px 72px"
                    }}
                >
                    {/* Hero — same style as the homepage title */}
                    <div style={{ textAlign: "center", marginBottom: 28 }}>
                        <h1
                            style={{
                                fontSize: "clamp(2rem, 4.5vw, 2.8rem)",
                                fontWeight: 800,
                                margin: "0 0 12px",
                                lineHeight: 1.15
                            }}
                        >
                            {isArabic ? "نتائج " : "Analysis "}
                            <span style={{ color: p.accent }}>{isArabic ? "التحليل" : "Results"}</span>
                        </h1>

                        {result && (
                            <p
                                dir="ltr"
                                style={{
                                    margin: "0 auto 8px",
                                    maxWidth: 560,
                                    color: p.body,
                                    fontSize: "0.95rem",
                                    wordBreak: "break-all"
                                }}
                            >
                                {result.url}
                            </p>
                        )}

                        {!newHome && result && checkedDate && !result.analyzedAt && (
                            <p style={{ margin: "0 auto 16px", color: p.body, fontSize: "0.85rem" }}>
                                {t("Last checked", "آخر فحص")}:{" "}
                                <time dateTime={checkedIso}>{checkedDate}</time>
                            </p>
                        )}
                        {/* Result cache (record has analyzedAt only when the cache flag was on): date + where it came from */}
                        {!newHome && result && checkedDate && result.analyzedAt && (
                            <p style={{ margin: "0 auto 16px", color: p.body, fontSize: "0.85rem" }}>
                                {t("Analyzed on", "تم التحليل في")}{" "} {/*  */}
                                <time dateTime={checkedIso}>{checkedDate}</time>
                                {" · "}
                                {result.fromCache
                                    ? t("Served from the cache", "نتيجة محفوظة مسبقًا") /*  */
                                    : t("New analysis", "تحليل جديد") /*  */}
                            </p>
                        )}

                        {/* Phase 2, REUSE_CACHED: a result reused from the cache. The URL shown above is the one the visitor typed. */}
                        {/* NEW_HOME replaces this block with the age rules below (re-run only when older than the cache window) */}
                        {!newHome && result && result.reusedCached && (
                            <div
                                role="status"
                                style={{
                                    margin: "0 auto 16px",
                                    maxWidth: 560,
                                    padding: "10px 12px",
                                    background: p.risk.moderate.bg,
                                    color: p.risk.moderate.text,
                                    borderRadius: 10,
                                    fontSize: "0.85rem"
                                }}
                            >
                                <p style={{ margin: "0 0 10px" }}>
                                    {t(
                                        `This result is from ${checkedDate}. Policies can change. Re-run the analysis for the latest version.`,
                                        `هذه النتيجة بتاريخ ${checkedDate}. قد تتغير السياسات. أعد تشغيل التحليل للحصول على أحدث نسخة.` // 
                                    )}
                                </p>
                                <button
                                    type="button"
                                    onClick={handleRerun}
                                    disabled={rerunning}
                                    style={{ ...pillButton, cursor: rerunning ? "wait" : "pointer" }}
                                >
                                    {rerunning
                                        ? t("Re-running...", "جارٍ إعادة التحليل...") /*  */
                                        : t("Re-run analysis", "إعادة التحليل") /*  */}
                                </button>
                                {rerunError && (
                                    <p role="alert" style={{ margin: "10px 0 0" }}>{rerunError}</p>
                                )}
                            </div>
                        )}

                        {/* NEW_HOME: date, age, near-boundary note, characters analyzed, and the re-run rule.
                            Display only: the label and the score are never changed here. */}
                        {newHome && result && (
                            <div style={{ margin: "0 auto 16px", maxWidth: 560, display: "flex", flexDirection: "column", gap: 10 }}>
                                {checkedDate && (
                                    <p style={{ margin: 0, color: p.body, fontSize: "0.85rem", textAlign: "center" }}>
                                        {t("Analyzed on", "تم التحليل في")}{" "}
                                        <time dateTime={checkedIso}>{checkedDate}</time>
                                        {ageText && <> · {ageText}</>}
                                    </p>
                                )}

                                {age?.isOld && (
                                    <p
                                        role="status"
                                        style={{
                                            margin: 0,
                                            padding: "12px 14px",
                                            borderRadius: 10,
                                            background: p.risk.high.bg,
                                            color: p.risk.high.text,
                                            ...borders(p.risk.high.ring, 1.5),
                                            fontWeight: 700,
                                            fontSize: "0.9rem",
                                            lineHeight: 1.6
                                        }}
                                    >
                                        {t(
                                            "This is an old result. The policy may have changed since it was analyzed.",
                                            "هذه نتيجة قديمة. قد تكون السياسة تغيّرت منذ تحليلها." // [AR review pending]
                                        )}
                                    </p>
                                )}

                                {nearHigh && (
                                    <p
                                        role="note"
                                        style={{
                                            margin: 0,
                                            padding: "8px 12px",
                                            borderRadius: 10,
                                            background: p.risk.moderate.bg,
                                            color: p.risk.moderate.text,
                                            fontSize: "0.85rem",
                                            textAlign: "center"
                                        }}
                                    >
                                        {t(
                                            "This result is close to the High Risk boundary.",
                                            "هذه النتيجة قريبة من حد الخطورة العالية." // [AR review pending]
                                        )}
                                    </p>
                                )}

                                {coverage && (
                                    <p style={{ margin: 0, color: p.body, fontSize: "0.85rem", textAlign: "center" }}>
                                        {t(
                                            `Analyzed ${Number(coverage.analyzedChars).toLocaleString("en-US")} of ${Number(coverage.totalChars).toLocaleString("en-US")} characters.`,
                                            `تم تحليل ${Number(coverage.analyzedChars).toLocaleString("ar-SA")} من ${Number(coverage.totalChars).toLocaleString("ar-SA")} حرفًا.` // [AR review pending]
                                        )}
                                    </p>
                                )}
                                {/* Re-run: only when the result is older than the cache window, and only for a web address */}
                                {age?.canRerun && canRerunUrl && (
                                    <div
                                        style={{
                                            padding: "10px 12px",
                                            borderRadius: 10,
                                            background: p.risk.moderate.bg,
                                            color: p.risk.moderate.text,
                                            fontSize: "0.85rem",
                                            textAlign: "center"
                                        }}
                                    >
                                        <p style={{ margin: "0 0 10px" }}>
                                            {t(
                                                `This result is older than ${cacheTtlDays} days. Policies can change. Re-run the analysis for the latest version.`,
                                                `عمر هذه النتيجة أكثر من ${cacheTtlDays} أيام. قد تتغير السياسات. أعد تشغيل التحليل للحصول على أحدث نسخة.` // [AR review pending]
                                            )}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleRerun}
                                            disabled={rerunning}
                                            style={{ ...pillButton, cursor: rerunning ? "wait" : "pointer" }}
                                        >
                                            {rerunning
                                                ? t("Re-running...", "جارٍ إعادة التحليل...")
                                                : t("Re-run analysis", "إعادة التحليل")}
                                        </button>
                                        {rerunError && <p role="alert" style={{ margin: "10px 0 0" }}>{rerunError}</p>}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Phase 2, POPULAR_PAGE: shown when the visitor opened this result from the /popular list */}
                        {result && fromPopular && !result.reusedCached && (
                            <p
                                role="note"
                                style={{
                                    margin: "0 auto 16px",
                                    maxWidth: 560,
                                    padding: "10px 12px",
                                    background: p.risk.moderate.bg,
                                    color: p.risk.moderate.text,
                                    borderRadius: 10,
                                    fontSize: "0.85rem"
                                }}
                            >
                                {t(
                                    "Results may not reflect the current policy. Re-run the analysis for the latest version.",
                                    "قد لا تعكس النتائج السياسة الحالية. أعد تشغيل التحليل للحصول على أحدث نسخة." // 
                                )}
                            </p>
                        )}


                        {result && (
                            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                                <button
                                    type="button"
                                    onClick={handleToggleLanguage}
                                    disabled={translating}
                                    lang={displayLang === "ar" ? "en" : "ar"}
                                    style={{ ...pillButton, cursor: translating ? "wait" : "pointer" }}
                                >
                                    {translating
                                        ? (isArabic ? "جارٍ الترجمة..." : "Translating...")
                                        : displayLang === "ar"
                                            ? "View in English"
                                            : "عرض بالعربية"}
                                </button>
                            </div>
                        )}

                        {result && helpOpen && (
                            <div
                                id="byan-help-panel"
                                role="region"
                                aria-label={t("How to read this page", "كيف تقرأ هذه الصفحة")}
                                style={{
                                    margin: "16px auto 0",
                                    maxWidth: 520,
                                    padding: "16px 18px",
                                    background: p.card,
                                    ...borders(p.border),
                                    borderRadius: 14,
                                    textAlign,
                                    boxShadow: p.shadow
                                }}
                            >
                                <h2 style={{ ...sectionTitle, marginBottom: 8 }}>
                                    {t("How to read this page", "كيف تقرأ هذه الصفحة")}
                                </h2>
                                <ul style={{ margin: "0 0 12px", paddingInlineStart: 18, color: p.text, fontSize: "0.88rem", lineHeight: 1.7 }}>
                                    {tourSteps.map((s) => (
                                        <li key={s.id}>
                                            <strong>{s.title}:</strong> {s.text}
                                        </li>
                                    ))}
                                    <li>
                                        {t(
                                            "Results are automated and may contain mistakes. Use “Report an incorrect result” in the footer if something looks wrong.",
                                            "النتائج آلية وقد تحتوي على أخطاء. استخدم «الإبلاغ عن نتيجة غير صحيحة» في التذييل إذا بدا شيء غير صحيح."
                                        )}
                                    </li>
                                </ul>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    <button type="button" onClick={replayTour} style={pillButton}>
                                        {t("Replay tour", "إعادة الجولة")}
                                    </button>
                                    <button type="button" onClick={() => setHelpOpen(false)} style={{ ...pillButton, background: "transparent", ...borders(p.border) }}>
                                        {t("Close", "إغلاق")}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Main card — same style as the homepage input card */}
                    <div
                        style={{
                            background: p.card,
                            ...borders(p.border),
                            borderRadius: 20,
                            boxShadow: p.shadow,
                            padding: "32px 28px",
                            textAlign
                        }}
                    >
                        {loading && (
                            <p role="status" style={{ textAlign: "center", color: p.body, margin: 0 }}>
                                {isArabic ? "جارٍ تحميل النتيجة..." : "Loading result..."}
                            </p>
                        )}
                        {error && <p role="alert" style={{ textAlign: "center", color: p.error, margin: 0 }}>{error}</p>}
                        {translateError && (
                            <p role="alert" style={{ textAlign: "center", color: p.error, marginBottom: 16 }}>{translateError}</p>
                        )}

                        {!loading && result && (
                            <>
                                {/* Score */}
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
                                    <div id="tour-score" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 8, ...highlight("tour-score") }}>
                                        <ScoreCircle score={result.riskScore} tier={tier} isArabic={isArabic} hideNumber={newHome} />
                                        <span
                                            style={{
                                                marginTop: 16,
                                                padding: "6px 18px",
                                                borderRadius: 999,
                                                background: colors.bg,
                                                color: colors.text,
                                                ...borders(colors.ring, 1.5),
                                                fontWeight: 600,
                                                fontSize: "0.95rem"
                                            }}
                                        >
                                            <span aria-hidden="true">{TIER_SYMBOL[tier]} </span>
                                            {displayRiskLabel(result.riskLevel)}
                                        </span>
                                    </div>

                                    {
                                        <button
                                            type="button"
                                            onClick={handleSave}
                                            aria-expanded={!session?.user ? showAuthPrompt : undefined}
                                            disabled={saveStatus === "saving" || saveStatus === "saved"}
                                            style={{
                                                marginTop: 16,
                                                padding: "8px 20px",
                                                borderRadius: 10,
                                                ...borders(p.accent),
                                                background: saveStatus === "saved" ? p.accent : "transparent",
                                                color: saveStatus === "saved" ? p.onAccent : p.accentText,
                                                fontWeight: 700,
                                                fontSize: "0.85rem",
                                                cursor: "pointer"
                                            }}
                                        >
                                            {saveStatus === "saved"
                                                ? isArabic ? "تم الحفظ ✓" : "Saved ✓"
                                                : saveStatus === "saving"
                                                    ? isArabic ? "جارٍ الحفظ..." : "Saving..."
                                                    : saveStatus === "error"
                                                        ? isArabic ? "فشل الحفظ، أعد المحاولة" : "Save failed, try again"
                                                        : isArabic ? "حفظ النتيجة" : "Save Result"}
                                        </button>
                                    }

                                    {/* Signed-out visitors: Log in / Sign up appear only after they try to save */}
                                    {!session?.user && showAuthPrompt && (
                                        <div
                                            role="region"
                                            aria-label={isArabic ? "سجّل الدخول لحفظ النتيجة" : "Log in to save this result"}
                                            style={{
                                                marginTop: 12,
                                                padding: "14px 16px",
                                                maxWidth: 380,
                                                background: p.altBg,
                                                ...borders(p.border),
                                                borderRadius: 12,
                                                textAlign: "center"
                                            }}
                                        >
                                            <p style={{ margin: "0 0 10px", color: p.text, fontSize: "0.88rem", lineHeight: 1.6 }}>
                                                {isArabic
                                                    ? "سجّل الدخول أو أنشئ حسابًا لحفظ هذه النتيجة والعودة إليها لاحقًا."
                                                    : "Log in or create an account to save this result and come back to it later."}
                                            </p>
                                            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                                                <Link
                                                    href={`/login?callbackUrl=${encodeURIComponent(`/results?id=${id}`)}`}
                                                    style={{ ...pillButton, background: p.accent, color: p.onAccent, textDecoration: "none" }}
                                                >
                                                    {isArabic ? "تسجيل الدخول" : "Log in"}
                                                </Link>
                                                <Link
                                                    href={`/signup?callbackUrl=${encodeURIComponent(`/results?id=${id}`)}`}
                                                    style={{ ...pillButton, textDecoration: "none" }}
                                                >
                                                    {isArabic ? "إنشاء حساب" : "Sign up"}
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAuthPrompt(false)}
                                                    style={{ ...pillButton, background: "transparent", ...borders(p.border) }}
                                                >
                                                    {isArabic ? "إغلاق" : "Close"}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <ShareBar
                                        resultId={id}
                                        isArabic={isArabic}
                                        onStatus={setLiveStatus}
                                    />
                                    {liveStatus && (
                                        <p aria-hidden="true" style={{ margin: "10px 0 0", color: p.accentText, fontSize: "0.82rem", fontWeight: 600 }}>
                                            {liveStatus}
                                        </p>
                                    )}
                                </div>

                                {/* Summary */}
                                <div
                                    id="tour-summary"
                                    style={{
                                        background: p.altBg,
                                        borderTop: `1px solid ${p.border}`,
                                        borderBottom: `1px solid ${p.border}`,
                                        borderLeft: isArabic ? `1px solid ${p.border}` : `4px solid ${colors.ring}`,
                                        borderRight: isArabic ? `4px solid ${colors.ring}` : `1px solid ${p.border}`,
                                        borderRadius: 14,
                                        padding: "18px 20px",
                                        marginBottom: 32,
                                        ...highlight("tour-summary")
                                    }}
                                >
                                    <h2 style={{ ...sectionTitle, margin: "0 0 8px" }}>
                                        {isArabic ? "الملخص" : "Summary"}
                                    </h2>
                                    <p style={{ margin: 0, color: p.text, lineHeight: 1.7, fontSize: "0.95rem" }}>
                                        {activeSummary}
                                    </p>
                                </div>

                                {/* Findings */}
                                <div id="tour-findings" style={{ padding: 4, ...highlight("tour-findings") }}>
                                    <h2 style={sectionTitle}>
                                        {isArabic ? "النتائج والأدلة" : "Findings & Evidence"}
                                    </h2>
                                    <p style={{ margin: "0 0 16px", color: p.body, fontSize: "0.85rem", lineHeight: 1.6 }}>
                                        {isArabic
                                            ? "كل نتيجة مرتبطة بنص حرفي من السياسة. فقط النتائج المؤكدة بدليل نصي تُحتسب في درجة المخاطر."
                                            : "Each finding is linked to a word-for-word quote from the policy. Only findings verified against the text count toward the risk score."}
                                    </p>
                                    {(result.resolvedUrl || result.url) && (<p style={{ margin: "0 0 16px", color: p.body }}>{isArabic ? "المصدر الذي تم تحليله: " : "Analyzed source: "}<a href={result.resolvedUrl || result.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline", wordBreak: "break-all" }}>{result.resolvedUrl || result.url}</a></p>)}
                                    {/* Visible method (record has analysisMethod only when the show-method flag was on) */}
                                    {result.analysisMethod === "keyword" && (
                                        <p
                                            role="status"
                                            style={{
                                                margin: "0 0 16px",
                                                padding: "10px 12px",
                                                background: p.risk.moderate.bg,
                                                color: p.risk.moderate.text,
                                                borderRadius: 10,
                                                fontSize: "0.82rem"
                                            }}
                                        >
                                            {result.analysisReason === "rate_limited"
                                                ? t(
                                                    "This result used a basic check because the AI service was busy.",
                                                    "استخدمت هذه النتيجة فحصًا أساسيًا لأن خدمة الذكاء الاصطناعي كانت مشغولة." // 
                                                )
                                                : t(
                                                    "This result used a basic check because the AI service was unavailable.",
                                                    "استخدمت هذه النتيجة فحصًا أساسيًا لأن خدمة الذكاء الاصطناعي لم تكن متاحة." // 
                                                )}
                                        </p>
                                    )}
                                    {result.analysisSource === "keyword" && !result.analysisMethod && (
                                        <p
                                            style={{
                                                margin: "0 0 16px",
                                                padding: "10px 12px",
                                                background: p.risk.moderate.bg,
                                                color: p.risk.moderate.text,
                                                borderRadius: 10,
                                                fontSize: "0.82rem"
                                            }}
                                        >
                                            {isArabic
                                                ? "تعذّر الوصول إلى تحليل الذكاء الاصطناعي، لذلك تم استخدام الكشف بالكلمات المفتاحية (نتائج محدودة). أعد المحاولة بعد قليل."
                                                : "AI analysis was unavailable, so keyword detection was used (limited results). Try again in a moment."}
                                        </p>
                                    )}

                                    {activeClauses.length === 0 ? (
                                        <p style={{ color: p.body }}>
                                            {isArabic
                                                ? "لم يتم العثور على مخاطر مدعومة بنص واضح من السياسة."
                                                : "No risks backed by clear text from the policy were found."}
                                        </p>
                                    ) : (
                                        activeClauses.map((c, idx) => (
                                            <FindingCard key={idx} index={idx} finding={c} isArabic={isArabic} />
                                        ))
                                    )}
                                </div>

                                {/* ---------- Comparison ---------- */}
                                <div
                                    style={{
                                        marginTop: 36,
                                        paddingTop: 28,
                                        borderTop: `1px solid ${p.line}`
                                    }}
                                >
                                    {!compareResult && (
                                        <>
                                            <h2 style={sectionTitle}>
                                                {isArabic ? "قارن مع رابط آخر" : "Compare with another URL"}
                                            </h2>
                                            <p style={{ margin: "0 0 14px", color: p.body, fontSize: "0.9rem" }}>
                                                {isArabic
                                                    ? "حلّل موقعًا آخر واعرض النتائج جنبًا إلى جنب."
                                                    : "Analyze another site and see the results side by side."}
                                            </p>
                                            <form
                                                onSubmit={handleCompare}
                                                style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
                                            >
                                                <label htmlFor="byan-compare-url" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                                                    {isArabic ? "رابط الموقع المراد مقارنته" : "URL of the site to compare"}
                                                </label>
                                                <input
                                                    id="byan-compare-url"
                                                    type="text"
                                                    dir="ltr"
                                                    value={compareInput}
                                                    onChange={(e) => setCompareInput(e.target.value)}
                                                    placeholder="https://example.com"
                                                    disabled={comparing}
                                                    style={{
                                                        flex: "1 1 240px",
                                                        minWidth: 0,
                                                        padding: "12px 14px",
                                                        borderRadius: 12,
                                                        ...borders(p.border),
                                                        background: p.input,
                                                        color: p.inputText,
                                                        fontSize: "0.92rem"
                                                    }}
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={comparing}
                                                    style={{
                                                        ...accentButton,
                                                        cursor: comparing ? "wait" : "pointer",
                                                        opacity: comparing ? 0.7 : 1
                                                    }}
                                                >
                                                    {comparing
                                                        ? isArabic ? "جارٍ التحليل..." : "Analyzing..."
                                                        : isArabic ? "قارن" : "Compare"}
                                                </button>
                                            </form>
                                        </>
                                    )}

                                    {compareError && (
                                        <p role="alert" style={{ color: p.error, marginTop: 12, fontSize: "0.9rem" }}>{compareError}</p>
                                    )}

                                    {compareResult && (
                                        <ComparisonPanel
                                            current={result}
                                            other={compareResult}
                                            isArabic={isArabic}
                                            onClear={handleClearComparison}
                                        />
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Bottom actions */}
                    <div style={{ textAlign: "center", marginTop: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
                        {result && (
                            <Link href="/" style={accentButton}>
                                {isArabic ? "تحليل رابط آخر" : "Analyze another URL"}
                            </Link>
                        )}
                        <Link href="/" style={{ color: p.accentText, textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" }}>
                            {isArabic ? "→ العودة إلى الصفحة الرئيسية" : "← Back to Homepage"}
                        </Link>
                    </div>
                </div>
            </div>

            {/* One-time tour card */}
            {tourStep >= 0 && result && (
                <div
                    role="dialog"
                    aria-modal="false"
                    aria-label={t("Quick tour", "جولة سريعة")}
                    style={{
                        position: "fixed",
                        insetInline: 16,
                        bottom: 16,
                        zIndex: 50,
                        maxWidth: 420,
                        marginInline: "auto",
                        padding: "16px 18px",
                        background: p.isDark ? "#0f172a" : "#ffffff",
                        ...borders(p.accent, 2),
                        borderRadius: 14,
                        boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
                        textAlign
                    }}
                >
                    <p style={{ margin: "0 0 4px", color: p.body, fontSize: "0.75rem", fontWeight: 700 }}>
                        {t(`Step ${tourStep + 1} of ${tourSteps.length}`, `الخطوة ${tourStep + 1} من ${tourSteps.length}`)}
                    </p>
                    <h2 style={{ margin: "0 0 6px", color: p.heading, fontSize: "1rem", fontWeight: 800 }}>
                        {tourSteps[tourStep].title}
                    </h2>
                    <p style={{ margin: "0 0 14px", color: p.text, fontSize: "0.88rem", lineHeight: 1.6 }}>
                        {tourSteps[tourStep].text}
                    </p>
                    <div style={{ display: "flex", gap: 8, justifyContent: "space-between", flexWrap: "wrap" }}>
                        <button type="button" onClick={endTour} style={{ ...pillButton, background: "transparent", ...borders(p.border) }}>
                            {t("Skip tour", "تخطي الجولة")}
                        </button>
                        <button
                            type="button"
                            autoFocus
                            onClick={() => (tourStep >= tourSteps.length - 1 ? endTour() : setTourStep(tourStep + 1))}
                            style={{ ...pillButton, background: p.accent, color: p.onAccent }}
                        >
                            {tourStep >= tourSteps.length - 1 ? t("Done", "تم") : t("Next", "التالي")}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ResultsPage() {
    return (
        <Suspense fallback={<p style={{ textAlign: "center", padding: "48px" }}>Loading...</p>}>
            <ResultsContent />
        </Suspense>
    );
}