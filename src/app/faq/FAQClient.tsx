"use client";

import { useId, useState, type CSSProperties } from "react";
import Link from "@/app/components/LocalizedLink";
import { useTheme } from "../providers";
import { FAQ } from "@/data/faq";

type Lang = "en" | "ar";

const content: Record<
  Lang,
  {
    eyebrow: string;
    title: string;
    subtitle: string;
    stillTitle: string;
    stillText: string;
    contact: string;
    backLabel: string;
  }
> = {
  en: {
    eyebrow: "FAQ",
    title: "Frequently asked questions",
    subtitle:
      "Answers about how BYAN analyzes Terms of Service and Privacy Policies, and what happens to your data.",
    stillTitle: "Still have questions?",
    stillText: "Send us a message and we'll get back to you.",
    contact: "Contact us",
    backLabel: "Back to homepage",
  },
  ar: {
    eyebrow: "الأسئلة الشائعة",
    title: "الأسئلة الشائعة",
    subtitle:
      "إجابات حول طريقة تحليل بيان لشروط الخدمة وسياسات الخصوصية، وما يحدث لبياناتك.",
    stillTitle: "لديك أسئلة أخرى؟",
    stillText: "أرسل لنا رسالة وسنرد عليك في أقرب وقت.",
    contact: "تواصل معنا",
    backLabel: "العودة إلى الصفحة الرئيسية",
  },
};

const css = `
.faq-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: var(--page-bg);
  color: var(--heading);
  font-family: var(--font);
}
.faq-page[dir="rtl"] { font-family: var(--font-ar); }

/* Soft accent glow behind the header to give the page depth */
.faq-page::before {
  content: "";
  position: absolute;
  top: -180px;
  inset-inline-start: 50%;
  translate: -50% 0;
  width: 720px;
  height: 480px;
  background: radial-gradient(closest-side, var(--accent-glow), transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.faq-wrap {
  position: relative;
  z-index: 1;
  max-width: 760px;
  margin: 0 auto;
  padding: 80px 24px 96px;
  text-align: start;
}

.faq-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px;
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--accent-soft);
  border: 1px solid var(--accent-border);
  color: var(--accent-text);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.faq-page[dir="rtl"] .faq-eyebrow { letter-spacing: 0; text-transform: none; font-size: 0.85rem; }

.faq-eyebrow::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 4px var(--accent-soft);
}

.faq-title {
  margin: 0 0 14px;
  font-size: clamp(2.1rem, 5vw, 2.8rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.faq-subtitle {
  margin: 0 0 44px;
  max-width: 600px;
  color: var(--body);
  font-size: 1.05rem;
  line-height: 1.75;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.faq-item {
  border-radius: 16px;
  background: var(--card);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-sm);
  transition: border-color 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease;
}
.faq-item:hover { border-color: var(--accent-border); }
.faq-item[data-open="true"] {
  border-color: var(--accent-border);
  background: var(--card-open);
  box-shadow: var(--shadow-md);
}

.faq-heading { margin: 0; font-size: inherit; font-weight: inherit; }

.faq-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 22px;
  background: none;
  border: 0;
  border-radius: 16px;
  cursor: pointer;
  color: var(--heading);
  font: inherit;
  font-size: 1.02rem;
  font-weight: 600;
  text-align: start;
}
.faq-trigger[aria-expanded="true"] { color: var(--accent-text); }

.faq-q { flex: 1; line-height: 1.45; }

.faq-icon {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 999px;
  color: var(--accent-text);
  border: 1px solid var(--accent-border);
  transition: transform 0.3s ease, background-color 0.25s ease;
}
.faq-trigger:hover .faq-icon { background: var(--accent-soft); }
.faq-item[data-open="true"] .faq-icon { transform: rotate(45deg); background: var(--accent-soft); }

.faq-panel {
  display: grid;
  grid-template-rows: 0fr;
  visibility: hidden;
  transition: grid-template-rows 0.35s ease, visibility 0.35s ease;
}
.faq-panel[data-open="true"] {
  grid-template-rows: 1fr;
  visibility: visible;
}
.faq-panel > div { min-height: 0; overflow: hidden; }

.faq-answer {
  margin: 0;
  padding: 0 22px 22px;
  color: var(--body);
  font-size: 0.98rem;
  line-height: 1.8;
}

.faq-cta {
  position: relative;
  overflow: hidden;
  margin-top: 56px;
  padding: 28px;
  border-radius: 20px;
  background: var(--cta-bg);
  border: 1px solid var(--accent-border);
  box-shadow: var(--shadow-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}
.faq-cta-title { margin: 0 0 4px; font-size: 1.15rem; font-weight: 700; }
.faq-cta-text { margin: 0; color: var(--body); }

.faq-cta-btn {
  display: inline-flex;
  align-items: center;
  padding: 12px 26px;
  border-radius: 12px;
  background: var(--accent);
  color: var(--on-accent);
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 8px 20px -8px var(--accent);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}
.faq-cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 26px -8px var(--accent);
  filter: brightness(1.06);
}

.faq-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 40px;
  color: var(--accent-text);
  font-weight: 600;
  text-decoration: none;
}
.faq-back span { transition: text-decoration 0.2s ease; }
.faq-back:hover span { text-decoration: underline; text-underline-offset: 4px; }
.faq-page[dir="rtl"] .faq-back svg { transform: scaleX(-1); }

.faq-trigger:focus-visible,
.faq-cta-btn:focus-visible,
.faq-back:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

@media (max-width: 560px) {
  .faq-wrap { padding: 56px 20px 72px; }
  .faq-trigger { padding: 18px 16px; gap: 12px; }
  .faq-answer { padding: 0 16px 20px; }
  .faq-cta { flex-direction: column; align-items: stretch; padding: 22px; }
  .faq-cta-btn { justify-content: center; }
}

@media (prefers-reduced-motion: reduce) {
  .faq-panel, .faq-icon, .faq-item, .faq-cta-btn, .faq-back span { transition: none; }
}
`;

