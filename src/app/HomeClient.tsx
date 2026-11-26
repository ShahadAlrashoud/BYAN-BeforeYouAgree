"use client";

import Link from "@/app/components/LocalizedLink";
import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "./providers";
import ImageAnalyzer from "./components/ImageAnalyzer";
import TermsBackground from "./components/TermsBackground";
import GuidedTour from "./components/GuidedTour";

/* ---------- Icons ---------- */

function IconDocument({ color }: { color: string }) {
    return (
        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <line x1="8" y1="13" x2="16" y2="13" />
            <line x1="8" y1="17" x2="13" y2="17" />
        </svg>
    );
}

function IconShield({ color }: { color: string }) {
    return (
        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2 4 5v6c0 5 3.4 9 8 11 4.6-2 8-6 8-11V5z" />
            <path d="M9 12l2 2 4-4" />
        </svg>
    );
}

function IconWarning({ color }: { color: string }) {
    return (
        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    );
}

function IconSparkle({ color }: { color: string }) {
    return (
        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4" />
            <path d="M12 18v4" />
            <path d="M4.9 4.9l2.8 2.8" />
            <path d="M16.3 16.3l2.8 2.8" />
            <path d="M2 12h4" />
            <path d="M18 12h4" />
            <path d="M4.9 19.1l2.8-2.8" />
            <path d="M16.3 7.7l2.8-2.8" />
        </svg>
    );
}

/* ---------- Content ---------- */

type SampleClause = { level: string; title: string; text: string };

type Content = {
    heroTitlePrefix: string;
    heroTitleAccent: string;
    heroSubtitle: string;
    placeholder: string;
    button: string;
    errorMsg: string;
    privacyNote: string;
    privacyLink: string;
    languageNote: string;
    tabUrl: string;
    tabImages: string;
    chips: string[];
    tourLink: string;

    sampleLabel: string;
    sampleNote: string;
    sampleTitle: string;
    sampleScoreLabel: string;
    sampleLevel: string;
    sampleClauses: SampleClause[];

    howTitle: string;
    steps: { title: string; text: string }[];

    featuresTitle: string;
    features: { title: string; text: string }[];

    legendTitle: string;
    legendText: string;
    legend: string[];

    disclaimerTitle: string;
    disclaimerText: string;
    disclaimerLink: string;

    ctaTitle: string;
};

