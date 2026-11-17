"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "../providers";

const steps = {
    en: [
        { title: "Welcome to BYAN", body: "BYAN means Before You Agree. We help you understand what you're accepting before you click “I Agree”." },
        { title: "Add the document", body: "Paste the terms or privacy policy, or give us a link to it." },
        { title: "We read it for you", body: "BYAN scans the text and highlights the clauses that matter, like data sharing, auto-renewal and waived rights." },
        { title: "Decide with confidence", body: "Review the highlights in plain language, then choose whether to agree." },
    ],
    ar: [
        { title: "مرحبًا بك في BYAN", body: "BYAN تعني «قبل أن توافق». نساعدك على فهم ما تقبله قبل الضغط على «أوافق»." },
        { title: "أضف المستند", body: "الصق الشروط أو سياسة الخصوصية، أو أعطنا رابطها." },
        { title: "نقرأ نيابةً عنك", body: "يفحص BYAN النص ويبرز البنود المهمة مثل مشاركة البيانات والتجديد التلقائي والتنازل عن الحقوق." },
        { title: "قرر بثقة", body: "راجع النقاط المهمة بلغة بسيطة، ثم قرر هل توافق أم لا." },
    ],
};

const ui = {
    en: { next: "Next", back: "Back", done: "Get started", skip: "Skip", close: "Close tutorial", step: "Step", of: "of" },
    ar: { next: "التالي", back: "السابق", done: "ابدأ الآن", skip: "تخطي", close: "إغلاق الشرح", step: "الخطوة", of: "من" },
};

type Props = { open: boolean; onClose: () => void };

export default function TutorialModal({ open, onClose }: Props) {
    const { theme, lang, colors: themeColors } = useTheme();
    const [index, setIndex] = useState(0);
    const [mounted, setMounted] = useState(false);
    const dialogRef = useRef<HTMLDivElement>(null);
    const lastFocused = useRef<HTMLElement | null>(null);

    const currentLang: "en" | "ar" = lang === "ar" ? "ar" : "en";
    const list = steps[currentLang];
    const t = ui[currentLang];
    const isDark = theme === "dark";
    const isAr = currentLang === "ar";
    const isLast = index === list.length - 1;

    useEffect(() => setMounted(true), []);

    // Reset to step 1 each time it opens
    useEffect(() => {
        if (open) setIndex(0);
    }, [open]);

    // Scroll lock, focus handling, Escape, focus trap
    useEffect(() => {
        if (!open) return;

        lastFocused.current = document.activeElement as HTMLElement | null;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        dialogRef.current?.focus();

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
                return;
            }
            if (e.key === "ArrowRight") setIndex((i) => Math.min(i + (isAr ? -1 : 1), list.length - 1) < 0 ? 0 : Math.min(i + (isAr ? -1 : 1), list.length - 1));
            if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, Math.min(i + (isAr ? 1 : -1), list.length - 1)));

            if (e.key === "Tab" && dialogRef.current) {
                const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
                    'button, [href], [tabindex]:not([tabindex="-1"])'
                );
                if (focusable.length === 0) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        window.addEventListener("keydown", onKey);
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
            lastFocused.current?.focus();
        };
    }, [open, onClose, isAr, list.length]);

    if (!mounted || !open) return null;

    const step = list[index];

    const ghostBtn = {
        border: "none",
        background: "transparent",
        color: isDark ? "#94a3b8" : "#64748b",
        cursor: "pointer",
        fontSize: "0.9rem",
        fontWeight: 600,
        padding: "8px 12px",
        borderRadius: 8,
    } as const;

    return createPortal(
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
                background: "rgba(2, 6, 23, 0.6)",
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
                animation: "byanFade 200ms ease",
            }}
        >
            <style>{`
                @keyframes byanFade { from { opacity: 0; } to { opacity: 1; } }
                @keyframes byanPop { from { opacity: 0; transform: translateY(12px) scale(0.97); } to { opacity: 1; transform: none; } }
                @media (prefers-reduced-motion: reduce) {
                    .byan-modal, .byan-modal-bg { animation: none !important; }
                }
            `}</style>

            <div
                ref={dialogRef}
                className="byan-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="byan-tutorial-title"
                tabIndex={-1}
                dir={isAr ? "rtl" : "ltr"}
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: 440,
                    background: isDark ? "#0f172a" : "#ffffff",
                    color: isDark ? "#f1f5f9" : "#1e293b",
                    border: `1px solid ${isDark ? "#1e293b" : "#e2e8f0"}`,
                    borderRadius: 16,
                    padding: "28px 24px 20px",
                    boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
                    outline: "none",
                    animation: "byanPop 260ms cubic-bezier(0.4,0,0.2,1)",
                }}
            >
                {/* Close */}
                <button
                    type="button"
                    onClick={onClose}
                    aria-label={t.close}
                    style={{
                        ...ghostBtn,
                        position: "absolute",
                        top: 12,
                        insetInlineEnd: 12,
                        padding: 6,
                        lineHeight: 0,
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                        <line x1="5" y1="5" x2="19" y2="19" />
                        <line x1="19" y1="5" x2="5" y2="19" />
                    </svg>
                </button>

                {/* Step badge */}
                <div
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: themeColors.accentSoft,
                        color: themeColors.accentText,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "1.1rem",
                        marginBottom: 16,
                    }}
                >
                    {index + 1}
                </div>

                {/* Content (aria-live so screen readers hear step changes) */}
                <div aria-live="polite">
                    <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 600, opacity: 0.6 }}>
                        {t.step} {index + 1} {t.of} {list.length}
                    </p>
                    <h2 id="byan-tutorial-title" style={{ margin: "4px 0 10px", fontSize: "1.3rem", fontWeight: 800 }}>
                        {step.title}
                    </h2>
                    <p style={{ margin: 0, lineHeight: 1.65, fontSize: "0.97rem", opacity: 0.85, minHeight: 78 }}>
                        {step.body}
                    </p>
                </div>

                {/* Progress dots */}
                <div style={{ display: "flex", gap: 6, justifyContent: "center", margin: "18px 0" }}>
                    {list.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setIndex(i)}
                            aria-label={`${t.step} ${i + 1}`}
                            aria-current={i === index ? "step" : undefined}
                            style={{
                                width: i === index ? 22 : 8,
                                height: 8,
                                borderRadius: 999,
                                border: "none",
                                padding: 0,
                                cursor: "pointer",
                                background: i === index ? themeColors.accent : isDark ? "#334155" : "#cbd5e1",
                                transition: "width 200ms ease, background 200ms ease",
                            }}
                        />
                    ))}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    {isLast ? (
                        <span />
                    ) : (
                        <button type="button" onClick={onClose} style={ghostBtn}>
                            {t.skip}
                        </button>
                    )}

                    <div style={{ display: "flex", gap: 8 }}>
                        {index > 0 && (
                            <button type="button" onClick={() => setIndex((i) => i - 1)} style={ghostBtn}>
                                {t.back}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => (isLast ? onClose() : setIndex((i) => i + 1))}
                            style={{
                                border: "none",
                                background: themeColors.accent,
                                color: themeColors.onAccent,
                                cursor: "pointer",
                                fontSize: "0.9rem",
                                fontWeight: 700,
                                padding: "9px 18px",
                                borderRadius: 10,
                            }}
                        >
                            {isLast ? t.done : t.next}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}