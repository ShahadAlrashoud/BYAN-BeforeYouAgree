"use client";

import type { FormEvent, CSSProperties } from "react";
import { useState } from "react";
import { useTheme } from "../providers";

type WebsiteResult = {
  url: string;
  websiteName?: string;
  riskScore?: number;
  overallRiskScore?: number;
  summary?: string;
  clauses?: {
    category?: string;
    text?: string;
    risk?: number | string;
    riskScore?: number | string;
  }[];
};

type SampleSite = {
  name: string;
  score: number;
  clauses: { category: string; text: string; level: "high" | "medium" | "low" }[];
};

const translations = {
  en: {
    title: "Compare Websites",
    subtitle:
      "Compare the Terms of Service and Privacy Policies of two websites.",
    first: "First website",
    second: "Second website",
    placeholder1: "e.g. example-shop.com",
    placeholder2: "e.g. sample-app.com",
    submit: "Compare these two sites",
    loading: "Analyzing both websites...",
    score: "Risk score",
    summary: "Summary",
    differences: "Policy findings",
    noSummary: "No summary is available.",
    noClauses: "No clause details were returned.",
    risk: "Risk",
    low: "Low risk",
    medium: "Moderate Risk",
    high: "High risk",
    enterBoth: "Please enter both website URLs.",
    invalid1: "Please enter a valid URL for the first website.",
    invalid2: "Please enter a valid URL for the second website.",
    different: "Please enter two different website URLs.",
    failed: "Unable to compare the websites. Please try again.",
    resultLabel: "Website",
    secureNote: "BYAN provides informational analysis, not legal advice.",

    howTitle: "How to compare",
    howSteps: [
      "Enter the address of the first website.",
      "Enter the address of a second website.",
      "Press “Compare these two sites” to see scores and flagged clauses side by side.",
    ],
    useSample: "Fill in the sample pair",

    sampleLabel: "Sample",
    sampleTitle: "Sample comparison",
    sampleNote:
      "Illustrative example with fictional services. These are not findings about real websites.",
    sampleSites: [
      {
        name: "example-shop.com",
        score: 28,
        clauses: [
          { category: "Data sharing", text: "Shares data only with payment and delivery providers.", level: "low" },
          { category: "Renewal", text: "No automatic renewal.", level: "low" },
          { category: "Disputes", text: "Disputes handled in local courts.", level: "medium" },
        ],
      },
      {
        name: "sample-app.com",
        score: 74,
        clauses: [
          { category: "Data sharing", text: "May share data with advertising partners.", level: "high" },
          { category: "Renewal", text: "Subscription renews automatically each period.", level: "medium" },
          { category: "Disputes", text: "Mandatory private arbitration.", level: "high" },
        ],
      },
    ] as SampleSite[],
    sampleDiffTitle: "Key differences in this sample",
    sampleDiffs: [
      "Data sharing: the second service shares more widely.",
      "Disputes: the first uses local courts, the second uses arbitration.",
      "Renewal: only the second renews automatically.",
    ],
  },
  ar: {
    title: "مقارنة المواقع",
    subtitle: "قارن بين شروط الخدمة وسياسات الخصوصية لموقعين.",
    first: "الموقع الأول",
    second: "الموقع الثاني",
    placeholder1: "مثال: example-shop.com",
    placeholder2: "مثال: sample-app.com",
    submit: "قارن بين هذين الموقعين",
    loading: "جارٍ تحليل الموقعين...",
    score: "درجة المخاطر",
    summary: "الملخص",
    differences: "نتائج تحليل السياسات",
    noSummary: "لا يتوفر ملخص.",
    noClauses: "لم يتم إرجاع تفاصيل البنود.",
    risk: "المخاطر",
    low: "مخاطر منخفضة",
    medium: "مخاطر متوسطة",
    high: "مخاطر مرتفعة",
    enterBoth: "يرجى إدخال رابطَي الموقعين.",
    invalid1: "يرجى إدخال رابط صحيح للموقع الأول.",
    invalid2: "يرجى إدخال رابط صحيح للموقع الثاني.",
    different: "يرجى إدخال رابطين مختلفين.",
    failed: "تعذرت مقارنة الموقعين. حاول مرة أخرى.",
    resultLabel: "الموقع",
    secureNote: "يقدم بيان تحليلاً معلوماتياً ولا يُعد استشارة قانونية.",

    howTitle: "كيف تقارن",
    howSteps: [
      "أدخل عنوان الموقع الأول.",
      "أدخل عنوان موقع ثانٍ.",
      "اضغط «قارن بين هذين الموقعين» لعرض الدرجات والبنود المهمة جنبًا إلى جنب.",
    ],
    useSample: "املأ الحقلين بالمثال",

    sampleLabel: "نموذج",
    sampleTitle: "مقارنة نموذجية",
    sampleNote:
      "مثال توضيحي لخدمات وهمية، وليست نتائج عن مواقع حقيقية.",
    sampleSites: [
      {
        name: "example-shop.com",
        score: 28,
        clauses: [
          { category: "مشاركة البيانات", text: "تُشارك البيانات فقط مع مزوّدي الدفع والتوصيل.", level: "low" },
          { category: "التجديد", text: "لا يوجد تجديد تلقائي.", level: "low" },
          { category: "النزاعات", text: "تُنظر النزاعات أمام المحاكم المحلية.", level: "medium" },
        ],
      },
      {
        name: "sample-app.com",
        score: 74,
        clauses: [
          { category: "مشاركة البيانات", text: "قد تُشارك البيانات مع شركاء إعلانيين.", level: "high" },
          { category: "التجديد", text: "يتجدد الاشتراك تلقائيًا كل فترة.", level: "medium" },
          { category: "النزاعات", text: "تحكيم خاص إلزامي.", level: "high" },
        ],
      },
    ] as SampleSite[],
    sampleDiffTitle: "أبرز الفروق في هذا النموذج",
    sampleDiffs: [
      "مشاركة البيانات: الخدمة الثانية تشارك بيانات أكثر.",
      "النزاعات: الأولى تعتمد المحاكم المحلية، والثانية تعتمد التحكيم.",
      "التجديد: الثانية فقط تتجدد تلقائيًا.",
    ],
  },
};

