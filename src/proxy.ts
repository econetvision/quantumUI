import { NextResponse } from "next/server";

// ============================================
// DEMO MODE: Authentication Disabled
// ============================================
// All routes are publicly accessible for demo purposes
// To enable authentication, uncomment the code below

export async function proxy() {
  // Allow all requests in demo mode
  return NextResponse.next();
}

/* ============================================
   PRODUCTION MODE (Commented Out)
   ============================================

import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const path = req.nextUrl.pathname;

  // If not authenticated, redirect to login
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as string | undefined;

  // Role-based access control
  if (path.startsWith("/admin") && role !== "ENTERPRISE") {
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

============================================ */

// No routes are protected in demo mode
export const config = {
  matcher: [],
};
