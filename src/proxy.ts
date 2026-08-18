import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

/**
 * Route protection.
 *
 * This file previously exported `matcher: []` under a "DEMO MODE" banner, which
 * meant nothing was protected at all. The rules below are the ones that were
 * sitting commented out beneath it, with one correction: the admin check tested
 * for `ENTERPRISE`, but `UserRole.ADMIN` is what the admin API routes require
 * (see src/app/api/admin/*), so the old check would have admitted the wrong
 * group and locked out real admins.
 *
 * Per the Next.js proxy docs this runs before rendering and may be hoisted to a
 * CDN, so it does a JWT check only — no database access, no shared module state.
 * It is a redirect layer for humans, NOT the security boundary: every sensitive
 * route handler re-checks the session itself.
 */
export async function proxy(req: NextRequest) {
  const token = await getToken({
    req,
    // NextAuth v5 signs with AUTH_SECRET; NEXTAUTH_SECRET is the v4 name kept
    // as a fallback, matching src/lib/auth.ts.
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  });

  const path = req.nextUrl.pathname;

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as string | undefined;

  if (path.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (path.startsWith("/pro") && role === "FREE") {
    return NextResponse.redirect(new URL("/upgrade", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tracks/:path*",
    "/labs/:path*",
    "/exam/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/pro/:path*",
  ],
};
