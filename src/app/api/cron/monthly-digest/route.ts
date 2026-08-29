import { NextResponse, type NextRequest } from 'next/server';
import { runDigest } from '@/lib/email/digest';

/** Monthly counterpart of weekly-digest/route.ts — see that file for auth. */
export async function GET(request: NextRequest) {
  const secret = (process.env.CRON_SECRET ?? '').trim();
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET is not configured.' }, { status: 503 });
  }
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const result = await runDigest('monthly');
  return NextResponse.json(result);
}