const content: Record<"en" | "ar", Content> = {
    en: {
        heroTitlePrefix: "Before you ",
        heroTitleAccent: "agree",
        heroSubtitle: "Paste a website link. Get a 0–100 risk score and the clauses that matter, in plain language. Analysis is based on Saudi Arabia's Personal Data Protection Law (PDPL).",
        placeholder: "Try: example.com",
        button: "Analyze Website →",
        errorMsg: "Please enter a URL.",
        privacyNote: "We use the policy text only to analyze it, and save the link and your results to your account.",
        privacyLink: "Privacy Policy",
        languageNote: "Results open in the policy's own language (Arabic or English), and you can switch the language afterwards.",
        tabUrl: "Website link",
        tabImages: "Upload Files",
        chips: ["Arabic & English", "0–100 risk score", "Plain language"],
        tourLink: "Take a quick tour",

        sampleLabel: "Sample",
        sampleNote: "Illustrative example, not a real service. A Low result is not a legal guarantee.",
        sampleTitle: "Sample report",
        sampleScoreLabel: "Risk score",
        sampleLevel: "High Risk",
        sampleClauses: [
            { level: "High", title: "Mandatory arbitration", text: "Disputes go to private arbitration instead of court." },
            { level: "Moderate", title: "Data shared with partners", text: "Your data may be passed to third-party advertisers." },
            { level: "Moderate", title: "Automatic renewal", text: "The plan renews each period unless you cancel." },
        ],

        howTitle: "How It Works",
        steps: [
            { title: "Enter a URL", text: "Paste any website's address." },
            { title: "We read the fine print", text: "BYAN finds and analyzes the Terms and Privacy Policy in Arabic or English." },
            { title: "Get your risk score", text: "A clear 0–100 score with a plain-language summary." },
        ],

        featuresTitle: "What You Get",
        features: [
            { title: "Terms of Service", text: "Understand what you're agreeing to." },
            { title: "Privacy Policy", text: "See how your data is collected and used." },
            { title: "Potential Risks", text: "Spot clauses that may concern you." },
            { title: "Plain Language", text: "Complex legal language, simplified — in English or Arabic." },
        ],

        legendTitle: "Know the risk at a glance",
        legendText: "Every policy is summarized in a single risk score from 0 to 100, classified into one of three levels: 0–29 Low, 30–59 Moderate Risk, 60–100 High Risk. A higher score means higher risk.",
        legend: ["Low", "Moderate Risk", "High Risk"],

        disclaimerTitle: "Disclaimer",
        disclaimerText:
            "BYAN provides automated, informational analysis only. It is not legal advice, and results may be incomplete or inaccurate. Please read the original policies before agreeing.",
        disclaimerLink: "Read full disclaimer",

        ctaTitle: "Before you agree, know what you're agreeing to.",
    },

    ar: {
        heroTitlePrefix: "قبل أن ",
        heroTitleAccent: "توافق",
        heroSubtitle: "الصق رابط موقع، واحصل على درجة مخاطر من 0 إلى 100 وأهم البنود بلغة بسيطة، ويستند التحليل إلى نظام حماية البيانات الشخصية السعودي (PDPL).",
        placeholder: "جرّب: example.com",
        button: "← تحليل الموقع",
        errorMsg: "الرجاء إدخال رابط.",
        privacyNote: "نستخدم نص السياسة لتحليله فقط، ونحفظ الرابط والنتائج في حسابك.",
        privacyLink: "سياسة الخصوصية",
        languageNote: "تظهر النتائج بلغة السياسة نفسها (العربية أو الإنجليزية)، ويمكنك تغيير اللغة بعد ذلك.",
        tabUrl: "رابط الموقع",
        tabImages: "رفع لقطات الشاشة",
        chips: ["عربي وإنجليزي", "درجة من 0 إلى 100", "لغة بسيطة"],
        tourLink: "خذ جولة سريعة",

        sampleLabel: "نموذج",
        sampleNote: "مثال توضيحي وليس خدمة حقيقية، ونتيجة منخفض لا تعني ضماناً قانونياً.", // [AR review pending]
        sampleTitle: "تقرير نموذجي",
        sampleScoreLabel: "درجة المخاطر",
        sampleLevel: "خطر مرتفع",
        sampleClauses: [
            { level: "مرتفع", title: "تحكيم إلزامي", text: "تُحال النزاعات إلى تحكيم خاص بدلاً من المحكمة." },
            { level: "متوسط", title: "مشاركة البيانات مع الشركاء", text: "قد تُمرَّر بياناتك إلى معلنين من أطراف ثالثة." },
            { level: "متوسط", title: "التجديد التلقائي", text: "تتجدد الخطة كل فترة ما لم تقم بالإلغاء." },
        ],

        howTitle: "كيف يعمل",
        steps: [
            { title: "أدخل الرابط", text: "الصق عنوان أي موقع." },
            { title: "نقرأ التفاصيل الدقيقة", text: "يعثر بيان على شروط الخدمة وسياسة الخصوصية ويحللها بالعربية أو الإنجليزية." },
            { title: "احصل على درجة المخاطر", text: "درجة واضحة من 0 إلى 100 مع ملخص بلغة بسيطة." },
        ],

        featuresTitle: "ماذا ستحصل عليه",
        features: [
            { title: "شروط الخدمة", text: "افهم ما الذي توافق عليه." },
            { title: "سياسة الخصوصية", text: "اطلع على كيفية جمع بياناتك واستخدامها." },
            { title: "المخاطر المحتملة", text: "اكتشف البنود التي قد تهمك." },
            { title: "لغة بسيطة", text: "لغة قانونية معقدة، مبسّطة — بالعربية أو الإنجليزية." },
        ],

        legendTitle: "اعرف مستوى الخطر بنظرة واحدة",
        legendText:
            "يتم تلخيص كل سياسة في درجة مخاطر واحدة من 0 إلى 100، وتُصنَّف ضمن واحد من ثلاثة مستويات: من 0 إلى 29 منخفض، ومن 30 إلى 59 خطر متوسط، ومن 60 إلى 100 خطر مرتفع، وكلما زادت الدرجة زاد الخطر.", // [AR review pending]
        legend: ["منخفض", "خطر متوسط", "خطر مرتفع"], // [AR review pending]

        disclaimerTitle: "تنبيه",
        disclaimerText:
            "يقدّم بيان تحليلاً آلياً للأغراض المعلوماتية فقط، وهو ليس استشارة قانونية، وقد تكون النتائج ناقصة أو غير دقيقة. يرجى قراءة السياسات الأصلية قبل الموافقة.",
        disclaimerLink: "اقرأ إخلاء المسؤولية كاملاً",

        ctaTitle: "قبل أن توافق، اعرف على ماذا توافق.",
    },
};

