"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useTheme } from "../providers";

const content = {
  en: {
    title: "Saved Analysis Results",
    search: "Search your analyses...",
    searchLabel: "Search your analyses",
    noResults: "No analyses found.",
    noAnalyses: "You haven't saved any analyses yet.",
    loading: "Loading...",
    pleaseLogin: "Please",
    logIn: "log in",
    sortLabel: "Sort by:",
    sortWorst: "Risk: Worst first",
    sortBest: "Risk: Best first",
    sortNewest: "Newest first",
    sortOldest: "Oldest first",
    delete: "Delete",
    deleting: "Deleting...",
    deleteFor: "Delete analysis:",
    share: "Share",
    shareFor: "Share analysis:",
    copied: "Link copied.",
    shared: "Shared.",
    shareFailed: "Could not share. Copy the link from the address bar instead.",
    viewDetails: "View clauses",
    hideDetails: "Hide clauses",
    toggleFor: "Show or hide clauses for",
    loadingDetails: "Loading details...",
    noClauses: "No risky clauses detected.",
    weight: "weight",
    severity: "severity",
    riskScore: "Risk score",
    notAvailable: "not available",
    tiers: { safe: "Safe", moderate: "Moderate", high: "High", unknown: "Unknown" },
    severities: { high: "High", medium: "Medium", low: "Low" },
  },
  ar: {
    title: "نتائج التحليل المحفوظة",
    search: "ابحث في تحليلاتك...",
    searchLabel: "ابحث في تحليلاتك",
    noResults: "لم يتم العثور على نتائج.",
    noAnalyses: "لم تقم بحفظ أي تحليلات بعد.",
    loading: "جارٍ التحميل...",
    pleaseLogin: "يرجى",
    logIn: "تسجيل الدخول",
    sortLabel: "ترتيب حسب:",
    sortWorst: "الخطورة: الأسوأ أولاً",
    sortBest: "الخطورة: الأفضل أولاً",
    sortNewest: "الأحدث أولاً",
    sortOldest: "الأقدم أولاً",
    delete: "حذف",
    deleting: "جارٍ الحذف...",
    deleteFor: "حذف التحليل:",
    share: "مشاركة",
    shareFor: "مشاركة التحليل:",
    copied: "تم نسخ الرابط.",
    shared: "تمت المشاركة.",
    shareFailed: "تعذّرت المشاركة. انسخ الرابط من شريط العنوان.",
    viewDetails: "عرض البنود",
    hideDetails: "إخفاء البنود",
    toggleFor: "إظهار أو إخفاء البنود الخاصة بـ",
    loadingDetails: "جارٍ تحميل التفاصيل...",
    noClauses: "لم يتم اكتشاف بنود خطرة.",
    weight: "الوزن",
    severity: "الخطورة",
    riskScore: "درجة الخطورة",
    notAvailable: "غير متاحة",
    tiers: { safe: "آمن", moderate: "متوسط", high: "عالٍ", unknown: "غير معروف" },
    severities: { high: "عالية", medium: "متوسطة", low: "منخفضة" },
  },
};

function getRiskTier(riskLevel) {
  if (!riskLevel) return "unknown";
  const level = riskLevel.toLowerCase();
  if (level.includes("safe")) return "safe";
  if (level.includes("high")) return "high";
  return "moderate";
}

// Text colors are dark enough for 4.5:1 contrast on their backgrounds
const TIER_COLORS_LIGHT = {
  safe: { bg: "#eafcf1", text: "#2b6b49", ring: "#86d9a4" },
  moderate: { bg: "#fdf6e3", text: "#7a5c12", ring: "#f2c96b" },
  high: { bg: "#fdecec", text: "#a03636", ring: "#f19a9a" },
  unknown: { bg: "#f1f5f9", text: "#475569", ring: "#cbd5e1" },
};

const TIER_COLORS_DARK = {
  safe: { bg: "rgba(134,217,164,0.12)", text: "#86d9a4", ring: "#86d9a4" },
  moderate: { bg: "rgba(242,201,107,0.12)", text: "#f2c96b", ring: "#f2c96b" },
  high: { bg: "rgba(241,154,154,0.12)", text: "#f19a9a", ring: "#f19a9a" },
  unknown: { bg: "rgba(148,163,184,0.12)", text: "#cbd5e1", ring: "#64748b" },
};

// Symbols so risk is never shown by color alone
const TIER_SYMBOL = { safe: "✓", moderate: "!", high: "▲", unknown: "?" };

