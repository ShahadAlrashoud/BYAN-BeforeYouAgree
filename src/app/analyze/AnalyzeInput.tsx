"use client";

// The /analyze input page (NEW_HOME): choose the analysis type, then give BYAN a policy.
//   Link         -> goes to /analyze?url=...&tier=..., which runs the analysis and shows progress
//   Screenshots  -> ImageAnalyzer (reads text in the browser, then posts it with the chosen tier)
//   Paste text   -> posts the text to /api/analyze with the chosen tier
// The daily allowance and the access check are enforced by /api/analyze for all three.
import { useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "@/app/components/LocalizedLink";
import { useTheme } from "../providers";
import ImageAnalyzer from "../components/ImageAnalyzer";
import AnalysisTierPicker, { type Tier } from "../components/AnalysisTierPicker";
import { inputStrings } from "./inputStrings";

type Tab = "url" | "files" | "text";

// [AR review pending] step labels for this page.
const stepLabels = {
    en: { type: "Analysis type", source: "Policy source" },
    ar: { type: "نوع التحليل", source: "مصدر السياسة" },
} as const;

type Colors = ReturnType<typeof useTheme>["colors"];

function StepTitle({ n, children, colors }: { n: number; children: ReactNode; colors: Colors }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span
                style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: colors.accent,
                    color: colors.onAccent,
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                {n}
            </span>
            <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: colors.heading }}>{children}</h2>
        </div>
    );
}

