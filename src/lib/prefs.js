// Saved preferences that work signed-out (localStorage) and signed-in (also saved to the account).
// Text size keeps its existing storage key, so the footer control and Settings share one value.
export const TEXT_SIZE_KEY = "byan-font-size";
export const TEXT_SIZE_STEPS = [100, 115, 130, 150];
export const RESULT_LANG_KEY = "byan-result-lang"; // "policy" | "my"

export function readResultLang() {
    try {
        const v = localStorage.getItem(RESULT_LANG_KEY);
        return v === "policy" ? "policy" : "my"; // default "my" = the behaviour before this setting existed
    } catch {
        return "my";
    }
}

export function writeResultLang(value) {
    const v = value === "policy" ? "policy" : "my";
    try {
        localStorage.setItem(RESULT_LANG_KEY, v);
    } catch {}
    window.dispatchEvent(new CustomEvent("byan-result-lang", { detail: v }));
}

export function readTextSize() {
    try {
        const n = Number(localStorage.getItem(TEXT_SIZE_KEY));
        return TEXT_SIZE_STEPS.includes(n) ? n : null;
    } catch {
        return null;
    }
}

// Applies a text size to the page and stores it. source: "control" (user clicked) or "sync" (loaded from the account)
export function applyTextSize(value, source = "control") {
    if (!TEXT_SIZE_STEPS.includes(value)) return;
    document.documentElement.style.fontSize = value + "%";
    try {
        localStorage.setItem(TEXT_SIZE_KEY, String(value));
    } catch {}
    window.dispatchEvent(new CustomEvent("byan-text-size", { detail: { value, source } }));
}
