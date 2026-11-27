"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useTheme } from "../providers";

const content = {
  en: {
    title: "Saved analyses",
    search: "Search your analyses",
    searchLabel: "Search your analyses",
    noResults: "No analyses match your search.",
    noAnalyses: "You haven't saved any analyses yet.",
    loading: "Loading…",
    updating: "Updating results",
    needAccount: "Sign in to see the analyses you've saved.",
    backHome: "Back to homepage",
    sortLabel: "Sort by",
    sortWorst: "Risk: highest first",
    sortBest: "Risk: lowest first",
    sortNewest: "Newest first",
    sortOldest: "Oldest first",
    delete: "Delete",
    deleting: "Deleting…",
    confirmDelete: "Confirm delete",
    cancel: "Cancel",
    deleteFor: "Delete analysis",
    share: "Share",
    shareFor: "Share analysis",
    copied: "Link copied.",
    shared: "Shared.",
    shareFailed: "Couldn't share. Copy the link from the address bar instead.",
    viewDetails: "View clauses",
    hideDetails: "Hide clauses",
    loadingDetails: "Loading clauses…",
    noClauses: "No risky clauses detected.",
    errorList: "We couldn't load your analyses.",
    errorDelete: "Couldn't delete this analysis. Try again.",
    errorDetails: "Couldn't load the clauses.",
    retry: "Try again",
    weight: "Weight",
    severity: "Severity",
    riskScore: "Risk score",
    notAvailable: "not available",
    tiers: { safe: "Low", moderate: "Moderate", high: "High", unknown: "Unknown" },
    severities: { high: "High", medium: "Medium", low: "Low" },
  },
  ar: {
    title: "التحليلات المحفوظة",
    search: "ابحث في تحليلاتك",
    searchLabel: "ابحث في تحليلاتك",
    noResults: "لا توجد تحليلات تطابق بحثك.",
    noAnalyses: "لم تحفظ أي تحليلات بعد.",
    loading: "جارٍ التحميل…",
    updating: "جارٍ تحديث النتائج",
    needAccount: "سجّل الدخول لعرض التحليلات التي حفظتها.",
    backHome: "العودة إلى الصفحة الرئيسية",
    sortLabel: "ترتيب حسب",
    sortWorst: "الخطورة: الأعلى أولاً",
    sortBest: "الخطورة: الأدنى أولاً",
    sortNewest: "الأحدث أولاً",
    sortOldest: "الأقدم أولاً",
    delete: "حذف",
    deleting: "جارٍ الحذف…",
    confirmDelete: "تأكيد الحذف",
    cancel: "إلغاء",
    deleteFor: "حذف التحليل",
    share: "مشاركة",
    shareFor: "مشاركة التحليل",
    copied: "تم نسخ الرابط.",
    shared: "تمت المشاركة.",
    shareFailed: "تعذّرت المشاركة. انسخ الرابط من شريط العنوان.",
    viewDetails: "عرض البنود",
    hideDetails: "إخفاء البنود",
    loadingDetails: "جارٍ تحميل البنود…",
    noClauses: "لم يتم رصد بنود محفوفة بالمخاطر.",
    errorList: "تعذّر تحميل تحليلاتك.",
    errorDelete: "تعذّر حذف هذا التحليل. حاول مرة أخرى.",
    errorDetails: "تعذّر تحميل البنود.",
    retry: "إعادة المحاولة",
    weight: "الوزن",
    severity: "الخطورة",
    riskScore: "درجة الخطورة",
    notAvailable: "غير متاحة",
    tiers: { safe: "منخفضة", moderate: "متوسطة", high: "عالية", unknown: "غير معروفة" },
    severities: { high: "عالية", medium: "متوسطة", low: "منخفضة" },
  },
};

