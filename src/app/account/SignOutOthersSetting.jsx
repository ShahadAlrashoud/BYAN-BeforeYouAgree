"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "../providers";
import { S } from "./strings";
import { outlineBtn } from "./ui";
import { SettingBox, Status } from "./SettingBox";

// Sign out of all devices except this one, with a confirmation step.
// This device is NOT signed out: the server gives this session a fresh stamp.
export default function SignOutOthersSetting() {
    const { lang } = useTheme();
    const { update } = useSession();
    const t = S[lang === "ar" ? "ar" : "en"];
    const [ask, setAsk] = useState(false);
    const [state, setState] = useState("idle"); // idle | working | done | failed
    const yes = useRef(null);
    const open = useRef(null);

    useEffect(() => {
        if (ask) yes.current?.focus();
    }, [ask]);

    function close() {
        setAsk(false);
        setTimeout(() => open.current?.focus(), 0);
    }

    async function confirm() {
        setState("working");
        try {
            const next = await update({ signOutOthers: true });
            // The server stamps the session only when the cut-off was really saved
            setState(next?.lastRevokeAt ? "done" : "failed");
        } catch {
            setState("failed");
        }
        close();
    }

    return (
        <SettingBox id="set-signout" title={t.signOutAllTitle} help={t.signOutAllHelp}>
            {!ask ? (
                <button ref={open} type="button" className="byan-account-btn" style={outlineBtn} onClick={() => { setState("idle"); setAsk(true); }}>
                    {t.signOutAllButton}
                </button>
            ) : (
                <div role="group" aria-label={t.signOutAllTitle} onKeyDown={(e) => e.key === "Escape" && close()}>
                    <p style={{ margin: "0 0 10px" }}>{t.signOutAllConfirm}</p>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button ref={yes} type="button" className="byan-account-btn" style={outlineBtn} onClick={confirm} disabled={state === "working"}>
                            {state === "working" ? t.working : t.signOutAllYes}
                        </button>
                        <button type="button" className="byan-account-btn" style={outlineBtn} onClick={close}>{t.cancel2}</button>
                    </div>
                </div>
            )}
            {state === "done" && <Status text={t.signOutAllDone} />}
            {state === "failed" && <Status text={t.failed} bad />}
        </SettingBox>
    );
}
