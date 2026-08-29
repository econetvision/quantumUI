import { NextResponse, type NextRequest } from 'next/server';
import { runDigest } from '@/lib/email/digest';

/**
 * Weekly progress digest, triggered by the cron entry in vercel.json (Vercel
 * sends `Authorization: Bearer ${CRON_SECRET}` automatically once the env var
 * is set). Any scheduler works — curl with the same header does too.
 *
 * With CRON_SECRET unset the route refuses outright rather than running
 * unauthenticated: an open endpoint that mass-emails every user is a denial-
 * of-inbox waiting to happen.
 */
export async function GET(request: NextRequest) {
  const secret = (process.env.CRON_SECRET ?? '').trim();
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET is not configured.' }, { status: 503 });
  }
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const result = await runDigest('weekly');
  return NextResponse.json(result);
}