// Text colors meet 4.5:1 contrast on their backgrounds.
const PALETTE = {
  light: {
    surface: "#ffffff",
    heading: "#0f172a",
    body: "#334155",
    muted: "#64748b",
    border: "#e2e8f0",
    hover: "#f1f5f9",
    focus: "#1d4ed8",
    accent: "#1e3a5f",
    danger: "#a03636",
    dangerSolid: "#a03636",
    toastBg: "#1e293b",
    toastFg: "#ffffff",
    tiers: {
      safe: { bg: "#eafcf1", text: "#2b6b49", ring: "#86d9a4" },
      moderate: { bg: "#fdf6e3", text: "#7a5c12", ring: "#f2c96b" },
      high: { bg: "#fdecec", text: "#a03636", ring: "#f19a9a" },
      unknown: { bg: "#f1f5f9", text: "#475569", ring: "#cbd5e1" },
    },
  },
  dark: {
    surface: "#1e293b",
    heading: "#f1f5f9",
    body: "#cbd5e1",
    muted: "#94a3b8",
    border: "#334155",
    hover: "#273449",
    focus: "#93c5fd",
    accent: "#a5b4fc",
    danger: "#f19a9a",
    dangerSolid: "#b91c1c",
    toastBg: "#f1f5f9",
    toastFg: "#0f172a",
    tiers: {
      safe: { bg: "rgba(134,217,164,0.12)", text: "#86d9a4", ring: "#86d9a4" },
      moderate: { bg: "rgba(242,201,107,0.12)", text: "#f2c96b", ring: "#f2c96b" },
      high: { bg: "rgba(241,154,154,0.12)", text: "#f19a9a", ring: "#f19a9a" },
      unknown: { bg: "rgba(148,163,184,0.12)", text: "#cbd5e1", ring: "#64748b" },
    },
  },
};

const TIER_SYMBOL = { safe: "✓", moderate: "!", high: "▲", unknown: "?" };
const SEVERITY_RANK = { high: 0, medium: 1, low: 2 };

const STYLES = `
.sa { max-width: 800px; margin: 24px auto; padding: 0 16px 56px; color: var(--body); }
.sa h1 { margin: 0 0 16px; font-size: 1.6rem; line-height: 1.25; color: var(--heading); }
.sa-controls { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin-bottom: 20px; }
.sa-input { flex: 1 1 260px; box-sizing: border-box; min-height: 44px; padding: 10px 14px;
  font: inherit; font-size: 14px; border: 1px solid var(--border); border-radius: 10px;
  background: var(--surface); color: var(--heading); }
.sa-sort { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--muted); }
.sa-select { min-height: 40px; padding: 6px 10px; font: inherit; font-size: 13px; border: 1px solid var(--border);
  border-radius: 8px; background: var(--surface); color: var(--heading); }
.sa-btn { min-height: 36px; padding: 6px 14px; font: inherit; font-size: 13px; font-weight: 600;
  border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--body); cursor: pointer; }
.sa-btn:hover:not(:disabled) { background: var(--hover); }
.sa-btn:disabled { opacity: 0.6; cursor: default; }
.sa-btn--accent { color: var(--accent); border-color: var(--accent); }
.sa-btn--danger { color: var(--danger); border-color: var(--danger); }
.sa-btn--solid { background: var(--danger-solid); border-color: var(--danger-solid); color: #ffffff; }
.sa-btn--solid:hover:not(:disabled) { background: var(--danger-solid); filter: brightness(1.08); }
:is(.sa-input, .sa-select, .sa-btn, .sa-disclosure):focus-visible { outline: 3px solid var(--focus); outline-offset: 2px; }

.sa-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; transition: opacity 0.15s; }
.sa-list[aria-busy="true"] { opacity: 0.6; }
.sa-card { position: relative; padding: 16px 84px 16px 16px; background: var(--surface);
  border: 1px solid var(--border); border-radius: 14px; }
.sa-title { margin: 0; font-size: 1rem; font-weight: 700; color: var(--heading); overflow-wrap: anywhere; }
.sa-query { margin: 4px 0 0; font-size: 13px; color: var(--muted); overflow-wrap: anywhere; }
.sa-date { display: block; margin-top: 8px; font-size: 12px; color: var(--muted); }
.sa-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.sa-error { margin: 8px 0 0; font-size: 13px; color: var(--danger); }
.sa-panel { margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border); }
.sa-clauses { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.sa-clauses li { padding: 8px 12px; border-inline-start: 3px solid var(--border); }
.sa-clause-head { display: flex; flex-wrap: wrap; gap: 4px 10px; align-items: baseline; font-size: 13px; color: var(--heading); }
.sa-clause-text { margin: 4px 0 0; font-size: 13px; line-height: 1.6; color: var(--body); }
.sa-tag { font-size: 12px; color: var(--muted); }
.sa-muted { margin: 0; font-size: 13px; color: var(--muted); }
.sa-state { display: grid; justify-items: start; gap: 10px; font-size: 14px; color: var(--body); }

.sa-badge { position: absolute; top: 14px; inset-inline-end: 14px; width: 52px; height: 52px;
  box-sizing: border-box; border-radius: 50%; border: 2px solid; display: flex; flex-direction: column;
  align-items: center; justify-content: center; font-weight: 700; line-height: 1.1; }
.sa-badge-symbol { font-size: 10px; }
.sa-badge-score { font-size: 14px; }

.sa-toast { position: fixed; bottom: 24px; inset-inline-start: 50%; z-index: 50;
  padding: 10px 18px; border-radius: 10px; font-size: 14px; background: var(--toast-bg); color: var(--toast-fg);
  opacity: 0; pointer-events: none; transform: translate(-50%, 8px); transition: opacity 0.2s, transform 0.2s; }
.sa-toast[data-visible="true"] { opacity: 1; transform: translate(-50%, 0); }

.sa-visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }

@media (prefers-reduced-motion: reduce) {
  .sa-list, .sa-toast { transition: none; }
}
`;

