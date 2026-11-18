import ResultsClient from "./ResultsClient";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.byan.website";

async function loadResult(id) {
    try {
        const res = await fetch(`${SITE}/api/result/${encodeURIComponent(id)}`, {
            cache: "no-store"
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data?.result || data;
    } catch {
        return null;
    }
}

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
    if (!id) return fallback;

    const r = await loadResult(id);
    if (!r || typeof r.riskScore !== "number") return fallback;

    const site = hostOf(r.resolvedUrl || r.url);
    const count = Array.isArray(r.clauses) ? r.clauses.length : 0;
    const title = `${site || "Result"}: risk ${r.riskScore}/100 (${r.riskLevel}) | BYAN`;
    const description = `${count} risky clause${count === 1 ? "" : "s"} found. ${r.summaryEn || ""
        }`.trim().slice(0, 200);
    const image = {
        url: `${SITE}/api/og/${encodeURIComponent(id)}`,
        width: 1200,
        height: 630,
        alt: title
    };

    return {
        title,
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