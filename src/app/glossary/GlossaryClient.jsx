"use client";

import { useMemo, useState } from "react";
import Link from "@/app/components/LocalizedLink";
import { useTheme } from "../providers";
import { GLOSSARY, AR_PENDING_TAG, localized } from "@/data/glossary";

const ui = {
  en: { title: "Glossary", intro: "Common terms you'll meet in Terms of Service and Privacy Policies, explained in plain language.", search: "Search terms...", searchLabel: "Search the glossary", count: (n) => `${n} term${n === 1 ? "" : "s"} shown`, none: "No matching terms.", pdpl: "PDPL", more: "More terms exist beyond those shown here." },
  ar: { title: "المصطلحات", intro: "مصطلحات شائعة في شروط الخدمة وسياسات الخصوصية، مشروحة بلغة بسيطة.", search: "ابحث في المصطلحات...", searchLabel: "البحث في المصطلحات", count: (n) => `عدد المصطلحات المعروضة: ${n}`, none: "لا توجد مصطلحات مطابقة.", pdpl: "نظام حماية البيانات", more: "توجد مصطلحات أخرى غير المعروضة هنا." /* [AR review pending] */ },
};

export default function GlossaryClient() {
  const { lang } = useTheme();
  const l = lang === "ar" ? "ar" : "en";
  const t = ui[l];
  const [q, setQ] = useState("");

  const items = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return GLOSSARY.filter((x) => {
      if (!needle) return true;
      // search both languages so either spelling finds the term
      return [x.en.term, x.en.def, x.ar.term, x.ar.def].some((s) => s.toLowerCase().includes(needle));
    })
      .map((x) => ({ id: x.id, pdpl: x.pdpl, ...localized(x, l) }))
      .sort((a, b) => a.term.localeCompare(b.term, l));
  }, [q, l]);

  return (
    <div dir={l === "ar" ? "rtl" : "ltr"} style={{ maxWidth: 760, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1>{t.title}</h1>
      <p>{t.intro}</p>

      <label htmlFor="glossary-search" style={{ display: "block", margin: "1rem 0 .25rem" }}>{t.searchLabel}</label>
      <input
        id="glossary-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search}
        style={{ width: "100%", padding: ".6rem .8rem", border: "1px solid currentColor", borderRadius: 8, background: "transparent", color: "inherit", font: "inherit" }}
      />
      <p role="status" style={{ margin: ".5rem 0 1rem" }}>{items.length ? t.count(items.length) : t.none}</p>

      <dl>
        {items.map((x) => (
          <div key={x.id} style={{ padding: ".9rem 0", borderTop: "1px solid rgba(128,128,128,.4)" }}>
            <dt style={{ fontWeight: 700 }}>
              <Link href={`/glossary/${x.id}`} lang={x.lang} dir={x.lang === "ar" ? "rtl" : "ltr"} style={{ color: "inherit" }}>{x.term}</Link>
              {x.pending && (
                <span style={{ marginInlineStart: 8, padding: "1px 8px", border: "1px dashed currentColor", borderRadius: 999, fontSize: "0.75rem", fontWeight: 600 }}>
                  {AR_PENDING_TAG}
                </span>
              )}
              {x.pdpl && (
                <span style={{ marginInlineStart: 8, padding: "1px 8px", border: "1px solid currentColor", borderRadius: 999, fontSize: "0.75rem" }}>
                  <span aria-hidden="true"> </span>{t.pdpl}
                </span>
              )}
            </dt>
            <dd lang={x.lang} dir={x.lang === "ar" ? "rtl" : "ltr"} style={{ margin: ".25rem 0 0" }}>{x.def}</dd>
          </div>
        ))}
      </dl>
      <p style={{ marginTop: "1.5rem", fontSize: 13, color: "inherit", opacity: 0.8 }}>{t.more}</p>
    </div>
  );
}