function getRiskTier(riskLevel) {
  const level = (riskLevel || "").toLowerCase();
  if (!level) return "unknown";
  if (level.includes("safe")) return "safe";
  if (level.includes("high")) return "high";
  if (level.includes("moderate") || level.includes("medium")) return "moderate";
  return "unknown";
}

function formatDate(iso, lang) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const locale = lang === "ar" ? "ar-u-ca-gregory" : "en-US";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(d);
}

function sortClauses(clauses) {
  if (!Array.isArray(clauses)) return [];
  return [...clauses].sort(
    (a, b) =>
      (SEVERITY_RANK[a.severity] ?? 3) - (SEVERITY_RANK[b.severity] ?? 3) ||
      (b.riskWeight ?? 0) - (a.riskWeight ?? 0)
  );
}

function scoreCompare(direction) {
  return (a, b) => {
    const x = a.riskScore;
    const y = b.riskScore;
    if (x == null && y == null) return 0;
    if (x == null) return 1; // unscored items always last
    if (y == null) return -1;
    return direction * (x - y);
  };
}

function RiskBadge({ score, tier, palette, t }) {
  const c = palette.tiers[tier];
  return (
    <div
      className="sa-badge"
      role="img"
      aria-label={`${t.riskScore}: ${score ?? t.notAvailable}, ${t.tiers[tier]}`}
      style={{ background: c.bg, borderColor: c.ring, color: c.text }}
    >
      <span aria-hidden="true" className="sa-badge-symbol">{TIER_SYMBOL[tier]}</span>
      <span aria-hidden="true" className="sa-badge-score">{score ?? "–"}</span>
    </div>
  );
}

function ClauseList({ entry, t, palette, onRetry }) {
  if (!entry || entry.status === "loading") {
    return <p role="status" className="sa-muted">{t.loadingDetails}</p>;
  }
  if (entry.status === "error") {
    return (
      <div role="alert" className="sa-state">
        <p style={{ margin: 0 }}>{t.errorDetails}</p>
        <button type="button" className="sa-btn" onClick={onRetry}>{t.retry}</button>
      </div>
    );
  }
  if (entry.clauses.length === 0) {
    return <p className="sa-muted">{t.noClauses}</p>;
  }

  const severityColor = {
    high: palette.tiers.high.text,
    medium: palette.tiers.moderate.text,
    low: palette.tiers.safe.text,
  };

  return (
    <ul className="sa-clauses">
      {entry.clauses.map((c, i) => {
        const meta = c.severity
          ? `${t.severity}: ${t.severities[c.severity] ?? c.severity}`
          : c.riskWeight != null
          ? `${t.weight}: ${c.riskWeight}`
          : null;
        return (
          <li key={`${c.category}-${i}`} style={{ borderInlineStartColor: severityColor[c.severity] ?? palette.border }}>
            <div className="sa-clause-head">
              <strong>{c.category}</strong>
              {meta && <span className="sa-tag">{meta}</span>}
            </div>
            <p className="sa-clause-text">{c.text}</p>
          </li>
        );
      })}
    </ul>
  );
}

