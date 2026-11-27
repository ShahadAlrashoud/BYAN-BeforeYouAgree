import { cache } from "react";
import ResultsClient from "./ResultsClient";
import { getAnalysisById } from "@/database/db";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.byan.website").replace(/\/$/, "");

// Shared within one request, so the metadata and the page don't both hit the DB.
const loadAnalysis = cache(async (id) => {
    try {
        return await getAnalysisById(id);
    } catch (e) {
        console.error("OG METADATA ERROR:", e);
        return null;
    }
});

function siteLabel(r) {
    const candidate = r.resolvedUrl || r.url;
    if (candidate) {
        try {
            return new URL(candidate).hostname.replace(/^www\./, "");
        } catch {
            // not a valid URL; fall through to the title
        }
    }
    return r.title || "";
}

function truncate(text, max = 200) {
    if (text.length <= max) return text;
    const cut = text.slice(0, max - 1);
    const lastSpace = cut.lastIndexOf(" ");
    const trimmed = lastSpace > 120 ? cut.slice(0, lastSpace) : cut;
    return trimmed.trimEnd() + "…";
}

export async function generateMetadata({ searchParams }) {
    const params = await searchParams;
    const id = params?.id;

    const fallback = {
        title: "Privacy analysis result | BYAN",
        description: "See the risks found in a privacy policy or terms of service.",
    };
    if (!id || typeof id !== "string") return fallback;

    const r = await loadAnalysis(id);
    const score = Number(r?.riskScore);
    if (!r || !Number.isFinite(score)) return fallback;

    const label = siteLabel(r) || "Result";
    const count = Array.isArray(r.clauses) ? r.clauses.length : 0;
    const title = `${label}: risk ${score}/100 (${r.riskLevel || "n/a"}) | BYAN`;
    const summary = r.summaryEn || r.result || "";
    const description = truncate(
        `${count} risky clause${count === 1 ? "" : "s"} found. ${summary}`.trim()
    );

    const pageUrl = `${SITE}/results?id=${encodeURIComponent(id)}`;
    const image = {
        url: `${SITE}/api/og/${encodeURIComponent(id)}`,
        width: 1200,
        height: 630,
        alt: title,
    };

    return {
        title: { absolute: title },
        description,
        alternates: { canonical: pageUrl },
        openGraph: {
            title,
            description,
            type: "website",
            url: pageUrl,
            images: [image],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [image.url],
        },
    };
}

export default function ResultsPage() {
    return <ResultsClient />;

}
