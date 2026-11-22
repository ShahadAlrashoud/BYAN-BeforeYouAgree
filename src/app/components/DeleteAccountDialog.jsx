"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "../providers";

const content = {
  en: {
    title: "Delete your account?",
    intro: "This permanently deletes your BYAN account. It cannot be undone. The following will be deleted:",
    items: [
      "Your profile (username and email address)",
      "Your sign-in details (including your password)",
      "All of your saved analysis results",
    ],
    signOutNote: "You will also be signed out on all devices, and we will send you a confirmation email when it is done.",
    label: (email) => `To confirm, type your email address (${email}) or the word DELETE:`,
    placeholder: "Email address or DELETE",
    cancel: "Cancel",
    confirm: "Permanently delete my account",
    deleting: "Deleting…",
    error: "We couldn't delete your account. Nothing was changed. Please try again.",
    mismatch: "What you typed doesn't match your email address or DELETE.",
  },
  ar: {
    title: "هل تريد حذف حسابك؟",
    intro: "سيؤدي هذا إلى حذف حسابك في بيان نهائيًا ولا يمكن التراجع عنه. سيتم حذف ما يلي:",
    items: [
      "ملفك الشخصي (اسم المستخدم والبريد الإلكتروني)",
      "بيانات تسجيل الدخول (بما في ذلك كلمة المرور)",
      "جميع نتائج التحليل المحفوظة",
    ],
    signOutNote: "سيتم أيضًا تسجيل خروجك من جميع الأجهزة، وسنرسل لك رسالة تأكيد بالبريد الإلكتروني عند الانتهاء.",
    label: (email) => `للتأكيد، اكتب بريدك الإلكتروني (${email}) أو كلمة DELETE:`,
    placeholder: "البريد الإلكتروني أو DELETE",
    cancel: "إلغاء",
    confirm: "حذف حسابي نهائيًا",
    deleting: "جارٍ الحذف…",
    error: "تعذّر حذف حسابك. لم يتم تغيير أي شيء. يرجى المحاولة مرة أخرى.",
    mismatch: "ما كتبته لا يطابق بريدك الإلكتروني ولا كلمة DELETE.",
  },
};

// Same rule the server enforces: the email address or the word DELETE (case-insensitive)
function matches(input, email) {
  const typed = input.trim().toLowerCase();
  if (!typed) return false;
  return typed === "delete" || typed === String(email || "").trim().toLowerCase();
}

export default function DeleteAccountDialog({ open, email, onClose, onDeleted }) {
  const { theme, lang } = useTheme();
  const isDark = theme === "dark";
  const isAr = lang === "ar";
  const t = content[isAr ? "ar" : "en"];

  const [mounted, setMounted] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const lastFocused = useRef(null);

  const danger = isDark ? "#f87171" : "#b91c1c"; // readable on both backgrounds
  const canDelete = matches(typed, email) && !busy;

  useEffect(() => setMounted(true), []);

  // Reset each time it opens
  useEffect(() => {
    if (open) {
      setTyped("");
      setError("");
      setBusy(false);
    }
  }, [open]);

  // Scroll lock, focus handling, Escape (blocked while deleting), focus trap
  useEffect(() => {
    if (!open) return undefined;

    lastFocused.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => inputRef.current?.focus(), 0);

    function onKey(e) {
      if (e.key === "Escape") {
        if (!busy) onClose();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll("button:not([disabled]), input:not([disabled])")
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      if (lastFocused.current && document.contains(lastFocused.current)) lastFocused.current.focus();
    };
  }, [open, busy, onClose]);

  async function handleDelete(e) {
    e.preventDefault();
    if (!matches(typed, email)) {
      setError(t.mismatch);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: typed.trim(), lang }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(res.status === 400 ? t.mismatch : t.error);
        setBusy(false);
        return;
      }
      onDeleted({ emailSent: Boolean(data.emailSent) });
    } catch {
      setError(t.error);
      setBusy(false);
    }
  }

  if (!mounted || !open) return null;

  const surface = isDark ? "#0f172a" : "#ffffff";
  const text = isDark ? "#f1f5f9" : "#1e293b";
  const line = isDark ? "#334155" : "#cbd5e1";

  const outlineBtn = {
    minHeight: 44,
    padding: "10px 20px",
    borderRadius: 10,
    fontWeight: 700,
    fontSize: "0.92rem",
  };

  return createPortal(
    <div
      onClick={() => !busy && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(2, 6, 23, 0.65)",
      }}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="byan-delete-title"
        aria-describedby="byan-delete-desc"
        dir={isAr ? "rtl" : "ltr"}
        lang={isAr ? "ar" : "en"}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          maxHeight: "calc(100vh - 32px)",
          overflowY: "auto",
          background: surface,
          color: text,
          border: `2px solid ${danger}`,
          borderRadius: 16,
          padding: "24px 22px 20px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
          textAlign: isAr ? "right" : "left",
        }}
      >
        <h2 id="byan-delete-title" style={{ margin: "0 0 10px", fontSize: "1.25rem", fontWeight: 800, color: danger }}>
          {t.title}
        </h2>

        <div id="byan-delete-desc">
          <p style={{ margin: "0 0 8px", lineHeight: 1.6, fontSize: "0.95rem" }}>{t.intro}</p>
          <ul style={{ margin: "0 0 10px", paddingInlineStart: 22, lineHeight: 1.8, fontSize: "0.95rem", fontWeight: 600 }}>
            {t.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p style={{ margin: "0 0 16px", lineHeight: 1.6, fontSize: "0.9rem", opacity: 0.85 }}>{t.signOutNote}</p>
        </div>

        <form onSubmit={handleDelete} noValidate>
          <label htmlFor="byan-delete-input" style={{ display: "block", marginBottom: 6, fontSize: "0.9rem", fontWeight: 600 }}>
            {t.label(email)}
          </label>
          <input
            ref={inputRef}
            id="byan-delete-input"
            type="text"
            dir="ltr"
            value={typed}
            onChange={(e) => {
              setTyped(e.target.value);
              if (error) setError("");
            }}
            placeholder={t.placeholder}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            disabled={busy}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "byan-delete-error" : undefined}
            style={{
              width: "100%",
              padding: "11px 12px",
              fontSize: "1rem",
              borderRadius: 10,
              border: `1px solid ${line}`,
              background: isDark ? "rgba(255,255,255,0.06)" : "#ffffff",
              color: text,
              textAlign: isAr ? "right" : "left",
            }}
          />

          <div aria-live="polite" style={{ minHeight: 22, marginTop: 8 }}>
            {error && (
              <p id="byan-delete-error" role="alert" style={{ margin: 0, color: danger, fontSize: "0.88rem", fontWeight: 600 }}>
                {error}
              </p>
            )}
            {busy && (
              <p role="status" style={{ margin: 0, fontSize: "0.88rem" }}>
                {t.deleting}
              </p>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap", marginTop: 14 }}>
            <button
              type="button"
              className="byan-danger-btn"
              onClick={onClose}
              disabled={busy}
              style={{
                ...outlineBtn,
                border: `1px solid ${line}`,
                background: "transparent",
                color: text,
                cursor: busy ? "not-allowed" : "pointer",
              }}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="byan-danger-btn"
              disabled={!canDelete}
              style={{
                ...outlineBtn,
                border: "none",
                background: danger,
                color: isDark ? "#0f172a" : "#ffffff",
                fontWeight: 800,
                cursor: canDelete ? "pointer" : "not-allowed",
                opacity: canDelete ? 1 : 0.5,
              }}
            >
              {busy ? t.deleting : t.confirm}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
