import { getAnalysisById } from "@/database/db";

const COLORS = { safe: "#1f7a4d", moderate: "#8a6410", high: "#b42323", none: "#475569" };

function tierOf(level) {
    const l = String(level || "").toLowerCase();
    if (l.includes("safe")) return "safe";
    if (l.includes("high")) return "high";
    return "moderate";
}

export async function GET(_request, { params }) {
    const { id } = await params;
    const record = await getAnalysisById(id);

    const n = record ? Number(record.riskScore) : NaN;
    const found = Number.isFinite(n);
    const value = found ? `${Math.round(n)} / 100` : "n/a";
    const color = found ? COLORS[tierOf(record.riskLevel)] : COLORS.none;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="22" role="img" aria-label="BYAN risk score: ${value}">
  <title>BYAN risk score: ${value}</title>
  <rect width="150" height="22" rx="4" fill="#1e3a5f"/>
  <rect x="70" width="80" height="22" rx="4" fill="${color}"/>
  <rect x="70" width="8" height="22" fill="${color}"/>
  <g fill="#ffffff" font-family="Verdana, Arial, sans-serif" font-size="11" text-anchor="middle">
    <text x="35" y="15">BYAN risk</text>
    <text x="110" y="15" font-weight="700">${value}</text>
  </g>
</svg>`;

    return new Response(svg, {
        status: found ? 200 : 404,
        headers: {
            "Content-Type": "image/svg+xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600"
        }
    });
}