"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "../providers";
import { S } from "./strings";
import { tokens, outlineBtn } from "./ui";
import { SettingBox, Status } from "./SettingBox";

// Clear all saved results: removes the user's SAVED LIST only. The account stays, and share
// links stay active. The confirmation names how many results will be removed.
export default function ClearSavedSetting() {
    const { lang, theme } = useTheme();
    const t = S[lang === "ar" ? "ar" : "en"];
    const { danger } = tokens(theme === "dark");
    const [count, setCount] = useState(null);
    const [ask, setAsk] = useState(false);
    const [res, setRes] = useState({ state: "idle", n: 0 }); // idle | working | done | failed | changed
    const yes = useRef(null);
    const open = useRef(null);

    useEffect(() => {
        fetch("/api/account/saved-results").then((r) => r.json()).then((d) => setCount(d.count ?? 0)).catch(() => setCount(null));
    }, []);
    useEffect(() => {
        if (ask) yes.current?.focus();
    }, [ask]);

    function close() {
        setAsk(false);
        setTimeout(() => open.current?.focus(), 0);
    }

    async function confirm() {
        setRes({ state: "working", n: 0 });
        try {
            const r = await fetch("/api/account/saved-results", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ confirmCount: count }),
            });
            const d = await r.json().catch(() => ({}));
            if (r.status === 409) {
                setCount(d.count ?? 0);
                setRes({ state: "changed", n: 0 });
            } else if (!r.ok) {
                setRes({ state: "failed", n: 0 });
            } else {
                setCount(0);
                setRes({ state: "done", n: d.deleted ?? 0 });
            }
        } catch {
            setRes({ state: "failed", n: 0 });
        }
        close();
    }

    return (
        <SettingBox id="set-clear" title={t.clearTitle} help={t.clearHelp}>
            {count === 0 ? (
                <p style={{ margin: 0 }}>{t.clearNone}</p>
            ) : !ask ? (
                <button ref={open} type="button" className="byan-account-btn" style={outlineBtn} disabled={count === null} onClick={() => { setRes({ state: "idle", n: 0 }); setAsk(true); }}>
                    {t.clearButton}
                </button>
            ) : (
                <div role="group" aria-label={t.clearTitle} onKeyDown={(e) => e.key === "Escape" && close()}>
                    <p style={{ margin: "0 0 6px", fontWeight: 700 }}>{t.clearConfirm(count)}</p>
                    <p style={{ margin: "0 0 10px", fontSize: "0.9rem" }}>{t.clearNote}</p>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button ref={yes} type="button" className="byan-account-btn" style={{ ...outlineBtn, color: danger }} onClick={confirm} disabled={res.state === "working"}>
                            {res.state === "working" ? t.working : t.clearYes}
                        </button>
                        <button type="button" className="byan-account-btn" style={outlineBtn} onClick={close}>{t.cancel2}</button>
                    </div>
                </div>
            )}
            {res.state === "done" && <Status text={t.clearDone(res.n)} />}
            {res.state === "changed" && <Status text={t.clearChanged} bad />}
            {res.state === "failed" && <Status text={t.failed} bad />}
        </SettingBox>
    );
}
