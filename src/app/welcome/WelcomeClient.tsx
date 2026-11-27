"use client";

// The welcome homepage (NEW_HOME). The demo is fixed text: no request, no model call, nothing saved.
import type { CSSProperties } from "react";
import Link from "@/app/components/LocalizedLink";
import { useTheme } from "../providers";
import TermsBackground from "../components/TermsBackground";
import { popularStrings } from "../popular/strings";
import { welcomeStrings } from "./strings";

const css = `
.wl-root {
  background: var(--wl-bg);
  color: var(--wl-heading);
  line-height: 1.6;
}
.wl-root[dir="rtl"] { line-height: 1.8; }

.wl-root a:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--wl-accent-soft);
  border-radius: 8px;
}

/* Hero */
.wl-hero { position: relative; overflow: hidden; width: 100%; }
.wl-bg { position: absolute; inset: 0; pointer-events: none; }
.wl-hero-inner {
  position: relative;
  z-index: 1;
  max-width: 760px;
  margin-inline: auto;
  padding: 72px 24px 48px;
  text-align: center;
}
.wl-title {
  font-size: clamp(2rem, 4.5vw, 3rem);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.01em;
  margin: 0 0 16px;
  text-wrap: balance;
}
.wl-intro {
  max-width: 560px;
  margin: 0 auto 28px;
  color: var(--wl-body);
  font-size: 1.05rem;
  line-height: 1.7;
}
.wl-cta {
  display: inline-block;
  border-radius: 12px;
  padding: 13px 30px;
  background: var(--wl-accent);
  color: var(--wl-on-accent);
  font-weight: 700;
  font-size: 1rem;
  text-decoration: none;
  box-shadow: 0 0 0 6px var(--wl-accent-soft);
  transition: transform 0.15s ease, filter 0.15s ease;
}
.wl-cta:hover { transform: translateY(-1px); filter: brightness(1.05); }
.wl-allowance {
  max-width: 520px;
  margin: 22px auto 0;
  color: var(--wl-body);
  font-size: 0.92rem;
  line-height: 1.7;
}

/* Content column */
.wl-content {
  max-width: 760px;
  margin-inline: auto;
  padding: 8px 24px 72px;
  display: flex;
  flex-direction: column;
  gap: 44px;
}
.wl-section-title {
  margin: 0 0 14px;
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--wl-heading);
}

/* Steps */
.wl-steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.wl-step {
  background: var(--wl-card);
  border: 1px solid var(--wl-border);
  border-radius: 16px;
  padding: 18px;
}
.wl-step-num {
  display: inline-grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--wl-accent-soft);
  color: var(--wl-accent-text);
  font-weight: 700;
  font-size: 0.9rem;
}
.wl-step-text { margin: 10px 0 0; color: var(--wl-heading); font-size: 0.95rem; }

/* Demo card */
.wl-card {
  background: var(--wl-card);
  border: 1px solid var(--wl-border);
  border-inline-start: 4px solid var(--wl-accent);
  border-radius: 16px;
  padding: 22px 24px;
}
.wl-chip {
  display: inline-block;
  margin-block-end: 10px;
  padding: 3px 12px;
  border-radius: 999px;
  background: var(--wl-accent-soft);
  color: var(--wl-accent-text);
  font-size: 0.8rem;
  font-weight: 700;
}
.wl-site { margin: 0 0 8px; font-size: 1.05rem; font-weight: 700; }
.wl-badge-row { margin: 0 0 12px; }
.wl-badge {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 999px;
  border: 1px solid var(--wl-medium);
  color: var(--wl-medium);
  font-size: 0.82rem;
  font-weight: 700;
}
.wl-summary { margin: 0 0 16px; color: var(--wl-body); line-height: 1.7; }
.wl-findings {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;
}
.wl-finding {
  border: 1px solid var(--wl-border);
  border-radius: 12px;
  padding: 14px 16px;
}
.wl-finding-cat { margin: 0 0 6px; font-weight: 700; color: var(--wl-accent-text); }
.wl-quote-label { margin: 0 0 4px; color: var(--wl-body); font-size: 0.82rem; }
.wl-quote {
  margin: 0 0 8px;
  padding-inline-start: 12px;
  border-inline-start: 3px solid var(--wl-border);
}
.wl-quote p {
  margin: 0;
  color: var(--wl-heading);
  font-style: italic;
  line-height: 1.7;
}
.wl-finding-plain { margin: 0; color: var(--wl-body); font-size: 0.9rem; }
.wl-demo-note { margin: 16px 0 0; color: var(--wl-body); font-size: 0.82rem; line-height: 1.6; }
.wl-inline-link { color: var(--wl-accent-text); font-weight: 700; }

/* Popular link card */
.wl-popular {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  border-radius: 16px;
  background: var(--wl-card);
  border: 1px solid var(--wl-border);
  text-decoration: none;
  color: var(--wl-heading);
  transition: border-color 0.15s ease;
}
.wl-popular:hover { border-color: var(--wl-accent); }
.wl-popular-title { font-weight: 700; }
.wl-popular-cta { color: var(--wl-accent-text); font-weight: 700; white-space: nowrap; }

/* Responsive */
@media (max-width: 760px) {
  .wl-hero-inner { padding: 48px 20px 32px; }
  .wl-steps { grid-template-columns: 1fr; }
  .wl-cta { width: 100%; max-width: 320px; }
  .wl-card { padding: 18px; }
}

@media (prefers-reduced-motion: reduce) {
  .wl-cta, .wl-popular { transition: none; }
  .wl-cta:hover { transform: none; }
}
`;

