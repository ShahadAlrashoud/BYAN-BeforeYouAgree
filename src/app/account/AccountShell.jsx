"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTheme } from "../providers";
import { stripArPrefix } from "@/lib/lang";
import { S } from "./strings";
import SettingsSync from "./SettingsSync";

const TABS = [
    { key: "profile", href: "/account/profile", label: "tabProfile" },
    { key: "settings", href: "/account/settings", label: "tabSettings" },
];

// The Account page frame: a title and two tabs (Profile, Settings) that are real links,
// so /account/profile and /account/settings keep their own URLs.
export default function AccountShell({ children }) {
    const { lang, theme, colors } = useTheme();
    const { status } = useSession();
    const pathname = stripArPrefix(usePathname() || "");
    const router = useRouter();
    const t = S[lang === "ar" ? "ar" : "en"];
    const isAr = lang === "ar";
    const isDark = theme === "dark";
    const tabRefs = useRef([]);

    const current = pathname.startsWith("/account/settings") ? "settings" : "profile";
    const line = isDark ? "#334155" : "#e2e8f0";

    // Arrow keys move between tabs (Home/End jump). In RTL the visual direction is reversed.
    function onKeyDown(e, index) {
        const forward = isAr ? "ArrowLeft" : "ArrowRight";
        const backward = isAr ? "ArrowRight" : "ArrowLeft";
        let next = null;
        if (e.key === forward) next = (index + 1) % TABS.length;
        else if (e.key === backward) next = (index - 1 + TABS.length) % TABS.length;
        else if (e.key === "Home") next = 0;
        else if (e.key === "End") next = TABS.length - 1;
        if (next === null) return;
        e.preventDefault();
        tabRefs.current[next]?.focus();
        router.push(TABS[next].href);
    }

    // The email-confirmation page is opened from an email, possibly while signed out: no tabs there
    if (pathname.startsWith("/account/confirm-email")) return children;

    if (status === "loading") {
        return (
            <div role="status" dir={isAr ? "rtl" : "ltr"} style={{ padding: 20 }}>
                {t.loading}
            </div>
        );
    }

    return (
        <div dir={isAr ? "rtl" : "ltr"} lang={isAr ? "ar" : "en"} style={{ maxWidth: 760, margin: "24px auto", padding: "0 16px" }}>
            <SettingsSync />
            <h1 style={{ marginBottom: 16 }}>{t.pageTitle}</h1>

            <div role="tablist" aria-label={t.tabsLabel} style={{ display: "flex", gap: 4, borderBottom: `1px solid ${line}`, marginBottom: 24 }}>
                {TABS.map((tab, i) => {
                    const active = current === tab.key;
                    return (
                        <Link
                            key={tab.key}
                            href={tab.href}
                            role="tab"
                            id={`account-tab-${tab.key}`}
                            aria-selected={active}
                            aria-controls="account-panel"
                            tabIndex={active ? 0 : -1}
                            ref={(el) => (tabRefs.current[i] = el)}
                            onKeyDown={(e) => onKeyDown(e, i)}
                            className="byan-account-tab"
                            style={{
                                padding: "10px 18px",
                                textDecoration: "none",
                                fontWeight: active ? 700 : 500,
                                color: active ? colors.accentText : "inherit",
                                borderBottom: `3px solid ${active ? colors.accent : "transparent"}`,
                                marginBottom: -1,
                            }}
                        >
                            {t[tab.label]}
                        </Link>
                    );
                })}
            </div>

            <div role="tabpanel" id="account-panel" aria-labelledby={`account-tab-${current}`}>
                {children}
            </div>
        </div>
    );
}
