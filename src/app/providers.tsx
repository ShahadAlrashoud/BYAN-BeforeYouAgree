"use client";

import { SessionProvider } from "next-auth/react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

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

export default function Providers({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as Theme) || "light";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");

    const savedLang = (localStorage.getItem("lang") as Lang) || "en";
    setLang(savedLang);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleSetLang = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem("lang", newLang);
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