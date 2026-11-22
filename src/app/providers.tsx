"use client";

import { SessionProvider } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { hasArPrefix, isLocalizable, toArabicPath, toEnglishPath } from "@/lib/lang";

type Theme = "light" | "dark";
type Lang = "en" | "ar";

export const ACCENT_DARK = "#6366f1";  // dark mode (unchanged)
export const ACCENT_LIGHT = "#1e3a5f"; // light mode (navy, matches the logo)

export function getColors(isDark: boolean) {
  return {
    accent: isDark ? ACCENT_DARK : ACCENT_LIGHT,
    accentHover: isDark ? "#7c7ff5" : "#162d4a",
    accentSoft: isDark ? "rgba(99,102,241,0.18)" : "rgba(30,58,95,0.08)",
    accentText: isDark ? "#a5b4fc" : "#1e3a5f",
    onAccent: "#ffffff", // text on top of accent buttons

    background: isDark ? "#0a1429" : "#f8fafc",
    card: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
    input: isDark ? "rgba(255,255,255,0.06)" : "#ffffff",
    border: isDark ? "rgba(255,255,255,0.10)" : "#e2e8f0",

    heading: isDark ? "#fbf9f4" : "#1e293b",
    text: isDark ? "#f5efe2" : "#475569",
    muted: isDark ? "rgba(245,239,226,0.65)" : "#64748b",

    high: "#dc5252",
    medium: "#a87916",
    low: "#218653",
  };
}

type Colors = ReturnType<typeof getColors>;

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
  lang: Lang;
  setLang: (lang: Lang) => void;
  colors: Colors;
}>({
  theme: "light",
  toggleTheme: () => {},
  lang: "en",
  setLang: () => {},
  colors: getColors(false),
});

export const useTheme = () => useContext(ThemeContext);

// initialLang comes from the server (the /ar URL prefix), so the first HTML is already in the right language
export default function Providers({ children, initialLang = "en" }: { children: ReactNode; initialLang?: Lang }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [lang, setLang] = useState<Lang>(initialLang);
  const router = useRouter();
  const pathname = usePathname();
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const savedTheme: Theme = storedTheme === "dark" ? "dark" : "light";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  // The URL decides the language on pages that have an Arabic version (/about vs /ar/about).
  // On every other page (results, login...) the saved preference decides, as before.
  useEffect(() => {
    // The address-bar path (with any /ar prefix), not the rewritten internal path
    const path = window.location.pathname;
    const prev = prevPath.current;
    prevPath.current = path;

    let stored: Lang = "en";
    try {
      stored = localStorage.getItem("lang") === "ar" ? "ar" : "en";
    } catch {}
    const remember = (l: Lang) => {
      try {
        localStorage.setItem("lang", l);
      } catch {}
    };

    if (hasArPrefix(path)) {
      setLang("ar");
      remember("ar");
      return;
    }
    if (!isLocalizable(path)) {
      setLang(stored);
      return;
    }

    // English URL of a page that has an Arabic version. A visitor who prefers Arabic is
    // sent to the Arabic URL, unless they just came from an Arabic page (the back button).
    const cameFromArabic = prev !== null && hasArPrefix(prev);
    if (stored === "ar" && !cameFromArabic) {
      setLang("ar");
      router.replace(toArabicPath(path) + window.location.search + window.location.hash);
      return;
    }
    setLang("en");
    remember("en");
  }, [pathname, router]);

  // Keep <html lang> and <html dir> in sync with the chosen language
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleSetLang = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem("lang", newLang);

    // On pages with an Arabic version, switching language moves to the matching URL
    const path = window.location.pathname;
    if (isLocalizable(path)) {
      const target = newLang === "ar" ? toArabicPath(path) : toEnglishPath(path);
      if (target !== path) {
        router.push(target + window.location.search + window.location.hash, { scroll: false });
      }
    }
  };

  return (
    <SessionProvider>
      <ThemeContext.Provider
        value={{
          theme,
          toggleTheme,
          lang,
          setLang: handleSetLang,
          colors: getColors(theme === "dark"),
        }}
      >
        {children}
      </ThemeContext.Provider>
    </SessionProvider>
  );
}