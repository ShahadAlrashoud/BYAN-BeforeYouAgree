import type { MetadataRoute } from "next";
import { GLOSSARY } from "@/data/glossary";
import { SITE_URL } from "@/lib/site";
import { toArabicPath } from "@/lib/lang";
import { aiFlags } from "@/lib/aiConfig";

// Recomputed on each request, so /popular appears or disappears as the counts change
export const dynamic = "force-dynamic";

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  // /popular is listed only while POPULAR_PAGE is on AND the list has at least one entry.
  // It is a dynamic check, not a fixed entry. If the database cannot be read, the page is left out.
  if (aiFlags().popularPage) {
    try {
      // Loaded here, not at the top, so nothing touches the database module while the flag is off
      const { getPopularEntries } = await import("@/database/popularDb");
      if ((await getPopularEntries()).length > 0) add("/popular", true, 0.4, "weekly");
    } catch {
      console.error("SITEMAP POPULAR CHECK FAILED");
    }
  }

  return entries;
}