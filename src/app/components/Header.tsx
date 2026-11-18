"use client";

import {
    useEffect,
    useRef,
    useState,
    type CSSProperties,
    type MouseEvent,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "../providers";
import BYANLogo from "./BYANLogo";
import UserMenu from "./UserMenu";
import TutorialModal from "./TutorialModal";
import FontSizeControl from "./FontSizeControl"; // NEW

/* ---------- Icons ---------- */

function MoonIcon({ color }: { color: string }) {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
        </svg>
    );
}

function SunIcon({ color }: { color: string }) {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
    );
}

function MenuIcon({ color, open }: { color: string; open: boolean }) {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
        >
            {open ? (
                <>
                    <line x1="5" y1="5" x2="19" y2="19" />
                    <line x1="19" y1="5" x2="5" y2="19" />
                </>
            ) : (
                <>
                    <line x1="4" y1="7" x2="20" y2="7" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="17" x2="20" y2="17" />
                </>
            )}
        </svg>
    );
}

/* ---------- Content ---------- */

const content = {
    en: {
        home: "Home",
        howItWorks: "How It Works",
        glossary: "Glossary", // NEW
        about: "About",
        toggleTheme: "Toggle theme",
        language: "Language",
        openMenu: "Open menu",
        closeMenu: "Close menu",
        mainNav: "Main navigation",
        help: "Help",
        helpTitle: "How to use BYAN",
    },
    ar: {
        home: "الرئيسية",
        howItWorks: "كيف يعمل",
        glossary: "المصطلحات", // NEW
        about: "من نحن",
        toggleTheme: "تبديل المظهر",
        language: "اللغة",
        openMenu: "فتح القائمة",
        closeMenu: "إغلاق القائمة",
        mainNav: "التنقل الرئيسي",
        help: "مساعدة",
        helpTitle: "كيفية استخدام بيان",
    },
};

/* ---------- Navigation ---------- */

const navItems = [
    { href: "/", key: "home" },
    { href: "/how-it-works", key: "howItWorks" },
    { href: "/glossary", key: "glossary" }, // NEW
    { href: "/about", key: "about" },
] as const;

/* ---------- Hooks ---------- */

function useIsMobile(breakpoint = 768) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
        const update = () => setIsMobile(mq.matches);

        update();
        mq.addEventListener("change", update);

        return () => mq.removeEventListener("change", update);
    }, [breakpoint]);

    return isMobile;
}

/* ---------- Component ---------- */

