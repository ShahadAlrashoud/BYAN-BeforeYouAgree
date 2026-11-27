"use client";

import { useMemo, useState } from "react";
import Link from "@/app/components/LocalizedLink";
import { useTheme } from "../providers";
import { GLOSSARY, AR_PENDING_TAG, localized } from "@/data/glossary";

const ui = {
  en: {
    title: "Fine Print Dictionary",
    intro: "The terms you'll meet in Terms of Service and Privacy Policies, explained in plain language.",
    legend: "PDPL: Saudi Personal Data Protection Law",
    filterLabel: "Filter terms",
    filterAll: "All",
    filterPdpl: "PDPL only",
    search: "Search terms...",
    searchLabel: "Search the dictionary",
    indexLabel: "Jump to letter",
    none: "No matching terms.",
    pdpl: "PDPL",
    why: "Why it matters",
    where: "Where you'll see it",
    more: "Missing a term? Tell us and we'll add it.",
  },
  ar: {
    title: "قاموس الحروف الصغيرة",
    intro: "مصطلحات ستقابلها في شروط الخدمة وسياسات الخصوصية، مشروحة بلغة بسيطة.",
    legend: "نظام حماية البيانات الشخصية (PDPL)",
    filterLabel: "تصفية المصطلحات",
    filterAll: "الكل",
    filterPdpl: "نظام حماية البيانات فقط",
    search: "ابحث في المصطلحات...",
    searchLabel: "البحث في القاموس",
    indexLabel: "الانتقال إلى حرف",
    none: "لا توجد مصطلحات مطابقة.",
    pdpl: "PDPL",
    why: "لماذا يهم",
    where: "أين ستجده",
    more: "لم تجد مصطلحًا؟ أخبرنا وسنضيفه.",
  },
};

// Arabic noun forms for the result count, keyed by Intl.PluralRules categories.
const AR_TERM_FORMS = {
  zero: "مصطلح",
  one: "مصطلح",
  two: "مصطلحان",
  few: "مصطلحات",
  many: "مصطلحًا",
  other: "مصطلح",
};

function countLabel(n, l) {
  if (l === "ar") {
    const word = AR_TERM_FORMS[new Intl.PluralRules("ar").select(n)] ?? "مصطلح";
    return `${new Intl.NumberFormat("ar").format(n)} ${word}`;
  }
  return `${n} term${n === 1 ? "" : "s"} shown`;
}

// Makes Arabic search forgiving: strips tashkeel and tatweel, unifies alef,
// taa marbuta and alef maqsura, and lowercases Latin text.
function normalize(s) {
  return s
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[\u0622\u0623\u0625]/g, "\u0627")
    .replace(/\u0629/g, "\u0647")
    .replace(/\u0649/g, "\u064A")
    .toLowerCase();
}

function letterOf(term, l) {
  const first = normalize(term.trim()).charAt(0);
  return l === "en" ? first.toUpperCase() : first;
}

// Keeps the first entry for each id so React keys stay unique.
// Fix the duplicate in data/glossary as well, since this skips the later entry.
const UNIQUE_GLOSSARY = (() => {
  const seen = new Set();
  return GLOSSARY.filter((x) => {
    if (seen.has(x.id)) {
      console.warn(`Duplicate glossary id skipped: ${x.id}`);
      return false;
    }
    seen.add(x.id);
    return true;
  });
})();

const visuallyHidden = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
};