const LEGEND_COLORS = [
    { ring: "#86d9a4", bg: "#eafcf1", text: "#4a8f68" },
    { ring: "#f2c96b", bg: "#fdf6e3", text: "#a17f2d" },
    { ring: "#f19a9a", bg: "#fdecec", text: "#c06a6a" },
];

const SAMPLE_SCORE = 72;

/* ---------- Sample report ---------- */

function SampleReport({
    t,
    isAr,
    isDark,
    themeColors,
    bodyColor,
}: {
    t: Content;
    isAr: boolean;
    isDark: boolean;
    themeColors: any;
    bodyColor: string;
}) {
    const ARC = Math.PI * 60; // length of the semicircle
    const offset = ARC * (1 - SAMPLE_SCORE / 100);
    const scoreText = isAr ? SAMPLE_SCORE.toLocaleString("ar-SA") : String(SAMPLE_SCORE);

    return (
        <section
            aria-label={`${t.sampleTitle} (${t.sampleLabel})`}
            style={{
                padding: 20,
                borderRadius: 20,
                background: themeColors.card,
                border: `1px dashed ${themeColors.border}`,
                boxShadow: isDark ? "0 10px 30px rgba(0,0,0,0.35)" : "0 10px 30px rgba(15,23,42,0.08)",
                textAlign: "start",
            }}
        >
            <style>{`
                .byan-gauge-arc { transition: stroke-dashoffset 1.1s cubic-bezier(0.4,0,0.2,1); }
                @media (prefers-reduced-motion: reduce) {
                    .byan-gauge-arc { transition: none !important; }
                }
            `}</style>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: themeColors.heading }}>
                    {t.sampleTitle}
                </h2>
                <span
                    style={{
                        padding: "3px 10px",
                        borderRadius: 999,
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        background: themeColors.accentSoft,
                        color: themeColors.accentText,
                        border: `1px solid ${themeColors.accent}`,
                    }}
                >
                    {t.sampleLabel}
                </span>
            </div>

            <p style={{ margin: "0 0 14px", fontSize: "0.78rem", color: bodyColor }}>{t.sampleNote}</p>

            {/* Gauge */}
            <div style={{ textAlign: "center", marginBottom: 14 }}>
                <svg
                    viewBox="0 0 140 84"
                    width="190"
                    role="img"
                    aria-label={`${t.sampleScoreLabel}: ${scoreText} / ${isAr ? (100).toLocaleString("ar-SA") : 100} — ${t.sampleLevel}`}
                >
                    <path d="M10 70 A60 60 0 0 1 130 70" fill="none" stroke={isDark ? "#1e293b" : "#e2e8f0"} strokeWidth="12" strokeLinecap="round" />
                    <path
                        className="byan-gauge-arc"
                        d="M10 70 A60 60 0 0 1 130 70"
                        fill="none"
                        stroke={themeColors.high}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={ARC}
                        strokeDashoffset={offset}
                    />
                    <text x="70" y="64" textAnchor="middle" fontSize="28" fontWeight="800" fill={themeColors.heading}>
                        {scoreText}
                    </text>
                </svg>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: themeColors.heading }}>
                    {t.sampleScoreLabel}: {t.sampleLevel}
                </div>
            </div>

            {/* Flagged clauses */}
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
                {t.sampleClauses.map((c, i) => {
                    const isHigh = i === 0;
                    return (
                        <li
                            key={c.title}
                            style={{
                                padding: "10px 12px",
                                borderRadius: 12,
                                border: `1px solid ${themeColors.border}`,
                                borderInlineStart: `4px solid ${isHigh ? themeColors.high : themeColors.medium}`,
                                background: themeColors.input,
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
                                <strong style={{ fontSize: "0.88rem", color: themeColors.heading }}>{c.title}</strong>
                                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: bodyColor, whiteSpace: "nowrap" }}>
                                    {isHigh ? "▲ " : "● "}
                                    {c.level}
                                </span>
                            </div>
                            <p style={{ margin: "2px 0 0", fontSize: "0.8rem", lineHeight: 1.5, color: bodyColor }}>{c.text}</p>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}

/* ---------- Page ---------- */

export default function HomePage() {
    const [url, setUrl] = useState("");
    const [error, setError] = useState("");
    const [mode, setMode] = useState<"url" | "images">("url");
    const [tourOpen, setTourOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const router = useRouter();
    const { theme, lang, colors: themeColors } = useTheme();

    const isDark = theme === "dark";
    const isAr = lang === "ar";
    const t = content[lang] ?? content.en;

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!url.trim()) {
            setError(t.errorMsg);
            return;
        }

        setError("");

        router.push(
            `/analyze?url=${encodeURIComponent(url.trim())}&lang=${lang}`
        );
    }

    // Stable reference so GuidedTour's effects don't restart the tour on re-renders
    const closeTour = useCallback(() => setTourOpen(false), []);

    function startTour() {
        setMode("url"); // the form step needs the URL tab visible
        window.scrollTo({ top: 0 });
        setTimeout(() => setTourOpen(true), 50);
    }

    const icons = [IconDocument, IconShield, IconWarning, IconSparkle];

    const features = t.features.map((f, i) => ({
        ...f,
        Icon: icons[i],
    }));

    // Page-specific tokens (neutral backgrounds/text only; accents come from themeColors)
    const colors = {
        pageBg: isDark
            ? "linear-gradient(180deg, #0a0e1a 0%, #111827 100%)"
            : "#ffffff",

        altBg: isDark ? "#0f172a" : "#f8fafc",

        heading: isDark ? "#f1f1f1" : "#1e293b",

        body: isDark ? "#94a3b8" : "#64748b",

        line: isDark ? "#1e293b" : "#e2e8f0",

        iconBox: isDark ? "#1e293b" : "#eef2f8",

        soft: themeColors.accentSoft,
    };

    const sectionTitle = {
        margin: "0 0 32px",
        textAlign: "center" as const,
        fontSize: "1.4rem",
        fontWeight: 800,
        color: colors.heading,
    };

    return (
        <div
            dir={isAr ? "rtl" : "ltr"}
            style={{
                minHeight: "100vh",
                background: colors.pageBg,
                fontFamily: "'Segoe UI', Arial, sans-serif",
                color: colors.heading,
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* Hero */}

            <div style={{ position: "relative", overflow: "hidden", width: "100%" }}>
                <TermsBackground />

                <div
                    className="byan-hero"
                    style={{
                        position: "relative",
                        zIndex: 1,
                        maxWidth: 1080,
                        margin: "0 auto",
                        width: "100%",
                        padding: "64px 24px 56px",
                        boxSizing: "border-box",
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                        gap: 36,
                        alignItems: "center",
                    }}
                >
                    {/* Left: headline + input */}
                    <div style={{ textAlign: "center" }}>
                        <h1
                            style={{
                                fontSize: "clamp(2.2rem, 5vw, 3.4rem)",
                                fontWeight: 800,
                                margin: "0 0 16px",
                                lineHeight: 1.15,
                            }}
                        >
                            {t.heroTitlePrefix}
                            <span style={{ color: themeColors.accent }}>
                                {t.heroTitleAccent}
                            </span>
                        </h1>

                        <p
                            style={{
                                fontSize: "1.05rem",
                                color: colors.body,
                                margin: "0 auto 28px",
                                maxWidth: 520,
                                lineHeight: 1.6,
                            }}
                        >
                            {t.heroSubtitle}
                        </p>

                        {/* Input card */}
                        <div
                            style={{
                                maxWidth: 580,
                                margin: "0 auto",
                                padding: 20,
                                borderRadius: 20,
                                background: themeColors.card,
                                border: `1px solid ${themeColors.border}`,
                                boxShadow: isDark
                                    ? "0 10px 30px rgba(0,0,0,0.35)"
                                    : "0 10px 30px rgba(15,23,42,0.08)",
                                textAlign: isAr ? "right" : "left",
                            }}
                        >
                            {/* Tabs */}
                            <div
                                role="tablist"
                                data-tour="tabs"
                                style={{
                                    display: "flex",
                                    gap: 4,
                                    padding: 4,
                                    marginBottom: 16,
                                    borderRadius: 12,
                                    background: themeColors.accentSoft,
                                }}
                            >
                                {(["url", "images"] as const).map((m) => {
                                    const active = mode === m;
                                    return (
                                        <button
                                            key={m}
                                            type="button"
                                            role="tab"
                                            aria-selected={active}
                                            onClick={() => setMode(m)}
                                            style={{
                                                flex: 1,
                                                border: "none",
                                                borderRadius: 9,
                                                padding: "9px 12px",
                                                fontWeight: 700,
                                                fontSize: "0.9rem",
                                                cursor: "pointer",
                                                background: active
                                                    ? themeColors.accent
                                                    : "transparent",
                                                color: active
                                                    ? themeColors.onAccent
                                                    : themeColors.accentText,
                                                textDecoration: active ? "none" : "underline",
                                                transition:
                                                    "background-color 0.2s ease, color 0.2s ease",
                                            }}
                                        >
                                            {m === "url" ? t.tabUrl : t.tabImages}
                                        </button>
                                    );
                                })}
                            </div>

                            {mode === "url" ? (
                                <form
                                    data-tour="form"
                                    onSubmit={handleSubmit}
                                    dir={isAr ? "rtl" : "ltr"}
                                    style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: 10,
                                    }}
                                >
                                    <label
                                        htmlFor="analyze-input"
                                        style={{
                                            position: "absolute",
                                            width: 1,
                                            height: 1,
                                            overflow: "hidden",
                                            clip: "rect(0 0 0 0)",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {t.tabUrl}
                                    </label>
                                    <input
                                        ref={inputRef}
                                        id="analyze-input"
                                        type="text"
                                        inputMode="url"
                                        autoComplete="url"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder={t.placeholder}
                                        style={{
                                            flex: "1 1 220px",
                                            minWidth: 0,
                                            padding: "14px 16px",
                                            fontSize: "1rem",
                                            borderRadius: 12,
                                            outline: "none",
                                            border: `1px solid ${themeColors.border}`,
                                            background: themeColors.input,
                                            color: themeColors.heading,
                                            textAlign: isAr ? "right" : "left",
                                        }}
                                    />

                                    <button
                                        type="submit"
                                        style={{
                                            flex: "0 0 auto",
                                            border: "none",
                                            borderRadius: 12,
                                            padding: "14px 26px",
                                            background: themeColors.accent,
                                            color: themeColors.onAccent,
                                            fontWeight: 700,
                                            fontSize: "0.95rem",
                                            cursor: "pointer",
                                            whiteSpace: "nowrap",
                                            boxShadow: `0 0 0 6px ${themeColors.accentSoft}`,
                                        }}
                                    >
                                        {t.button}
                                    </button>
                                </form>
                            ) : (
                                <ImageAnalyzer showIntro={false} />
                            )}

                            {error && (
                                <p
                                    role="alert"
                                    style={{
                                        color: themeColors.high,
                                        fontSize: "0.85rem",
                                        margin: "10px 0 0",
                                    }}
                                >
                                    {error}
                                </p>
                            )}

                            {/* Privacy note */}
                            <p
                                style={{
                                    margin: "12px 0 0",
                                    fontSize: "0.78rem",
                                    color: colors.body,
                                }}
                            >
                                {t.privacyNote}{" "}
                                <Link
                                    href="/privacy"
                                    style={{
                                        color: themeColors.accentText,
                                        fontWeight: 700,
                                        textDecoration: "underline",
                                    }}
                                >
                                    {t.privacyLink}
                                </Link>
                            </p>
                        </div>

                        {/* Language behaviour */}
                        <p
                            style={{
                                margin: "14px auto 0",
                                maxWidth: 520,
                                fontSize: "0.8rem",
                                lineHeight: 1.6,
                                color: colors.body,
                            }}
                        >
                            {t.languageNote}
                        </p>

                        {/* Trust chips */}
                        <div
                            data-tour="chips"
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                justifyContent: "center",
                                gap: 10,
                                marginTop: 14,
                            }}
                        >
                            {t.chips.map((chip) => (
                                <span
                                    key={chip}
                                    style={{
                                        padding: "6px 14px",
                                        borderRadius: 999,
                                        fontSize: "0.8rem",
                                        fontWeight: 600,
                                        background: themeColors.accentSoft,
                                        color: themeColors.accentText,
                                    }}
                                >
                                    <span aria-hidden="true">✓ </span>
                                    {chip}
                                </span>
                            ))}
                        </div>

                        {/* Tour: secondary (outlined) button, clearly visible but not a second primary action */}
                        <div style={{ marginTop: 18 }}>
                            <button
                                type="button"
                                className="byan-tour-btn"
                                onClick={startTour}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 8,
                                    minHeight: 44,
                                    padding: "10px 22px",
                                    borderRadius: 12,
                                    border: `2px solid ${themeColors.accentText}`,
                                    background: isDark ? "rgba(165,180,252,0.10)" : "#ffffff",
                                    color: themeColors.accentText,
                                    fontWeight: 700,
                                    fontSize: "0.95rem",
                                    cursor: "pointer",
                                }}
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                    style={{ flexShrink: 0 }}
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <polygon points="10 8 16 12 10 16 10 8" />
                                </svg>
                                {t.tourLink}
                            </button>
                        </div>
                    </div>

                    {/* Right: static sample report */}
                    <SampleReport
                        t={t}
                        isAr={isAr}
                        isDark={isDark}
                        themeColors={themeColors}
                        bodyColor={colors.body}
                    />
                </div>
            </div>

            {/* Divider */}

            <div
                style={{
                    width: "100%",
                    height: 1,
                    background: colors.line,
                }}
            />

            {/* How it works */}

            <section
                data-tour="how"
                style={{
                    width: "100%",
                    padding: "60px 24px",
                    background: colors.altBg,
                }}
            >
                <div style={{ maxWidth: 900, margin: "0 auto" }}>
                    <h2 style={sectionTitle}>{t.howTitle}</h2>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: 28,
                        }}
                    >
                        {t.steps.map((s, i) => (
                            <div key={i} style={{ textAlign: "center" }}>
                                <div
                                    style={{
                                        width: 44,
                                        height: 44,
                                        margin: "0 auto 14px",
                                        borderRadius: "50%",
                                        background: themeColors.accent,
                                        color: themeColors.onAccent,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: 800,
                                        boxShadow: `0 0 0 6px ${colors.soft}`,
                                    }}
                                >
                                    {isAr
                                        ? (i + 1).toLocaleString("ar-SA")
                                        : i + 1}
                                </div>

                                <h3
                                    style={{
                                        margin: "0 0 6px",
                                        fontSize: "1rem",
                                    }}
                                >
                                    {s.title}
                                </h3>

                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: "0.88rem",
                                        lineHeight: 1.6,
                                        color: colors.body,
                                    }}
                                >
                                    {s.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What you get */}

            <section style={{ width: "100%", padding: "60px 24px" }}>
                <div style={{ maxWidth: 900, margin: "0 auto" }}>
                    <h2 style={sectionTitle}>{t.featuresTitle}</h2>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(160px, 1fr))",
                            gap: 24,
                            textAlign: "center",
                        }}
                    >
                        {features.map((f) => (
                            <div key={f.title}>
                                <div
                                    style={{
                                        width: 48,
                                        height: 48,
                                        margin: "0 auto 12px",
                                        borderRadius: 12,
                                        background: colors.iconBox,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <f.Icon color={themeColors.accentText} />
                                </div>

                                <h3
                                    style={{
                                        margin: "0 0 6px",
                                        fontSize: "0.95rem",
                                    }}
                                >
                                    {f.title}
                                </h3>

                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: "0.8rem",
                                        color: colors.body,
                                    }}
                                >
                                    {f.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Risk score legend */}

            <section
                data-tour="legend"
                style={{
                    width: "100%",
                    padding: "60px 24px",
                    background: colors.altBg,
                }}
            >
                <div
                    style={{
                        maxWidth: 700,
                        margin: "0 auto",
                        textAlign: "center",
                    }}
                >
                    <h2 style={{ ...sectionTitle, margin: "0 0 12px" }}>
                        {t.legendTitle}
                    </h2>

                    <p
                        style={{
                            margin: "0 0 28px",
                            fontSize: "0.95rem",
                            lineHeight: 1.7,
                            color: colors.body,
                        }}
                    >
                        {t.legendText}
                    </p>

                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            justifyContent: "center",
                            gap: 12,
                        }}
                    >
                        {t.legend.map((label, i) => (
                            <span
                                key={label}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 8,
                                    padding: "8px 18px",
                                    borderRadius: 999,
                                    background: LEGEND_COLORS[i].bg,
                                    color: LEGEND_COLORS[i].text,
                                    border: `1.5px solid ${LEGEND_COLORS[i].ring}`,
                                    fontWeight: 600,
                                    fontSize: "0.9rem",
                                }}
                            >
                                <span
                                    aria-hidden="true"
                                    style={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: "50%",
                                        background: LEGEND_COLORS[i].ring,
                                    }}
                                />

                                {label}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Disclaimer */}

            <section
                style={{
                    width: "100%",
                    padding: "28px 24px",
                    background: isDark ? "#111827" : "#f8fafc",
                    borderTop: `1px solid ${colors.line}`,
                    borderBottom: `1px solid ${colors.line}`,
                }}
            >
                <div
                    style={{
                        maxWidth: 850,
                        margin: "0 auto",
                        textAlign: "center",
                    }}
                >
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            marginBottom: 8,
                        }}
                    >
                        <IconWarning color={themeColors.medium} />

                        <h3
                            style={{
                                margin: 0,
                                fontSize: "0.95rem",
                                fontWeight: 800,
                                color: colors.heading,
                            }}
                        >
                            {t.disclaimerTitle}
                        </h3>
                    </div>

                    <p
                        style={{
                            maxWidth: 760,
                            margin: "0 auto 8px",
                            fontSize: "0.78rem",
                            lineHeight: 1.7,
                            color: colors.body,
                        }}
                    >
                        {t.disclaimerText}
                    </p>

                    <Link
                        href="/disclaimer"
                        style={{
                            fontSize: "0.78rem",
                            color: themeColors.accentText,
                            fontWeight: 700,
                            textDecoration: "underline",
                        }}
                    >
                        {t.disclaimerLink}
                    </Link>
                </div>
            </section>

            {/* Closing line (no second CTA button; the analyze form above is the single primary action) */}

            <section
                style={{
                    width: "100%",
                    padding: "56px 24px",
                    textAlign: "center",
                    flex: 1,
                }}
            >
                <h2
                    style={{
                        margin: "0 auto",
                        maxWidth: 560,
                        fontSize: "1.5rem",
                        fontWeight: 800,
                        lineHeight: 1.4,
                    }}
                >
                    {t.ctaTitle}
                </h2>
            </section>

            <GuidedTour open={tourOpen} onClose={closeTour} />
        </div>
    );
}