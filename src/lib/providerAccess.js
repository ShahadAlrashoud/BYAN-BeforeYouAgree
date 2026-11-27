import { createHmac, timingSafeEqual } from "crypto";

export const PROVIDER_COOKIE = "byan_provider";

// The cookie holds a keyed hash of the access code, so it cannot be typed or guessed by hand.
export function accessToken() {
    const code = process.env.OPENAI_ACCESS_CODE;
    if (!code) return null;
    return createHmac("sha256", code).update("openai-access").digest("hex");
}

export function checkCode(input) {
    const code = process.env.OPENAI_ACCESS_CODE;
    if (!code || typeof input !== "string") return false;
    const a = Buffer.from(input.trim());
    const b = Buffer.from(code);
    return a.length === b.length && timingSafeEqual(a, b);
}

// "openai" only when the cookie holds the valid token. Everyone else gets "groq".
export function providerFor(cookieValue) {
    const token = accessToken();
    if (!token || !cookieValue) return "groq";
    const a = Buffer.from(cookieValue);
    const b = Buffer.from(token);
    return a.length === b.length && timingSafeEqual(a, b) ? "openai" : "groq";
}