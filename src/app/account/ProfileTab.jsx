"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "../providers";
import { S } from "./strings";
import DisplayNameForm from "./DisplayNameForm";
import ChangeEmail from "./ChangeEmail";
import DeleteAccountV2 from "./DeleteAccountV2";

// Profile tab: display name, read-only email with "Change email", and the danger zone.
// The user id is deliberately NOT shown here.
export default function ProfileTab() {
    const { data: session, status } = useSession();
    const { lang, theme } = useTheme();
    const t = S[lang === "ar" ? "ar" : "en"];
    const isDark = theme === "dark";
    const danger = isDark ? "#f87171" : "#b91c1c";
    const line = isDark ? "#334155" : "#e2e8f0";

    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleted, setDeleted] = useState(null);
    const doneRef = useRef(null);

    useEffect(() => {
        if (deleted) doneRef.current?.focus();
    }, [deleted]);

    async function handleDeleted({ emailSent }) {
        setDialogOpen(false);
        setDeleted({ emailSent });
        try {
            await signOut({ redirect: false });
        } catch {
            /* the account is already gone, so the session is invalid anyway */
        }
    }

    if (deleted) {
        return (
            <div ref={doneRef} tabIndex={-1} role="status" style={{ border: `1px solid ${line}`, borderRadius: 12, padding: 20, outline: "none" }}>
                <h2 style={{ marginTop: 0 }}>{t.doneTitle}</h2>
                <p>{t.doneText}</p>
                <p>{deleted.emailSent ? t.doneEmail : t.doneNoEmail}</p>
                <p><Link href="/">{t.backHome}</Link></p>
            </div>
        );
    }

    if (!session?.user) {
        return <p>{t.needSignIn} <Link href="/">{t.backHome}</Link></p>;
    }

    return (
        <div>
            <DisplayNameForm initial={session.user.displayName || ""} />
            <ChangeEmail email={session.user.email} />

            <p style={{ marginTop: 20 }}>
                <Link href="/saved-analyses">{t.savedLink}</Link>
            </p>

            {/* Danger zone, kept separate from the profile details above */}
            <section aria-labelledby="byan-danger-title" style={{ marginTop: 48, padding: 18, border: `2px solid ${danger}`, borderRadius: 12 }}>
                <h2 id="byan-danger-title" style={{ margin: "0 0 8px", fontSize: "1.1rem", color: danger }}>{t.dangerTitle}</h2>
                <p style={{ margin: "0 0 10px", lineHeight: 1.6 }}>{t.dangerText}</p>
                {/* [PRIVACY TEAM: confirm] deletion timing sentence */}
                <p style={{ margin: "0 0 14px", lineHeight: 1.6, fontSize: "0.9rem", opacity: 0.85 }}>{t.deleteTiming}</p>
                <button
                    type="button"
                    className="byan-danger-btn"
                    onClick={() => setDialogOpen(true)}
                    aria-haspopup="dialog"
                    style={{ minHeight: 44, padding: "10px 20px", borderRadius: 10, border: `2px solid ${danger}`, background: "transparent", color: danger, fontWeight: 800, fontSize: "0.92rem", cursor: "pointer" }}
                >
                    {t.deleteButton}
                </button>
            </section>

            <DeleteAccountV2 open={dialogOpen} email={session.user.email} onClose={() => setDialogOpen(false)} onDeleted={handleDeleted} />
        </div>
    );
}
