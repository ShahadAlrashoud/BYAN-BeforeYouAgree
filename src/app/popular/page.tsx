import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PopularClient from "./PopularClient";
import { popularStrings } from "./strings";
import { aiFlags } from "@/lib/aiConfig";
import { buildMetadata, getRequestLang } from "@/lib/seo";
import type { getPopularEntries as GetPopularEntries } from "@/database/popularDb";

// Read per request: the flag and the counts are checked every time, never frozen at build time
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
    if (!aiFlags().popularPage) return {};
    const lang = await getRequestLang();
    const copy = popularStrings[lang];
    return buildMetadata({
        title: copy.metaTitle,
        description: copy.metaDescription,
        path: "/popular",
        lang,
        noindex: true, // a list that changes daily is not worth indexing
    });
}

export default async function PopularPage() {
    // Flag off: the page does not exist
    if (!aiFlags().popularPage) notFound();

    let entries: Awaited<ReturnType<typeof GetPopularEntries>> = [];
    let unavailable = false;
    try {
        // Loaded here so the database module is never touched while the flag is off
        const { getPopularEntries } = await import("@/database/popularDb");
        entries = await getPopularEntries();
    } catch {
        // No details are logged: the error could contain query text
        console.error("POPULAR PAGE QUERY FAILED");
        unavailable = true;
    }

    return <PopularClient entries={entries} unavailable={unavailable} />;
}