const srOnly = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

function RiskBadge({ score, tier, isDark, t }) {
  const colors = (isDark ? TIER_COLORS_DARK : TIER_COLORS_LIGHT)[tier];
  const scoreText = score ?? t.notAvailable;
  return (
    <div
      role="img"
      aria-label={`${t.riskScore}: ${scoreText}, ${t.tiers[tier]}`}
      style={{
        position: "absolute",
        top: 12,
        insetInlineEnd: 12,
        minWidth: 46,
        height: 46,
        borderRadius: "50%",
        background: colors.bg,
        border: `2px solid ${colors.ring}`,
        color: colors.text,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: 13,
        lineHeight: 1.1,
      }}
    >
      <span aria-hidden="true" style={{ fontSize: 10 }}>
        {TIER_SYMBOL[tier]}
      </span>
      <span aria-hidden="true">{score ?? "–"}</span>
    </div>
  );
}

export default function SavedAnalysesPage() {
  const { data: session, status } = useSession();
  const { theme, lang } = useTheme();
  const isDark = theme === "dark";
  const isAr = lang === "ar";
  const t = content[lang] || content.en;

  const heading = isDark ? "#f1f5f9" : "#111827";
  const body = isDark ? "#cbd5e1" : "#334155";
  const muted = isDark ? "#94a3b8" : "#64748b"; // 4.5:1+ on card backgrounds
  const border = isDark ? "#334155" : "#e2e8f0";
  const surface = isDark ? "#1e293b" : "#ffffff";
  const danger = isDark ? "#f19a9a" : "#a03636";
  const shareColor = isDark ? "#a5b4fc" : "#1e3a5f";

  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [deletingId, setDeletingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [detailsCache, setDetailsCache] = useState({});
  const [detailsLoading, setDetailsLoading] = useState(null);
  const [shareMsg, setShareMsg] = useState("");

  useEffect(() => {
    if (status !== "authenticated") return;

    const controller = new AbortController();
    setLoading(true);

    fetch(`/api/analyze/list?search=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => setItems(data.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [query, status]);

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/analyze/delete/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  }

async function handleShare(item) {
  const url = `${window.location.origin}/results?id=${item.id}`;
  const isTouch = window.matchMedia?.("(pointer: coarse)").matches;
  try {
    if (isTouch && navigator.share) {
      await navigator.share({ title: item.title, url });
      setShareMsg(t.shared);
    } else {
      await navigator.clipboard.writeText(url);
      setShareMsg(t.copied);
    }
  } catch (e) {
    if (e?.name !== "AbortError") setShareMsg(t.shareFailed);
  }
  setTimeout(() => setShareMsg(""), 3500);
}

  async function handleToggleDetails(id) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);

    if (!detailsCache[id]) {
      setDetailsLoading(id);
      try {
        const res = await fetch(`/api/result/${id}`);
        const data = await res.json();
        if (res.ok) {
          setDetailsCache((prev) => ({ ...prev, [id]: data }));
        }
      } catch {
        // ignore
      } finally {
        setDetailsLoading(null);
      }
    }
  }

  const sortedItems = [...items].sort((a, b) => {
    if (sortBy === "worst") return (b.riskScore ?? -1) - (a.riskScore ?? -1);
    if (sortBy === "best") return (a.riskScore ?? 999) - (b.riskScore ?? 999);
    if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
    return new Date(b.createdAt) - new Date(a.createdAt); // newest
  });

  if (status === "loading") {
    return (
      <div role="status" style={{ padding: 20 }}>
        {t.loading}
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div dir={isAr ? "rtl" : "ltr"} style={{ padding: 20 }}>
        {t.pleaseLogin} <Link href="/login">{t.logIn}</Link>.
      </div>
    );
  }

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      style={{ maxWidth: 800, margin: "20px auto", padding: "0 16px" }}
    >
      <h1 style={{ color: heading }}>{t.title}</h1>

 <p
  role="status"
  style={
    shareMsg
      ? {
          position: "fixed",
          bottom: 24,
          insetInlineStart: "50%",
          transform: "translateX(-50%)",
          background: isDark ? "#f1f5f9" : "#1e293b",
          color: isDark ? "#0f172a" : "#ffffff",
          padding: "10px 18px",
          borderRadius: 10,
          fontSize: 14,
          zIndex: 50,
        }
      : srOnly
  }
>
  {shareMsg}
</p>

      <label htmlFor="saved-search" style={srOnly}>
        {t.searchLabel}
      </label>
      <input
        id="saved-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t.search}
        style={{
          width: "100%",
          padding: "10px 14px",
          borderRadius: 10,
          border: `1px solid ${border}`,
          background: surface,
          color: heading,
          marginBottom: 12,
          fontSize: 14,
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <label htmlFor="saved-sort" style={{ fontSize: 13, color: muted }}>
          {t.sortLabel}
        </label>
        <select
          id="saved-sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: `1px solid ${border}`,
            background: surface,
            color: heading,
            fontSize: 13,
          }}
        >
          <option value="newest">{t.sortNewest}</option>
          <option value="oldest">{t.sortOldest}</option>
          <option value="worst">{t.sortWorst}</option>
          <option value="best">{t.sortBest}</option>
        </select>
      </div>

      {loading ? (
        <p role="status" style={{ color: muted }}>
          {t.loading}
        </p>
      ) : sortedItems.length === 0 ? (
        <p style={{ color: muted }}>{query ? t.noResults : t.noAnalyses}</p>
      ) : (
        <ul style={{ display: "flex", flexDirection: "column", gap: 12, listStyle: "none", margin: 0, padding: 0 }}>
          {sortedItems.map((item) => {
            const tier = getRiskTier(item.riskLevel);
            const isExpanded = expandedId === item.id;
            const details = detailsCache[item.id];
            const panelId = `clauses-${item.id}`;

            return (
              <li
                key={item.id}
                style={{
                  position: "relative",
                  border: `1px solid ${border}`,
                  borderRadius: 12,
                  padding: "16px 64px 16px 16px",
                  background: surface,
                }}
              >
                <RiskBadge score={item.riskScore} tier={tier} isDark={isDark} t={t} />

                <button
                  type="button"
                  onClick={() => handleToggleDetails(item.id)}
                  aria-expanded={isExpanded}
                  aria-controls={panelId}
                  aria-label={`${t.toggleFor} ${item.title}`}
                  style={{
                    display: "block",
                    maxWidth: "100%",
                    padding: 0,
                    margin: 0,
                    border: "none",
                    background: "transparent",
                    font: "inherit",
                    fontWeight: 700,
                    color: heading,
                    cursor: "pointer",
                    textDecoration: "underline",
                    textAlign: "start",
                    overflowWrap: "anywhere",
                  }}
                >
                  {item.title}
                </button>
                {item.query && (
                  <div style={{ fontSize: 13, color: muted, marginTop: 4, overflowWrap: "anywhere" }}>
                    {item.query}
                  </div>
                )}
                <div style={{ fontSize: 12, color: muted, marginTop: 8 }}>
                  {new Date(item.createdAt).toLocaleString(isAr ? "ar" : "en-US")}
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => handleShare(item)}
                    aria-label={`${t.shareFor} ${item.title}`}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 8,
                      border: `1px solid ${shareColor}`,
                      background: "transparent",
                      color: shareColor,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {t.share}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    aria-label={`${t.deleteFor} ${item.title}`}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 8,
                      border: `1px solid ${danger}`,
                      background: "transparent",
                      color: danger,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: deletingId === item.id ? "default" : "pointer",
                      opacity: deletingId === item.id ? 0.7 : 1,
                    }}
                  >
                    {deletingId === item.id ? t.deleting : t.delete}
                  </button>
                </div>

                {isExpanded && (
                  <div
                    id={panelId}
                    style={{
                      marginTop: 14,
                      paddingTop: 14,
                      borderTop: `1px solid ${border}`,
                    }}
                  >
                    {detailsLoading === item.id ? (
                      <p role="status" style={{ fontSize: 13, color: muted, margin: 0 }}>
                        {t.loadingDetails}
                      </p>
                    ) : details?.clauses?.length ? (
                      <ul style={{ margin: 0, paddingInlineStart: 18 }}>
                        {details.clauses.map((c, idx) => (
                          <li
                            key={idx}
                            style={{
                              marginBottom: 10,
                              fontSize: 13,
                              lineHeight: 1.5,
                              color: body,
                            }}
                          >
                            <strong>{c.category}:</strong> {c.text}{" "}
                            {(c.severity || c.riskWeight != null) && (
                              <span style={{ color: muted, fontSize: 12 }}>
                                {c.severity
                                  ? `(${t.severity}: ${t.severities[c.severity] || c.severity})`
                                  : `(${t.weight}: ${c.riskWeight})`}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ fontSize: 13, color: muted, margin: 0 }}>{t.noClauses}</p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}