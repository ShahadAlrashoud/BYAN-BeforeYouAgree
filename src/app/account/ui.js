// Small shared style helpers for the Account area.
export function tokens(isDark) {
    return {
        line: isDark ? "#334155" : "#e2e8f0",
        danger: isDark ? "#f87171" : "#b91c1c",
        muted: isDark ? "#94a3b8" : "#64748b",
        surface: isDark ? "#0f172a" : "#ffffff",
        text: isDark ? "#f1f5f9" : "#1e293b",
        ok: isDark ? "#4ade80" : "#15803d",
    };
}

export const outlineBtn = {
    minHeight: 42,
    padding: "8px 18px",
    borderRadius: 10,
    border: "1px solid currentColor",
    background: "transparent",
    color: "inherit",
    fontWeight: 700,
    fontSize: "0.92rem",
    cursor: "pointer",
};

export const sectionBox = (line) => ({
    border: `1px solid ${line}`,
    borderRadius: 12,
    padding: "16px 18px",
    marginBottom: 16,
});

// Styles for the delete-account dialog
export function dialogStyles({ danger, text, line, surface, isAr, isDark }) {
    const btn = { minHeight: 44, padding: "10px 20px", borderRadius: 10, fontWeight: 700, fontSize: "0.92rem" };
    return {
        overlay: { position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(2,6,23,0.65)" },
        box: { width: "100%", maxWidth: 480, maxHeight: "calc(100vh - 32px)", overflowY: "auto", background: surface, color: text, border: `2px solid ${danger}`, borderRadius: 16, padding: "24px 22px 20px", boxShadow: "0 24px 60px rgba(0,0,0,0.4)", textAlign: isAr ? "right" : "left" },
        btn,
        ghost: { ...btn, border: `1px solid ${line}`, background: "transparent", color: text },
        outlineDanger: { ...btn, border: `2px solid ${danger}`, background: "transparent", color: danger },
        solidDanger: { ...btn, border: "none", background: danger, color: isDark ? "#0f172a" : "#ffffff" },
        field: { width: "100%", padding: "11px 12px", fontSize: "1rem", borderRadius: 10, border: `1px solid ${line}`, background: "transparent", color: text },
        row: { display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap", marginTop: 10 },
        alertBox: { minHeight: 24, marginTop: 8, color: danger, fontWeight: 600 },
        label: { display: "block", marginBottom: 6, fontWeight: 600 },
    };
}

export const visuallyHidden = {
    position: "absolute",
    width: 1,
    height: 1,
    overflow: "hidden",
    clip: "rect(0 0 0 0)",
    whiteSpace: "nowrap",
};
