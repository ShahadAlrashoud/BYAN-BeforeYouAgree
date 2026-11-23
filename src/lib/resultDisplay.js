// Display rules for a result (pure functions: safe in client and server code). Nothing here changes a score,
// a label, a weight or any analysis behaviour. It only decides what the results page SHOWS.

export const HIGH_BOUNDARY = 60; // the existing scorer: 60 and above is "High Risk"
// A Moderate Risk score this many points (or fewer) below the High boundary gets a small note.
// The label itself is never changed. 5 is an assumption ("a few points"): the owner can change this one number.
export const NEAR_HIGH_POINTS = 5;
// From this age the "old result" warning becomes more prominent.
export const OLD_RESULT_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

// The existing three labels, read the same way the rest of the site reads them: "safe" | "moderate" | "high".
export function riskTier(riskLevel) {
    const l = String(riskLevel || "").toLowerCase();
    if (l.includes("safe")) return "safe";
    if (l.includes("high")) return "high";
    return "moderate";
}

// True for a Moderate Risk result whose score is within NEAR_HIGH_POINTS below the High boundary.
export function isNearHighBoundary(riskScore, riskLevel) {
    const n = Number(riskScore);
    if (!Number.isFinite(n)) return false;
    return riskTier(riskLevel) === "moderate" && n >= HIGH_BOUNDARY - NEAR_HIGH_POINTS && n < HIGH_BOUNDARY;
}

// Age facts for the results page. `analyzedAt` is the date the analysis was made (not the date it was opened).
//   days      whole days since the analysis (0 if the date is missing, invalid or in the future)
//   isOld     at least OLD_RESULT_DAYS old: show the prominent warning
//   canRerun  older than the cache window (ttlDays): the re-run button may be shown
// `ttlDays` is CACHE_TTL_DAYS from the server. If it is not a positive number, canRerun is false (fail closed).
export function resultAge({ analyzedAt, ttlDays, now = Date.now() }) {
    const t = analyzedAt ? new Date(analyzedAt).getTime() : NaN;
    if (!Number.isFinite(t)) return { days: 0, isOld: false, canRerun: false, known: false };
    const ageMs = Math.max(0, now - t);
    const days = Math.floor(ageMs / DAY_MS);
    const ttl = Number(ttlDays);
    return {
        days,
        isOld: days >= OLD_RESULT_DAYS,
        canRerun: Number.isFinite(ttl) && ttl > 0 && ageMs > ttl * DAY_MS,
        known: true,
    };
}
