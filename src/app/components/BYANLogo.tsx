"use client";

import { useEffect, useRef, useState } from "react";

type BYANLogoProps = {
  isDark?: boolean;
  size?: "sm" | "md" | "lg";
  rotate?: boolean; // true = new phrase each time the badge opens
  focused?: boolean; // lets a parent (link focus / mobile tap) open the badge
};

// Trimmed to phrases about reading terms and knowing your rights.
// Every phrase starts with "N" to match the badge letter.
const PHRASES = [
  "Know Now",
  "Need to Know",
  "No Surprises",
  "Notice",
  "Know Your Rights",
  "Nothing Hidden",
  "No Fine Print",
  "Note the Terms",
  "Never Assume",
  "Next, Read This",
  "Navigate the Terms",
  "Never Skip the Terms",
];

const SIZES = {
  sm: { fontSize: "1.1rem", badge: 22, pad: "0 6px" },
  md: { fontSize: "1.4rem", badge: 28, pad: "0 8px" },
  lg: { fontSize: "2.2rem", badge: 42, pad: "0 12px" },
};

// Fisher-Yates shuffle
function shuffle(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function BYANLogo({
  isDark = false,
  size = "md",
  rotate = true,
  focused = false,
}: BYANLogoProps) {
  const [hovered, setHovered] = useState(false);
  // Always start at index 0 so server and client HTML match (no hydration mismatch)
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const queue = useRef<number[]>([]);
  const current = useRef(0);

  const active = hovered || focused;

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Shuffled queue: every phrase shows once before any repeats
  const pickNewPhrase = () => {
    if (!rotate) return;

    if (queue.current.length === 0) {
      queue.current = shuffle(PHRASES.length);
      // avoid showing the same phrase twice in a row at the reshuffle boundary
      if (queue.current[queue.current.length - 1] === current.current) {
        const last = queue.current.length - 1;
        [queue.current[0], queue.current[last]] = [
          queue.current[last],
          queue.current[0],
        ];
      }
    }

    const next = queue.current.pop()!;
    current.current = next;
    setPhraseIndex(next);
  };

  // New phrase when the parent opens the badge (keyboard focus or mobile tap)
  useEffect(() => {
    if (focused) pickNewPhrase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused]);

  const s = SIZES[size];

  const textColor = isDark ? "#f1f1f1" : "#1e293b";
  const badgeBg = isDark ? "#f1f1f1" : "#1e3a5f";
  const badgeText = isDark ? "#1e293b" : "#ffffff";
  const phrase = PHRASES[phraseIndex];

  const gridTransition = (delay = 0) =>
    reducedMotion
      ? "none"
      : `grid-template-columns 300ms cubic-bezier(0.4,0,0.2,1) ${delay}ms`;

  return (
    <span
      // Decorative: the parent Link's aria-label names the logo.
      // The changing phrase is intentionally not announced.
      aria-hidden="true"
      // Mouse only, so touch devices don't get a "sticky hover"
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        if (!hovered) pickNewPhrase();
        setHovered(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        setHovered(false);
      }}
      style={{
        display: "inline-flex",
        flexDirection: "row",
        alignItems: "center",
        direction: "ltr",
        unicodeBidi: "isolate",
        cursor: "pointer",
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontWeight: 700,
        fontSize: s.fontSize,
        color: textColor,
      }}
    >
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
            ? "none"
            : "all 320ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <span
          style={{
            display: "inline-grid",
            gridTemplateColumns: active ? "0fr" : "1fr",
            transition: gridTransition(),
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
            transition: gridTransition(60),
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
    </span>
  );
}