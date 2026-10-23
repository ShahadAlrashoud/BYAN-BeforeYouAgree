
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
    secureNote:
      "BYAN provides informational analysis, not legal advice.",
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

const ACCENT = "#6366f1";

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

function getScore(result: WebsiteResult): number | null {
  const raw = result.overallRiskScore ?? result.riskScore;

  if (raw === undefined || raw === null || raw === "") {
    return null;
  }

  const score = Number(raw);

  return Number.isFinite(score) && score >= 0 && score <= 100
    ? score
    : null;
}

function getRiskLevel(score: number, t: (typeof translations)["en"]) {
  if (score >= 70) {
    return { label: t.high, color: "#dc5252", background: "#feecec" };
  }

  if (score >= 40) {
    return { label: t.medium, color: "#a87916", background: "#fff5d9" };
  }

  return { label: t.low, color: "#218653", background: "#e5f8ed" };
}

export default function ComparePage() {
  const [url1, setUrl1] = useState("");
  const [url2, setUrl2] = useState("");
  const [result1, setResult1] = useState<WebsiteResult | null>(null);
  const [result2, setResult2] = useState<WebsiteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { theme, lang } = useTheme();
  const isDark = theme === "dark";
  const isAr = lang === "ar";
  const t = translations[isAr ? "ar" : "en"];

  const colors = {
    background: isDark ? "#0b1120" : "#f8fafc",
    card: isDark ? "#111827" : "#ffffff",
    heading: isDark ? "#f1f5f9" : "#1e293b",
    text: isDark ? "#cbd5e1" : "#475569",
    muted: isDark ? "#94a3b8" : "#64748b",
    border: isDark ? "#334155" : "#e2e8f0",
    input: isDark ? "#0f172a" : "#ffffff",
    subtle: isDark ? "#1e293b" : "#f1f5f9",
  };

  const page: CSSProperties = {
    minHeight: "70vh",
    padding: "48px 20px 72px",
    background: colors.background,
    color: colors.heading,
    direction: isAr ? "rtl" : "ltr",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    transition: "background 0.2s ease, color 0.2s ease",
  };

  const container: CSSProperties = {
    width: "100%",
    maxWidth: 1040,
    margin: "0 auto",
  };

  const card: CSSProperties = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: 18,
    padding: "28px",
    boxShadow: isDark
      ? "0 8px 30px rgba(0,0,0,0.15)"
      : "0 8px 30px rgba(15,23,42,0.04)",
  };

  const inputStyle: CSSProperties = {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 15px",
    borderRadius: 10,
    border: `1px solid ${colors.border}`,
    background: colors.input,
    color: colors.heading,
    fontSize: 15,
    outlineColor: ACCENT,
    marginTop: 9,
  };

  async function analyzeWebsite(url: string): Promise<WebsiteResult> {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || data.error || t.failed);
    }

    return {
      ...data,
      url: data.url || url,
    };
  }

  async function handleCompare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult1(null);
    setResult2(null);

    const firstUrl = normalizeUrl(url1);
    const secondUrl = normalizeUrl(url2);

    if (!url1.trim() || !url2.trim()) {
      setError(t.enterBoth);
      return;
    }

    if (!firstUrl) {
      setError(t.invalid1);
      return;
    }

    if (!secondUrl) {
      setError(t.invalid2);
      return;
    }

    if (
      new URL(firstUrl).hostname.toLowerCase() ===
      new URL(secondUrl).hostname.toLowerCase()
    ) {
      setError(t.different);
      return;
    }

    setLoading(true);

    try {
      const [firstResult, secondResult] = await Promise.all([
        analyzeWebsite(firstUrl),
        analyzeWebsite(secondUrl),
      ]);

      setResult1(firstResult);
      setResult2(secondResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.failed);
    } finally {
      setLoading(false);
    }
  }

  function renderResult(result: WebsiteResult, index: number) {
    const score = getScore(result);
    const risk = score === null ? null : getRiskLevel(score, t);
    const clauses = result.clauses ?? [];

    return (
      <article
        key={`${index}-${result.url}`}
        style={{ ...card, minWidth: 0 }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "6px 11px",
            borderRadius: 8,
            background: isDark ? "#25264a" : "#eef0ff",
            color: isDark ? "#c7c8ff" : ACCENT,
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 14,
          }}
        >
          {t.resultLabel} {index + 1}
        </div>

        <h2
          style={{
            fontSize: 19,
            fontWeight: 750,
            lineHeight: 1.5,
            margin: "0 0 5px",
            overflowWrap: "anywhere",
          }}
        >
          {result.websiteName || new URL(result.url).hostname}
        </h2>

        <p
          style={{
            fontSize: 13,
            color: colors.muted,
            margin: "0 0 24px",
            overflowWrap: "anywhere",
          }}
        >
          {result.url}
        </p>

        <div
          style={{
            padding: 20,
            borderRadius: 14,
            background: colors.subtle,
            marginBottom: 24,
          }}
        >
          <p
            style={{
              fontSize: 13,
              color: colors.muted,
              margin: "0 0 10px",
            }}
          >
            {t.score}
          </p>

          {score === null ? (
            <p style={{ margin: 0, color: colors.muted, fontSize: 14 }}>
              —
            </p>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 7,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: 42,
                    fontWeight: 800,
                    color: risk!.color,
                    lineHeight: 1.2,
                  }}
                >
                  {score}
                </span>
                <span style={{ color: colors.muted, fontSize: 13 }}>
                  / 100
                </span>
              </div>

              <span
                style={{
                  display: "inline-block",
                  marginTop: 10,
                  padding: "5px 10px",
                  borderRadius: 7,
                  background: isDark ? colors.card : risk!.background,
                  color: risk!.color,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {risk!.label}
              </span>

              <div
                style={{
                  height: 7,
                  background: colors.border,
                  borderRadius: 99,
                  overflow: "hidden",
                  marginTop: 16,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${score}%`,
                    background: risk!.color,
                    borderRadius: 99,
                  }}
                />
              </div>
            </>
          )}
        </div>

        <h3 style={{ fontSize: 15, fontWeight: 750, margin: "0 0 10px" }}>
          {t.summary}
        </h3>

        <p
          style={{
            fontSize: 14,
            lineHeight: 1.85,
            color: colors.text,
            margin: "0 0 24px",
            whiteSpace: "pre-wrap",
            overflowWrap: "anywhere",
          }}
        >
          {result.summary || t.noSummary}
        </p>

        <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 750, margin: "0 0 14px" }}>
            {t.differences}
          </h3>

          {clauses.length === 0 ? (
            <p style={{ fontSize: 13, color: colors.muted, lineHeight: 1.7 }}>
              {t.noClauses}
            </p>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {clauses.map((clause, clauseIndex) => {
                const rawRisk = clause.riskScore ?? clause.risk;
                const clauseScore =
                  rawRisk === undefined || rawRisk === null
                    ? null
                    : Number(rawRisk);
                const clauseRisk =
                  clauseScore !== null && Number.isFinite(clauseScore)
                    ? getRiskLevel(clauseScore, t)
                    : null;

                return (
                  <div
                    key={clauseIndex}
                    style={{
                      padding: 14,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 11,
                    }}
                  >
                    <p
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        margin: "0 0 7px",
                      }}
                    >
                      {clause.category || "General"}
                    </p>

                    <p
                      style={{
                        fontSize: 13,
                        lineHeight: 1.75,
                        color: colors.text,
                        margin: 0,
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {clause.text || t.noClauses}
                    </p>

                    {clauseRisk && clauseScore !== null && (
                      <p
                        style={{
                          fontSize: 12,
                          color: clauseRisk.color,
                          fontWeight: 700,
                          margin: "10px 0 0",
                        }}
                      >
                        {t.risk}: {clauseScore} — {clauseRisk.label}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </article>
    );
  }

  return (
    <main style={page}>
      <div style={container}>
        <header style={{ textAlign: "center", marginBottom: 36 }}>
          <div
            style={{
              display: "inline-flex",
              padding: "7px 13px",
              borderRadius: 99,
              background: isDark ? "#25264a" : "#eef0ff",
              color: ACCENT,
              fontWeight: 750,
              fontSize: 12,
              marginBottom: 17,
            }}
          >
            BYAN · {isAr ? "مقارنة السياسات" : "POLICY COMPARISON"}
          </div>

          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 40px)",
              fontWeight: 850,
              letterSpacing: "-0.7px",
              lineHeight: 1.25,
              margin: "0 0 14px",
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
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
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
              background: loading
                ? isDark
                  ? "#373b60"
                  : "#a5a6e9"
                : `linear-gradient(135deg, ${ACCENT}, #5365bc)`,
              color: "#ffffff",
              fontSize: 15,
              fontWeight: 750,
              cursor: loading ? "wait" : "pointer",
              boxShadow: "0 5px 14px rgba(99,102,241,0.18)",
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
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
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
