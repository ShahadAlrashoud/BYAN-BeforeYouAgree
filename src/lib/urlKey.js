// Cache key helpers (server side). Nothing here logs or returns anything but the key / a hash.
import crypto from "crypto";

export const sha256 = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");

const MAX_KEY_LENGTH = 2048;

// Turns an already-normalized http(s) URL into the cache key:
//   - host in lowercase (the URL parser does this), default port dropped
//   - no trailing slash on the path, no fragment, no username / password
//   - the whole query string is removed, which also removes every tracking parameter
//     (utm_*, fbclid, gclid, ...). Only "hl" (interface language) is kept, because analysisService
//     sends a different Accept-Language header when it is present, so the fetched text can differ.
// Returns null when the URL cannot be keyed (the request is then simply not cached).
export function urlCacheKey(normalizedUrl) {
    let u;
    try {
        u = new URL(normalizedUrl);
    } catch {
        return null;
    }
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;

    const path = u.pathname.replace(/\/+$/, "");
    const hl = (u.searchParams.get("hl") || "").toLowerCase();
    const hlPart = /^[a-z]{2,3}(-[a-z0-9]{2,8})?$/.test(hl) ? `?hl=${hl}` : "";

    const key = `${u.protocol}//${u.host}${path}${hlPart}`;
    return key.length <= MAX_KEY_LENGTH ? key : null;
}

export function urlHash(key) {
    return key ? sha256(key) : null;
}
