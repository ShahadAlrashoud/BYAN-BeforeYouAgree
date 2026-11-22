"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTheme } from "../../providers";
import { S } from "../strings";
import { outlineBtn } from "../ui";

// Opened from the link in the verification email. The email only changes when the person
// presses "Confirm change" (a POST), so mail scanners that pre-open links cannot change it.
export default function ConfirmEmail() {
    const { lang } = useTheme();
    const t = S[lang === "ar" ? "ar" : "en"];
    const params = useSearchParams();
    const token = params.get("token") || "";
    const [state, setState] = useState("ready"); // ready | working | done | invalid | taken
    const result = useRef(null);

    useEffect(() => {
        if (state !== "ready" && state !== "working") result.current?.focus();
    }, [state]);

    async function confirm() {
        setState("working");
        try {
            const res = await fetch("/api/account/email/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
            });
            const d = await res.json().catch(() => ({}));
            if (res.ok) setState("done");
            else if (d.error === "email_taken") setState("taken");
            else setState("invalid");
        } catch {
            setState("invalid");
        }
    }

    return (
        <div dir={lang === "ar" ? "rtl" : "ltr"} lang={lang === "ar" ? "ar" : "en"} style={{ maxWidth: 560, margin: "40px auto", padding: "0 16px" }}>
            <h1>{t.confirmTitle}</h1>
            {state === "ready" || state === "working" ? (
                <button type="button" className="byan-account-btn" style={outlineBtn} onClick={confirm} disabled={state === "working" || !token}>
                    {state === "working" ? t.confirmWorking : t.confirmButton}
                </button>
            ) : (
                <div ref={result} tabIndex={-1} role="status" style={{ outline: "none" }}>
                    <p>{state === "done" ? t.confirmDone : state === "taken" ? t.confirmTaken : t.confirmFailed}</p>
                    <Link href={state === "done" ? "/login" : "/account/profile"}>{state === "done" ? t.signInLink : t.backToAccount}</Link>
                </div>
            )}
        </div>
    );
}
