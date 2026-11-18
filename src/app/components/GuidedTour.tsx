"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "../providers";

const STEPS = [
 {
    target: "tabs",
    en: { title: "Choose how to analyze", body: "Paste a website link, or switch to Upload Files if you have images of the policy." },
    ar: { title: "اختر طريقة التحليل", body: "الصق رابط موقع، أو انتقل إلى رفع ملفات إذا كانت لديك ملفات للسياسة." },
},
    {
        target: "form",
        en: { title: "Paste the link and analyze", body: "Enter a website address, then press Analyze. We find its Terms and Privacy Policy and read them for you." },
        ar: { title: "الصق الرابط وابدأ التحليل", body: "أدخل عنوان الموقع ثم اضغط تحليل. نجد شروط الخدمة وسياسة الخصوصية ونقرأها نيابةً عنك." },
    },
    {
        target: "chips",
        en: { title: "What you'll get", body: "A 0–100 risk score in plain language, in Arabic or English." },
        ar: { title: "ماذا ستحصل عليه", body: "درجة مخاطر من 0 إلى 100 بلغة بسيطة، بالعربية أو الإنجليزية." },
    },
    {
        target: "how",
        en: { title: "How it works", body: "Three steps: enter a URL, we read the fine print, you get your score." },
        ar: { title: "كيف يعمل", body: "ثلاث خطوات: أدخل الرابط، نقرأ التفاصيل الدقيقة، وتحصل على درجتك." },
    },
    {
        target: "legend",
        en: { title: "Read the risk levels", body: "Every policy lands in one of three levels: Safe, Medium Risk or High Risk." },
        ar: { title: "افهم مستويات الخطر", body: "تُصنَّف كل سياسة ضمن ثلاثة مستويات: آمن أو خطر متوسط أو خطر مرتفع." },
    },
];

const ui = {
    en: { next: "Next", back: "Back", done: "Finish", skip: "Skip tour", of: "of" },
    ar: { next: "التالي", back: "السابق", done: "إنهاء", skip: "تخطي الجولة", of: "من" },
};

type Props = { open: boolean; onClose: () => void };
type Rect = { top: number; left: number; width: number; height: number };

const PAD = 8;
const TIP_H = 190;

