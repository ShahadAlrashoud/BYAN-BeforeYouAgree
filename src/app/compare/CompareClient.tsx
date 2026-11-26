"use client";

import type { CSSProperties, FormEvent } from "react";
import { Fragment, useState } from "react";
import { useTheme } from "../providers";

type Level = "high" | "medium" | "low";

type Finding = {
  category: string;
  text: string;
  level: Level | null;
  score: number | null;
};

type ApiResult = {
  url?: string;
  summaryEn?: string;
  summaryAr?: string;
  summary?: string;
  coverage?: { analyzedChars: number; totalChars: number };
  clauses?: { category?: string; text?: string; riskWeight?: number | string }[];
};

type WebsiteResult = {
  url: string;
  websiteName?: string;
  summary?: string;
  coverage?: { analyzedChars: number; totalChars: number };
  clauses?: { category?: string; text?: string; risk?: number | string }[];
};

type Slot =
  | { kind: "result"; url: string; result: WebsiteResult }
  | { kind: "error"; url: string; message: string };

class AnalysisError extends Error {}

const translations = {
  en: {
    title: "Compare Websites",
    subtitle: "Compare the Terms of Service and Privacy Policies of two websites.",
    first: "First website",
    second: "Second website",
    placeholder1: "e.g. example-shop.com",
    placeholder2: "e.g. sample-app.com",
    submit: "Compare these two sites",
    loading: "Analyzing both websites...",
    summary: "Summary",
    differences: "Policy findings",
    noSummary: "No summary is available.",
    noClauses: "No clause details were returned.",
    low: "Low risk",
    medium: "Moderate risk",
    high: "High risk",
    enterBoth: "Please enter both website URLs.",
    invalid1: "Please enter a valid URL for the first website.",
    invalid2: "Please enter a valid URL for the second website.",
    different: "Please enter two different website URLs.",
    failed: "Unable to compare the websites. Please try again.",
    blocked: "This website could not be analyzed.",
    helperUrl: "Enter the website address as shown in your browser's address bar.",
    comparabilityNote: "Policies of different types of services may not be directly comparable.",
    coverage: (a: number, b: number) =>
      `Read ${a.toLocaleString("en-US")} of ${b.toLocaleString("en-US")} characters.`,
    resultLabel: "Website",
    resultsTitle: "Comparison results",
    secureNote: "Automated analysis. Not legal advice.",

    howTitle: "How to compare",
    howSteps: [
      "Enter the address of the first website.",
      "Enter the address of a second website.",
      "Press “Compare these two sites” to compare their risk categories side by side.",
    ],
    useSample: "Fill in the sample pair",

    sampleLabel: "Example only",
    sampleTitle: "Sample comparison",
    sampleNote:
      "Illustrative example with fictional services, not real websites. Key differences are generated from detected clauses and may not capture the full policy.",
    sampleSites: [
      {
        name: "example-shop.com",
        clauses: [
          { category: "Data sharing", text: "Shares data only with payment and delivery providers.", level: "low" },
          { category: "Renewal", text: "No automatic renewal.", level: "low" },
          { category: "Disputes", text: "Disputes handled in local courts.", level: "medium" },
        ],
      },
      {
        name: "sample-app.com",
        clauses: [
          { category: "Data sharing", text: "May share data with advertising partners.", level: "high" },
          { category: "Renewal", text: "Subscription renews automatically each period.", level: "medium" },
          { category: "Disputes", text: "Mandatory private arbitration.", level: "high" },
        ],
      },
    ] as const,
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
    summary: "الملخص",
    differences: "نتائج تحليل السياسات",
    noSummary: "لا يتوفر ملخص.",
    noClauses: "لم يتم إرجاع تفاصيل البنود.",
    low: "منخفضة المخاطر",
    medium: "متوسطة المخاطر",
    high: "عالية المخاطر",
    enterBoth: "يرجى إدخال رابطَي الموقعين.",
    invalid1: "يرجى إدخال رابط صحيح للموقع الأول.",
    invalid2: "يرجى إدخال رابط صحيح للموقع الثاني.",
    different: "يرجى إدخال رابطين مختلفين.",
    failed: "تعذرت مقارنة الموقعين. حاول مرة أخرى.",
    blocked: "تعذر تحليل هذا الموقع.",
    helperUrl: "أدخل عنوان الموقع كما يظهر في شريط عناوين المتصفح.",
    comparabilityNote: "قد لا تكون سياسات أنواع الخدمات المختلفة قابلة للمقارنة بشكل مباشر.",
    coverage: (a: number, b: number) =>
      `تمت قراءة ${a.toLocaleString("ar-SA")} من ${b.toLocaleString("ar-SA")} حرفًا.`,
    resultLabel: "الموقع",
    resultsTitle: "نتائج المقارنة",
    secureNote: "تحليل آلي. ليس استشارة قانونية.",

    howTitle: "كيف تقارن",
    howSteps: [
      "أدخل عنوان الموقع الأول.",
      "أدخل عنوان موقع ثانٍ.",
      "اضغط «قارن بين هذين الموقعين» لعرض الفئات والبنود المهمة جنبًا إلى جنب.",
    ],
    useSample: "املأ الحقلين بالمثال",

    sampleLabel: "مثال توضيحي فقط",
    sampleTitle: "مقارنة نموذجية",
    sampleNote:
      "مثال توضيحي لخدمات وهمية، وليست نتائج لمواقع حقيقية. تُنشأ الفروق الرئيسية من البنود المكتشفة وقد لا تشمل السياسة كاملة.",
    sampleSites: [
      {
        name: "example-shop.com",
        clauses: [
          { category: "مشاركة البيانات", text: "تُشارك البيانات فقط مع مزوّدي الدفع والتوصيل.", level: "low" },
          { category: "التجديد", text: "لا يوجد تجديد تلقائي.", level: "low" },
          { category: "النزاعات", text: "تُنظر النزاعات أمام المحاكم المحلية.", level: "medium" },
        ],
      },
      {
        name: "sample-app.com",
        clauses: [
          { category: "مشاركة البيانات", text: "قد تُشارك البيانات مع شركاء إعلانيين.", level: "high" },
          { category: "التجديد", text: "يتجدد الاشتراك تلقائيًا كل فترة.", level: "medium" },
          { category: "النزاعات", text: "تحكيم خاص إلزامي.", level: "high" },
        ],
      },
    ] as const,
    sampleDiffTitle: "أبرز الفروق في هذا النموذج",
    sampleDiffs: [
      "مشاركة البيانات: الخدمة الثانية تشارك بيانات أكثر.",
      "النزاعات: الأولى تعتمد المحاكم المحلية، والثانية تعتمد التحكيم.",
      "التجديد: الثانية فقط تتجدد تلقائيًا.",
    ],
  },
};