export default function AnalyzeInput() {
    const router = useRouter();
    const { theme, lang, colors } = useTheme();
    const isDark = theme === "dark";
    const isAr = lang === "ar";
    const t = inputStrings[isAr ? "ar" : "en"];
    const steps = stepLabels[isAr ? "ar" : "en"];

    const [tab, setTab] = useState<Tab>("url");
    const [tier, setTier] = useState<Tier>("free");
    const [url, setUrl] = useState("");
    const [text, setText] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const [limited, setLimited] = useState(false);

    const heading = isDark ? "#f1f1f1" : "#1e293b";
    const body = isDark ? "#94a3b8" : "#64748b";

    function submitUrl(e: FormEvent) {
        e.preventDefault();
        if (!url.trim()) {
            setError(t.urlError);
            return;
        }
        setError("");
        router.push(`/analyze?url=${encodeURIComponent(url.trim())}&lang=${lang}&tier=${tier}`);
    }

    async function submitText(e: FormEvent) {
        e.preventDefault();
        if (busy) return;
        if (text.trim().length < 50) {
            setError(t.textError);
            return;
        }
        setError("");
        setLimited(false);
        setBusy(true);
        try {
            const res = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: text.trim(), lang, tier }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data?.id) {
                if (data?.reason === "daily_allowance") setLimited(true);
                else if (data?.code === "access_required") setError(t.accessRequired);
                else setError(String(data?.error || t.failed));
                return;
            }
            router.push(`/results?id=${data.id}`);
        } catch {
            setError(t.failed);
        } finally {
            setBusy(false);
        }
    }

    const panel: CSSProperties = {
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: 20,
        padding: 24,
        boxShadow: isDark ? "0 10px 30px rgba(0,0,0,0.35)" : "0 10px 30px rgba(15,23,42,0.06)",
    };

    const field: CSSProperties = {
        width: "100%",
        boxSizing: "border-box",
        padding: "14px 16px",
        fontSize: "1rem",
        fontFamily: "inherit",
        borderRadius: 12,
        border: `1px solid ${colors.border}`,
        background: colors.input,
        color: colors.heading,
        textAlign: isAr ? "right" : "left",
        outline: "none",
    };

    const primary: CSSProperties = {
        width: "100%",
        border: "none",
        borderRadius: 12,
        padding: "14px 26px",
        background: colors.accent,
        color: colors.onAccent,
        fontWeight: 700,
        fontSize: "0.98rem",
        fontFamily: "inherit",
        cursor: busy ? "wait" : "pointer",
        opacity: busy ? 0.7 : 1,
    };

    const tabs: [Tab, string][] = [
        ["url", t.tabUrl],
        ["files", t.tabFiles],
        ["text", t.tabText],
    ];

    return (
        <div
            dir={isAr ? "rtl" : "ltr"}
            style={{
                background: isDark ? "linear-gradient(180deg, #0a0e1a 0%, #111827 100%)" : "#ffffff",
                color: heading,
                minHeight: "100%",
            }}
        >
            <div style={{ maxWidth: 680, margin: "0 auto", padding: "56px 24px 72px" }}>
                {/* Hero */}
                <header style={{ textAlign: "center", marginBottom: 36 }}>
                    <h1
                        style={{
                            margin: "0 0 12px",
                            fontSize: "clamp(1.9rem, 4.2vw, 2.6rem)",
                            fontWeight: 800,
                            lineHeight: 1.15,
                        }}
                    >
                        {t.title}
                    </h1>
                    <p style={{ margin: "0 auto", maxWidth: 520, color: body, lineHeight: 1.7 }}>{t.intro}</p>
                </header>

                {/* Step 1: analysis type */}
                <section style={{ ...panel, marginBottom: 20 }}>
                    <StepTitle n={1} colors={colors}>
                        {steps.type}
                    </StepTitle>
                    <AnalysisTierPicker lang={isAr ? "ar" : "en"} tier={tier} onTierChange={setTier} />
                </section>

                {/* Step 2: policy source */}
                <section style={panel}>
                    <StepTitle n={2} colors={colors}>
                        {steps.source}
                    </StepTitle>

                    <div
                        role="tablist"
                        style={{
                            display: "flex",
                            gap: 4,
                            padding: 4,
                            borderRadius: 14,
                            background: colors.input,
                            border: `1px solid ${colors.border}`,
                            marginBottom: 20,
                        }}
                    >
                        {tabs.map(([id, label]) => {
                            const active = tab === id;
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    role="tab"
                                    aria-selected={active}
                                    onClick={() => {
                                        setTab(id);
                                        setError("");
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: "10px 12px",
                                        borderRadius: 10,
                                        border: "none",
                                        cursor: "pointer",
                                        fontFamily: "inherit",
                                        fontWeight: 700,
                                        fontSize: "0.9rem",
                                        background: active ? colors.accent : "transparent",
                                        color: active ? colors.onAccent : colors.muted,
                                        transition: "background 0.15s, color 0.15s",
                                    }}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>

                    {tab === "url" && (
                        <form onSubmit={submitUrl} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <label htmlFor="analyze-url" style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                                {t.urlLabel}
                            </label>
                            <input
                                id="analyze-url"
                                type="text"
                                inputMode="url"
                                autoComplete="url"
                                dir="ltr"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder={t.urlPlaceholder}
                                style={field}
                            />
                            <button type="submit" disabled={!url.trim()} style={{ ...primary, opacity: url.trim() ? 1 : 0.5 }}>
                                {t.urlButton}
                            </button>
                        </form>
                    )}

                    {tab === "files" && <ImageAnalyzer showIntro={false} tier={tier} />}

                    {tab === "text" && (
                        <form onSubmit={submitText} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <label htmlFor="analyze-text" style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                                {t.textLabel}
                            </label>
                            <textarea
                                id="analyze-text"
                                rows={9}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder={t.textPlaceholder}
                                style={{ ...field, resize: "vertical", lineHeight: 1.6 }}
                            />
                            <span
                                style={{
                                    fontSize: "0.8rem",
                                    color: text.trim().length >= 50 ? colors.low : colors.muted,
                                    textAlign: isAr ? "left" : "right",
                                }}
                            >
                                {text.trim().length} / 50
                            </span>
                            <button type="submit" disabled={busy} style={primary}>
                                {busy ? t.working : t.textButton}
                            </button>
                        </form>
                    )}

                    {error && (
                        <p role="alert" style={{ margin: "16px 0 0", color: colors.high, fontSize: "0.9rem" }}>
                            {error}
                        </p>
                    )}

                    {limited && (
                        <div
                            role="alert"
                            style={{
                                marginTop: 16,
                                padding: "12px 14px",
                                borderRadius: 12,
                                background: colors.accentSoft,
                                color: colors.accentText,
                            }}
                        >
                            <strong>{t.limitTitle}</strong>
                            <p style={{ margin: "6px 0 0", fontSize: "0.9rem", lineHeight: 1.6 }}>{t.limitBody}</p>
                        </div>
                    )}
                </section>

                <p style={{ margin: "28px 0 0", textAlign: "center", fontSize: "0.9rem" }}>
                    <Link href="/privacy" style={{ color: colors.accentText, fontWeight: 700, textDecoration: "none" }}>
                        {t.privacy}
                    </Link>
                </p>
            </div>
        </div>
    );
}