type T = (typeof translations)["en"];

function normalizeUrl(value: string): string | null {
  let input = value.trim();

  if (!input) return null;

  if (!/^https?:\/\//i.test(input)) {
    input = `https://${input}`;
  }

  try {
    const parsed = new URL(input);

    if (
      !["http:", "https:"].includes(parsed.protocol) ||
      !parsed.hostname.includes(".") ||
      parsed.hostname.startsWith(".") ||
      parsed.hostname.endsWith(".")
    ) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function getScore(result: WebsiteResult): number | null {
  const raw: unknown = result.overallRiskScore ?? result.riskScore;

  if (raw === undefined || raw === null || raw === "") {
    return null;
  }

  const score = Number(raw);

  return Number.isFinite(score) && score >= 0 && score <= 100 ? score : null;
}

// Light-mode amber is darkened for readable contrast; dark mode keeps the brighter tones.
function levelColors(isDark: boolean) {
  return {
    high: isDark ? "#f08a8a" : "#b83a3a",
    medium: isDark ? "#e0b44a" : "#8a5f0a",
    low: isDark ? "#5ccf94" : "#1a6e45",
  };
}

function getRiskLevel(score: number, t: T, isDark: boolean) {
  const c = levelColors(isDark);

  if (score >= 70) {
    return { key: "high" as const, label: t.high, color: c.high, background: "#feecec", symbol: "▲" };
  }

  if (score >= 40) {
    return { key: "medium" as const, label: t.medium, color: c.medium, background: "#fff5d9", symbol: "●" };
  }

  return { key: "low" as const, label: t.low, color: c.low, background: "#e6f7ee", symbol: "✓" };
}

function getClauseScore(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export default function ComparePage() {
  const [url1, setUrl1] = useState("");
  const [url2, setUrl2] = useState("");
  const [result1, setResult1] = useState<WebsiteResult | null>(null);
  const [result2, setResult2] = useState<WebsiteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { theme, lang, colors: themeColors } = useTheme();
  const isDark = theme === "dark";
  const isAr = lang === "ar";
  const t = translations[isAr ? "ar" : "en"];
  const lvl = levelColors(isDark);

  // Page-specific neutral tokens (accents come from themeColors)
  const colors = {
    background: isDark ? "#0b1120" : "#f8fafc",
    card: isDark ? "#111827" : "#ffffff",
    heading: isDark ? "#f1f5f9" : "#1e293b",
    text: isDark ? "#cbd5e1" : "#475569",
    muted: isDark ? "#94a3b8" : "#5b6b80",
    border: isDark ? "#334155" : "#e2e8f0",
    input: isDark ? "#0f172a" : "#ffffff",
  };

  const page: CSSProperties = {
    minHeight: "100vh",
    background: colors.background,
    color: colors.text,
    padding: "56px 20px 80px",
    direction: isAr ? "rtl" : "ltr",
    textAlign: isAr ? "right" : "left",
  };

  const container: CSSProperties = {
    maxWidth: 1040,
    margin: "0 auto",
  };

  const card: CSSProperties = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: 18,
    padding: 26,
    boxShadow: isDark
      ? "0 6px 24px rgba(0,0,0,0.25)"
      : "0 6px 24px rgba(15,23,42,0.06)",
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    marginTop: 8,
    padding: "13px 14px",
    borderRadius: 10,
    border: `1px solid ${colors.border}`,
    background: colors.input,
    color: colors.heading,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  };

  async function analyzeWebsite(url: string): Promise<WebsiteResult> {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, lang }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        String(data.error || data.message || t.failed).replace(
          /^BLOCKED:\s*/,
          ""
        )
      );
    }

    const res = await fetch(`/api/result/${data.id}`);
    const full = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(full.error || t.failed);
    }

    return {
      url: full.url || url,
      riskScore: full.riskScore,
      summary: full.summaryEn ?? full.summary,
      clauses: (full.clauses ?? []).map(
        (c: { category?: string; text?: string; riskWeight?: number }) => ({
          category: c.category,
          text: c.text,
          risk: c.riskWeight,
        })
      ),
    };
  }

  async function handleCompare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setResult1(null);
    setResult2(null);

    if (!url1.trim() || !url2.trim()) {
      setError(t.enterBoth);
      return;
    }

    const normalized1 = normalizeUrl(url1);
    const normalized2 = normalizeUrl(url2);

    if (!normalized1) {
      setError(t.invalid1);
      return;
    }

    if (!normalized2) {
      setError(t.invalid2);
      return;
    }

    if (getHostname(normalized1) === getHostname(normalized2)) {
      setError(t.different);
      return;
    }

    setLoading(true);

    try {
      const [first, second] = await Promise.all([
        analyzeWebsite(normalized1),
        analyzeWebsite(normalized2),
      ]);

      setResult1(first);
      setResult2(second);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.failed);
    } finally {
      setLoading(false);
    }
  }

  function renderResult(result: WebsiteResult, index: number) {
    const score = getScore(result);
    const level = score !== null ? getRiskLevel(score, t, isDark) : null;
    const clauses = result.clauses ?? [];

    return (
      <article key={index} style={card}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: themeColors.accentText,
            marginBottom: 8,
          }}
        >
          {t.resultLabel} {isAr ? (index + 1).toLocaleString("ar-SA") : index + 1}
        </div>

        <h2
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: colors.heading,
            margin: "0 0 18px",
            wordBreak: "break-word",
          }}
        >
          {result.websiteName || getHostname(result.url)}
        </h2>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: colors.muted }}>{t.score}</div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 850,
                color: level ? level.color : colors.muted,
                lineHeight: 1.1,
              }}
            >
              {score !== null ? score : "—"}
              {score !== null && (
                <span style={{ fontSize: 14, color: colors.muted }}> /100</span>
              )}
            </div>
          </div>

          {level && (
            <span
              style={{
                padding: "6px 14px",
                borderRadius: 99,
                background: isDark ? "transparent" : level.background,
                border: `1px solid ${level.color}`,
                color: level.color,
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              <span aria-hidden="true">{level.symbol} </span>
              {level.label}
            </span>
          )}
        </div>

        <h3
          style={{
            fontSize: 15,
            fontWeight: 750,
            color: colors.heading,
            margin: "0 0 8px",
          }}
        >
          {t.summary}
        </h3>
        <p style={{ fontSize: 14, lineHeight: 1.8, margin: "0 0 22px" }}>
          {result.summary?.trim() || t.noSummary}
        </p>

        <h3
          style={{
            fontSize: 15,
            fontWeight: 750,
            color: colors.heading,
            margin: "0 0 10px",
          }}
        >
          {t.differences}
        </h3>

        {clauses.length === 0 ? (
          <p style={{ fontSize: 13, color: colors.muted, margin: 0 }}>
            {t.noClauses}
          </p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {clauses.map((clause, i) => {
              const clauseScore = getClauseScore(
                clause.riskScore ?? clause.risk
              );

              const clauseRisk =
                clauseScore === null || !Number.isFinite(clauseScore)
                  ? null
                  : clauseScore >= 15
                  ? { color: lvl.high, label: t.high, symbol: "▲" }
                  : clauseScore >= 8
                  ? { color: lvl.medium, label: t.medium, symbol: "●" }
                  : { color: lvl.low, label: t.low, symbol: "✓" };

              return (
                <div
                  key={i}
                  style={{
                    border: `1px solid ${colors.border}`,
                    borderRadius: 12,
                    padding: "12px 14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 6,
                      flexWrap: "wrap",
                    }}
                  >
                    <strong style={{ fontSize: 13, color: colors.heading }}>
                      {clause.category || "—"}
                    </strong>

                    {clauseRisk && (
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: clauseRisk.color,
                        }}
                      >
                        <span aria-hidden="true">{clauseRisk.symbol} </span>
                        {t.risk}: {clauseRisk.label}
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                    {clause.text || "—"}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </article>
    );
  }

  const levelLabel = { high: t.high, medium: t.medium, low: t.low };
  const levelSymbol = { high: "▲", medium: "●", low: "✓" };

  return (
    <div style={page}>
      <div style={container}>
        <header style={{ textAlign: "center", marginBottom: 36 }}>
          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 40px)",
              fontWeight: 850,
              letterSpacing: isAr ? 0 : "-0.7px",
              lineHeight: 1.25,
              margin: "0 0 14px",
              color: colors.heading,
            }}
          >
            {t.title}
          </h1>

          <p
            style={{
              color: colors.muted,
              fontSize: 15,
              lineHeight: 1.8,
              maxWidth: 620,
              margin: "0 auto",
            }}
          >
            {t.subtitle}
          </p>
        </header>

        {/* How to compare */}
        <section
          aria-labelledby="how-to-compare"
          style={{ ...card, marginBottom: 24, padding: 22 }}
        >
          <h2
            id="how-to-compare"
            style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 800, color: colors.heading }}
          >
            {t.howTitle}
          </h2>
          <ol style={{ margin: "0 0 14px", paddingInlineStart: 22, fontSize: 14, lineHeight: 1.9 }}>
            {t.howSteps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <button
            type="button"
            onClick={() => {
              setUrl1(t.sampleSites[0].name);
              setUrl2(t.sampleSites[1].name);
            }}
            style={{
              border: "none",
              background: "transparent",
              padding: "4px 0",
              color: themeColors.accentText,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            {t.useSample}
          </button>
        </section>

        <form onSubmit={handleCompare} style={{ ...card, marginBottom: 30 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
              gap: 22,
            }}
          >
            <div>
              <label
                htmlFor="compare-url-1"
                style={{ fontSize: 14, fontWeight: 700 }}
              >
                {t.first}
              </label>
              <input
                id="compare-url-1"
                type="text"
                inputMode="url"
                autoComplete="url"
                value={url1}
                onChange={(event) => setUrl1(event.target.value)}
                placeholder={t.placeholder1}
                style={inputStyle}
                disabled={loading}
                dir="ltr"
              />
            </div>

            <div>
              <label
                htmlFor="compare-url-2"
                style={{ fontSize: 14, fontWeight: 700 }}
              >
                {t.second}
              </label>
              <input
                id="compare-url-2"
                type="text"
                inputMode="url"
                autoComplete="url"
                value={url2}
                onChange={(event) => setUrl2(event.target.value)}
                placeholder={t.placeholder2}
                style={inputStyle}
                disabled={loading}
                dir="ltr"
              />
            </div>
          </div>

          {error && (
            <div
              role="alert"
              style={{
                color: isDark ? "#fca5a5" : "#b91c1c",
                background: isDark ? "#351b28" : "#fef2f2",
                border: `1px solid ${isDark ? "#7f1d35" : "#fecaca"}`,
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: 13,
                lineHeight: 1.6,
                marginTop: 20,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: 24,
              padding: "15px 20px",
              border: "none",
              borderRadius: 11,
              background: themeColors.accent,
              color: themeColors.onAccent,
              opacity: loading ? 0.6 : 1,
              fontSize: 15,
              fontWeight: 750,
              cursor: loading ? "wait" : "pointer",
              boxShadow: `0 0 0 5px ${themeColors.accentSoft}`,
              transition: "opacity 0.2s ease",
            }}
          >
            {loading ? t.loading : t.submit}
          </button>
        </form>

        {loading && (
          <p
            role="status"
            style={{
              textAlign: "center",
              color: colors.muted,
              padding: 20,
              fontSize: 14,
            }}
          >
            {t.loading}
          </p>
        )}

        {result1 && result2 ? (
          <section aria-label={t.differences}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
                gap: 22,
                alignItems: "start",
              }}
            >
              {renderResult(result1, 0)}
              {renderResult(result2, 1)}
            </div>
          </section>
        ) : (
          !loading && (
            /* Static sample comparison (shown until a real comparison runs) */
            <section aria-labelledby="sample-compare">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                  marginBottom: 6,
                }}
              >
                <h2
                  id="sample-compare"
                  style={{ margin: 0, fontSize: 18, fontWeight: 800, color: colors.heading }}
                >
                  {t.sampleTitle}
                </h2>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 800,
                    background: themeColors.accentSoft,
                    color: themeColors.accentText,
                    border: `1px solid ${themeColors.accent}`,
                  }}
                >
                  {t.sampleLabel}
                </span>
              </div>
              <p style={{ margin: "0 0 16px", fontSize: 13, color: colors.muted }}>
                {t.sampleNote}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
                  gap: 22,
                  alignItems: "start",
                  marginBottom: 18,
                }}
              >
                {t.sampleSites.map((site, i) => {
                  const lv = getRiskLevel(site.score, t, isDark);
                  return (
                    <article key={site.name} style={{ ...card, borderStyle: "dashed" }}>
                      <h3
                        dir="ltr"
                        style={{
                          margin: "0 0 12px",
                          fontSize: 18,
                          fontWeight: 800,
                          color: colors.heading,
                          textAlign: isAr ? "right" : "left",
                        }}
                      >
                        {site.name}
                      </h3>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                        <div style={{ fontSize: 34, fontWeight: 850, color: lv.color, lineHeight: 1.1 }}>
                          {isAr ? site.score.toLocaleString("ar-SA") : site.score}
                          <span style={{ fontSize: 14, color: colors.muted }}>
                            {" "}/{isAr ? (100).toLocaleString("ar-SA") : 100}
                          </span>
                        </div>
                        <span
                          style={{
                            padding: "5px 12px",
                            borderRadius: 99,
                            border: `1px solid ${lv.color}`,
                            color: lv.color,
                            fontWeight: 700,
                            fontSize: 13,
                          }}
                        >
                          <span aria-hidden="true">{lv.symbol} </span>
                          {lv.label}
                        </span>
                      </div>
                      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 10 }}>
                        {site.clauses.map((c) => (
                          <li
                            key={c.category}
                            style={{
                              border: `1px solid ${colors.border}`,
                              borderRadius: 12,
                              padding: "10px 14px",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                              <strong style={{ fontSize: 13, color: colors.heading }}>{c.category}</strong>
                              <span style={{ fontSize: 12, fontWeight: 700, color: lvl[c.level] }}>
                                <span aria-hidden="true">{levelSymbol[c.level]} </span>
                                {t.risk}: {levelLabel[c.level]}
                              </span>
                            </div>
                            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7 }}>{c.text}</p>
                          </li>
                        ))}
                      </ul>
                    </article>
                  );
                })}
              </div>

              <div style={{ ...card, padding: 20 }}>
                <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 800, color: colors.heading }}>
                  {t.sampleDiffTitle}
                </h3>
                <ul style={{ margin: 0, paddingInlineStart: 20, fontSize: 14, lineHeight: 1.9 }}>
                  {t.sampleDiffs.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>
            </section>
          )
        )}

        <p
          style={{
            textAlign: "center",
            color: colors.muted,
            fontSize: 12,
            lineHeight: 1.8,
            margin: "32px auto 0",
            maxWidth: 650,
          }}
        >
          {t.secureNote}
        </p>
      </div>
    </div>
  );
}