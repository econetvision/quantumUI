'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

/**
 * Thin client wrapper so the root layout (a server component) can still provide
 * session context to the header, admin views and anything else that needs to
 * know who is signed in.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
