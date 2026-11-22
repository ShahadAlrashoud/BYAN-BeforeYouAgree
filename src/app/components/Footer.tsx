"use client";

import Link from "@/app/components/LocalizedLink";
import { usePathname } from "next/navigation";
import { useTheme } from "../providers";
import BYANLogo from "./BYANLogo";
import FontSizeControl from "./FontSizeControl";
import { stripArPrefix } from "@/lib/lang";
import { ACCOUNT_V2 } from "@/lib/flags";

const content = {
    en: {
        description: "Plain-language analysis of Terms of Service and Privacy Policies, grounded in Saudi Arabia's PDPL.",
        product: "Product",
        company: "Company",
        legal: "Legal",
        analyze: "Analyze",
        compare: "Compare",
        howItWorks: "How It Works",
        glossary: "Glossary", // NEW
        analyzedSites: "Analyzed websites", // shown only when POPULAR_PAGE is on
        report: "Report an incorrect result",
        about: "About",
        contact: "Contact",
        faq: "FAQ",
        privacy: "Privacy Policy",
        terms: "Terms of Use",
        disclaimerLink: "Disclaimer",
        disclaimer: "BYAN provides automated, informational analysis and does not constitute legal advice. Always review the original documents for important decisions.",
        rights: "All rights reserved.",
        language: "Language",
    },
    ar: {
        description: "تحليل مبسّط لشروط الخدمة وسياسات الخصوصية، مستند إلى نظام حماية البيانات الشخصية السعودي (PDPL).",
        product: "المنتج",
        company: "الشركة",
        legal: "قانوني",
        analyze: "تحليل",
        compare: "مقارنة",
        howItWorks: "كيف يعمل",
        glossary: "المصطلحات", // NEW
        analyzedSites: "المواقع المحللة", // [AR review pending] shown only when POPULAR_PAGE is on
        report: "الإبلاغ عن نتيجة غير صحيحة",
        about: "من نحن",
        contact: "تواصل معنا",
        faq: "الأسئلة الشائعة",
        privacy: "سياسة الخصوصية",
        terms: "شروط الاستخدام",
        disclaimerLink: "إخلاء المسؤولية",
        disclaimer: "يقدّم بيان تحليلًا آليًا لأغراض معلوماتية فقط، ولا يُعد استشارة قانونية. يُرجى مراجعة المستندات الأصلية عند اتخاذ القرارات المهمة.",
        rights: "جميع الحقوق محفوظة.",
        language: "اللغة",
    },
};

type FooterKey = keyof typeof content.en;

const sections: { title: FooterKey; links: { key: FooterKey; href: string }[] }[] = [
    {
        title: "product",
        links: [
            { key: "analyze", href: "/" },
            { key: "compare", href: "/compare" },
            { key: "howItWorks", href: "/how-it-works" },
            { key: "glossary", href: "/glossary" }, // NEW
            { key: "report", href: "/contact?topic=incorrect-result" },
        ],
    },
    {
        title: "company",
        links: [
            { key: "about", href: "/about" },
            { key: "contact", href: "/contact" },
            { key: "faq", href: "/faq" },
        ],
    },
    {
        title: "legal",
        links: [
            { key: "privacy", href: "/privacy" },
            { key: "terms", href: "/terms" },
            { key: "disclaimerLink", href: "/disclaimer" },
        ],
    },
];

