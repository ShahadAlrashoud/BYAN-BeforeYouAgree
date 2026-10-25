"use client";

import { useTheme } from "../providers";

const sentences = {
    en: [
        "We may share your [data] with [third parties] for advertising purposes.",
        "You grant us a [perpetual, worldwide license] to use your content.",
        "We may [change these terms] at any time without notice.",
        "Disputes will be resolved through [binding arbitration].",
        "We [collect] information about your device, location and browsing activity.",
        "Your account may be [terminated] at our sole discretion.",
        "We retain your [personal information] for as long as necessary.",
        "By continuing, you [waive] your right to join a class action.",
    ],
    ar: [
        "قد نشارك [بياناتك] مع [أطراف ثالثة] لأغراض إعلانية.",
        "تمنحنا [ترخيصًا دائمًا وعالميًا] لاستخدام المحتوى الذي تنشره.",
        "يجوز لنا [تعديل هذه الشروط] في أي وقت دون إشعار.",
        "تُحل النزاعات عن طريق [التحكيم الملزم].",
        "نقوم بـ[جمع] معلومات عن جهازك وموقعك ونشاط التصفح.",
        "يجوز [إنهاء حسابك] وفق تقديرنا المطلق.",
        "نحتفظ بـ[معلوماتك الشخصية] طالما كان ذلك ضروريًا.",
        "بالمتابعة، [تتنازل] عن حقك في رفع دعوى جماعية.",
    ],
};

const ROWS = 6;

export default function TermsBackground() {
    const { lang, colors: themeColors } = useTheme();
    const list = sentences[lang];

    const rows = Array.from({ length: ROWS }, (_, r) => {
        const rotated = [...list.slice(r), ...list.slice(0, r)];
        return [...rotated, ...rotated]; // duplicated for a seamless loop
    });

    const mask = "radial-gradient(ellipse at center, transparent 20%, black 80%)";

    return (
        <div
            aria-hidden="true"
            dir="ltr"
            style={{
                position: "absolute",
                inset: 0,
                overflow: "hidden",
                pointerEvents: "none",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-around",
                maskImage: mask,
                WebkitMaskImage: mask,
            }}
        >
            <style>{`
                @keyframes byanDrift { from { transform: translateX(0); } to { transform: translateX(-50%); } }
                @keyframes byanGlow { 0%, 100% { opacity: 0.12; } 50% { opacity: 0.85; } }
                @media (prefers-reduced-motion: reduce) {
                    .byan-track, .byan-hl { animation: none !important; }
                    .byan-hl { opacity: 0.5 !important; }
                }
            `}</style>

            {rows.map((row, r) => (
                <div key={r} style={{ whiteSpace: "nowrap", overflow: "hidden" }}>
                    <div
                        className="byan-track"
                        style={{
                            display: "inline-flex",
                            width: "max-content",
                            fontSize: "0.95rem",
                            animation: `byanDrift ${110 + r * 18}s linear infinite`,
                            animationDirection: r % 2 ? "reverse" : "normal",
                        }}
                    >
                        {row.map((s, i) => (
                            <span
                                key={i}
                                dir={lang === "ar" ? "rtl" : "ltr"}
                                style={{ unicodeBidi: "isolate", marginInline: 40 }}
                            >
                                {s.split(/\[(.+?)\]/).map((part, k) =>
                                    k % 2 ? (
                                        <span
                                            key={k}
                                            className="byan-hl"
                                            style={{
                                                color: themeColors.accentText,
                                                background: themeColors.accentSoft,
                                                borderRadius: 4,
                                                padding: "1px 6px",
                                                fontWeight: 700,
                                                animation: "byanGlow 8s ease-in-out infinite",
                                                animationDelay: `${((r * 3 + i * 5 + k) % 8) * -1}s`,
                                            }}
                                        >
                                            {part}
                                        </span>
                                    ) : (
                                        <span key={k} style={{ color: themeColors.heading, opacity: 0.12 }}>
                                            {part}
                                        </span>
                                    )
                                )}
                            </span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}