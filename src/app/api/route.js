import { ImageResponse } from "next/og";

export const runtime = "nodejs";

const TIERS = {
    safe: { bg: "#eafcf1", ring: "#86d9a4", text: "#2b6b49", label: "Safe" },
    moderate: { bg: "#fdf6e3", ring: "#f2c96b", text: "#7a5c12", label: "Moderate" },
    high: { bg: "#fdecec", ring: "#f19a9a", text: "#a03636", label: "High risk" }
};

function tierOf(level) {
    const l = (level || "").toLowerCase();
    if (l.includes("safe")) return "safe";
    if (l.includes("high")) return "high";
    return "moderate";
}

function hostOf(url) {
    try {
        return new URL(url).hostname.replace(/^www\./, "");
    } catch {
        return url || "";
    }
}

export async function GET(request, { params }) {
    const { id } = await params;
    const origin = new URL(request.url).origin;

    let r = null;
    try {
        const res = await fetch(`${origin}/api/result/${encodeURIComponent(id)}`, {
            cache: "no-store"
        });
        if (res.ok) {
            const d = await res.json();
            r = d?.result || d;
        }
    } catch { }

    const found = r && typeof r.riskScore === "number";
    const c = TIERS[tierOf(r?.riskLevel)];
    const site = found ? hostOf(r.resolvedUrl || r.url) : "BYAN";
    const count = Array.isArray(r?.clauses) ? r.clauses.length : 0;

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: 64,
                    background: "#ffffff",
                    color: "#1e293b"
                }}
            >
                <div style={{ display: "flex", fontSize: 34, fontWeight: 700, color: "#1e3a5f" }}>
                    BYAN · Privacy policy check
                </div>

                <div style={{ display: "flex", alignItems: "center" }}>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 260,
                            height: 260,
                            borderRadius: 130,
                            background: c.bg,
                            border: `12px solid ${c.ring}`,
                            color: c.text
                        }}
                    >
                        <div style={{ display: "flex", fontSize: 40 }}>
                            {found ? (tierOf(r.riskLevel) === "high" ? "▲" : tierOf(r.riskLevel) === "safe" ? "✓" : "!") : "?"}
                        </div>
                        <div style={{ display: "flex", fontSize: 110, fontWeight: 700, lineHeight: 1 }}>
                            {found ? r.riskScore : "–"}
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", marginLeft: 56, maxWidth: 700 }}>
                        <div style={{ display: "flex", fontSize: 64, fontWeight: 700 }}>{site}</div>
                        <div style={{ display: "flex", fontSize: 40, color: c.text, marginTop: 12 }}>
                            {found ? `${c.label} · ${r.riskScore}/100` : "Result not found"}
                        </div>
                        {found && (
                            <div style={{ display: "flex", fontSize: 32, color: "#475569", marginTop: 12 }}>
                                {count} risky clause{count === 1 ? "" : "s"} found
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: "flex", fontSize: 28, color: "#475569" }}>byan.website</div>
            </div>
        ),
        { width: 1200, height: 630 }
    );
}