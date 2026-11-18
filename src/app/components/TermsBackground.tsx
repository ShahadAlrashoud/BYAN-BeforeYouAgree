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
        "We may [sell] your information to [data brokers].",
        "We use [cookies] and trackers to follow you across other sites.",
        "Your [content] may be used to [train AI models].",
        "We are [not liable] for any damages arising from your use of the service.",
        "Subscriptions [renew automatically] until you cancel.",
        "These terms are governed by the laws of [a jurisdiction of our choosing].",
        "We may [record] your calls and messages for quality purposes.",
        "[Refunds] are not guaranteed under any circumstances.",
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
        "قد نقوم [ببيع] معلوماتك إلى [وسطاء البيانات].",
        "نستخدم [ملفات تعريف الارتباط] وأدوات التتبع لمتابعتك عبر مواقع أخرى.",
        "قد يُستخدم [محتواك] في [تدريب نماذج الذكاء الاصطناعي].",
        "نحن [غير مسؤولين] عن أي أضرار ناتجة عن استخدامك للخدمة.",
        "تتجدد الاشتراكات [تلقائيًا] حتى تقوم بإلغائها.",
        "تخضع هذه الشروط لقوانين [جهة قضائية نختارها نحن].",
        "قد نقوم [بتسجيل] مكالماتك ورسائلك لأغراض الجودة.",
        "[المبالغ المستردة] غير مضمونة في أي حال.",
    ],
};

const agreeLabel = { en: "I Agree", ar: "أوافق" };

const captionText = {
    en: "Background text: illustrative example clauses (§01–§16), not findings about real services.",
    ar: "نص الخلفية: بنود توضيحية (§01–§16) وليست نتائج عن خدمات حقيقية.",
};

// Slow-drifting checkboxes: vertical position, speed, start offset
const CHECKBOXES = [
    { top: "10%", duration: 170, delay: -30 },
    { top: "47%", duration: 210, delay: -120 },
    { top: "84%", duration: 190, delay: -60 },
];

const ROWS = 8;

export default function TermsBackground() {
    const { theme, lang, colors: themeColors } = useTheme();

    // Safe fallback: anything other than "ar" renders English
    const currentLang: "en" | "ar" = lang === "ar" ? "ar" : "en";
    const list = sentences[currentLang];
    const label = agreeLabel[currentLang];
    const isDark = theme === "dark";

    const rows = Array.from({ length: ROWS }, (_, r) => {
        const offset = r % list.length;
        const rotated = [...list.slice(offset), ...list.slice(0, offset)];
        return [...rotated, ...rotated]; // duplicated for a seamless loop
    });

    const mask = "radial-gradient(ellipse at center, transparent 20%, black 80%)";

    return (
        <>
            {/* Decorative layer: hidden from assistive tech (ticker + "I Agree" boxes) */}
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
                    @keyframes byanFloat { from { transform: translateX(-20vw); } to { transform: translateX(120vw); } }
                    @keyframes byanBox { 0%, 35% { opacity: 0.25; } 50%, 90% { opacity: 0.8; } 100% { opacity: 0.25; } }
                    @keyframes byanTick {
                        0%, 40% { stroke-dashoffset: 20; }
                        55%, 90% { stroke-dashoffset: 0; }
                        100% { stroke-dashoffset: 20; }
                    }
                    @media (prefers-reduced-motion: reduce) {
                        .byan-track, .byan-hl, .byan-float, .byan-box, .byan-tick { animation: none !important; }
                        .byan-hl { opacity: 0.5 !important; }
                        .byan-tick { stroke-dashoffset: 0 !important; }
                        .byan-float { transform: translateX(10vw) !important; }
                    }
                `}</style>

                {/* Layer 1: scrolling terms with clause numbers */}
                {rows.map((row, r) => (
                    <div key={r} style={{ whiteSpace: "nowrap", overflow: "hidden" }}>
                        <div
                            className="byan-track"
                            style={{
                                display: "inline-flex",
                                width: "max-content",
                                fontSize: "0.95rem",
                                animation: `byanDrift ${(110 + r * 18) * (list.length / 8)}s linear infinite`,
                                animationDirection: r % 2 ? "reverse" : "normal",
                            }}
                        >
                            {row.map((s, i) => {
                                // real index of this sentence in the original list
                                const n = ((r + (i % list.length)) % list.length) + 1;

                                return (
                                    <span
                                        key={i}
                                        dir={currentLang === "ar" ? "rtl" : "ltr"}
                                        style={{ unicodeBidi: "isolate", marginInline: 40 }}
                                    >
                                        {/* Faint clause number */}
                                        <span
                                            style={{
                                                color: themeColors.heading,
                                                opacity: 0.18,
                                                fontWeight: 700,
                                                fontVariantNumeric: "tabular-nums",
                                                marginInlineEnd: 10,
                                            }}
                                        >
                                            § {String(n).padStart(2, "0")}
                                        </span>

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
                                );
                            })}
                        </div>
                    </div>
                ))}

                {/* Layer 2: drifting "I Agree" checkboxes (decorative) */}
                {CHECKBOXES.map((box, b) => (
                    <div
                        key={b}
                        className="byan-float"
                        style={{
                            position: "absolute",
                            top: box.top,
                            left: 0,
                            animation: `byanFloat ${box.duration}s linear infinite`,
                            animationDelay: `${box.delay}s`,
                        }}
                    >
                        <div
                            className="byan-box"
                            dir={currentLang === "ar" ? "rtl" : "ltr"}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "6px 12px",
                                border: `1.5px solid ${themeColors.accentText}`,
                                borderRadius: 8,
                                background: themeColors.accentSoft,
                                color: themeColors.accentText,
                                fontSize: "0.85rem",
                                fontWeight: 700,
                                whiteSpace: "nowrap",
                                animation: "byanBox 12s ease-in-out infinite",
                                animationDelay: `${b * -4}s`,
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                                <rect
                                    x="1"
                                    y="1"
                                    width="16"
                                    height="16"
                                    rx="4"
                                    stroke={themeColors.accentText}
                                    strokeWidth="1.8"
                                />
                                <path
                                    className="byan-tick"
                                    d="M5 9.5l2.8 2.8L13 6.5"
                                    stroke={themeColors.accentText}
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeDasharray="20"
                                    style={{
                                        animation: "byanTick 12s ease-in-out infinite",
                                        animationDelay: `${b * -4}s`,
                                    }}
                                />
                            </svg>
                            {label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Visible, readable caption: clauses are examples, not findings */}
            <p
                dir={currentLang === "ar" ? "rtl" : "ltr"}
                style={{
                    position: "absolute",
                    left: 12,
                    right: 12,
                    bottom: 10,
                    zIndex: 2,
                    margin: 0,
                    textAlign: "center",
                    fontSize: "0.72rem",
                    lineHeight: 1.4,
                    color: isDark ? "#94a3b8" : "#64748b",
                    pointerEvents: "none",
                }}
            >
                {captionText[currentLang]}
            </p>
        </>
    );
}