// Re-authentication for sensitive actions (delete account, change email).
//  - Accounts with a password: the password must be re-entered. Failed attempts are rate
//    limited per account, so the prompt cannot be used to guess passwords.
//  - Accounts with no password (for example a future social sign-in): the person must have
//    signed in freshly, within FRESH_SIGNIN_MS. They cannot skip the check.
import bcrypt from "bcryptjs";
import { takeToken, countEvents, recordEvent, clearEvents, hashKey } from "@/database/accountDb";

const MAX_FAILS = Number(process.env.REAUTH_MAX_FAILS) || 5;
const FAIL_WINDOW = Number(process.env.REAUTH_WINDOW_SECONDS) || 900; // 15 minutes
const FRESH_SIGNIN_MS = (Number(process.env.REAUTH_FRESH_SECONDS) || 300) * 1000; // 5 minutes

// Returns { ok: true } or { ok: false, status, error, retryAfter? }
export async function checkReauth({ user, session, password }) {
    const key = hashKey(user.id);

    if (user.passwordHash) {
        const { count, retryAfter } = await countEvents(key, "reauth_fail", FAIL_WINDOW);
        if (count >= MAX_FAILS) {
            return { ok: false, status: 429, error: "rate_limited", retryAfter };
        }
        const valid =
            typeof password === "string" &&
            password.length > 0 &&
            password.length <= 200 &&
            (await bcrypt.compare(password, user.passwordHash));
        if (!valid) {
            await recordEvent(key, "reauth_fail");
            return { ok: false, status: 403, error: "reauth_failed" };
        }
        await clearEvents(key, "reauth_fail");
        return { ok: true };
    }

    const signedInAt = Number(session?.signedInAt) || 0;
    if (!signedInAt || Date.now() - signedInAt > FRESH_SIGNIN_MS) {
        return { ok: false, status: 403, error: "fresh_signin_required" };
    }
    return { ok: true };
}

export { takeToken };
