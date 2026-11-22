"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "../providers";
import { S } from "../account/strings";

// Account v2 avatar menu (replaces UserMenu when the feature flag is on).
// A menu button with Account and Sign out. Keyboard: Enter/Space/ArrowDown open it, ArrowUp/Down and
// Home/End move between items, Escape closes it and returns focus to the avatar, Tab closes it.
export default function AccountMenu() {
    const { data: session, status } = useSession();
    const { lang, theme, colors } = useTheme();
    const router = useRouter();
    const t = S[lang === "ar" ? "ar" : "en"];
    const isAr = lang === "ar";
    const isDark = theme === "dark";

    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);
    const buttonRef = useRef(null);
    const itemRefs = useRef([]);

    // Close on an outside click
    useEffect(() => {
        function onDown(e) {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, []);

    // Focus the first item when the menu opens
    useEffect(() => {
        if (open) itemRefs.current[0]?.focus();
    }, [open]);

    if (status === "loading" || !session?.user) return null;

    // The display name wins; otherwise fall back to the username, then the email
    const name = session.user.displayName || session.user.username || "";
    const initial = (name || session.user.email || "U")[0].toUpperCase();

    function close(returnFocus) {
        setOpen(false);
        if (returnFocus) buttonRef.current?.focus();
    }

    function onButtonKey(e) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            setOpen(true);
        }
    }

    function onMenuKey(e) {
        const items = itemRefs.current.filter(Boolean);
        const i = items.indexOf(document.activeElement);
        if (e.key === "ArrowDown") { e.preventDefault(); items[(i + 1) % items.length]?.focus(); }
        else if (e.key === "ArrowUp") { e.preventDefault(); items[(i - 1 + items.length) % items.length]?.focus(); }
        else if (e.key === "Home") { e.preventDefault(); items[0]?.focus(); }
        else if (e.key === "End") { e.preventDefault(); items[items.length - 1]?.focus(); }
        else if (e.key === "Escape") { e.preventDefault(); close(true); }
        else if (e.key === "Tab") close(false);
    }

    const bg = isDark ? "#111827" : "#ffffff";
    const border = isDark ? "#374151" : "#e2e8f0";
    const color = isDark ? "#f3f4f6" : "#111827";
    const item = { display: "block", width: "100%", padding: "10px 12px", borderRadius: 8, border: "none", background: "transparent", color, textAlign: isAr ? "right" : "left", fontSize: 14, fontWeight: 500, cursor: "pointer", boxSizing: "border-box" };

    return (
        <div ref={wrapRef} dir={isAr ? "rtl" : "ltr"} style={{ position: "relative" }}>
            <button
                ref={buttonRef}
                type="button"
                id="account-menu-button"
                className="byan-account-avatar"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={open ? "account-menu" : undefined}
                aria-label={name ? `${t.menuLabel}: ${name}` : t.menuLabel}
                onClick={() => setOpen((v) => !v)}
                onKeyDown={onButtonKey}
                style={{ width: 38, height: 38, borderRadius: "50%", border: `1px solid ${colors.accent}`, background: colors.accent, color: colors.onAccent, fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: open ? `0 0 0 3px ${colors.accentSoft}` : "none" }}
            >
                <span aria-hidden="true">{initial}</span>
            </button>

            {open && (
                <div
                    id="account-menu"
                    role="menu"
                    aria-labelledby="account-menu-button"
                    onKeyDown={onMenuKey}
                    style={{ position: "absolute", [isAr ? "left" : "right"]: 0, top: 46, minWidth: 190, background: bg, border: `1px solid ${border}`, borderRadius: 12, boxShadow: isDark ? "0 10px 30px rgba(0,0,0,0.35)" : "0 10px 30px rgba(0,0,0,0.12)", padding: 6, zIndex: 200 }}
                >
                    {name && <div style={{ padding: "8px 12px", fontSize: 13, opacity: 0.8, color }}>{name}</div>}
                    <button
                        ref={(el) => (itemRefs.current[0] = el)}
                        role="menuitem"
                        type="button"
                        className="byan-account-menuitem"
                        onClick={() => { close(false); router.push("/account/profile"); }}
                        style={item}
                    >
                        {t.menuAccount}
                    </button>
                    <button
                        ref={(el) => (itemRefs.current[1] = el)}
                        role="menuitem"
                        type="button"
                        className="byan-account-menuitem"
                        onClick={() => signOut({ callbackUrl: "/" })}
                        style={{ ...item, color: colors.high }}
                    >
                        {t.menuSignOut}
                    </button>
                </div>
            )}
        </div>
    );
}
