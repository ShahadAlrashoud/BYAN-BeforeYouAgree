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

const translations = {
  en: {
    title: "Compare Websites",
    subtitle:
      "Compare the Terms of Service and Privacy Policies of two websites.",
    first: "First website",
    second: "Second website",
    placeholder1: "https://example.com",
    placeholder2: "https://example.org",
    submit: "Compare websites",
    loading: "Analyzing both websites...",
    score: "Risk score",
    summary: "Summary",
    differences: "Policy findings",
    noSummary: "No summary is available.",
    noClauses: "No clause details were returned.",
    risk: "Risk",
    low: "Low risk",
    medium: "Medium risk",
    high: "High risk",
    enterBoth: "Please enter both website URLs.",
    invalid1: "Please enter a valid URL for the first website.",
    invalid2: "Please enter a valid URL for the second website.",
    different: "Please enter two different website URLs.",
    failed: "Unable to compare the websites. Please try again.",
    resultLabel: "Website",
    intro: "See how two websites compare before you agree.",
    secureNote: "BYAN provides informational analysis, not legal advice.",
    back: "Analyze a website",
  },
  ar: {
    title: "مقارنة المواقع",
    subtitle: "قارن بين شروط الخدمة وسياسات الخصوصية لموقعين.",
    first: "الموقع الأول",
    second: "الموقع الثاني",
    placeholder1: "https://example.com",
    placeholder2: "https://example.org",
    submit: "قارن بين الموقعين",
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
    intro: "قارن بين الموقعين قبل الموافقة على شروطهما.",
    secureNote: "يقدم بيان تحليلاً معلوماتياً ولا يُعد استشارة قانونية.",
    back: "تحليل موقع",
  },
};

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

function getRiskLevel(score: number, t: (typeof translations)["en"]) {
  if (score >= 70) {
    return { label: t.high, color: "#dc5252", background: "#feecec" };
  }

  if (score >= 40) {
    return { label: t.medium, color: "#a87916", background: "#fff5d9" };
  }

  return { label: t.low, color: "#218653", background: "#e6f7ee" };
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

  // Page-specific neutral tokens (accents come from themeColors)
  const colors = {
    background: isDark ? "#0b1120" : "#f8fafc",
    card: isDark ? "#111827" : "#ffffff",
    heading: isDark ? "#f1f5f9" : "#1e293b",
    text: isDark ? "#cbd5e1" : "#475569",
    muted: isDark ? "#94a3b8" : "#64748b",
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
    const level = score !== null ? getRiskLevel(score, t) : null;
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
          {t.resultLabel} {index + 1}
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
                  ? { color: "#dc5252", label: t.high }
                  : clauseScore >= 8
                  ? { color: "#a87916", label: t.medium }
                  : { color: "#218653", label: t.low };

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

  return (
    <main style={page}>
      <div style={container}>
        <header style={{ textAlign: "center", marginBottom: 36 }}>
  

          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 40px)",
              fontWeight: 850,
              letterSpacing: "-0.7px",
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

        {result1 && result2 && (
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
    </main>
  );
}