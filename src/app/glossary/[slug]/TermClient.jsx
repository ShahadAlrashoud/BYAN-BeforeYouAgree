"use client";

import Link from "next/link";
import { useTheme } from "../../providers";
import { bySlug } from "@/data/glossary";

const ui = {
  en: { back: "← All terms", example: "Example from a policy", seeAlso: "See also", pdpl: "PDPL", other: "In Arabic", note: "Informational only, not legal advice." },
  ar: { back: "→ كل المصطلحات", example: "مثال من سياسة", seeAlso: "انظر أيضاً", pdpl: "نظام حماية البيانات الشخصية", other: "بالإنجليزية", note: "للأغراض المعلوماتية فقط، وليست استشارة قانونية." },
};

export default function TermClient({ id }) {
  const { lang } = useTheme();
  const l = lang === "ar" ? "ar" : "en";
  const o = l === "ar" ? "en" : "ar";
  const t = ui[l];
  const term = bySlug(id);
  if (!term) return null;
  const c = term[l];

  return (
    <article dir={l === "ar" ? "rtl" : "ltr"} style={{ maxWidth: 760, margin: "0 auto", padding: "2rem 1rem" }}>
      <p><Link href="/glossary">{t.back}</Link></p>
      <h1>{c.term}</h1>

      {term.pdpl && (
        <p style={{ display: "inline-block", padding: "2px 10px", border: "1px solid currentColor", borderRadius: 999, fontSize: "0.85rem" }}>
          <span aria-hidden="true">§ </span>{t.pdpl}
        </p>
      )}

      <p style={{ fontSize: "1.1rem", lineHeight: 1.8 }}>{c.def}</p>
      {term.pdplNote && <p>{term.pdplNote[l]}</p>}

      {c.example && (
        <>
          <h2 style={{ fontSize: "1.1rem" }}>{t.example}</h2>
          <blockquote style={{ margin: 0, paddingInlineStart: 12, borderInlineStart: "3px solid currentColor" }}>{c.example}</blockquote>
        </>
      )}

      {/* both languages visible together */}
      <h2 style={{ fontSize: "1.1rem" }}>{t.other}</h2>
      <p lang={o} dir={o === "ar" ? "rtl" : "ltr"}>
        <strong>{term[o].term}</strong>: {term[o].def}
      </p>

      {term.related?.length > 0 && (
        <>
          <h2 style={{ fontSize: "1.1rem" }}>{t.seeAlso}</h2>
          <ul>
            {term.related.map((rid) => {
              const r = bySlug(rid);
              return r && (
                <li key={rid}><Link href={`/glossary/${rid}`}>{r[l].term}</Link></li>
              );
            })}
          </ul>
        </>
      )}
      <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>{t.note}</p>
    </article>
  );
}