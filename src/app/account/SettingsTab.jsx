"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "../providers";
import { S } from "./strings";
import { tokens, sectionBox } from "./ui";
import { TEXT_SIZE_STEPS, readTextSize, applyTextSize, readResultLang, writeResultLang } from "@/lib/prefs";
import SettingsAccountActions from "./SettingsAccountActions";

function save(body) {
    return fetch("/api/account/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    }).catch(() => {});
}

// A group of radio-style buttons that works with the keyboard and screen readers
function Choice({ legend, help, name, value, options, onChange, line }) {
    return (
        <fieldset style={{ ...sectionBox(line), minInlineSize: 0 }}>
            <legend style={{ fontWeight: 700, padding: "0 6px" }}>{legend}</legend>
            <p style={{ margin: "0 0 12px", fontSize: "0.9rem", opacity: 0.85 }}>{help}</p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                {options.map((o) => (
                    <label key={String(o.value)} style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 36, cursor: "pointer" }}>
                        <input
                            type="radio"
                            name={name}
                            checked={value === o.value}
                            onChange={() => onChange(o.value)}
                            lang={o.lang}
                            style={{ width: 18, height: 18 }}
                        />
                        <span lang={o.lang}>{o.label}</span>
                    </label>
                ))}
            </div>
        </fieldset>
    );
}

// Settings tab. Signed in: saved to the account (and kept in this browser). Signed out: this browser only.
export default function SettingsTab() {
    const { data: session } = useSession();
    const { lang, setLang, theme } = useTheme();
    const t = S[lang === "ar" ? "ar" : "en"];
    const { line } = tokens(theme === "dark");
    const signedIn = Boolean(session?.user);

    const [size, setSize] = useState(100);
    const [resultLang, setResultLang] = useState("my");

    useEffect(() => {
        setSize(readTextSize() || 100);
        setResultLang(readResultLang());
        const onSize = (e) => e.detail?.value && setSize(e.detail.value);
        window.addEventListener("byan-text-size", onSize);
        return () => window.removeEventListener("byan-text-size", onSize);
    }, []);

    function chooseLang(code) {
        setLang(code); // updates the page, local storage and the /ar URL
        if (signedIn) save({ uiLang: code });
    }
    function chooseSize(n) {
        setSize(n);
        applyTextSize(n, "control"); // the sync listener saves it to the account when signed in
    }
    function chooseResult(v) {
        setResultLang(v);
        writeResultLang(v);
        if (signedIn) save({ resultLang: v });
    }

    return (
        <div>
            <p style={{ marginTop: 0 }}>{signedIn ? t.settingsIntro : t.guestNote}</p>

            <Choice
                legend={t.langTitle}
                help={t.langHelp}
                name="ui-lang"
                value={lang}
                line={line}
                onChange={chooseLang}
                options={[
                    { value: "en", label: t.langEn, lang: "en" },
                    { value: "ar", label: t.langAr, lang: "ar" },
                ]}
            />

            <Choice
                legend={t.textTitle}
                help={t.textHelp}
                name="text-size"
                value={size}
                line={line}
                onChange={chooseSize}
                options={TEXT_SIZE_STEPS.map((n) => ({ value: n, label: `${n}%` }))}
            />

            <Choice
                legend={t.resultTitle}
                help={t.resultHelp}
                name="result-lang"
                value={resultLang}
                line={line}
                onChange={chooseResult}
                options={[
                    { value: "policy", label: t.resultPolicy },
                    { value: "my", label: t.resultMy },
                ]}
            />

            {signedIn && <SettingsAccountActions />}
        </div>
    );
}