export default function SavedAnalysesPage() {
  const { data: session, status } = useSession();
  const { theme, lang } = useTheme();
  const isDark = theme === "dark";
  const isAr = lang === "ar";
  const t = content[lang] || content.en;
  const dir = isAr ? "rtl" : "ltr";
  const palette = isDark ? PALETTE.dark : PALETTE.light;

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [items, setItems] = useState([]);
  const [listState, setListState] = useState("loading"); // loading | ready | error
  const [busy, setBusy] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [expandedId, setExpandedId] = useState(null);
  const [details, setDetails] = useState({}); // id -> { status, clauses? }
  const [confirmingId, setConfirmingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [rowError, setRowError] = useState(null); // { id, message }

  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);

  // Debounce search input so typing doesn't fire a request per keystroke.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => clearTimeout(id);
  }, [query]);

  // Fetch the list. Previous results stay visible while a new search runs.
  useEffect(() => {
    if (status !== "authenticated") return;
    const controller = new AbortController();
    setBusy(true);

    fetch(`/api/analyze/list?search=${encodeURIComponent(debouncedQuery)}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setItems(Array.isArray(data.items) ? data.items : []);
        setListState("ready");
      })
      .catch((err) => {
        if (err.name !== "AbortError") setListState("error");
      })
      .finally(() => {
        if (!controller.signal.aborted) setBusy(false);
      });

    return () => controller.abort();
  }, [debouncedQuery, status, reloadKey]);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const showToast = useCallback((message) => {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(""), 3500);
  }, []);

  const loadDetails = useCallback(async (id) => {
    setDetails((d) => ({ ...d, [id]: { status: "loading" } }));
    try {
      const res = await fetch(`/api/result/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setDetails((d) => ({
        ...d,
        [id]: { status: "ready", clauses: sortClauses(data.clauses) },
      }));
    } catch {
      setDetails((d) => ({ ...d, [id]: { status: "error" } }));
    }
  }, []);

  function toggleDetails(id) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    const entry = details[id];
    if (!entry || entry.status === "error") loadDetails(id);
  }

  async function handleShare(item) {
    const url = `${window.location.origin}/results?id=${encodeURIComponent(item.id)}`;
    const preferNative =
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function" &&
      window.matchMedia?.("(pointer: coarse)").matches;
    try {
      if (preferNative) {
        await navigator.share({ title: item.title, url });
        showToast(t.shared);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        showToast(t.copied);
      } else {
        throw new Error("Clipboard unavailable");
      }
    } catch (err) {
      if (err?.name !== "AbortError") showToast(t.shareFailed);
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);
    setRowError(null);
    try {
      const res = await fetch(`/api/analyze/delete/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setItems((prev) => prev.filter((x) => x.id !== id));
      setConfirmingId(null);
      setExpandedId((cur) => (cur === id ? null : cur));
      setDetails((d) => {
        const { [id]: _removed, ...rest } = d;
        return rest;
      });
    } catch {
      setRowError({ id, message: t.errorDelete });
    } finally {
      setDeletingId(null);
    }
  }

  const sortedItems = useMemo(() => {
    const time = (x) => new Date(x.createdAt).getTime() || 0;
    const comparators = {
      newest: (a, b) => time(b) - time(a),
      oldest: (a, b) => time(a) - time(b),
      worst: scoreCompare(-1),
      best: scoreCompare(1),
    };
    return [...items].sort(comparators[sortBy] ?? comparators.newest);
  }, [items, sortBy]);

  const cssVars = {
    "--surface": palette.surface,
    "--heading": palette.heading,
    "--body": palette.body,
    "--muted": palette.muted,
    "--border": palette.border,
    "--hover": palette.hover,
    "--focus": palette.focus,
    "--accent": palette.accent,
    "--danger": palette.danger,
    "--danger-solid": palette.dangerSolid,
    "--toast-bg": palette.toastBg,
    "--toast-fg": palette.toastFg,
  };

  const shell = (children) => (
    <div className="sa" dir={dir} lang={lang} style={cssVars}>
      <style>{STYLES}</style>
      {children}
    </div>
  );

  if (status === "loading") {
    return shell(<p role="status" className="sa-muted">{t.loading}</p>);
  }

  if (!session?.user) {
    return shell(
      <p className="sa-muted">
        {t.needAccount} <Link href="/">{t.backHome}</Link>
      </p>
    );
  }

  let body;
  if (listState === "error") {
    body = (
      <div role="alert" className="sa-state">
        <p style={{ margin: 0 }}>{t.errorList}</p>
        <button
          type="button"
          className="sa-btn"
          onClick={() => {
            setListState("loading");
            setReloadKey((k) => k + 1);
          }}
        >
          {t.retry}
        </button>
      </div>
    );
  } else if (listState === "loading") {
    body = <p role="status" className="sa-muted">{t.loading}</p>;
  } else if (sortedItems.length === 0) {
    body = <p className="sa-muted">{debouncedQuery ? t.noResults : t.noAnalyses}</p>;
  } else {
    body = (
      <ul className="sa-list" aria-busy={busy}>
        {sortedItems.map((item) => {
          const tier = getRiskTier(item.riskLevel);
          const isExpanded = expandedId === item.id;
          const isDeleting = deletingId === item.id;
          const isConfirming = confirmingId === item.id;
          const panelId = `clauses-${item.id}`;

          return (
            <li key={item.id} className="sa-card">
              <RiskBadge score={item.riskScore} tier={tier} palette={palette} t={t} />

              <h2 className="sa-title">{item.title}</h2>
              {item.query && <p className="sa-query">{item.query}</p>}
              <time className="sa-date" dateTime={item.createdAt}>
                {formatDate(item.createdAt, lang)}
              </time>

              <div className="sa-actions">
                <button
                  type="button"
                  className="sa-btn"
                  aria-expanded={isExpanded}
                  aria-controls={isExpanded ? panelId : undefined}
                  onClick={() => toggleDetails(item.id)}
                >
                  {isExpanded ? t.hideDetails : t.viewDetails}
                </button>

                <button
                  type="button"
                  className="sa-btn sa-btn--accent"
                  onClick={() => handleShare(item)}
                  aria-label={`${t.shareFor}: ${item.title}`}
                >
                  {t.share}
                </button>

                {isConfirming ? (
                  <>
                    <button
                      type="button"
                      className="sa-btn sa-btn--solid"
                      onClick={() => handleDelete(item.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? t.deleting : t.confirmDelete}
                    </button>
                    <button
                      type="button"
                      className="sa-btn"
                      onClick={() => setConfirmingId(null)}
                      disabled={isDeleting}
                    >
                      {t.cancel}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="sa-btn sa-btn--danger"
                    onClick={() => {
                      setRowError(null);
                      setConfirmingId(item.id);
                    }}
                    aria-label={`${t.deleteFor}: ${item.title}`}
                  >
                    {t.delete}
                  </button>
                )}
              </div>

              {rowError?.id === item.id && (
                <p role="alert" className="sa-error">{rowError.message}</p>
              )}

              {isExpanded && (
                <div id={panelId} className="sa-panel">
                  <ClauseList
                    entry={details[item.id]}
                    t={t}
                    palette={palette}
                    onRetry={() => loadDetails(item.id)}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  }

  return shell(
    <>
      <h1>{t.title}</h1>

      <label htmlFor="saved-search" className="sa-visually-hidden">{t.searchLabel}</label>
      <input
        id="saved-search"
        type="search"
        className="sa-input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t.search}
        style={{ marginBottom: 12 }}
      />

      <div className="sa-controls">
        <div className="sa-sort">
          <label htmlFor="saved-sort">{t.sortLabel}</label>
          <select
            id="saved-sort"
            className="sa-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">{t.sortNewest}</option>
            <option value="oldest">{t.sortOldest}</option>
            <option value="worst">{t.sortWorst}</option>
            <option value="best">{t.sortBest}</option>
          </select>
        </div>
        <span role="status" className="sa-visually-hidden">
          {busy && listState === "ready" ? t.updating : ""}
        </span>
      </div>

      {body}

      <div
        role="status"
        aria-live="polite"
        className="sa-toast"
        data-visible={toast ? "true" : "false"}
      >
        {toast}
      </div>
    </>
  );
}