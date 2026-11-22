"use client";

import { useTheme } from "../providers";
import { tokens, sectionBox } from "./ui";

// A titled settings box, used by the export / sign-out / clear sections
export function SettingBox({ id, title, help, children }) {
    const { theme } = useTheme();
    const { line } = tokens(theme === "dark");
    return (
        <section aria-labelledby={id} style={sectionBox(line)}>
            <h2 id={id} style={{ margin: "0 0 6px", fontSize: "1.05rem" }}>{title}</h2>
            <p style={{ margin: "0 0 12px", fontSize: "0.9rem", opacity: 0.85 }}>{help}</p>
            {children}
        </section>
    );
}

// A short status line read out by screen readers
export function Status({ text, bad }) {
    const { theme } = useTheme();
    const { danger } = tokens(theme === "dark");
    return (
        <p role="status" style={{ margin: "10px 0 0", color: bad ? danger : "inherit", fontWeight: 600 }}>
            {text}
        </p>
    );
}
