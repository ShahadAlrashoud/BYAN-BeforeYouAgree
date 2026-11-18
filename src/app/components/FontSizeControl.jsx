"use client";

import { useEffect, useState } from "react";
import { useTheme } from "../providers";

const STEPS = [100, 115, 130, 150];
const KEY = "byan-font-size";

const labels = {
  en: { group: "Text size", smaller: "Decrease text size", larger: "Increase text size", reset: "Reset text size", now: (p) => `Text size ${p}%` },
  ar: { group: "حجم النص", smaller: "تصغير النص", larger: "تكبير النص", reset: "إعادة ضبط حجم النص", now: (p) => `حجم النص ${p}%` },
};

export default function FontSizeControl() {
  const { lang } = useTheme(); // adjust if needed
  const t = labels[lang === "ar" ? "ar" : "en"];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const saved = Number(localStorage.getItem(KEY));
    const i = STEPS.indexOf(saved);
    if (i >= 0) setIdx(i);
  }, []);

  function apply(i) {
    setIdx(i);
    document.documentElement.style.fontSize = STEPS[i] + "%";
    localStorage.setItem(KEY, String(STEPS[i]));
  }

  const btn = {
    minWidth: 40,
    minHeight: 40,
    border: "1px solid currentColor",
    borderRadius: 8,
    background: "transparent",
    color: "inherit",
    font: "inherit",
    cursor: "pointer",
  };

  return (
    <div role="group" aria-label={t.group} style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
      <button type="button" style={btn} onClick={() => apply(idx - 1)} disabled={idx === 0} aria-label={t.smaller}>
        <span aria-hidden="true">A−</span>
      </button>
      <button type="button" style={btn} onClick={() => apply(0)} disabled={idx === 0} aria-label={t.reset}>
        <span aria-hidden="true">A</span>
      </button>
      <button type="button" style={btn} onClick={() => apply(idx + 1)} disabled={idx === STEPS.length - 1} aria-label={t.larger}>
        <span aria-hidden="true">A+</span>
      </button>
      <span role="status" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
        {t.now(STEPS[idx])}
      </span>
    </div>
  );
}