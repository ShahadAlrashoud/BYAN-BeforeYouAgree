"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { signIn } from "next-auth/react";
import { useTheme } from "../providers";
import { tokens, dialogStyles } from "./ui";
import { useDeleteFlow, matches } from "./useDeleteFlow";
import { useModalBehavior } from "./useModalBehavior";

// Two-step delete dialog. Step 1: what will be deleted + type the email or DELETE.
// Step 2: re-authenticate (password, or a fresh sign-in when the account has no password), then delete.
export default function DeleteAccountV2({ open, email, onClose, onDeleted }) {
    const { lang, theme } = useTheme();
    const isAr = lang === "ar";
    const isDark = theme === "dark";
    const tk = tokens(isDark);
    const st = dialogStyles({ ...tk, isAr, isDark });
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const f = useDeleteFlow({ open, email, lang, onDeleted });
    const dialogRef = useModalBehavior({ open, busy: f.busy, onClose });
    const { t } = f;

    if (!mounted || !open) return null;

    const canContinue = matches(f.typed, email);

    return createPortal(
        <div onClick={() => !f.busy && onClose()} style={st.overlay}>
            <div
                ref={dialogRef}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="byan-del2-title"
                aria-describedby="byan-del2-desc"
                dir={isAr ? "rtl" : "ltr"}
                lang={isAr ? "ar" : "en"}
                onClick={(e) => e.stopPropagation()}
                style={st.box}
            >
                <h2 id="byan-del2-title" style={{ margin: "0 0 10px", fontSize: "1.25rem", color: tk.danger }}>{t.delTitle}</h2>
                <div id="byan-del2-desc">
                    <p style={{ margin: "0 0 8px" }}>{t.delIntro}</p>
                    <ul style={{ margin: "0 0 10px", paddingInlineStart: 22, lineHeight: 1.8, fontWeight: 600 }}>
                        {t.delItems.map((x) => <li key={x}>{x}</li>)}
                    </ul>
                    <p style={{ margin: "0 0 16px", fontSize: "0.9rem", opacity: 0.85 }}>{t.delSignOut}</p>
                </div>

                {f.step === 1 ? (
                    <form onSubmit={f.next} noValidate>
                        <label htmlFor="byan-del2-type" style={st.label}>{t.delTypeLabel(email)}</label>
                        <input ref={f.firstField} id="byan-del2-type" type="text" dir="ltr" value={f.typed} autoComplete="off" spellCheck={false} placeholder={t.delTypePlaceholder} aria-invalid={Boolean(f.error)} onChange={(e) => { f.setTyped(e.target.value); f.setError(""); }} style={{ ...st.field, textAlign: isAr ? "right" : "left" }} />
                        <div role="alert" style={st.alertBox}>{f.error}</div>
                        <div style={st.row}>
                            <button type="button" className="byan-danger-btn" onClick={onClose} style={st.ghost}>{t.delCancel}</button>
                            <button type="submit" className="byan-danger-btn" disabled={!canContinue} style={{ ...st.outlineDanger, opacity: canContinue ? 1 : 0.5 }}>{t.delContinue}</button>
                        </div>
                    </form>
                ) : f.hasPassword ? (
                    <form onSubmit={f.remove}>
                        <label htmlFor="byan-del2-pw" style={st.label}>{t.delPasswordLabel}</label>
                        <input ref={f.firstField} id="byan-del2-pw" type="password" autoComplete="current-password" required value={f.password} disabled={f.busy} onChange={(e) => { f.setPassword(e.target.value); f.setError(""); }} style={st.field} />
                        <div role="alert" style={st.alertBox}>{f.error}</div>
                        <div role="status" style={{ minHeight: 20 }}>{f.busy ? t.deleting : ""}</div>
                        <div style={st.row}>
                            <button type="button" className="byan-danger-btn" disabled={f.busy} onClick={f.back} style={st.ghost}>{t.delBack}</button>
                            <button type="submit" className="byan-danger-btn" disabled={f.busy || !f.password} style={{ ...st.solidDanger, opacity: f.busy || !f.password ? 0.5 : 1 }}>{f.busy ? t.deleting : t.delConfirm}</button>
                        </div>
                    </form>
                ) : (
                    <div>
                        <p style={{ margin: "0 0 12px", fontWeight: 600 }}>{t.delFreshLabel}</p>
                        <div style={st.row}>
                            <button type="button" className="byan-danger-btn" onClick={f.back} style={st.ghost}>{t.delBack}</button>
                            <button ref={f.firstField} type="button" className="byan-danger-btn" onClick={() => signIn(undefined, { callbackUrl: "/account/profile" })} style={st.outlineDanger}>{t.delSignInAgain}</button>
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