export default function WelcomeClient({
  showAllowance,
  showPopular,
}: {
  showAllowance: boolean; // DAILY_ALLOWANCE is on: the sentence is only true while the limit exists
  showPopular: boolean; // POPULAR_PAGE is on: the link only appears while /popular exists
}) {
  const { theme, lang, colors: c } = useTheme();
  const isDark = theme === "dark";
  const L = lang === "ar" ? "ar" : "en";
  const isAr = L === "ar";
  const t = welcomeStrings[L];
  const p = popularStrings[L];

  // Theme values reach the stylesheet as custom properties.
  const vars = {
    "--wl-bg": isDark
      ? "linear-gradient(180deg, #0a0e1a 0%, #111827 100%)"
      : "#ffffff",
    "--wl-heading": isDark ? "#f1f1f1" : "#1e293b",
    "--wl-body": isDark ? "#94a3b8" : "#64748b",
    "--wl-card": c.card,
    "--wl-border": c.border,
    "--wl-accent": c.accent,
    "--wl-accent-soft": c.accentSoft,
    "--wl-accent-text": c.accentText,
    "--wl-on-accent": c.onAccent,
    "--wl-medium": c.medium,
  } as CSSProperties;

  return (
    <div className="wl-root" style={vars} dir={isAr ? "rtl" : "ltr"} lang={L}>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* Hero: one message, one action */}
      <section className="wl-hero" aria-labelledby="welcome-title">
        <div className="wl-bg" aria-hidden="true">
          <TermsBackground />
        </div>
        <div className="wl-hero-inner">
          <h1 id="welcome-title" className="wl-title">
            {t.title}
          </h1>
          <p className="wl-intro">{t.intro}</p>

          <Link href="/analyze" className="wl-cta">
            {t.tryIt}
          </Link>

          {showAllowance && <p className="wl-allowance">{t.allowance}</p>}
        </div>
      </section>

      <div className="wl-content">
        {/* How it works */}
        <section aria-labelledby="welcome-steps">
          <h2 id="welcome-steps" className="wl-section-title">
            {t.stepsTitle}
          </h2>
          <ol className="wl-steps">
            {t.steps.map((step, i) => (
              <li key={i} className="wl-step">
                <span className="wl-step-num" aria-hidden="true">
                  {i + 1}
                </span>
                <p className="wl-step-text">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Sample analysis: fixed text, not a real result */}
        <section aria-labelledby="welcome-demo">
          <h2 id="welcome-demo" className="wl-section-title">
            {t.demoTitle}
          </h2>

          <article className="wl-card">
            <span className="wl-chip">{t.demoLabel}</span>
            <h3 className="wl-site">{t.demoSite}</h3>
            <p className="wl-badge-row">
              <span className="wl-badge">{p.levels.moderate}</span>
            </p>
            <p className="wl-summary">{t.demoSummary}</p>

            <ul className="wl-findings">
              {t.demoFindings.map((f) => (
                <li key={f.category} className="wl-finding">
                  <p className="wl-finding-cat">{f.category}</p>
                  <p className="wl-quote-label">{t.demoQuoteLabel}</p>
                  <blockquote className="wl-quote">
                    <p>“{f.quote}”</p>
                  </blockquote>
                  <p className="wl-finding-plain">{f.plain}</p>
                </li>
              ))}
            </ul>

            <p className="wl-demo-note">
              {t.demoNote}{" "}
              <Link href="/disclaimer" className="wl-inline-link">
                {t.disclaimerLink}
              </Link>
            </p>
          </article>
        </section>

        {/* Popular: one link to the page that already exists */}
        {showPopular && (
          <Link href="/popular" className="wl-popular">
            <span className="wl-popular-title">{t.cardsTitle}</span>
            <span className="wl-popular-cta">{t.viewAll} →</span>
          </Link>
        )}
      </div>
    </div>
  );
}