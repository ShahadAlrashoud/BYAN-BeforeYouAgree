"use client";

import Link from "@/app/components/LocalizedLink";
import { useMemo } from "react";
import { useTheme } from "../providers";
import { GLOSSARY } from "@/data/glossary";

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Wraps the FIRST mention of each glossary term in a link.
export default function GlossaryText({ text }) {
  const { lang } = useTheme();
  const l = lang === "ar" ? "ar" : "en";

  const { re, lookup } = useMemo(() => {
    const lookup = new Map();
    GLOSSARY.forEach((x) => {
      [...x.match.en, ...x.match.ar].forEach((p) => lookup.set(p.toLowerCase(), x.id));
    });
    const phrases = [...lookup.keys()].sort((a, b) => b.length - a.length).map(esc);
    return { re: new RegExp(`(${phrases.join("|")})`, "gi"), lookup };
  }, []);

  if (!text) return null;
  const seen = new Set();

  return (
    <>
      {String(text).split(re).map((part, i) => {
        const id = lookup.get(part.toLowerCase());
        if (!id || seen.has(id)) return part;
        seen.add(id);
        return (
          <Link
            key={i}
            href={`/glossary/${id}`}
            title={l === "ar" ? "اطّلع على التعريف" : "See definition"}
            style={{ color: "inherit", textDecoration: "underline dotted", textUnderlineOffset: 3 }}
          >
            {part}
          </Link>
        );
      })}
    </>
  );
}