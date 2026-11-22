"use client";

import { useEffect, useRef, useState } from "react";
import { S } from "./strings";

// Same rule the server enforces: the email address or the word DELETE (any letter case)
export function matches(input, email) {
    const typed = input.trim().toLowerCase();
    return Boolean(typed) && (typed === "delete" || typed === String(email || "").trim().toLowerCase());
}

// Logic for the two-step delete: (1) type the email or DELETE, (2) re-authenticate, then delete.
// The server repeats both checks, so the dialog cannot be used to skip them.
export function useDeleteFlow({ open, email, lang, onDeleted }) {
    const t = S[lang === "ar" ? "ar" : "en"];
    const [step, setStep] = useState(1);
    const [typed, setTyped] = useState("");
    const [password, setPassword] = useState("");
    const [hasPassword, setHasPassword] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const firstField = useRef(null);

    useEffect(() => {
        if (!open) return;
        setStep(1); setTyped(""); setPassword(""); setError(""); setBusy(false);
        fetch("/api/account/profile").then((r) => r.json()).then((d) => setHasPassword(d.hasPassword !== false)).catch(() => {});
    }, [open]);

    // Move focus to the first control of each step
    useEffect(() => {
        if (open) setTimeout(() => firstField.current?.focus(), 0);
    }, [open, step]);

    function next(e) {
        e.preventDefault();
        if (!matches(typed, email)) return setError(t.delMismatch);
        setError("");
        setStep(2);
    }

    function back() {
        setStep(1);
        setError("");
    }

    async function remove(e) {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
            const res = await fetch("/api/account/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ confirmation: typed.trim(), password, lang }),
            });
            const d = await res.json().catch(() => ({}));
            if (res.ok) return onDeleted({ emailSent: Boolean(d.emailSent) });
            setBusy(false);
            if (res.status === 429) setError(t.delTooMany);
            else if (d.error === "reauth_failed") setError(t.delWrongPassword);
            else if (d.error === "fresh_signin_required") setError(t.delFreshLabel);
            else if (res.status === 400) { setStep(1); setError(t.delMismatch); }
            else setError(t.delError);
        } catch {
            setBusy(false);
            setError(t.delError);
        }
    }

    return {
        t, step, typed, setTyped, password, setPassword, hasPassword,
        busy, error, setError, firstField, next, back, remove,
    };
}
