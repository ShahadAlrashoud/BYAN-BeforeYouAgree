import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // Public pages (including /ar/* and every glossary term) are crawlable.
    // Only API routes and per-user or private pages are blocked.
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/profile", "/saved-analyses", "/settings", "/login", "/signup", "/forgot-password", "/reset-password", "/analyze"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}