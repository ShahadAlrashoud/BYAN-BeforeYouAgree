// Server-side SEO helpers: reads the request language and builds page metadata.
// (Uses next/headers, so import this from server code only: layouts, pages, generateMetadata.)
import { headers } from "next/headers";
import type { Metadata } from "next";
import { SEO_COPY } from "@/data/seoCopy";
import { OG_IMAGE, SITE_URL } from "./site";
import { toArabicPath, type Lang } from "./lang";

// Set by src/proxy.ts on every page request: "ar" for /ar/*, otherwise "en".
export async function getRequestLang(): Promise<Lang> {
    const h = await headers();
    return h.get("x-byan-lang") === "ar" ? "ar" : "en";
}

export const SEO_PATHS = {
    home: "/",
    howItWorks: "/how-it-works",
    compare: "/compare",
    glossary: "/glossary",
    about: "/about",
    faq: "/faq",
    contact: "/contact",
    privacy: "/privacy",
    terms: "/terms",
    disclaimer: "/disclaimer",
} as const;

type BuildArgs = {
    title: string;
    description: string;
    path: string; // English path, e.g. "/about"
    lang: Lang;
    hasArabic?: boolean; // false: no Arabic version to point hreflang at
    noindex?: boolean;
};

// Full metadata for one page: title, description, canonical, hreflang, Open Graph, Twitter.
export function buildMetadata({ title, description, path, lang, hasArabic = true, noindex = false }: BuildArgs): Metadata {
    const enUrl = `${SITE_URL}${path}`;
    const arUrl = `${SITE_URL}${toArabicPath(path)}`;
    const url = lang === "ar" ? arUrl : enUrl;

    const languages: Record<string, string> = { en: enUrl, "x-default": enUrl };
    if (hasArabic) languages.ar = arUrl;

    return {
        // "absolute" skips the site title template, so the title is exactly as written
        title: { absolute: title },
        description,
        alternates: {
            // A noindex Arabic page points search engines at the English original
            canonical: noindex && lang === "ar" ? enUrl : url,
            languages,
        },
        robots: noindex ? { index: false, follow: true } : undefined,
        openGraph: {
            type: "website",
            siteName: "BYAN",
            title,
            description,
            url,
            locale: lang === "ar" ? "ar_SA" : "en_US",
            alternateLocale: lang === "ar" ? ["en_US"] : ["ar_SA"],
            images: [OG_IMAGE],
        },
        twitter: {
            // The default image is the square logo, so use the "summary" card
            card: "summary",
            title,
            description,
            images: [OG_IMAGE.url],
        },
    };
}

// Metadata for one of the main pages, using the copy in src/data/seoCopy.js
export async function pageMetadata(key: keyof typeof SEO_PATHS): Promise<Metadata> {
    const lang = await getRequestLang();
    const copy = SEO_COPY[key][lang];
    return buildMetadata({
        title: copy.title,
        description: copy.description,
        path: SEO_PATHS[key],
        lang,
    });
}
