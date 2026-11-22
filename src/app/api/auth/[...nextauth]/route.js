import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUserByEmail, getUserById } from "@/database/db";


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
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.username = user.username;
                token.email = user.email;
                return token;
            }

            // Sessions are stateless JWTs, so a deleted account would otherwise stay
            // signed in on other devices until the token expires. Re-check the user
            // exists: if not, throwing makes NextAuth clear the cookie and return no session.
            if (token?.id) {
                let exists = true;
                try {
                    exists = Boolean(await getUserById(token.id));
                } catch (err) {
                    // Database hiccup: keep the session rather than signing everyone out
                    console.error("SESSION USER CHECK ERROR:", err);
                }
                if (!exists) throw new Error("ACCOUNT_DELETED");
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.username = token.username;
                session.user.email = token.email;
            }
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