// showPopular comes from the server layout (POPULAR_PAGE flag, read per request). Default: no link.
export default function Footer({ showPopular = false }: { showPopular?: boolean }) {
    const { theme, lang, setLang, colors } = useTheme();
    const pathname = usePathname();
    const isDark = theme === "dark";
    const isAr = lang === "ar";
    const t = content[isAr ? "ar" : "en"];

    const muted = isDark ? "#94a3b8" : "#64748b";
    const heading = isDark ? "#f1f1f1" : "#1e293b";
    const line = isDark ? "#1e293b" : "#e2e8f0";

    const linkStyle = {
        color: muted,
        textDecoration: "none",
        fontSize: "0.88rem",
    };

    const colTitle = {
        margin: "0 0 12px",
        fontSize: "0.8rem",
        fontWeight: 700,
        color: colors.accentText,
        letterSpacing: isAr ? 0 : "0.1em",
        textTransform: "uppercase" as const,
    };

    const colList = {
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column" as const,
        gap: 10,
    };

    // Already on the homepage: scroll to top and focus the input (if it has id="analyze-input")
    function handleLinkClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
        if (href === "/" && stripArPrefix(pathname || "/") === "/") {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
            setTimeout(() => document.getElementById("analyze-input")?.focus(), 400);
        }
    }

    return (
        <footer
            dir={isAr ? "rtl" : "ltr"}
            style={{
                borderTop: `1px solid ${line}`,
                padding: "48px 24px 72px", // extra bottom space so the floating Help button never covers footer text
                marginTop: 48,
                background: isDark ? "#0a0e1a" : "#ffffff",
                color: muted,
            }}
        >
            <div
                style={{
                    maxWidth: 1000,
                    margin: "0 auto",
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    gap: 40,
                }}
            >
                {/* Brand */}
                <div style={{ flex: "1 1 280px", maxWidth: 380 }}>
                    <BYANLogo isDark={isDark} />
                    <p style={{ margin: "14px 0 16px", fontSize: "0.85rem", lineHeight: 1.7 }}>
                        {t.description}
                    </p>

                    {/* Language toggle. With Account v2 on it is removed: the header control and Settings are the only places */}
                    {!ACCOUNT_V2 && (
                    <div
                        role="group"
                        aria-label={t.language}
                        style={{
                            display: "inline-flex",
                            border: `1px solid ${line}`,
                            borderRadius: 999,
                            padding: 2,
                        }}
                    >
                        {(
                            [
                                { code: "en", label: "English" },
                                { code: "ar", label: "العربية" },
                            ] as const
                        ).map(({ code, label }) => {
                            const active = lang === code;
                            return (
                                <button
                                    key={code}
                                    type="button"
                                    lang={code}
                                    onClick={() => setLang(code)}
                                    aria-pressed={active}
                                    style={{
                                        border: "none",
                                        borderRadius: 999,
                                        padding: "5px 14px",
                                        fontSize: "0.8rem",
                                        fontWeight: active ? 700 : 600,
                                        cursor: "pointer",
                                        background: active ? colors.accent : "transparent",
                                        color: active ? colors.onAccent : muted,
                                        textDecoration: active ? "none" : "underline",
                                    }}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                    )}

                    {/* Text size control (A−, A, A+), moved here from the header */}
                    <div style={{ marginTop: 14, color: muted }}>
                        <FontSizeControl />
                    </div>
                </div>

                {/* Links */}
                <div style={{ display: "flex", gap: 56, flexWrap: "wrap" }}>
                    {sections.map((section) => (
                        <nav key={section.title} aria-label={t[section.title]}>
                            <h2 style={colTitle}>{t[section.title]}</h2>
                            <ul style={colList}>
                                {(showPopular && section.title === "product"
                                    ? [...section.links, { key: "analyzedSites" as FooterKey, href: "/popular" }]
                                    : section.links
                                ).map((link) => (
                                    <li key={link.key}>
                                        <Link
                                            href={link.href}
                                            onClick={(e) => handleLinkClick(e, link.href)}
                                            style={linkStyle}
                                        >
                                            {t[link.key]}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}
                </div>
            </div>

            {/* Bottom bar */}
            <div
                style={{
                    maxWidth: 1000,
                    margin: "36px auto 0",
                    paddingTop: 20,
                    borderTop: `1px solid ${line}`,
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    fontSize: "0.8rem",
                }}
            >
                <p style={{ margin: 0, maxWidth: 640, lineHeight: 1.6 }}>{t.disclaimer}</p>
                <p style={{ margin: 0 }}>
                    © {new Date().getFullYear()} BYAN. {t.rights}
                </p>
            </div>
        </footer>
    );
}