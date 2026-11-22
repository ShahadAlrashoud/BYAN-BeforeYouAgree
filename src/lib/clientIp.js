// The client IP, taken only from a header that the hosting proxy sets itself.
// On Vercel, "x-vercel-forwarded-for" is written by Vercel and cannot be set by the visitor.
// On another host, set TRUSTED_IP_HEADER to the header YOUR proxy overwrites.
// The first value of "x-forwarded-for" is NOT used: a client can put anything in it.
// "x-real-ip" is only a fallback for when the trusted header is missing (for example local development).
export function getClientIp(request) {
    const trusted = (process.env.TRUSTED_IP_HEADER || "x-vercel-forwarded-for").toLowerCase();
    for (const name of [trusted, "x-real-ip"]) {
        const value = (request.headers.get(name) || "").split(",")[0].trim();
        if (value) return value.slice(0, 64);
    }
    return "unknown";
}
