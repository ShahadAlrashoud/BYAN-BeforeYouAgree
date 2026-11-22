"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "../providers";
import { ACCOUNT_V2 } from "@/lib/flags";
import { applyTextSize, writeResultLang, readTextSize, TEXT_SIZE_STEPS } from "@/lib/prefs";

// Keeps saved preferences in step for signed-in people.
//  - On sign-in (once per browser tab): load the account's saved settings and apply them.
//    If the account has none yet, the values already chosen in this browser are saved instead.
//  - After that: when text size changes anywhere (Settings or the footer control), save it to the account.
// Signed-out visitors are untouched: their choices stay in localStorage only.
export default function SettingsSync() {
    const { status, data: session } = useSession();
    const { lang, setLang } = useTheme();
    const loadedFor = useRef(null);
    const userId = session?.user?.id;

    useEffect(() => {
        if (!ACCOUNT_V2 || status !== "authenticated" || !userId) return;
        if (loadedFor.current === userId) return;
        loadedFor.current = userId;

        let cancelled = false;
        (async () => {
            try {
                const res = await fetch("/api/account/settings");
                if (!res.ok || cancelled) return;
                const s = await res.json();

                if (s.textSize) applyTextSize(s.textSize, "sync");
                if (s.resultLang) writeResultLang(s.resultLang);
                if (s.uiLang && s.uiLang !== lang) setLang(s.uiLang);

                // Nothing saved for this account yet: save what this browser already has
                const first = !s.uiLang && !s.textSize && !s.resultLang;
                if (first) {
                    const size = readTextSize();
                    const body = { uiLang: lang };
                    if (size) body.textSize = size;
                    await fetch("/api/account/settings", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body),
                    });
                }
            } catch {
                /* preferences still work from this browser */
            }
        })();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, userId]);

    // Footer text-size control (or Settings): save the new size to the account
    useEffect(() => {
        if (!ACCOUNT_V2 || status !== "authenticated") return;
        function onSize(e) {
            const v = e.detail?.value;
            if (e.detail?.source !== "control" || !TEXT_SIZE_STEPS.includes(v)) return;
            fetch("/api/account/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ textSize: v }),
            }).catch(() => {});
        }
        window.addEventListener("byan-text-size", onSize);
        return () => window.removeEventListener("byan-text-size", onSize);
    }, [status]);

    return null;
}
