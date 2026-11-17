"use client";
import { useTheme } from "../providers";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import TermsBackground from "../components/TermsBackground";

/* ---------- Risk colors (light + dark) ---------- */

const RISK_LIGHT = {
    safe: { ring: "#86d9a4", bg: "#eafcf1", text: "#4a8f68" },
    moderate: { ring: "#f2c96b", bg: "#fdf6e3", text: "#a17f2d" },
    high: { ring: "#f19a9a", bg: "#fdecec", text: "#c06a6a" }
};

const RISK_DARK = {
    safe: { ring: "#86d9a4", bg: "rgba(134,217,164,0.12)", text: "#86d9a4" },
    moderate: { ring: "#f2c96b", bg: "rgba(242,201,107,0.12)", text: "#f2c96b" },
    high: { ring: "#f19a9a", bg: "rgba(241,154,154,0.12)", text: "#f19a9a" }
};

function getRiskTier(riskLevel) {
    if (!riskLevel) return "moderate";
    const level = riskLevel.toLowerCase();
    if (level.includes("safe")) return "safe";
    if (level.includes("high")) return "high";
    return "moderate";
}

function weightTier(weight) {
    if (weight >= 15) return "high";
    if (weight >= 8) return "moderate";
    return "safe";
}

function getHostname(url) {
    try {
        return new URL(url).hostname.replace(/^www\./, "");
    } catch {
        return url || "";
    }
}

const SEVERITY_TIER = { high: "high", medium: "moderate", low: "safe" };
const SEVERITY_LABEL = {
    high: { en: "High", ar: "عالي" },
    medium: { en: "Medium", ar: "متوسط" },
    low: { en: "Low", ar: "منخفض" }
};
const TRANSLATABLE_FIELDS = ["category", "text", "plainExplanation", "riskReason", "suggestedAction"];

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
        muted: isDark ? "#64748b" : "#94a3b8",
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

/* ---------- Finding card ---------- */

