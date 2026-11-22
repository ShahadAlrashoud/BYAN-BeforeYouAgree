"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "../providers";
import { ACCOUNT_V2 } from "@/lib/flags";
import AccountMenu from "./AccountMenu";

const content = {
  en: {
    profile: "Account / Profile",
    saved: "Saved Analysis Results",
    settings: "Settings",
    signout: "Sign out",
  },
  ar: {
    profile: "الحساب / الملف الشخصي",
    saved: "نتائج التحليل المحفوظة",
    settings: "الإعدادات",
    signout: "تسجيل الخروج",
  },
};

// Feature flag: with Account v2 on, the new accessible menu replaces this one.
export default function UserMenu() {
  return ACCOUNT_V2 ? <AccountMenu /> : <LegacyUserMenu />;
}

function LegacyUserMenu() {
  const { data: session, status } = useSession();
  const { lang, theme, colors } = useTheme();

  const isAr = lang === "ar";
  const isDark = theme === "dark";
  const t = content[lang];

  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
    };
  }, []);

  if (status === "loading") return null;

  // LOGGED OUT: no Log in / Sign up links in the header for now.
  // They only appear when the visitor uses "Save Result" on the results page.
  if (!session?.user) return null;

  // LOGGED IN
  const name = session.user.username || session.user.email || "User";
  const initial = name[0]?.toUpperCase() || "U";

  const menuBackground = isDark ? "#111827" : "#ffffff";
  const menuBorder = isDark ? "#374151" : "#e2e8f0";
  const primaryText = isDark ? "#f3f4f6" : "#111827";
  const secondaryText = isDark ? "#9ca3af" : "#64748b";
  const divider = isDark ? "#374151" : "#f1f5f9";

  return (
    <div
      ref={ref}
      dir={isAr ? "rtl" : "ltr"}
      style={{
        position: "relative",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={isAr ? "فتح قائمة الحساب" : "Open account menu"}
        aria-expanded={open}
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          border: `1px solid ${colors.accent}`,
          background: colors.accent,
          color: colors.onAccent,
          fontWeight: 700,
          fontSize: 14,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: open ? `0 0 0 3px ${colors.accentSoft}` : "none",
          transition: "box-shadow 0.2s ease",
        }}
      >
        {initial}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            [isAr ? "left" : "right"]: 0,
            top: 46,
            width: 270,
            background: menuBackground,
            border: `1px solid ${menuBorder}`,
            borderRadius: 12,
            boxShadow: isDark
              ? "0 10px 30px rgba(0,0,0,0.35)"
              : "0 10px 30px rgba(0,0,0,0.12)",
            padding: 8,
            zIndex: 200,
            textAlign: isAr ? "right" : "left",
          }}
        >
          {/* Account information */}
          <div
            style={{
              padding: "10px 10px 12px",
              borderBottom: `1px solid ${divider}`,
              marginBottom: 6,
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: 14,
                color: primaryText,
                marginBottom: 3,
              }}
            >
              {session.user.username || "User"}
            </div>

            <div
              style={{
                fontSize: 12,
                color: secondaryText,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {session.user.email}
            </div>
          </div>

          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            style={itemStyle(primaryText)}
          >
            {t.profile}
          </Link>

          <Link
            href="/saved-analyses"
            onClick={() => setOpen(false)}
            style={itemStyle(primaryText)}
          >
            {t.saved}
          </Link>

          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            style={itemStyle(primaryText)}
          >
            {t.settings}
          </Link>

          <div
            style={{
              height: 1,
              background: divider,
              margin: "6px 4px",
            }}
          />

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{
              ...itemStyle(colors.high),
              width: "100%",
              textAlign: isAr ? "right" : "left",
              border: "none",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            {t.signout}
          </button>
        </div>
      )}
    </div>
  );
}

function itemStyle(color) {
  return {
    display: "block",
    width: "100%",
    padding: "9px 10px",
    borderRadius: 8,
    color,
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 500,
    boxSizing: "border-box",
  };
}