const css = `
.gl-root {
  --gl-accent: #163369;
  --gl-accent-ink: #ffffff;
  --gl-surface: color-mix(in srgb, currentColor 4%, transparent);
  --gl-line: color-mix(in srgb, currentColor 14%, transparent);

  max-width: 1040px;
  margin: 0 auto;
  padding: 2.5rem 1.25rem 4rem;
}

/* Header */
.gl-header { display: grid; gap: .5rem; margin-bottom: 1.5rem; }
.gl-title {
  margin: 0;
  font-size: clamp(1.75rem, 3vw, 2.4rem);
  line-height: 1.15;
  letter-spacing: -.01em;
}
.gl-intro { margin: 0; opacity: .85; max-width: 60ch; }
.gl-legend {
  margin: 0;
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  font-size: .8rem;
  opacity: .7;
}
.gl-legend::before {
  content: "";
  width: .5rem;
  height: .5rem;
  border-radius: 50%;
  background: var(--gl-accent);
}

/* Sticky toolbar: search, filter, and A–Z index */
.gl-toolbar {
  position: sticky;
  top: 0;
  z-index: 5;
  display: grid;
  gap: .75rem;
  padding: .85rem 0;
  background: var(--background, Canvas);
  border-bottom: 1px solid var(--gl-line);
}
.gl-controls { display: flex; flex-wrap: wrap; gap: .75rem; align-items: center; }
.gl-search {
  flex: 1 1 280px;
  padding: .6rem .9rem;
  border: 1px solid var(--gl-line);
  border-radius: 10px;
  background: var(--gl-surface);
  color: inherit;
  font: inherit;
}
.gl-search:focus-visible,
.gl-seg button:focus-visible,
.gl-index a:focus-visible {
  outline: 2px solid var(--gl-accent);
  outline-offset: 2px;
}

/* Segmented filter */
.gl-seg {
  display: inline-flex;
  padding: 3px;
  border: 1px solid var(--gl-line);
  border-radius: 999px;
  background: var(--gl-surface);
}
.gl-seg button {
  border: 0;
  padding: .35rem .95rem;
  border-radius: 999px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: .875rem;
  cursor: pointer;
}
.gl-seg button[aria-pressed="true"] {
  background: var(--gl-accent);
  color: var(--gl-accent-ink);
  box-shadow: 0 4px 10px -4px var(--gl-accent);
}

/* A–Z index */
.gl-index { display: flex; flex-wrap: wrap; gap: .3rem; }
.gl-index a,
.gl-index span {
  min-width: 2rem;
  height: 2rem;
  padding: 0 .4rem;
  display: grid;
  place-items: center;
  border-radius: 8px;
  font-size: .85rem;
  font-weight: 600;
  text-decoration: none;
  color: inherit;
  border: 1px solid var(--gl-line);
  background: var(--gl-surface);
}
.gl-index a:hover {
  border-color: var(--gl-accent);
  color: var(--gl-accent);
}
.gl-index span { opacity: .3; }

/* Sections */
.gl-section { scroll-margin-top: 9rem; margin-top: 2.25rem; }
.gl-letter {
  display: flex;
  align-items: center;
  gap: .9rem;
  margin: 0 0 1rem;
}
.gl-letter-badge {
  width: 2.75rem;
  height: 2.75rem;
  display: grid;
  place-items: center;
  margin: 0;
  padding: 0;
  border-radius: 14px;
  background: var(--gl-accent);
  color: var(--gl-accent-ink);
  font-family: inherit;
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1;
  flex: none;
  box-shadow: 0 6px 16px -6px var(--gl-accent);
}
.gl-letter-rule {
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, var(--gl-line), transparent);
}
[dir="rtl"] .gl-letter-rule {
  background: linear-gradient(to left, var(--gl-line), transparent);
}

/* Cards */
.gl-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}
.gl-grid > li { display: flex; }
.gl-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: .65rem;
  padding: 1.15rem 1.2rem;
  background: var(--gl-surface);
  border: 1px solid var(--gl-line);
  border-inline-start: 3px solid var(--gl-accent);
  border-radius: 14px;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, .04),
    0 6px 18px -10px rgba(0, 0, 0, .18);
  transition: transform .2s ease, box-shadow .2s ease;
}
.gl-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 2px 4px rgba(0, 0, 0, .05),
    0 14px 28px -12px rgba(0, 0, 0, .25);
}
.gl-card-head { display: flex; flex-wrap: wrap; gap: .4rem; align-items: center; }
.gl-term {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.3;
}
.gl-term a {
  color: inherit;
  text-decoration: none;
  border-bottom: 1px dotted var(--gl-accent);
}
.gl-term a:hover {
  color: var(--gl-accent);
  border-bottom-style: solid;
}
.gl-tag {
  padding: 2px 9px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--gl-accent) 14%, transparent);
  color: var(--gl-accent);
  font-size: .72rem;
  font-weight: 600;
  line-height: 1.6;
}
.gl-tag--pending {
  background: transparent;
  border: 1px dashed var(--gl-accent);
}
.gl-def { margin: 0; line-height: 1.65; }

/* Meta panel */
.gl-meta {
  margin: auto 0 0;
  padding: .7rem .8rem;
  display: grid;
  gap: .6rem;
  border-radius: 10px;
  background: color-mix(in srgb, currentColor 5%, transparent);
  font-size: .875rem;
}
.gl-meta dt {
  font-size: .72rem;
  font-weight: 600;
  letter-spacing: .06em;
  text-transform: uppercase;
  opacity: .6;
}
.gl-meta dd { margin: .15rem 0 0; line-height: 1.5; opacity: .9; }

.gl-empty { margin: 1.5rem 0; opacity: .8; }
.gl-more {
  margin-top: 2.5rem;
  font-size: .875rem;
  opacity: .8;
  text-align: center;
}

@media (max-width: 600px) {
  .gl-grid { grid-template-columns: 1fr; }
  .gl-section { scroll-margin-top: 12rem; }
}
`;

