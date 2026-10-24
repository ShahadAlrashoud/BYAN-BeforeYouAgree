import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { runAnalysisForUrl, runAnalysisForText } from "../analysisService";

export async function POST(request) {
    try {
        const body = await request.json();
        const url = body?.url?.trim();
        const text = body?.text?.trim();
        const preferredLang = body?.lang === "ar" ? "ar" : "en";

        if (!url && !text) {
            return NextResponse.json(
                { error: "URL or text is required." },
                { status: 400 }
            );
        }

        const session = await getServerSession(authOptions);
        const userId = session?.user?.id || null;

        const result = text
            ? await runAnalysisForText(text, preferredLang, userId)
            : await runAnalysisForUrl(url, preferredLang, userId);

        return NextResponse.json({ id: result.id }, { status: 200 });
    } catch (error) {
        console.error("ANALYSIS API ERROR:", error);

        return NextResponse.json(
            {
                error: error instanceof Error
                    ? error.message
                    : "An unknown server error occurred."
            },
            { status: 500 }
        );
    }
}