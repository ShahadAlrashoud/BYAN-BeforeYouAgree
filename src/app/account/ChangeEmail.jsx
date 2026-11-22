"use client";

import { useState } from "react";
import { useTheme } from "../providers";
import { S } from "./strings";
import { tokens, outlineBtn } from "./ui";

// Email is shown read-only. "Change email" sends a verification link to the NEW address;
// the stored email does not change until that link is opened.
export default function ChangeEmail({ email }) {
    const { lang, theme } = useTheme();
    const t = S[lang === "ar" ? "ar" : "en"];
    const { line, danger } = tokens(theme === "dark");
    const [open, setOpen] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [password, setPassword] = useState("");
    const [state, setState] = useState("idle"); // idle | sending | sent | error key
    const [error, setError] = useState("");

    const field = { width: "100%", maxWidth: 420, padding: "10px 12px", fontSize: "1rem", borderRadius: 10, border: `1px solid ${line}`, background: "transparent", color: "inherit" };

    async function onSubmit(e) {
        e.preventDefault();
        setError("");
        setState("sending");
        try {
            const res = await fetch("/api/account/email/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newEmail, password, lang }),
            });
            const d = await res.json().catch(() => ({}));
            if (res.ok) { setState("sent"); setPassword(""); return; }
            setState("idle");
            if (res.status === 429) setError(t.tooMany);
            else if (d.error === "invalid_email") setError(t.emailInvalid);
            else if (d.error === "same_email") setError(t.emailSame);
            else if (d.error === "reauth_failed") setError(t.reauthFailed);
            else if (d.error === "fresh_signin_required") setError(t.freshSignIn);
            else setError(t.saveFailed);
        } catch {
            setState("idle");
            setError(t.saveFailed);
        }
    }

    return (
        <div style={{ marginBottom: 8 }}>
            <p style={{ fontWeight: 700, margin: "0 0 6px" }}>{t.email}</p>
            {/* Read-only: shown as text, not an editable field */}
            <p dir="ltr" style={{ margin: "0 0 6px", textAlign: lang === "ar" ? "right" : "left" }}>{email}</p>
            <p style={{ margin: "0 0 10px", fontSize: "0.88rem", opacity: 0.8 }}>{t.emailReadOnly}</p>

            {!open ? (
                <button type="button" className="byan-account-btn" style={outlineBtn} onClick={() => { setOpen(true); setState("idle"); }} aria-expanded="false">
                    {t.changeEmail}
                </button>
            ) : state === "sent" ? (
                <p role="status" style={{ fontWeight: 600 }}>{t.emailSent}</p>
            ) : (
                <form onSubmit={onSubmit} aria-label={t.changeEmail}>
                    <label htmlFor="account-new-email" style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>{t.newEmail}</label>
                    <input id="account-new-email" type="email" dir="ltr" autoComplete="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} style={field} />
                    <label htmlFor="account-email-pw" style={{ display: "block", fontWeight: 600, margin: "12px 0 4px" }}>{t.currentPassword}</label>
                    <input id="account-email-pw" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} style={field} />
                    <div role="alert" style={{ minHeight: 22, margin: "8px 0", color: danger, fontWeight: 600 }}>{error}</div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button type="submit" className="byan-account-btn" style={outlineBtn} disabled={state === "sending"}>
                            {state === "sending" ? t.sending : t.sendLink}
                        </button>
                        <button type="button" className="byan-account-btn" style={outlineBtn} onClick={() => { setOpen(false); setError(""); }}>{t.cancel}</button>
                    </div>
                </form>
            )}
        </div>
    );
}
