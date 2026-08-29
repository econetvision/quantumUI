import { NextResponse, type NextRequest } from 'next/server';
import auth from '@/lib/auth';
import { withDatabase } from '@/lib/db';
import { coercePreferences, DEFAULT_PREFERENCES } from '@/components/learning/constants';

/**
 * Per-user learning preferences.
 *
 * Anonymous visitors keep these in localStorage and never call this route;
 * signing in merges that local copy up via PATCH. The shape is identical on
 * both sides so the merge is a spread, not a translation.
 */

export async function GET() {
  const session = await auth.auth().catch(() => null);
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) {
    // Not an error: the client falls back to localStorage.
    return NextResponse.json({ signedIn: false, preferences: DEFAULT_PREFERENCES });
  }

  const { data: row, persisted } = await withDatabase(
    (db) => db.user.findUnique({ where: { id: user.id }, select: { preferences: true } }),
    null,
  );

  return NextResponse.json({
    signedIn: true,
    persisted,
    preferences: coercePreferences(row?.preferences ?? null),
  });
}

export async function PATCH(request: NextRequest) {
  const session = await auth.auth().catch(() => null);
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Expected a preferences object.' }, { status: 400 });
  }

  const { data: existing, persisted } = await withDatabase(
    (db) => db.user.findUnique({ where: { id: user.id }, select: { preferences: true } }),
    null,
  );
  if (!persisted) {
    return NextResponse.json(
      { error: 'Preferences need the database.', code: 'DB_UNAVAILABLE' },
      { status: 503 },
    );
  }

  // coerce twice: once to normalise what is already stored, once after merging,
  // so a malformed row cannot widen the shape it is merged into.
  const next = coercePreferences({
    ...coercePreferences(existing?.preferences ?? null),
    ...(body as Record<string, unknown>),
  });

  await withDatabase(
    (db) => db.user.update({ where: { id: user.id }, data: { preferences: next as never } }),
    null,
  );

  return NextResponse.json({ preferences: next });
}