function FindingCard({ finding, isArabic }) {
    const p = usePalette();
    const severity =
        finding.severity ||
        (finding.riskWeight >= 15 ? "high" : finding.riskWeight >= 8 ? "medium" : "low");
    const c = p.risk[SEVERITY_TIER[severity]];
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
            style={{
                borderTop: `1px solid ${p.border}`,
                borderBottom: `1px solid ${p.border}`,
                borderLeft: isArabic ? `1px solid ${p.border}` : `4px solid ${c.ring}`,
                borderRight: isArabic ? `4px solid ${c.ring}` : `1px solid ${p.border}`,
                borderRadius: 14,
                padding: "16px 18px",
                marginBottom: 16,
                background: p.card
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

function ScoreCircle({ score, tier, size = 180 }) {
    const p = usePalette();
    const colors = p.risk[tier];
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const [progress, setProgress] = useState(0);
    const scale = size / 180;

    useEffect(() => {
        const timeout = setTimeout(() => setProgress(score), 100);
        return () => clearTimeout(timeout);
    }, [score]);

    const offset = circumference - (progress / 100) * circumference;

    return (
        <div style={{ position: "relative", width: size, height: size }}>
            <svg width={size} height={size} viewBox="0 0 180 180">
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
                    style={{ transition: "stroke-dashoffset 1s ease-out" }}
                />
            </svg>
            <div
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
                <span style={{ fontSize: `${2.2 * scale}rem`, fontWeight: 800, color: p.heading }}>{score}</span>
                <span style={{ fontSize: `${Math.max(0.85 * scale, 0.7)}rem`, color: p.body }}>/ 100</span>
            </div>
        </div>
    );
}

/* ---------- Comparison ---------- */

function SiteColumn({ data, tier, label, host }) {
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
            <ScoreCircle score={data.riskScore} tier={tier} size={130} />
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
                {data.riskLevel}
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
        verdictTier = "safe";
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
                <h3 style={{ margin: 0, color: p.heading, fontSize: "1.05rem", fontWeight: 800 }}>
                    {isArabic ? "المقارنة" : "Comparison"}
                </h3>
                <button
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
                <SiteColumn data={current} tier={tierA} label={isArabic ? "هذا الموقع" : "This site"} host={hostA} />
                <SiteColumn data={other} tier={tierB} label={isArabic ? "الموقع المقارن" : "Compared site"} host={hostB} />
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
                            <th style={headLabelCell}>{isArabic ? "المقياس" : "Metric"}</th>
                            <th style={headCell}>{hostA}</th>
                            <th style={headCell}>{hostB}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.map((s) => {
                            const win = better(s.a, s.b, s.lowerIsBetter);
                            return (
                                <tr key={s.label}>
                                    <td style={labelCellStyle}>{s.label}</td>
                                    <td style={{ ...cellStyle, fontWeight: win.a ? 700 : 400, color: win.a ? p.risk.safe.text : p.text }}>
                                        {s.a}
                                    </td>
                                    <td style={{ ...cellStyle, fontWeight: win.b ? 700 : 400, color: win.b ? p.risk.safe.text : p.text }}>
                                        {s.b}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Category breakdown */}
            <h4 style={{ margin: "0 0 10px", color: p.heading, fontSize: "0.95rem" }}>
                {isArabic ? "مقارنة الفئات" : "Category breakdown"}
            </h4>
            {categories.length === 0 ? (
                <p style={{ color: p.body, fontSize: "0.9rem" }}>
                    {isArabic ? "لا توجد بنود للمقارنة." : "No clauses to compare."}
                </p>
            ) : (
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: p.altBg }}>
                                <th style={headLabelCell}>{isArabic ? "الفئة" : "Category"}</th>
                                <th style={headCell}>{hostA}</th>
                                <th style={headCell}>{hostB}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat) => (
                                <tr key={cat.label}>
                                    <td style={labelCellStyle}>{cat.label}</td>
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
    const p = usePalette();

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

    async function handleSave() {
        if (!result?.id) return;
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

    // Follow the site-wide EN/AR switch in the navbar
    useEffect(() => {
        if (!result || (siteLang !== "ar" && siteLang !== "en")) return;
        switchLanguage(siteLang);
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

    return (
        <div dir={dir} style={{ background: p.pageBg, color: p.heading }}>
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
                                    margin: "0 auto 16px",
                                    maxWidth: 560,
                                    color: p.body,
                                    fontSize: "0.95rem",
                                    wordBreak: "break-all"
                                }}
                            >
                                {result.url}
                            </p>
                        )}

                        {result && (
                            <button
                                onClick={handleToggleLanguage}
                                disabled={translating}
                                style={{
                                    padding: "7px 16px",
                                    borderRadius: 999,
                                    border: "none",
                                    background: p.accentSoft,
                                    color: p.accentText,
                                    fontWeight: 700,
                                    fontSize: "0.82rem",
                                    cursor: translating ? "wait" : "pointer"
                                }}
                            >
                                {translating
                                    ? (isArabic ? "جارٍ الترجمة..." : "Translating...")
                                    : displayLang === "ar"
                                        ? "View in English"
                                        : "عرض بالعربية"}
                            </button>
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
                            <p style={{ textAlign: "center", color: p.body, margin: 0 }}>
                                {isArabic ? "جارٍ تحميل النتيجة..." : "Loading result..."}
                            </p>
                        )}
                        {error && <p style={{ textAlign: "center", color: p.error, margin: 0 }}>{error}</p>}
                        {translateError && (
                            <p style={{ textAlign: "center", color: p.error, marginBottom: 16 }}>{translateError}</p>
                        )}

                        {!loading && result && (
                            <>
                                {/* Score */}
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
                                    <ScoreCircle score={result.riskScore} tier={tier} />
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
                                        {result.riskLevel}
                                    </span>

                                    {session?.user && (
                                        <button
                                            onClick={handleSave}
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
                                    )}
                                </div>

                                {/* Summary */}
                                <div
                                    style={{
                                        background: p.altBg,
                                        borderTop: `1px solid ${p.border}`,
                                        borderBottom: `1px solid ${p.border}`,
                                        borderLeft: isArabic ? `1px solid ${p.border}` : `4px solid ${colors.ring}`,
                                        borderRight: isArabic ? `4px solid ${colors.ring}` : `1px solid ${p.border}`,
                                        borderRadius: 14,
                                        padding: "18px 20px",
                                        marginBottom: 32
                                    }}
                                >
                                    <h3 style={{ ...sectionTitle, margin: "0 0 8px" }}>
                                        {isArabic ? "الملخص" : "Summary"}
                                    </h3>
                                    <p style={{ margin: 0, color: p.text, lineHeight: 1.7, fontSize: "0.95rem" }}>
                                        {activeSummary}
                                    </p>
                                </div>

                                {/* Findings */}
                                <div>
                                    <h3 style={sectionTitle}>
                                        {isArabic ? "النتائج والأدلة" : "Findings & Evidence"}
                                    </h3>
                                    <p style={{ margin: "0 0 16px", color: p.body, fontSize: "0.85rem", lineHeight: 1.6 }}>
                                        {isArabic
                                            ? "كل نتيجة مرتبطة بنص حرفي من السياسة. فقط النتائج المؤكدة بدليل نصي تُحتسب في درجة المخاطر."
                                            : "Each finding is linked to a word-for-word quote from the policy. Only findings verified against the text count toward the risk score."}
                                    </p>

                                    {result.analysisSource === "keyword" && (
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
                                            <FindingCard key={idx} finding={c} isArabic={isArabic} />
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
                                            <h3 style={sectionTitle}>
                                                {isArabic ? "قارن مع رابط آخر" : "Compare with another URL"}
                                            </h3>
                                            <p style={{ margin: "0 0 14px", color: p.body, fontSize: "0.9rem" }}>
                                                {isArabic
                                                    ? "حلّل موقعًا آخر واعرض النتائج جنبًا إلى جنب."
                                                    : "Analyze another site and see the results side by side."}
                                            </p>
                                            <form
                                                onSubmit={handleCompare}
                                                style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
                                            >
                                                <input
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
                                                        fontSize: "0.92rem",
                                                        outline: "none"
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
                                        <p style={{ color: p.error, marginTop: 12, fontSize: "0.9rem" }}>{compareError}</p>
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