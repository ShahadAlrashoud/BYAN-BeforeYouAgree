"use client";

import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { useTheme } from "../providers";

export type Tier = "free" | "full";
type Lang = "en" | "ar";

// [AR review pending] every Arabic string in this file must be approved by a native speaker.
const TEXT = {
    en: {
        ariaLabel: "Analysis type",
        free: "Free analysis",
        freeNote: "Reads the first 12,000 characters of the policy.",
        freeBadge: "Open to everyone",
        full: "Full analysis",
        fullNote: "Reads the whole policy, not only the beginning.",
        fullBadge: "🔒 Access code",
        unlockedBadge: "✓ Unlocked",
        codeLabel: "Enter your access code",
        codePlaceholder: "Access code",
        unlock: "Unlock",
        checking: "Checking...",
        wrong: "Invalid code.",
        unlockedNote: "Full analysis is unlocked in this browser.",
    },
    ar: {
        ariaLabel: "نوع التحليل",
        free: "تحليل مجاني",
        freeNote: "يقرأ أول 12,000 حرف من السياسة.",
        freeBadge: "متاح للجميع",
        full: "تحليل كامل",
        fullNote: "يقرأ السياسة كاملة وليس بدايتها فقط.",
        fullBadge: "🔒 يحتاج رمز",
        unlockedBadge: "✓ مفعّل",
        codeLabel: "أدخل رمز الوصول",
        codePlaceholder: "رمز الوصول",
        unlock: "تفعيل",
        checking: "جارٍ التحقق...",
        wrong: "الرمز غير صحيح.",
        unlockedNote: "التحليل الكامل مفعّل في هذا المتصفح.",
    },
} as const;

type Props = {
    lang?: Lang;
    tier: Tier;
    onTierChange: (tier: Tier) => void;
};

// "full" is reported to the parent only after the code is accepted, or when the cookie already exists.
// The server still checks the cookie on every full request; this component only shows the choice.
export default function AnalysisTierPicker({ lang: langProp, tier, onTierChange }: Props) {
    const { lang: ctxLang, colors } = useTheme();
    const lang: Lang = langProp ?? ctxLang;
    const isAr = lang === "ar";
    const t = TEXT[lang] ?? TEXT.en;

    const [unlocked, setUnlocked] = useState(false);
    const [showCode, setShowCode] = useState(false);
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch("/api/provider-access", { cache: "no-store" })
            .then((r) => r.json())
            .then((d) => setUnlocked(Boolean(d.unlocked)))
            .catch(() => setUnlocked(false));
    }, []);

    function selectFree() {
        setShowCode(false);
        setError("");
        onTierChange("free");
    }

    function selectFull() {
        if (unlocked) {
            setShowCode(false);
            onTierChange("full");
        } else {
            setShowCode(true);
            setError("");
        }
    }

    async function unlock(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!code.trim() || saving) return;
        setSaving(true);
        setError("");
        const res = await fetch("/api/provider-access", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: code.trim() }),
        });
        setSaving(false);
        if (!res.ok) {
            setError(t.wrong);
            return;
        }
        setUnlocked(true);
        setCode("");
        setShowCode(false);
        onTierChange("full");
    }

    const freeActive = tier === "free";
    const fullActive = tier === "full";
    const pending = showCode && !unlocked;

    const optionStyle = (active: boolean, dashed = false): CSSProperties => ({
        flex: "1 1 230px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 18,
        borderRadius: 16,
        cursor: "pointer",
        fontFamily: "inherit",
        textAlign: isAr ? "right" : "left",
        color: colors.heading,
        background: active ? colors.accentSoft : colors.card,
        border: `1.5px ${dashed ? "dashed" : "solid"} ${active || dashed ? colors.accent : colors.border}`,
        transition: "border-color 0.15s, background 0.15s",
    });

    const badgeStyle = (fg: string, bg: string): CSSProperties => ({
        alignSelf: "flex-start",
        marginTop: "auto",
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: "0.75rem",
        fontWeight: 700,
        color: fg,
        background: bg,
    });

    const headRow: CSSProperties = {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    };

    const dot = (active: boolean) => (
        <span
            aria-hidden="true"
            style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                flexShrink: 0,
                border: `2px solid ${active ? colors.accent : colors.border}`,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {active && (
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: colors.accent }} />
            )}
        </span>
    );

    return (
        <div role="radiogroup" aria-label={t.ariaLabel} dir={isAr ? "rtl" : "ltr"}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                <button
                    type="button"
                    role="radio"
                    aria-checked={freeActive}
                    onClick={selectFree}
                    style={optionStyle(freeActive)}
                >
                    <span style={headRow}>
                        <span style={{ fontWeight: 700, fontSize: "1rem" }}>{t.free}</span>
                        {dot(freeActive)}
                    </span>
                    <span style={{ fontSize: "0.85rem", color: colors.muted, lineHeight: 1.6 }}>
                        {t.freeNote}
                    </span>
                    <span style={badgeStyle(colors.low, "rgba(33,134,83,0.12)")}>{t.freeBadge}</span>
                </button>

                <button
                    type="button"
                    role="radio"
                    aria-checked={fullActive}
                    onClick={selectFull}
                    style={optionStyle(fullActive, pending)}
                >
                    <span style={headRow}>
                        <span style={{ fontWeight: 700, fontSize: "1rem" }}>{t.full}</span>
                        {dot(fullActive)}
                    </span>
                    <span style={{ fontSize: "0.85rem", color: colors.muted, lineHeight: 1.6 }}>
                        {t.fullNote}
                    </span>
                    {unlocked ? (
                        <span style={badgeStyle(colors.low, "rgba(33,134,83,0.12)")}>{t.unlockedBadge}</span>
                    ) : (
                        <span style={badgeStyle(colors.medium, "rgba(168,121,22,0.14)")}>{t.fullBadge}</span>
                    )}
                </button>
            </div>

            {pending && (
                <form
                    onSubmit={unlock}
                    style={{
                        marginTop: 14,
                        padding: 16,
                        borderRadius: 14,
                        background: colors.input,
                        border: `1px solid ${colors.border}`,
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                    }}
                >
                    <label htmlFor="access-code" style={{ fontWeight: 600, fontSize: "0.9rem", color: colors.heading }}>
                        {t.codeLabel}
                    </label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <input
                            id="access-code"
                            type="password"
                            dir="ltr"
                            autoComplete="off"
                            value={code}
                            onChange={(e) => {
                                setCode(e.target.value);
                                setError("");
                            }}
                            placeholder={t.codePlaceholder}
                            style={{
                                flex: "1 1 200px",
                                padding: "12px 14px",
                                borderRadius: 10,
                                border: `1px solid ${colors.border}`,
                                background: colors.card,
                                color: colors.heading,
                                fontSize: "1rem",
                                fontFamily: "inherit",
                                outline: "none",
                            }}
                        />
                        <button
                            type="submit"
                            disabled={saving || !code.trim()}
                            style={{
                                padding: "12px 22px",
                                borderRadius: 10,
                                border: "none",
                                background: colors.accent,
                                color: colors.onAccent,
                                fontWeight: 700,
                                fontFamily: "inherit",
                                cursor: saving ? "wait" : "pointer",
                                opacity: saving || !code.trim() ? 0.6 : 1,
                            }}
                        >
                            {saving ? t.checking : t.unlock}
                        </button>
                    </div>
                    {error && (
                        <p role="alert" style={{ margin: 0, color: colors.high, fontSize: "0.85rem" }}>
                            {error}
                        </p>
                    )}
                </form>
            )}

            {unlocked && (
                <p style={{ margin: "12px 0 0", fontSize: "0.85rem", color: colors.low }}>
                    {t.unlockedNote}
                </p>
            )}
        </div>
    );
}