export default function Header() {
    const { theme, toggleTheme, lang, setLang, colors: themeColors } = useTheme();
    const pathname = usePathname();

    const isMobile = useIsMobile();
    const [menuOpen, setMenuOpen] = useState(false);

    // Logo state
    const [logoFocused, setLogoFocused] = useState(false);
    const [logoTapped, setLogoTapped] = useState(false);
    const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Tutorial state
    const [tutorialOpen, setTutorialOpen] = useState(false);

    const isDark = theme === "dark";
    const isAr = lang === "ar";
    const t = content[isAr ? "ar" : "en"];

    // Header-specific tokens, driven by the shared theme colors
    const c = {
        accent: themeColors.accent,
        accentText: themeColors.accentText,
        onAccent: themeColors.onAccent,
        border: isDark ? "#1e293b" : "#e2e8f0",
        bg: isDark ? "rgba(15, 23, 42, 0.8)" : "rgba(255, 255, 255, 0.8)",
        mobileBg: isDark ? "#0f172a" : "#ffffff",
        link: isDark ? "#dbe4f0" : "#334155",
        langBorder: isDark ? "#334155" : "#e2e8f0",
        langText: isDark ? "#94a3b8" : "#64748b",
    };

    /* Mobile: first tap opens the badge, second tap (within 2.5s) navigates home */
    const handleLogoClick = (e: MouseEvent) => {
        if (!isMobile || logoTapped) return;

        e.preventDefault();
        setLogoTapped(true);

        if (tapTimer.current) clearTimeout(tapTimer.current);
        tapTimer.current = setTimeout(() => setLogoTapped(false), 2500);
    };

    /* Clean up the tap timer on unmount */
    useEffect(() => {
        return () => {
            if (tapTimer.current) clearTimeout(tapTimer.current);
        };
    }, []);

    /* Collapse the logo badge after navigating */
    useEffect(() => {
        setLogoTapped(false);
    }, [pathname]);

    /* Auto-open the tutorial once for first-time visitors */
    useEffect(() => {
        try {
            if (!localStorage.getItem("byan-tutorial-seen")) {
                setTutorialOpen(true);
            }
        } catch {}
    }, []);

    const closeTutorial = () => {
        setTutorialOpen(false);
        try {
            localStorage.setItem("byan-tutorial-seen", "1");
        } catch {}
    };

    /* Close mobile menu on navigation */
    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    /* Close mobile menu when switching to desktop */
    useEffect(() => {
        if (!isMobile) {
            setMenuOpen(false);
        }
    }, [isMobile]);

    /* Close mobile menu with Escape */
    useEffect(() => {
        if (!menuOpen) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setMenuOpen(false);
            }
        };

        window.addEventListener("keydown", onKey);

        return () => window.removeEventListener("keydown", onKey);
    }, [menuOpen]);

    /* Active navigation item */
    const isActive = (href: string) =>
        href === "/"
            ? pathname === "/"
            : pathname === href || pathname?.startsWith(href + "/");

    /* Desktop navigation link */
    const navLinkStyle = (href: string): CSSProperties => ({
        color: isActive(href) ? c.accentText : c.link,
        textDecoration: "none",
        fontSize: "0.9rem",
        fontWeight: isActive(href) ? 700 : 500,
        paddingBottom: 4,
        borderBottom: isActive(href)
            ? `2px solid ${c.accent}`
            : "2px solid transparent",
        transition: "border-color 0.2s ease, color 0.2s ease",
    });

    /* Mobile navigation link */
    const mobileLinkStyle = (href: string): CSSProperties => ({
        color: isActive(href) ? c.accentText : c.link,
        textDecoration: "none",
        fontSize: "1rem",
        fontWeight: isActive(href) ? 700 : 500,
        padding: "12px 4px",
        borderBottom: `1px solid ${c.border}`,
    });

    /* Compact language switch, with readable text labels */
    const langToggle = (
        <div
            role="group"
            aria-label={t.language}
            style={{
                display: "flex",
                alignItems: "center",
                border: `1px solid ${c.langBorder}`,
                borderRadius: 999,
                padding: 2,
                background: isDark
                    ? "rgba(30, 41, 59, 0.55)"
                    : "rgba(248, 250, 252, 0.9)",
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
                            background: active ? c.accent : "transparent",
                            color: active ? c.onAccent : c.langText,
                            borderRadius: 999,
                            padding: "4px 10px",
                            fontSize: "0.78rem",
                            fontWeight: active ? 700 : 600,
                            cursor: "pointer",
                            lineHeight: 1.3,
                            textDecoration: active ? "none" : "underline",
                            transition: "background-color 0.2s ease, color 0.2s ease",
                        }}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );

    /* Theme toggle */
    const themeToggle = (
        <button
            type="button"
            onClick={toggleTheme}
            style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                padding: 4,
            }}
            aria-label={t.toggleTheme}
            title={t.toggleTheme}
        >
            {isDark ? (
                <SunIcon color={c.accent} />
            ) : (
                <MoonIcon color={c.accent} />
            )}
        </button>
    );

    /* NEW: text-size controls, colored to match the header */
    const fontControl = (
        <div style={{ color: c.link }}>
            <FontSizeControl />
        </div>
    );

    /* Help button (reopens the tutorial), with a visible text label */
    const helpButton = (
        <button
            type="button"
            onClick={() => setTutorialOpen(true)}
            aria-haspopup="dialog"
            title={t.helpTitle}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                height: 30,
                padding: "0 12px 0 6px",
                borderRadius: 999,
                border: `1.5px solid ${c.accent}`,
                background: "transparent",
                color: c.accentText,
                fontWeight: 700,
                fontSize: "0.8rem",
                cursor: "pointer",
                lineHeight: 1,
            }}
        >
            <span
                aria-hidden="true"
                style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: c.accent,
                    color: c.onAccent,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                }}
            >
                ?
            </span>
            {t.help}
        </button>
    );

    return (
        <header
            dir={isAr ? "rtl" : "ltr"}
            style={{
                position: "sticky",
                top: 0,
                zIndex: 50,
                background: c.bg,
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                borderBottom: `1px solid ${c.border}`,
            }}
        >
            {/* Main bar */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr auto" : "1fr auto 1fr",
                    alignItems: "center",
                    padding: isMobile ? "12px 16px" : "14px 24px",
                }}
            >
                {/* Logo */}
                <div dir="ltr" style={{ justifySelf: "start" }}>
                    <Link
                        href="/"
                        aria-label="BYAN — Before You Agree"
                        onClick={handleLogoClick}
                        onFocus={() => setLogoFocused(true)}
                        onBlur={() => setLogoFocused(false)}
                        style={{
                            display: "inline-flex",
                            unicodeBidi: "bidi-override",
                        }}
                    >
                        <BYANLogo
                            isDark={isDark}
                            size="sm"
                            focused={logoFocused || logoTapped}
                        />
                    </Link>
                </div>

                {/* Desktop navigation */}
                {!isMobile && (
                    <nav
                        aria-label={t.mainNav}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 30,
                            justifySelf: "center",
                        }}
                    >
                        {navItems.map(({ href, key }) => (
                            <Link
                                key={href}
                                href={href}
                                style={navLinkStyle(href)}
                                aria-current={isActive(href) ? "page" : undefined}
                            >
                                {t[key]}
                            </Link>
                        ))}
                    </nav>
                )}

                {/* Right cluster */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: isMobile ? 10 : 12,
                        justifySelf: "end",
                    }}
                >
                    {!isMobile && (
                        <>
                            {langToggle}
                            {fontControl}
                            {themeToggle}
                            {helpButton}
                        </>
                    )}

                    <UserMenu />

                    {isMobile && (
                        <button
                            type="button"
                            onClick={() => setMenuOpen((o) => !o)}
                            style={{
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                                lineHeight: 1,
                                display: "flex",
                                alignItems: "center",
                                padding: 4,
                            }}
                            aria-label={menuOpen ? t.closeMenu : t.openMenu}
                            aria-expanded={menuOpen}
                            aria-controls="mobile-menu"
                        >
                            <MenuIcon color={c.accent} open={menuOpen} />
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile menu */}
            {isMobile && menuOpen && (
                <div
                    id="mobile-menu"
                    style={{
                        background: c.mobileBg,
                        borderTop: `1px solid ${c.border}`,
                        padding: "8px 16px 16px",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <nav
                        aria-label={t.mainNav}
                        style={{ display: "flex", flexDirection: "column" }}
                    >
                        {navItems.map(({ href, key }) => (
                            <Link
                                key={href}
                                href={href}
                                style={mobileLinkStyle(href)}
                                aria-current={isActive(href) ? "page" : undefined}
                            >
                                {t[key]}
                            </Link>
                        ))}
                    </nav>

                    {/* Mobile controls */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: 10,
                            padding: "14px 4px",
                        }}
                    >
                        {langToggle}
                        {fontControl}
                        {themeToggle}
                        {helpButton}
                    </div>
                </div>
            )}

            {/* Tutorial popup */}
            <TutorialModal open={tutorialOpen} onClose={closeTutorial} />
        </header>
    );
}