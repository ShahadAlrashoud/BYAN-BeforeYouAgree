// Language-aware URL helpers. Pure functions: safe to use in client and server code.
//
// Arabic versions live under /ar (for example /ar/about). The proxy (src/proxy.ts)
// rewrites /ar/* to the same page and tells the app the language is Arabic.

export type Lang = "en" | "ar";

// Public pages that have an Arabic URL. Glossary term pages (/glossary/<slug>) do too.
const LOCALIZABLE = [
    "/",
    "/how-it-works",
    "/compare",
    "/glossary",
    "/popular", // only exists while the POPULAR_PAGE flag is on (otherwise a 404)
    "/about",
    "/faq",
    "/contact",
    "/privacy",
    "/terms",
    "/disclaimer",
];

export function hasArPrefix(pathname: string): boolean {
    return pathname === "/ar" || pathname.startsWith("/ar/");
}

export function stripArPrefix(pathname: string): string {
    if (!hasArPrefix(pathname)) return pathname;
    return pathname.slice(3) || "/";
}

export function isLocalizable(pathname: string): boolean {
    const p = stripArPrefix(pathname).replace(/\/+$/, "") || "/";
    return LOCALIZABLE.includes(p) || p.startsWith("/glossary/");
}

export function toArabicPath(pathname: string): string {
    const p = stripArPrefix(pathname);
    return p === "/" ? "/ar" : `/ar${p}`;
}

export function toEnglishPath(pathname: string): string {
    return stripArPrefix(pathname);
}

// Turns an internal href into its Arabic URL when the UI is Arabic.
// Keeps any ?query or #hash. Links to pages without an Arabic URL are left alone.
export function localizeHref(href: string, lang: Lang): string {
    if (lang !== "ar" || !href.startsWith("/")) return href;
    const match = href.match(/^([^?#]*)(.*)$/);
    const path = match ? match[1] : href;
    const rest = match ? match[2] : "";
    if (hasArPrefix(path) || !isLocalizable(path)) return href;
    return toArabicPath(path) + rest;
}
