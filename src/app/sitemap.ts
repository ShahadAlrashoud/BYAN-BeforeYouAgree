import type { MetadataRoute } from "next";
import { GLOSSARY } from "@/data/glossary";
import { SITE_URL } from "@/lib/site";
import { toArabicPath } from "@/lib/lang";

// Every public page. Results, login, signup, profile and other private or per-user pages are left out.
const PAGES = [
  "/",
  "/how-it-works",
  "/compare",
  "/glossary",
  "/about",
  "/faq",
  "/contact",
  "/privacy",
  "/terms",
  "/disclaimer",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  const add = (path: string, arabic: boolean, priority: number, changeFrequency: "weekly" | "monthly") => {
    const en = `${SITE_URL}${path}`;
    const ar = `${SITE_URL}${toArabicPath(path)}`;
    // Each language version is listed, with hreflang links to its counterpart and x-default
    const languages: Record<string, string> = arabic ? { en, ar, "x-default": en } : { en, "x-default": en };
    entries.push({ url: en, changeFrequency, priority, alternates: { languages } });
    if (arabic) entries.push({ url: ar, changeFrequency, priority, alternates: { languages } });
  };

  for (const path of PAGES) {
    add(path, true, path === "/" ? 1 : 0.7, path === "/" ? "weekly" : "monthly");
  }

  // Glossary term pages. An entry whose Arabic is still awaiting review has no Arabic URL
  // listed (that page is noindex until the Arabic is approved).
  for (const term of GLOSSARY) {
    add(`/glossary/${term.id}`, !term.arPending, 0.6, "monthly");
  }

  return entries;
}