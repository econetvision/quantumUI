import { NextResponse } from 'next/server';
import auth from '@/lib/auth';

/**
 * Session gate for route handlers that spend real compute.
 *
 * src/proxy.ts redirects unauthenticated humans, but it only covers page paths
 * and the Next.js docs are explicit that proxy may be hoisted to a CDN and must
 * not be treated as the security boundary. Anything that reaches the Python
 * executor re-checks here, because that service runs code.
 */
export interface SessionUser {
  id: string;
  role?: string;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth.auth().catch(() => null);
  const user = session?.user as { id?: string; role?: string } | undefined;
  return user?.id ? { id: user.id, role: user.role } : null;
}

/**
 * Returns a 401 response when there is no session, or null to continue.
 * The shape matches what the playground and lab shell already render on error,
 * so an expired session reads as a normal message rather than a blank panel.
 */
export async function requireSession(): Promise<
  { user: SessionUser; response: null } | { user: null; response: NextResponse }
> {
  const user = await getSessionUser();
  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        {
          success: false,
          error: 'Sign in to run quantum code.',
          output: '',
          unauthenticated: true,
        },
        { status: 401 },
      ),
    };
  }
  return { user, response: null };
}