export default function GuidedTour({ open, onClose }: Props) {
    const { theme, lang, colors: themeColors } = useTheme();
    const isAr = lang === "ar";
    const L: "en" | "ar" = isAr ? "ar" : "en";
    const t = ui[L];
    const isDark = theme === "dark";

    const [mounted, setMounted] = useState(false);
    const [list, setList] = useState<typeof STEPS>([]);
    const [index, setIndex] = useState(0);
    const [rect, setRect] = useState<Rect | null>(null);
    const [vp, setVp] = useState({ w: 0, h: 0 });
    const tipRef = useRef<HTMLDivElement>(null);

    useEffect(() => setMounted(true), []);

    // Build the list from targets that exist on this page right now
    useEffect(() => {
        if (!open) return;
        const found = STEPS.filter((s) => document.querySelector(`[data-tour="${s.target}"]`));
        setList(found);
        setIndex(0);
        if (found.length === 0) onClose();
    }, [open, onClose]);

    const step = list[index];
    const isLast = index === list.length - 1;

    // Scroll to the target and keep its rectangle updated
    useEffect(() => {
        if (!open || !step) return;
        const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
        if (!el) return;

        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        el.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });

        const update = () => {
            const r = el.getBoundingClientRect();
            setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
            setVp({ w: window.innerWidth, h: window.innerHeight });
        };

        update();
        const timer = setTimeout(update, 450); // after smooth scroll settles
        window.addEventListener("scroll", update, true);
        window.addEventListener("resize", update);
        tipRef.current?.focus();

        return () => {
            clearTimeout(timer);
            window.removeEventListener("scroll", update, true);
            window.removeEventListener("resize", update);
        };
    }, [open, step]);

    // Keyboard
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            const fwd = isAr ? "ArrowLeft" : "ArrowRight";
            const bck = isAr ? "ArrowRight" : "ArrowLeft";
            if (e.key === fwd) setIndex((i) => Math.min(i + 1, list.length - 1));
            if (e.key === bck) setIndex((i) => Math.max(i - 1, 0));
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, isAr, list.length, onClose]);

    if (!mounted || !open || !step || !rect) return null;

    const text = step[L];
    const tipW = Math.min(340, vp.w - 24);

    // Spotlight box, clamped to the viewport
    const sTop = Math.max(rect.top - PAD, 4);
    const sBottom = Math.min(rect.top + rect.height + PAD, vp.h - 4);
    const spot = {
        top: sTop,
        left: Math.max(rect.left - PAD, 4),
        width: Math.min(rect.width + PAD * 2, vp.w - 8),
        height: Math.max(sBottom - sTop, 20),
    };

    // Tooltip: below, else above, else pinned to the bottom of the screen
    let tipTop: number;
    if (vp.h - sBottom >= TIP_H + 16) tipTop = sBottom + 12;
    else if (sTop >= TIP_H + 16) tipTop = sTop - TIP_H - 12;
    else tipTop = vp.h - TIP_H - 16;

    const tipLeft = Math.min(
        Math.max(12, spot.left + spot.width / 2 - tipW / 2),
        vp.w - tipW - 12
    );

    const ghost = {
        border: "none",
        background: "transparent",
        color: isDark ? "#94a3b8" : "#64748b",
        cursor: "pointer",
        fontSize: "0.88rem",
        fontWeight: 600,
        padding: "8px 10px",
        borderRadius: 8,
    } as const;

    return createPortal(
        <>
            <style>{`
                @media (prefers-reduced-motion: reduce) {
                    .byan-spot, .byan-tip { transition: none !important; }
                }
            `}</style>

            {/* Click blocker */}
            <div style={{ position: "fixed", inset: 0, zIndex: 100 }} onClick={onClose} />

            {/* Spotlight */}
            <div
                className="byan-spot"
                aria-hidden="true"
                style={{
                    position: "fixed",
                    zIndex: 101,
                    pointerEvents: "none",
                    borderRadius: 16,
                    top: spot.top,
                    left: spot.left,
                    width: spot.width,
                    height: spot.height,
                    boxShadow: `0 0 0 9999px rgba(2, 6, 23, 0.68), 0 0 0 2px ${themeColors.accent}`,
                    transition: "all 300ms cubic-bezier(0.4,0,0.2,1)",
                }}
            />

            {/* Tooltip */}
            <div
                ref={tipRef}
                className="byan-tip"
                role="dialog"
                aria-modal="true"
                aria-label={text.title}
                tabIndex={-1}
                dir={isAr ? "rtl" : "ltr"}
                style={{
                    position: "fixed",
                    zIndex: 102,
                    top: tipTop,
                    left: tipLeft,
                    width: tipW,
                    boxSizing: "border-box",
                    padding: "16px 18px 12px",
                    borderRadius: 14,
                    outline: "none",
                    background: isDark ? "#0f172a" : "#ffffff",
                    color: isDark ? "#f1f5f9" : "#1e293b",
                    border: `1px solid ${isDark ? "#1e293b" : "#e2e8f0"}`,
                    boxShadow: "0 18px 50px rgba(0,0,0,0.4)",
                    transition: "top 300ms ease, left 300ms ease",
                }}
            >
                <p style={{ margin: 0, fontSize: "0.72rem", fontWeight: 700, opacity: 0.6 }}>
                    {index + 1} {t.of} {list.length}
                </p>
                <h3 style={{ margin: "4px 0 6px", fontSize: "1.05rem", fontWeight: 800 }}>{text.title}</h3>
                <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.6, opacity: 0.85 }}>{text.body}</p>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
                    {isLast ? (
                        <span />
                    ) : (
                        <button type="button" onClick={onClose} style={ghost}>
                            {t.skip}
                        </button>
                    )}
                    <div style={{ display: "flex", gap: 6 }}>
                        {index > 0 && (
                            <button type="button" onClick={() => setIndex((i) => i - 1)} style={ghost}>
                                {t.back}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => (isLast ? onClose() : setIndex((i) => i + 1))}
                            style={{
                                border: "none",
                                borderRadius: 10,
                                padding: "8px 16px",
                                background: themeColors.accent,
                                color: themeColors.onAccent,
                                fontWeight: 700,
                                fontSize: "0.88rem",
                                cursor: "pointer",
                            }}
                        >
                            {isLast ? t.done : t.next}
                        </button>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}