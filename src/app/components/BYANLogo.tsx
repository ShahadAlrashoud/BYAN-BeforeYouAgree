"use client";

import { useEffect, useState } from "react";

type BYANLogoProps = {
  isDark?: boolean;
  size?: "sm" | "md" | "lg";
  rotate?: boolean; // true = new phrase on every hover
};

const PHRASES = [
  "Know Now",
  "Need to Know",
  "No Surprises",
  "Notice",
  "Know Your Rights",
  "Nothing Hidden",
  "No Fine Print",
  "Not So Fast",
  "Negotiate",
  "Note the Terms",
  "Never Assume",
  "Next, Read This",
  "No Rush",
  "Navigate the Terms",
  "Needs a Look",
  "Name Your Terms",
];

const SIZES = {
  sm: { fontSize: "1.1rem", badge: 22, pad: "0 6px" },
  md: { fontSize: "1.4rem", badge: 28, pad: "0 8px" },
  lg: { fontSize: "2.2rem", badge: 42, pad: "0 12px" },
};

export default function BYANLogo({
  isDark = false,
  size = "md",
  rotate = true,
}: BYANLogoProps) {
  const [active, setActive] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (window.matchMedia) {
      setReducedMotion(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      );
    }
  }, []);

  // Pick a different random phrase each time the logo is activated.
  // It swaps while the badge is collapsed, so the change isn't visible mid-animation.
  const activate = () => {
    if (active) return;
    if (rotate) {
      setPhraseIndex((current) => {
        let next = current;
        while (next === current) {
          next = Math.floor(Math.random() * PHRASES.length);
        }
        return next;
      });
    }
    setActive(true);
  };

  const deactivate = () => setActive(false);

  const s = SIZES[size];

  const textColor = isDark ? "#f1f1f1" : "#1e293b";
  const badgeBg = isDark ? "#f1f1f1" : "#1e3a5f";
  const badgeText = isDark ? "#1e293b" : "#ffffff";
  const phrase = PHRASES[phraseIndex];

  return (
    <button
      type="button"
      onMouseEnter={activate}
      onMouseLeave={deactivate}
      onFocus={activate}
      onBlur={deactivate}
      aria-label={`BYAN — Before You Agree. ${phrase}.`}
      style={{
        display: "inline-flex",
        flexDirection: "row",
        alignItems: "center",
        direction: "ltr",
        unicodeBidi: "isolate",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        padding: 0,
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontWeight: 700,
        fontSize: s.fontSize,
        color: textColor,
        outline: "none",
      }}
    >
      {/* Keep BYAN visually LTR even when the page is Arabic */}
      <span
        dir="ltr"
        style={{
          direction: "ltr",
          unicodeBidi: "isolate",
          letterSpacing: "-0.02em",
        }}
      >
        BYA
      </span>

      <span
        dir="ltr"
        style={{
          display: "inline-flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          height: s.badge,
          minWidth: s.badge,
          padding: s.pad,
          marginLeft: 2,
          borderRadius: 6,
          background: badgeBg,
          color: badgeText,
          overflow: "hidden",
          whiteSpace: "nowrap",
          direction: "ltr",
          unicodeBidi: "isolate",
          transition: reducedMotion
            ? "opacity 200ms ease"
            : "all 320ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <span
          style={{
            display: "inline-grid",
            gridTemplateColumns: active ? "0fr" : "1fr",
            transition: "grid-template-columns 300ms cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <span style={{ overflow: "hidden", minWidth: 0, direction: "ltr" }}>
            N
          </span>
        </span>

        <span
          style={{
            display: "inline-grid",
            gridTemplateColumns: active ? "1fr" : "0fr",
            transition:
              "grid-template-columns 300ms cubic-bezier(0.4,0,0.2,1) 60ms",
          }}
        >
          <span
            style={{
              overflow: "hidden",
              whiteSpace: "nowrap",
              fontSize: size === "lg" ? "1rem" : "0.75rem",
              fontWeight: 600,
              direction: "ltr",
            }}
          >
            {phrase}
          </span>
        </span>
      </span>
    </button>
  );
}