import ResultsClient from "./ResultsClient";
import { getAnalysisById } from "@/database/db";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.byan.website";

function hostOf(url) {
    try {
        return new URL(url).hostname.replace(/^www\./, "");
    } catch {
        return url || "";
    }
}

export async function generateMetadata({ searchParams }) {
    const params = await searchParams;
    const id = params?.id;

    const fallback = {
        title: "Privacy analysis result | BYAN",
        description: "See the risks found in a privacy policy or terms of service."
    };
    if (!id || typeof id !== "string") return fallback;

    let r = null;
    try {
        r = await getAnalysisById(id);
    } catch (e) {
        console.error("OG METADATA ERROR:", e);
    }

    const score = Number(r?.riskScore);
    if (!r || !Number.isFinite(score)) return fallback;

    const site = hostOf(r.resolvedUrl || r.url || r.title);
    const count = Array.isArray(r.clauses) ? r.clauses.length : 0;
    const title = `${site || "Result"}: risk ${score}/100 (${r.riskLevel || "n/a"}) | BYAN`;
    const description = `${count} risky clause${count === 1 ? "" : "s"} found. ${r.summaryEn || r.result || ""
        }`.trim().slice(0, 200);
    const image = {
        url: `${SITE}/api/og/${encodeURIComponent(id)}`,
        width: 1200,
        height: 630,
        alt: title
    };

    return {
        title: { absolute: title },
        description,
        alternates: { canonical: `${SITE}/results?id=${id}` },
        openGraph: {
            title,
            description,
            type: "website",
            url: `${SITE}/results?id=${id}`,
            images: [image]
        },
        twitter: { card: "summary_large_image", title, description, images: [image.url] }
    };
}

export default function ResultsPage() {
    return <ResultsClient />;
}