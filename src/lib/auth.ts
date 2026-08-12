import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 * No database adapter here on purpose.
 *
 * PrismaAdapter requires `Account` and `VerificationToken` models, neither of
 * which exists in our schema — that mismatch made NextAuth fail every sign-in
 * with `error=Configuration`. The Credentials provider with a JWT session
 * strategy needs no adapter: we look the user up ourselves in `authorize()`
 * and carry identity in the token. Add the adapter (and those two models) only
 * if OAuth providers or database sessions are introduced.
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
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