type T = (typeof translations)["en"];

// Clause risk thresholds (0–100).
const THRESHOLDS = { high: 70, medium: 40 };

// Marker position on the bar when a clause has no numeric score (0–100).
const LEVEL_POSITION: Record<Level, number> = { low: 15, medium: 50, high: 85 };

const SYMBOLS: Record<Level, string> = { high: "▲", medium: "●", low: "✓" };

function levelFromScore(score: number): Level {
  if (score >= THRESHOLDS.high) return "high";
  if (score >= THRESHOLDS.medium) return "medium";
  return "low";
}

function parseScore(raw: unknown): number | null {
  if (raw === undefined || raw === null || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : null;
}

// Light-mode colors are darkened for contrast; dark mode keeps brighter tones.
function palette(isDark: boolean): Record<Level, { color: string; background: string }> {
  return {
    high: { color: isDark ? "#f08a8a" : "#b83a3a", background: "#feecec" },
    medium: { color: isDark ? "#e0b44a" : "#8a5f0a", background: "#fff5d9" },
    low: { color: isDark ? "#5ccf94" : "#1a6e45", background: "#e6f7ee" },
  };
}

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

function RiskBadge({
  level,
  label,
  isDark,
  small = false,
}: {
  level: Level;
  label: string;
  isDark: boolean;
  small?: boolean;
}) {
  const p = palette(isDark)[level];
  return (
    <span
      style={{
        display: "inline-block",
        padding: small ? "4px 10px" : "6px 14px",
        borderRadius: 99,
        background: isDark ? "transparent" : p.background,
        border: `1px solid ${p.color}`,
        color: p.color,
        fontWeight: 700,
        fontSize: small ? 12 : 13,
        whiteSpace: "nowrap",
      }}
    >
      <span aria-hidden="true">{SYMBOLS[level]} </span>
      {label}
    </span>
  );
}

function RiskBar({
  value,
  level,
  isDark,
  isAr,
  borderColor,
  mutedColor,
  labels,
}: {
  value: number;
  level: Level;
  isDark: boolean;
  isAr: boolean;
  borderColor: string;
  mutedColor: string;
  labels: [string, string, string];
}) {
  const position = Math.min(100, Math.max(0, value));
  const markerColor = palette(isDark)[level].color;

  // Green (low risk) starts at the inline-start edge, red (high risk) at the end.
  const gradient = isAr
    ? "linear-gradient(to left, #1a6e45, #c9a227, #b83a3a)"
    : "linear-gradient(to right, #1a6e45, #c9a227, #b83a3a)";

  return (
    <div aria-hidden="true" style={{ padding: "4px 0 0" }}>
      <div
        style={{
          position: "relative",
          height: 12,
          borderRadius: 99,
          background: gradient,
          border: `1px solid ${borderColor}`,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "50%",
            insetInlineStart: `calc(${position}% - 9px)`,
            transform: "translateY(-50%)",
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#ffffff",
            border: `3px solid ${markerColor}`,
            boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
            boxSizing: "border-box",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: mutedColor,
          marginTop: 6,
        }}
      >
        <span>{labels[0]}</span>
        <span>{labels[1]}</span>
        <span>{labels[2]}</span>
      </div>
    </div>
  );
}

export default function ComparePage() {
  const [url1, setUrl1] = useState("");
  const [url2, setUrl2] = useState("");
  const [slots, setSlots] = useState<[Slot | null, Slot | null]>([null, null]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { theme, lang, colors: themeColors } = useTheme();
  const isDark = theme === "dark";
  const isAr = lang === "ar";
  const t: T = translations[isAr ? "ar" : "en"];
  const locale = isAr ? "ar-SA" : "en-US";

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

  const container: CSSProperties = { maxWidth: 1040, margin: "0 auto" };

  const card: CSSProperties = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: 18,
    padding: 26,
    boxShadow: isDark ? "0 6px 24px rgba(0,0,0,0.25)" : "0 6px 24px rgba(15,23,42,0.06)",
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

  const errorBox: CSSProperties = {
    color: isDark ? "#fca5a5" : "#b91c1c",
    background: isDark ? "#351b28" : "#fef2f2",
    border: `1px solid ${isDark ? "#7f1d35" : "#fecaca"}`,
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: 13,
    lineHeight: 1.6,
  };

  const subHeading: CSSProperties = {
    fontSize: 15,
    fontWeight: 750,
    color: colors.heading,
    margin: "0 0 8px",
  };

  const hasResults = slots.some((s) => s !== null);

  const fieldErrors = {
    first: error !== "" && [t.enterBoth, t.invalid1, t.different].includes(error),
    second: error !== "" && [t.enterBoth, t.invalid2, t.different].includes(error),
  };
  const describedBy = error ? "url-helper form-error" : "url-helper";

  async function analyzeWebsite(url: string): Promise<WebsiteResult> {
    let response: Response;
    try {
      response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, lang }),
      });
    } catch {
      throw new AnalysisError(t.failed);
    }

    const data: { id?: string; error?: unknown } = await response
      .json()
      .catch(() => ({}));

    if (!response.ok) {
      const code = typeof data.error === "string" ? data.error : "";
      throw new AnalysisError(code.startsWith("BLOCKED") ? t.blocked : t.failed);
    }

    if (!data.id) {
      throw new AnalysisError(t.failed);
    }

    let res: Response;
    try {
      res = await fetch(`/api/result/${encodeURIComponent(data.id)}`);
    } catch {
      throw new AnalysisError(t.failed);
    }

    const full: ApiResult = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new AnalysisError(t.failed);
    }

    return {
      url: full.url || url,
      summary: isAr ? (full.summaryAr ?? full.summary) : (full.summaryEn ?? full.summary),
      coverage: full.coverage,
      clauses: (full.clauses ?? []).map((c) => ({
        category: c.category,
        text: c.text,
        risk: c.riskWeight,
      })),
    };
  }

  async function handleCompare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setSlots([null, null]);

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

    const urls = [normalized1, normalized2];
    const settled = await Promise.allSettled([
      analyzeWebsite(normalized1),
      analyzeWebsite(normalized2),
    ]);

    // Keep a successful result even if the other site failed.
    const next = settled.map((s, i): Slot =>
      s.status === "fulfilled"
        ? { kind: "result", url: urls[i], result: s.value }
        : {
            kind: "error",
            url: urls[i],
            message: s.reason instanceof AnalysisError ? s.reason.message : t.failed,
          }
    ) as [Slot, Slot];

    setSlots(next);
    setLoading(false);
  }

  function fillSample() {
    setUrl1(t.sampleSites[0].name);
    setUrl2(t.sampleSites[1].name);
    setError("");
    setSlots([null, null]);
  }

  function renderSiteCard(site: {
    label?: string;
    name: string;
    coverage?: { analyzedChars: number; totalChars: number };
    summary?: string;
    findings: Finding[];
  }) {
    return (
      <article style={card}>
        {site.label && (
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: themeColors.accentText,
              marginBottom: 6,
            }}
          >
            {site.label}
          </div>
        )}

        <h3
          dir="ltr"
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: colors.heading,
            margin: "0 0 14px",
            wordBreak: "break-word",
            textAlign: isAr ? "right" : "left",
          }}
        >
          {site.name}
        </h3>

        {site.coverage && (
          <p style={{ margin: "0 0 18px", fontSize: 12, color: colors.muted }}>
            {t.coverage(site.coverage.analyzedChars, site.coverage.totalChars)}
          </p>
        )}

        {site.summary !== undefined && (
          <>
            <h4 style={subHeading}>{t.summary}</h4>
            <p style={{ fontSize: 14, lineHeight: 1.8, margin: "0 0 22px" }}>
              {site.summary}
            </p>
          </>
        )}

        <h4 style={subHeading}>{t.differences}</h4>

        {site.findings.length === 0 ? (
          <p style={{ fontSize: 13, color: colors.muted, margin: 0 }}>{t.noClauses}</p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 12 }}>
            {site.findings.map((f, i) => (
              <li
                key={`${f.category}-${i}`}
                style={{
                  border: `1px solid ${colors.border}`,
                  borderRadius: 14,
                  padding: "14px 16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                    flexWrap: "wrap",
                    marginBottom: 6,
                  }}
                >
                  <strong style={{ fontSize: 14, color: colors.heading }}>
                    {f.category || "—"}
                  </strong>
                  {f.level && (
                    <RiskBadge level={f.level} label={t[f.level]} isDark={isDark} small />
                  )}
                </div>

                <p style={{ margin: "0 0 12px", fontSize: 14, lineHeight: 1.7 }}>
                  {f.text || "—"}
                </p>

                {f.level && (
                  <RiskBar
                    value={f.score ?? LEVEL_POSITION[f.level]}
                    level={f.level}
                    isDark={isDark}
                    isAr={isAr}
                    borderColor={colors.border}
                    mutedColor={colors.muted}
                    labels={[t.low, t.medium, t.high]}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </article>
    );
  }

  function renderSlot(slot: Slot, index: number) {
    const label = `${t.resultLabel} ${(index + 1).toLocaleString(locale)}`;

    if (slot.kind === "error") {
      return (
        <article style={card}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: themeColors.accentText,
              marginBottom: 6,
            }}
          >
            {label}
          </div>
          <h3
            dir="ltr"
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: colors.heading,
              margin: "0 0 14px",
              wordBreak: "break-word",
              textAlign: isAr ? "right" : "left",
            }}
          >
            {getHostname(slot.url)}
          </h3>
          <p role="alert" style={errorBox}>
            {slot.message}
          </p>
        </article>
      );
    }

    const findings: Finding[] = (slot.result.clauses ?? []).map((c) => {
      const clauseScore = parseScore(c.risk);
      return {
        category: c.category ?? "",
        text: c.text ?? "",
        level: clauseScore === null ? null : levelFromScore(clauseScore),
        score: clauseScore,
      };
    });

    return renderSiteCard({
      label,
      name: slot.result.websiteName || getHostname(slot.result.url),
      coverage: slot.result.coverage,
      summary: slot.result.summary?.trim() || t.noSummary,
      findings,
    });
  }

  return (
    <div style={page}>
      <main style={container}>
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

        <section aria-labelledby="how-to-compare" style={{ ...card, marginBottom: 24, padding: 22 }}>
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
            onClick={fillSample}
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
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
              gap: 22,
            }}
          >
            <div>
              <label htmlFor="compare-url-1" style={{ fontSize: 14, fontWeight: 700 }}>
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
                aria-invalid={fieldErrors.first}
                aria-describedby={describedBy}
              />
            </div>

            <div>
              <label htmlFor="compare-url-2" style={{ fontSize: 14, fontWeight: 700 }}>
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
                aria-invalid={fieldErrors.second}
                aria-describedby={describedBy}
              />
            </div>
          </div>

          <p id="url-helper" style={{ marginTop: 14, fontSize: 13, color: colors.muted }}>
            {t.helperUrl}
          </p>

          {error && (
            <div id="form-error" role="alert" style={{ ...errorBox, marginTop: 20 }}>
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
            {t.submit}
          </button>
        </form>

        {loading && (
          <p
            role="status"
            style={{ textAlign: "center", color: colors.muted, padding: 20, fontSize: 14 }}
          >
            {t.loading}
          </p>
        )}

        {hasResults && !loading && (
          <section aria-labelledby="results-heading">
            <h2
              id="results-heading"
              style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800, color: colors.heading }}
            >
              {t.resultsTitle}
            </h2>
            <p style={{ margin: "0 0 18px", fontSize: 13, color: colors.muted }}>
              {t.comparabilityNote}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
                gap: 22,
                alignItems: "start",
              }}
            >
              {slots.map((slot, i) =>
                slot ? <Fragment key={i}>{renderSlot(slot, i)}</Fragment> : null
              )}
            </div>
          </section>
        )}

        {!hasResults && !loading && (
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
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
                gap: 22,
                alignItems: "start",
                marginBottom: 18,
              }}
            >
              {t.sampleSites.map((site) => (
                <Fragment key={site.name}>
                  {renderSiteCard({
                    name: site.name,
                    findings: site.clauses.map((c) => ({
                      category: c.category,
                      text: c.text,
                      level: c.level,
                      score: null,
                    })),
                  })}
                </Fragment>
              ))}
            </div>

            <div style={{ ...card, padding: 20 }}>
              <h3 style={{ ...subHeading, fontSize: 15 }}>{t.sampleDiffTitle}</h3>
              <ul style={{ margin: 0, paddingInlineStart: 20, fontSize: 14, lineHeight: 1.9 }}>
                {t.sampleDiffs.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
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
      </main>
    </div>
  );
}