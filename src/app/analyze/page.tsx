"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTheme } from "../providers";
import TermsBackground from "../components/TermsBackground";
import AnalyzeInput from "./AnalyzeInput";
import { useFlags } from "../components/FlagsProvider";

const content = {
    en: {
        titlePrefix: "Reading the ",
        titleAccent: "fine print",
        failedPrefix: "Analysis ",
        failedAccent: "failed",
        wait: "We're reading the policy and checking every finding against the original text. This usually takes a few seconds.",
        analyzing: "Analyzing...",
        chips: ["Verified quotes only", "0–100 risk score", "Plain language"],
        tryAnother: "Analyze another URL",
        back: "← Back to Homepage",
        missingUrl: "Missing URL. Go back and paste a valid URL.",
        blocked:
            "This site blocks automated tools from reading it directly. Try copying the link to its Terms of Service or Privacy Policy page yourself and paste that instead.",
        connectError: "Could not connect to API."
    },
    ar: {
        titlePrefix: "نقرأ ",
        titleAccent: "التفاصيل الدقيقة",
        failedPrefix: "فشل ",
        failedAccent: "التحليل",
        wait: "نقرأ السياسة ونتحقق من كل نتيجة مقابل النص الأصلي. يستغرق ذلك عادةً بضع ثوانٍ.",
        analyzing: "جارٍ التحليل...",
        chips: ["اقتباسات موثّقة فقط", "درجة من 0 إلى 100", "لغة بسيطة"],
        tryAnother: "تحليل رابط آخر",
        back: "→ العودة إلى الصفحة الرئيسية",
        missingUrl: "الرابط مفقود. ارجع والصق رابطًا صالحًا.",
        blocked:
            "يمنع هذا الموقع الأدوات الآلية من قراءته مباشرة. حاول نسخ رابط صفحة شروط الخدمة أو سياسة الخصوصية بنفسك ولصقه هنا بدلاً من ذلك.",
        connectError: "تعذر الاتصال بالخادم."
    }
};

function Spinner({ track, ring }: { track: string; ring: string }) {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    return (
        <svg width={76} height={76} viewBox="0 0 76 76" aria-hidden="true">
            <circle cx="38" cy="38" r={radius} fill="none" stroke={track} strokeWidth="7" />
            <circle
                cx="38"
                cy="38"
                r={radius}
                fill="none"
                stroke={ring}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={`${circumference * 0.28} ${circumference}`}
            >
                <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 38 38"
                    to="360 38 38"
                    dur="1s"
                    repeatCount="indefinite"
                />
            </circle>
        </svg>
    );
}

function AnalyzeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const url = searchParams.get("url");
    const [error, setError] = useState("");
    const { theme, lang, colors: themeColors } = useTheme();
    const isDark = theme === "dark";
    const isAr = lang === "ar";
    const t = content[lang];
    // NEW_HOME: with no ?url=, show the input page (link / screenshots / pasted text) instead of "Missing URL"
    const { newHome } = useFlags();

    // Same neutral tokens as the homepage
    const colors = {
        pageBg: isDark ? "linear-gradient(180deg, #0a0e1a 0%, #111827 100%)" : "#ffffff",
        heading: isDark ? "#f1f1f1" : "#1e293b",
        body: isDark ? "#94a3b8" : "#64748b"
    };

    // Guard so only ONE analysis request is sent per URL
    // (blocks Strict Mode's double run and re-runs when `lang` loads from the theme provider)
    const startedForRef = useRef<string | null>(null);

    useEffect(() => {
        if (!url) {
            if (!newHome) setError(t.missingUrl);
            return;
        }

        if (startedForRef.current === url) return;
        startedForRef.current = url;

        async function runAnalysis() {
            try {
                const response = await fetch("/api/analyze", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url, lang })
                });

                const text = await response.text();

                let data;
                try {
                    data = JSON.parse(text);
                } catch {
                    throw new Error(`Server returned: ${text}`);
                }

                if (!response.ok) {
                    const message = data.error || "Analysis failed.";
                    setError(message.startsWith("BLOCKED:") ? t.blocked : message);
                    return;
                }

                router.replace(`/results?id=${data.id}`);
            } catch (err) {
                console.error("Analysis error:", err);
                setError(err instanceof Error ? err.message : t.connectError);
            }
        }

        runAnalysis();
        // Only re-run when the URL itself changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url]);

    // All hooks above run on every render, so this early return is safe
    if (newHome && !url) return <AnalyzeInput />;

    const accentButton = {
        display: "inline-block",
        border: "none",
        borderRadius: 12,
        padding: "13px 26px",
        background: themeColors.accent,
        color: themeColors.onAccent,
        fontWeight: 700,
        fontSize: "0.95rem",
        textDecoration: "none",
        boxShadow: `0 0 0 6px ${themeColors.accentSoft}`
    };

    return (
        <div
            dir={isAr ? "rtl" : "ltr"}
            style={{ background: colors.pageBg, color: colors.heading }}
        >
            <div style={{ position: "relative", overflow: "hidden", width: "100%" }}>
                <TermsBackground />

                <div
                    style={{
                        position: "relative",
                        zIndex: 1,
                        maxWidth: 760,
                        margin: "0 auto",
                        width: "100%",
                        padding: "80px 24px 72px",
                        textAlign: "center"
                    }}
                >
                    <h1
                        style={{
                            fontSize: "clamp(2rem, 4.5vw, 3rem)",
                            fontWeight: 800,
                            margin: "0 0 16px",
                            lineHeight: 1.15
                        }}
                    >
                        {error ? t.failedPrefix : t.titlePrefix}
                        <span style={{ color: error ? themeColors.high : themeColors.accent }}>
                            {error ? t.failedAccent : t.titleAccent}
                        </span>
                    </h1>

                    {!error && (
                        <p
                            style={{
                                fontSize: "1.05rem",
                                color: colors.body,
                                margin: "0 auto 32px",
                                maxWidth: 520,
                                lineHeight: 1.6
                            }}
                        >
                            {t.wait}
                        </p>
                    )}

                    {/* Card — same style as the homepage input card */}
                    <div
                        style={{
                            maxWidth: 580,
                            margin: error ? "24px auto 0" : "0 auto",
                            padding: 24,
                            borderRadius: 20,
                            background: themeColors.card,
                            border: `1px solid ${themeColors.border}`,
                            boxShadow: isDark
                                ? "0 10px 30px rgba(0,0,0,0.35)"
                                : "0 10px 30px rgba(15,23,42,0.08)"
                        }}
                    >
                        {!error ? (
                            <div role="status" aria-live="polite">
                                <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                                    <Spinner track={themeColors.accentSoft} ring={themeColors.accent} />
                                </div>
                                <p style={{ margin: "0 0 18px", fontWeight: 700, color: colors.heading }}>
                                    {t.analyzing}
                                </p>
                                {url && (
                                    <div
                                        dir="ltr"
                                        style={{
                                            padding: "14px 16px",
                                            borderRadius: 12,
                                            border: `1px solid ${themeColors.border}`,
                                            background: themeColors.input,
                                            color: themeColors.heading,
                                            fontSize: "0.9rem",
                                            wordBreak: "break-all",
                                            textAlign: "left"
                                        }}
                                    >
                                        {url}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div role="alert">
                                <div
                                    style={{
                                        borderRadius: 12,
                                        border: `1px solid ${themeColors.high}`,
                                        padding: "14px 16px",
                                        color: themeColors.high,
                                        fontSize: "0.92rem",
                                        lineHeight: 1.7,
                                        textAlign: isAr ? "right" : "left",
                                        marginBottom: 22
                                    }}
                                >
                                    {error}
                                </div>
                                <Link href="/" style={accentButton}>
                                    {t.tryAnother}
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Chips — same as homepage trust chips */}
                    {!error && (
                        <div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                justifyContent: "center",
                                gap: 10,
                                marginTop: 22
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
                                        color: themeColors.accentText
                                    }}
                                >
                                    ✓ {chip}
                                </span>
                            ))}
                        </div>
                    )}

                    <div style={{ marginTop: 28 }}>
                        <Link
                            href="/"
                            style={{
                                color: themeColors.accentText,
                                fontWeight: 700,
                                fontSize: "0.9rem",
                                textDecoration: "none"
                            }}
                        >
                            {t.back}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AnalyzePage() {
    return (
        <Suspense fallback={<p style={{ textAlign: "center", padding: "48px" }}>Loading...</p>}>
            <AnalyzeContent />
        </Suspense>
    );
}