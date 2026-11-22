"use client";

import { useState } from "react";
import { useTheme } from "../providers";
import { S } from "./strings";
import { outlineBtn } from "./ui";
import { SettingBox, Status } from "./SettingBox";

// Export my data: downloads a JSON file of the signed-in user's own data
export default function ExportSetting() {
    const { lang } = useTheme();
    const t = S[lang === "ar" ? "ar" : "en"];
    const [state, setState] = useState("idle"); // idle | working | failed | limited

    async function doExport() {
        setState("working");
        try {
            const res = await fetch("/api/account/export");
            if (res.status === 429) return setState("limited");
            if (!res.ok) return setState("failed");
            const blob = await res.blob();
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "byan-my-data.json";
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(a.href);
            setState("idle");
        } catch {
            setState("failed");
        }
    }

    return (
        <SettingBox id="set-export" title={t.exportTitle} help={t.exportHelp}>
            <button type="button" className="byan-account-btn" style={outlineBtn} onClick={doExport} disabled={state === "working"}>
                {state === "working" ? t.exportWorking : t.exportButton}
            </button>
            {state === "failed" && <Status text={t.exportFailed} bad />}
            {state === "limited" && <Status text={t.tooMany} bad />}
        </SettingBox>
    );
}
