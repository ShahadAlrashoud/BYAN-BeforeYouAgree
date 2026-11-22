"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "../providers";
import { S } from "./strings";

// Display name: an empty field with a placeholder when nothing is set (never "N/A")
export default function DisplayNameForm({ initial }) {
    const { lang, theme } = useTheme();
    const { update } = useSession();
    const t = S[lang === "ar" ? "ar" : "en"];
    const isDark = theme === "dark";
    const [value, setValue] = useState(initial);
    const [state, setState] = useState("idle"); // idle | saving | saved | invalid | error

    async function onSubmit(e) {
        e.preventDefault();
        setState("saving");
        try {
            const res = await fetch("/api/account/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ displayName: value }),
            });
            if (res.status === 400) return setState("invalid");
            if (!res.ok) return setState("error");
            await update(); // refresh the session so the header menu shows the new name
            setState("saved");
        } catch {
            setState("error");
        }
    }

    const message = { saved: t.saved, invalid: t.nameInvalid, error: t.saveFailed }[state];

    return (
        <form onSubmit={onSubmit} style={{ marginBottom: 24 }}>
            <label htmlFor="account-display-name" style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>{t.displayName}</label>
            <input
                id="account-display-name"
                type="text"
                value={value}
                maxLength={60}
                placeholder={t.displayNamePlaceholder}
                aria-describedby="account-display-name-help account-display-name-status"
                onChange={(e) => { setValue(e.target.value); if (state !== "idle") setState("idle"); }}
                style={{ width: "100%", maxWidth: 420, padding: "10px 12px", fontSize: "1rem", borderRadius: 10, border: `1px solid ${isDark ? "#334155" : "#cbd5e1"}`, background: "transparent", color: "inherit" }}
            />
            <p id="account-display-name-help" style={{ margin: "6px 0 10px", fontSize: "0.88rem", opacity: 0.8 }}>{t.displayNameHelp}</p>
            <button type="submit" disabled={state === "saving"} className="byan-account-btn" style={{ minHeight: 40, padding: "8px 18px", borderRadius: 10, border: "1px solid currentColor", background: "transparent", color: "inherit", fontWeight: 700, cursor: "pointer" }}>
                {state === "saving" ? t.saving : t.save}
            </button>
            <span id="account-display-name-status" role="status" style={{ marginInlineStart: 12, fontSize: "0.9rem" }}>{message}</span>
        </form>
    );
}
