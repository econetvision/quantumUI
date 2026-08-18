import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compare } from "bcryptjs";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * No database adapter here on purpose.
 *
 * PrismaAdapter requires `Account` and `VerificationToken` models, neither of
 * which exists in our schema — that mismatch made NextAuth fail every sign-in
 * with `error=Configuration`. The Credentials provider with a JWT session
 * strategy needs no adapter: we look the user up ourselves in `authorize()`
 * and carry identity in the token. Add the adapter (and those two models) only
 * if database sessions are introduced.
 *
 * Google sign-in works without the adapter too: the `jwt` callback below
 * upserts the Google identity into `User` by email, so an OAuth login lands on
 * the same row (and the same `User.id`) that progress, labs and roles key off.
 */
export const authOptions: NextAuthConfig = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // `/logout` and `/error` routes do not exist; pointing at them turned an
  // auth failure into a 404 instead of a message on the sign-in form.
  pages: {
    signIn: "/login",
  },

  trustHost: true,

  providers: [
    // Credentials are listed first so the email/password form stays the
    // primary path; Google is additive. Both env names are read because
    // NextAuth v5 auto-discovers AUTH_GOOGLE_*, while GOOGLE_CLIENT_* is what
    // the Google Cloud console hands you.
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET,
      // Ask Google for a fresh account chooser instead of silently reusing the
      // one browser session, which is what people expect from a "sign in with"
      // button on a shared machine.
      authorization: {
        params: { prompt: "select_account" },
      },
    }),

    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await compare(credentials.password as string, user.password);

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    // Google hands back whatever address is on the account; only a verified
    // one proves ownership. Without this check anybody could register a Google
    // account with someone else's unverified email and inherit their row in
    // the upsert below.
    async signIn({ account, profile }) {
      if (account?.provider !== "google") return true;

      const verified = (profile as { email_verified?: boolean } | undefined)?.email_verified;
      return Boolean(profile?.email && verified);
    },

    async jwt({ token, user, account }) {
      // On a Google sign-in `user.id` is Google's opaque `sub`, not a cuid from
      // our database, and nothing has written the account to `User` yet — there
      // is no adapter. Resolve it here so the token carries our own id and the
      // role that every authorisation check reads.
      if (account?.provider === "google" && user?.email) {
        const dbUser = await prisma.user.upsert({
          where: { email: user.email },
          // An existing password account signing in with Google for the first
          // time is the same person: link, do not duplicate. The password stays
          // untouched so either route keeps working.
          update: {
            name: user.name ?? undefined,
            image: user.image ?? undefined,
            emailVerified: new Date(),
          },
          create: {
            email: user.email,
            name: user.name,
            image: user.image,
            emailVerified: new Date(),
          },
          select: { id: true, role: true },
        });

        token.id = dbUser.id;
        token.role = dbUser.role;
        return token;
      }

      // `User.id` is optional in NextAuth's own types even though the
      // credentials provider always supplies one, while src/types/next-auth.d.ts
      // declares JWT.id as required. Guard rather than cast, so a provider that
      // genuinely returns no id leaves the previous token id intact instead of
      // writing undefined into it.
      if (user?.id) {
        token.id = user.id;
        const role = (user as { role?: UserRole }).role;
        if (role) token.role = role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string; role?: string }).id = token.id as string;
        (session.user as { id?: string; role?: string }).role = token.role as string;
      }
      return session;
    },
  },

  // NextAuth v5 reads AUTH_SECRET; NEXTAUTH_SECRET is the v4 name, kept as a
  // fallback so existing .env files keep working.
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);
