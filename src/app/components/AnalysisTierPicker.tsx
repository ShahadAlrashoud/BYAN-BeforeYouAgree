"use client";

import { useEffect, useState, type FormEvent } from "react";

export type Tier = "free" | "full";
type Lang = "en" | "ar";

// [AR review pending] every Arabic string in this file must be approved by a native speaker.
const TEXT = {
    en: {
        title: "Choose analysis type",
        free: "Free analysis",
        freeNote: "The first 12,000 characters of the policy.",
        full: "Full analysis",
        fullNote: "The whole policy. Requires an access code.",
        codePlaceholder: "Access code",
        unlock: "Unlock",
        wrong: "Invalid code.",
        unlocked: "Full analysis is unlocked.",
    },
    ar: {
        title: "اختر نوع التحليل",
        free: "تحليل مجاني",
        freeNote: "أول 12,000 حرف من السياسة.",
        full: "تحليل كامل",
        fullNote: "السياسة كاملة. يحتاج رمز وصول.",
        codePlaceholder: "رمز الوصول",
        unlock: "تفعيل",
        wrong: "الرمز غير صحيح.",
        unlocked: "التحليل الكامل مفعّل.",
    },
} as const;

type Props = {
    lang: Lang;
    tier: Tier;
    onTierChange: (tier: Tier) => void;
};

// "full" is reported to the parent only after the code is accepted, or when the cookie already exists.
// The server still checks the cookie on every full request; this component only shows the choice.
export default function AnalysisTierPicker({ lang, tier, onTierChange }: Props) {
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

    function chooseFull() {
        if (unlocked) {
            setShowCode(false);
            onTierChange("full");
        } else {
            setShowCode(true);
        }
    }

    async function unlock(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSaving(true);
        setError("");
        const res = await fetch("/api/provider-access", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
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

    return (
        <div dir={lang === "ar" ? "rtl" : "ltr"} className="space-y-3">
            <p className="font-semibold">{t.title}</p>

            <label className="flex cursor-pointer gap-3 rounded-lg border p-3">
                <input
                    type="radio"
                    name="analysis-tier"
                    checked={tier === "free"}
                    onChange={() => {
                        setShowCode(false);
                        onTierChange("free");
                    }}
                />
                <span>
                    <span className="block font-medium">{t.free}</span>
                    <span className="block text-sm text-gray-500">{t.freeNote}</span>
                </span>
            </label>

            <label className="flex cursor-pointer gap-3 rounded-lg border p-3">
                <input
                    type="radio"
                    name="analysis-tier"
                    checked={tier === "full"}
                    onChange={chooseFull}
                />
                <span>
                    <span className="block font-medium">{t.full}</span>
                    <span className="block text-sm text-gray-500">{t.fullNote}</span>
                </span>
            </label>

            {showCode && !unlocked && (
                <form onSubmit={unlock} className="flex gap-2">
                    <input
                        type="password"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder={t.codePlaceholder}
                        autoComplete="off"
                        className="flex-1 rounded border p-2"
                    />
                    <button
                        type="submit"
                        disabled={saving || !code}
                        className="rounded bg-black px-4 text-white disabled:opacity-50"
                    >
                        {t.unlock}
                    </button>
                </form>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}
            {unlocked && <p className="text-sm text-green-700">{t.unlocked}</p>}
        </div>
    );
}