import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUserByEmail, getUserById } from "@/database/db";
import { ACCOUNT_V2 } from "@/lib/flags";
import { setSessionsValidAfter } from "@/database/accountDb";


export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.email || !credentials?.password) return null;

                    const user = await getUserByEmail(credentials.email);
                    if (!user) return null;

                    const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
                    if (!isValid) return null;

                    return {
                        id: String(user.id),
                        email: user.email,
                        username: user.username,
                        displayName: user.displayName ?? null,
                    };
                } catch (err) {
                    console.error("AUTHORIZE ERROR:", err);
                    return null;
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.username = user.username;
                token.email = user.email;
                if (ACCOUNT_V2) {
                    token.displayName = user.displayName ?? null;
                    // authAt: used by "sign out of all devices". signedInAt: when the person
                    // actually typed their credentials (never refreshed; used to judge "fresh sign-in").
                    token.authAt = Date.now();
                    token.signedInAt = token.authAt;
                }
                return token;
            }

            // Sessions are stateless JWTs, so a deleted account would otherwise stay
            // signed in on other devices until the token expires. Re-check the user
            // exists: if not, throwing makes NextAuth clear the cookie and return no session.
            if (token?.id) {
                let dbUser = null;
                let lookupFailed = false;
                try {
                    dbUser = await getUserById(token.id);
                } catch (err) {
                    // Database hiccup: keep the session rather than signing everyone out
                    lookupFailed = true;
                    console.error("SESSION USER CHECK ERROR:", err);
                }
                if (!lookupFailed && !dbUser) throw new Error("ACCOUNT_DELETED");

                if (ACCOUNT_V2 && dbUser) {
                    // "Sign out of all devices": a token issued before the cut-off is rejected.
                    // The device that asked for it gets a new token (authAt = cut-off) and stays signed in.
                    const validAfter = dbUser.sessionsValidAfter
                        ? new Date(dbUser.sessionsValidAfter).getTime()
                        : 0;
                    if (validAfter) {
                        if (!token.authAt || token.authAt < validAfter) {
                            throw new Error("SESSION_REVOKED");
                        }
                    } else if (!token.authAt) {
                        token.authAt = Date.now();
                    }

                    // "Sign out of all devices": only a session that is still valid can ask for it.
                    // Set the cut-off to "now" and stamp THIS token with the same instant, so every
                    // other device's older token is rejected while this one stays signed in.
                    if (trigger === "update" && session?.signOutOthers === true) {
                        const cutoff = new Date();
                        try {
                            await setSessionsValidAfter(token.id, cutoff);
                            token.authAt = cutoff.getTime();
                            token.lastRevokeAt = cutoff.getTime(); // lets the page confirm it really happened
                        } catch (err) {
                            console.error("SIGN OUT OTHERS ERROR:", err?.name || "error");
                        }
                    }

                    // Keep profile fields current (email change, display name) without a new sign-in
                    token.email = dbUser.email;
                    token.username = dbUser.username;
                    token.displayName = dbUser.displayName ?? null;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.username = token.username;
                session.user.email = token.email;
                session.user.displayName = token.displayName ?? null;
            }
            // When the person typed their credentials (used to judge a "fresh sign-in")
            session.signedInAt = token.signedInAt ?? null;
            session.lastRevokeAt = token.lastRevokeAt ?? null;
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };