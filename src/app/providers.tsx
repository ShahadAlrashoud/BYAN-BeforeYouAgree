"use client";

import { SessionProvider } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { hasArPrefix, isLocalizable, toArabicPath, toEnglishPath } from "@/lib/lang";

type Theme = "light" | "dark";
type Lang = "en" | "ar";

export const ACCENT_DARK = "#1F2839";
export const ACCENT_LIGHT = "#1F2839";

// Color tokens per the design spec
// Primary: #1F2839 (navy) - used for header, CTA button
// Background: #F5F5EF (cream) - page backgrounds
// Accent: #B69D74 (tan) - dividers, icons, decorative elements

export function getColors(isDark: boolean) {
  const high = {
    bg: isDark ? "#7a2e2e" : "#B42318",
    text: isDark ? "#fad0d0" : "#222222",
    ring: isDark ? "#fff" : "#000",
  };
  const moderate = {
    bg: isDark ? "#c97b12" : "#C98A12",
    text: isDark ? "#fde68a" : "#222222",
    ring: isDark ? "#fff" : "#000",
  };
  const low = {
    bg: isDark ? "#2c5a3e" : "#2E7D4F",
    text: isDark ? "#a8d5a8" : "#222222",
    ring: isDark ? "#fff" : "#000",
  };

  return {
    primary: "#1F2839",
    primaryHover: isDark ? "#313e55" : "#162d4a",

    bg: isDark ? "#0a0e1a" : "#F5F5EF",
    card: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
    input: isDark ? "rgba(255,255,255,0.06)" : "#ffffff",
    border: isDark ? "rgba(255,255,255,0.10)" : "#e2e8f0",

    heading: isDark ? "#fbf9f4" : "#1F2839",
    text: isDark ? "#f5efe2" : "#1F2839",
    muted: isDark ? "rgba(245,239,226,0.65)" : "#64748b",

accent: "#B69D74",
    accentHover: isDark ? "#c6af86" : "#a58e5c",
    accentSoft: isDark ? "rgba(182,157,116,0.15)" : "rgba(182,157,116,0.08)",
accentText: isDark ? "#eed2b6" : "#7A6242",

onAccent: isDark ? "#ffffff" : "#1F2839",
    high,
    moderate,
    low,
    // "safe" is displayed as "Low"
    safe: low,
  };
}

// Font families must match the stylesheet loaded in layout.tsx
export const FONT = {
  body: {
    en: {
      fontFamily: "'IBM Plex Sans Arabic', 'IBM Plex Sans', system-ui, sans-serif",
      fontWeight: 400,
      lineHeight: 1.5,
    },
    ar: {
      fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif",
      fontWeight: 400,
      lineHeight: 1.8,
    },
  },
  heading: {
    en: {
      // Add Playfair Display to the Google Fonts URL in layout.tsx to use it here
      fontFamily: "'Playfair Display', 'Noto Naskh Arabic', serif",
      fontWeight: 700,
      lineHeight: 1.5,
    },
    ar: {
      fontFamily: "'Noto Naskh Arabic', serif",
      fontWeight: 700,
      lineHeight: 1.5,
    },
  },
};

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