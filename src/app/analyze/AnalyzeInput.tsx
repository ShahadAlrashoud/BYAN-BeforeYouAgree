"use client";

// The /analyze input page (NEW_HOME): three ways to give BYAN a policy. Nothing runs here by itself.
//   Link         -> goes to /analyze?url=...&tier=..., which already runs the analysis and shows progress
//   Screenshots  -> the existing ImageAnalyzer (reads text in the browser, then posts it with the chosen tier)
//   Paste text   -> posts the text to /api/analyze with the chosen tier
// The daily allowance and the access check are enforced by /api/analyze for all three.
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "@/app/components/LocalizedLink";
import { useTheme } from "../providers";
import ImageAnalyzer from "../components/ImageAnalyzer";
import AnalysisTierPicker, { type Tier } from "../components/AnalysisTierPicker";
import { inputStrings } from "./inputStrings";

type Tab = "url" | "files" | "text";

export default function AnalyzeInput() {
    const router = useRouter();
    const { theme, lang, colors } = useTheme();
    const isDark = theme === "dark";
    const isAr = lang === "ar";
    const t = inputStrings[isAr ? "ar" : "en"];

    const [tab, setTab] = useState<Tab>("url");
    const [tier, setTier] = useState<Tier>("free");
    const [url, setUrl] = useState("");
    const [text, setText] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const [limited, setLimited] = useState(false);

    const heading = isDark ? "#f1f1f1" : "#1e293b";
    const body = isDark ? "#94a3b8" : "#64748b";

    function submitUrl(e: React.FormEvent) {
        e.preventDefault();
        if (!url.trim()) {
            setError(t.urlError);
            return;
        }
        setError("");
        router.push(`/analyze?url=${encodeURIComponent(url.trim())}&lang=${lang}&tier=${tier}`);
    }

    async function submitText(e: React.FormEvent) {
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

    const tabButton = (id: Tab, label: string) => (
        <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => {
                setTab(id);
                setError("");
            }}
            style={{
                border: `1px solid ${colors.border}`,
                borderRadius: 999,
                padding: "8px 18px",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "pointer",
                background: tab === id ? colors.accent : "transparent",
                color: tab === id ? colors.onAccent : colors.accentText,
            }}
        >
            {label}
        </button>
    );

    const field = {
        width: "100%",
        boxSizing: "border-box",
        padding: "14px 16px",
        fontSize: "1rem",
        borderRadius: 12,
        border: `1px solid ${colors.border}`,
        background: colors.input,
        color: colors.heading,
        textAlign: isAr ? "right" : "left",
    } as const;

    const primary = {
        border: "none",
        borderRadius: 12,
        padding: "13px 26px",
        background: colors.accent,
        color: colors.onAccent,
        fontWeight: 700,
        fontSize: "0.95rem",
        cursor: busy ? "wait" : "pointer",
    } as const;

    return (
        <div dir={isAr ? "rtl" : "ltr"} style={{ background: isDark ? "linear-gradient(180deg, #0a0e1a 0%, #111827 100%)" : "#ffffff", color: heading }}>
            <div style={{ maxWidth: 640, margin: "0 auto", padding: "64px 24px 72px" }}>
                <h1 style={{ margin: "0 0 12px", fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 800, textAlign: "center" }}>{t.title}</h1>
                <p style={{ margin: "0 0 24px", color: body, textAlign: "center", lineHeight: 1.7 }}>{t.intro}</p>

                <div style={{ marginBottom: 22, padding: 22, borderRadius: 20, background: colors.card, border: `1px solid ${colors.border}` }}>
                    <AnalysisTierPicker lang={isAr ? "ar" : "en"} tier={tier} onTierChange={setTier} />
                </div>

                <div role="tablist" style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 22 }}>
                    {tabButton("url", t.tabUrl)}
                    {tabButton("files", t.tabFiles)}
                    {tabButton("text", t.tabText)}
                </div>

                <div style={{ padding: 22, borderRadius: 20, background: colors.card, border: `1px solid ${colors.border}` }}>
                    {tab === "url" && (
                        <form onSubmit={submitUrl} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <label htmlFor="analyze-url" style={{ fontWeight: 700 }}>{t.urlLabel}</label>
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
                            <button type="submit" style={primary}>{t.urlButton}</button>
                        </form>
                    )}

                    {tab === "files" && <ImageAnalyzer showIntro={false} tier={tier} />}

                    {tab === "text" && (
                        <form onSubmit={submitText} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <label htmlFor="analyze-text" style={{ fontWeight: 700 }}>{t.textLabel}</label>
                            <textarea
                                id="analyze-text"
                                rows={9}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder={t.textPlaceholder}
                                style={{ ...field, resize: "vertical", fontFamily: "inherit" }}
                            />
                            <button type="submit" disabled={busy} style={{ ...primary, opacity: busy ? 0.7 : 1 }}>
                                {busy ? t.working : t.textButton}
                            </button>
                        </form>
                    )}

                    {error && (
                        <p role="alert" style={{ margin: "12px 0 0", color: colors.high, fontSize: "0.9rem" }}>{error}</p>
                    )}
                    {limited && (
                        <div role="alert" style={{ margin: "12px 0 0", padding: "10px 12px", borderRadius: 10, background: colors.accentSoft, color: colors.accentText }}>
                            <strong>{t.limitTitle}</strong>
                            <p style={{ margin: "6px 0 0", fontSize: "0.9rem" }}>{t.limitBody}</p>
                        </div>
                    )}
                </div>

                <p style={{ margin: "16px 0 0", textAlign: "center", fontSize: "0.85rem" }}>
                    <Link href="/privacy" style={{ color: colors.accentText, fontWeight: 700 }}>{t.privacy}</Link>
                </p>
            </div>
        </div>
    );
}