export default function GlossaryClient() {
  const { lang } = useTheme();
  const l = lang === "ar" ? "ar" : "en";
  const t = ui[l];
  const dir = l === "ar" ? "rtl" : "ltr";

  const [q, setQ] = useState("");
  const [pdplOnly, setPdplOnly] = useState(false);

  const collator = useMemo(
    () => new Intl.Collator(l, { sensitivity: "base" }),
    [l],
  );

  // Full alphabet for this language, so the index keeps its shape while filtering.
  const alphabet = useMemo(() => {
    const set = new Set(
      UNIQUE_GLOSSARY.map((x) => letterOf(x[l].term ?? x.en.term, l)),
    );
    return [...set].filter(Boolean).sort((a, b) => collator.compare(a, b));
  }, [l, collator]);

  const { groups, total } = useMemo(() => {
    const needle = normalize(q.trim());

    const list = UNIQUE_GLOSSARY.filter((x) => {
      if (pdplOnly && !x.pdpl) return false;
      if (!needle) return true;
      return [x.en.term, x.en.def, x.ar.term, x.ar.def].some((s) =>
        normalize(s).includes(needle),
      );
    })
      .map((x) => {
        const block = x[l];
        return {
          id: x.id,
          pdpl: x.pdpl,
          pending: x.pending,
          lang: l,
          ...localized(x, l),
          why: block.why,
          where: block.where,
        };
      })
      .sort((a, b) => collator.compare(a.term, b.term));

    const map = new Map();
    for (const item of list) {
      const key = letterOf(item.term, l);
      map.set(key, [...(map.get(key) ?? []), item]);
    }

    return { groups: [...map.entries()], total: list.length };
  }, [q, l, pdplOnly, collator]);

  const present = new Set(groups.map(([letter]) => letter));

  return (
    <div dir={dir} className="gl-root">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <header className="gl-header">
        <h1 className="gl-title">{t.title}</h1>
        <p className="gl-intro">{t.intro}</p>
        <p className="gl-legend">{t.legend}</p>
      </header>

      <div className="gl-toolbar">
        <div className="gl-controls">
          <label htmlFor="glossary-search" style={visuallyHidden}>
            {t.searchLabel}
          </label>
          <input
            id="glossary-search"
            className="gl-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.search}
          />
          <div role="group" aria-label={t.filterLabel} className="gl-seg">
            <button
              type="button"
              aria-pressed={!pdplOnly}
              onClick={() => setPdplOnly(false)}
            >
              {t.filterAll}
            </button>
            <button
              type="button"
              aria-pressed={pdplOnly}
              onClick={() => setPdplOnly(true)}
            >
              {t.filterPdpl}
            </button>
          </div>
        </div>

        {total > 0 && (
          <nav aria-label={t.indexLabel} className="gl-index">
            {alphabet.map((letter) =>
              present.has(letter) ? (
                <a key={letter} href={`#gl-${letter.codePointAt(0)}`}>
                  {letter}
                </a>
              ) : (
                <span key={letter} aria-hidden="true">
                  {letter}
                </span>
              ),
            )}
          </nav>
        )}
      </div>

      <p
        role="status"
        aria-live="polite"
        style={{ margin: "1rem 0 0", fontSize: "0.875rem", opacity: 0.8 }}
      >
        {total ? countLabel(total, l) : t.none}
      </p>

      {groups.map(([letter, items]) => (
        <section
          key={letter}
          id={`gl-${letter.codePointAt(0)}`}
          className="gl-section"
          aria-labelledby={`gl-h-${letter.codePointAt(0)}`}
        >
          <div className="gl-letter">
            <h2
              id={`gl-h-${letter.codePointAt(0)}`}
              className="gl-letter-badge"
            >
              {letter}
            </h2>
            <span className="gl-letter-rule" aria-hidden="true" />
          </div>

          <ul className="gl-grid">
            {items.map((x) => {
              const itemDir = x.lang === "ar" ? "rtl" : "ltr";
              return (
                <li key={x.id}>
                  <article className="gl-card" lang={x.lang} dir={itemDir}>
                    <div className="gl-card-head">
                      <h3 className="gl-term">
                        <Link href={`/glossary/${x.id}`}>{x.term}</Link>
                      </h3>
                      {x.pending && (
                        <span className="gl-tag gl-tag--pending">
                          {AR_PENDING_TAG}
                        </span>
                      )}
                      {x.pdpl && (
                        <span className="gl-tag" title={t.legend}>
                          {t.pdpl}
                        </span>
                      )}
                    </div>

                    <p className="gl-def">{x.def}</p>

                    {(x.why || x.where) && (
                      <dl className="gl-meta">
                        {x.why && (
                          <div>
                            <dt>{t.why}</dt>
                            <dd>{x.why}</dd>
                          </div>
                        )}
                        {x.where && (
                          <div>
                            <dt>{t.where}</dt>
                            <dd>{x.where}</dd>
                          </div>
                        )}
                      </dl>
                    )}
                  </article>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {total === 0 && <p className="gl-empty">{t.none}</p>}

      <p className="gl-more">{t.more}</p>
    </div>
  );
}