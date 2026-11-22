import { NextResponse } from "next/server";
import { requireUser, readJson, noStore } from "@/lib/accountApi";
import { getSettings, saveSettings } from "@/database/accountDb";

const UI_LANGS = ["en", "ar"];
const TEXT_SIZES = [100, 115, 130, 150];
const RESULT_LANGS = ["policy", "my"];

// GET: the signed-in user's saved preferences (null fields = nothing saved yet)
export async function GET() {
    const { user, error } = await requireUser();
    if (error) return error;
    const s = (await getSettings(user.id)) || {};
    return NextResponse.json(
        { uiLang: s.uiLang ?? null, textSize: s.textSize ?? null, resultLang: s.resultLang ?? null },
        { headers: noStore }
    );
}

// PUT { uiLang?, textSize?, resultLang? }: save only the fields that are sent
export async function PUT(request) {
    const { user, error } = await requireUser();
    if (error) return error;

    const body = await readJson(request);
    if (!body || typeof body !== "object") {
        return NextResponse.json({ error: "invalid" }, { status: 400 });
    }

    const next = { uiLang: null, textSize: null, resultLang: null };
    if (body.uiLang !== undefined) {
        if (!UI_LANGS.includes(body.uiLang)) return NextResponse.json({ error: "invalid" }, { status: 400 });
        next.uiLang = body.uiLang;
    }
    if (body.textSize !== undefined) {
        if (!TEXT_SIZES.includes(body.textSize)) return NextResponse.json({ error: "invalid" }, { status: 400 });
        next.textSize = body.textSize;
    }
    if (body.resultLang !== undefined) {
        if (!RESULT_LANGS.includes(body.resultLang)) return NextResponse.json({ error: "invalid" }, { status: 400 });
        next.resultLang = body.resultLang;
    }

    await saveSettings(user.id, next);
    return NextResponse.json({ ok: true }, { headers: noStore });
}