export default function FAQPage() {
  const { theme, lang, colors: themeColors } = useTheme();
  const isDark = theme === "dark";
  const isAr = lang === "ar";
  const l: Lang = isAr ? "ar" : "en";
  const t = content[l];
  const faqs = FAQ[l];
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const vars = {
    "--page-bg": isDark
      ? "linear-gradient(180deg, #0a0e1a 0%, #0f1629 60%, #111827 100%)"
      : "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
    "--heading": isDark ? "#f1f5f9" : "#0f172a",
    "--body": isDark ? "#a1acc0" : "#5b6679",
    "--line": isDark ? "#1f2a3d" : "#e2e8f0",
    "--card": isDark ? "rgba(17, 24, 39, 0.6)" : "#ffffff",
    "--card-open": isDark ? "rgba(17, 24, 39, 0.9)" : "#ffffff",
    "--shadow-sm": isDark
      ? "0 1px 2px rgba(0, 0, 0, 0.4)"
      : "0 1px 2px rgba(15, 23, 42, 0.04)",
    "--shadow-md": isDark
      ? "0 12px 32px -12px rgba(0, 0, 0, 0.6)"
      : "0 12px 32px -12px rgba(15, 23, 42, 0.12)",
    "--font": "'Segoe UI', system-ui, Arial, sans-serif",
    "--font-ar": "'Noto Sans Arabic', Tahoma, 'Segoe UI', sans-serif",
    "--accent": themeColors.accent,
    "--accent-text": themeColors.accentText,
    "--accent-soft": themeColors.accentSoft,
    "--accent-border": `color-mix(in srgb, ${themeColors.accent} ${isDark ? 40 : 28}%, transparent)`,
    "--accent-glow": `color-mix(in srgb, ${themeColors.accent} ${isDark ? 22 : 14}%, transparent)`,
    "--cta-bg": `linear-gradient(135deg, ${themeColors.accentSoft} 0%, color-mix(in srgb, ${themeColors.accent} ${isDark ? 14 : 8}%, transparent) 100%)`,
    "--on-accent": themeColors.onAccent,
  } as CSSProperties;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <main dir={isAr ? "rtl" : "ltr"} lang={l} className="faq-page" style={vars}>
      <style>{css}</style>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="faq-wrap">
        <span className="faq-eyebrow">{t.eyebrow}</span>
        <h1 className="faq-title">{t.title}</h1>
        <p className="faq-subtitle">{t.subtitle}</p>

        <div className="faq-list">
          {faqs.map((item, i) => {
            const isOpen = openIndex === i;
            const triggerId = `${baseId}-trigger-${i}`;
            const panelId = `${baseId}-panel-${i}`;

            return (
              <div className="faq-item" data-open={isOpen} key={item.q}>
                <h3 className="faq-heading">
                  <button
                    id={triggerId}
                    type="button"
                    className="faq-trigger"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                  >
                    <span className="faq-q">{item.q}</span>
                    <span className="faq-icon" aria-hidden="true">
                      <svg width="12" height="12" viewBox="0 0 12 12">
                        <path
                          d="M6 1v10M1 6h10"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          fill="none"
                        />
                      </svg>
                    </span>
                  </button>
                </h3>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  className="faq-panel"
                  data-open={isOpen}
                >
                  <div>
                    <p className="faq-answer">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <section className="faq-cta">
          <div>
            <h2 className="faq-cta-title">{t.stillTitle}</h2>
            <p className="faq-cta-text">{t.stillText}</p>
          </div>
          <Link href="/contact" className="faq-cta-btn">
            {t.contact}
          </Link>
        </section>

        <Link href="/" className="faq-back">
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M13 8H3M7 4 3 8l4 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          <span>{t.backLabel}</span>
        </Link>
      </div>
    </main>
  );
}