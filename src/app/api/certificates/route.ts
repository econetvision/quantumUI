import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import auth from '@/lib/auth';
import { withDatabase } from '@/lib/db';
import { getAllLessons, getTrackName } from '@/lib/lesson-loader';
import { TRACK_CONFIGS } from '@/lib/track-mapping';
import { sendEmail } from '@/lib/email/mailer';
import { certificateEmail } from '@/lib/email/templates';
import { absoluteUrl } from '@/lib/site';

/**
 * Certificates of completion.
 *
 * POST claims one for a track. The server re-verifies against LessonProgress
 * rather than trusting the client's word: every lesson number from 1 to the
 * track's lesson count must have a completion row. That is why lesson
 * completions sync to the server for signed-in learners — a certificate is
 * the one artefact where the localStorage copy is not evidence enough.
 */

const ClaimSchema = z.object({ trackSlug: z.string().max(80) });

async function currentUserId(): Promise<string | null> {
  try {
    const session = await auth.auth();
    return (session?.user as { id?: string } | undefined)?.id ?? null;
  } catch {
    return null;
  }
}

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ signedIn: false, certificates: [] });

  const { data } = await withDatabase(
    (db) =>
      db.certificate.findMany({
        where: { userId },
        select: { id: true, trackSlug: true, trackName: true, issuedAt: true },
        orderBy: { issuedAt: 'desc' },
      }),
    [],
  );

  return NextResponse.json({ signedIn: true, certificates: data ?? [] });
}

export async function POST(request: NextRequest) {
  const userId = await currentUserId();
  if (!userId) {
    return NextResponse.json(
      { error: 'Sign in to claim a certificate — it needs a name to be issued to.' },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed request body.' }, { status: 400 });
  }

  const parsed = ClaimSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  const { trackSlug } = parsed.data;
  const config = TRACK_CONFIGS.find((track) => track.slug === trackSlug);
  if (!config) {
    return NextResponse.json({ error: 'Unknown track.' }, { status: 400 });
  }

  const lessonCount = getAllLessons(trackSlug).length;
  if (lessonCount === 0) {
    return NextResponse.json({ error: 'This track has no lessons to certify.' }, { status: 400 });
  }

  const trackName = getTrackName(trackSlug) ?? config.title;

  const { data, persisted } = await withDatabase(async (db) => {
    const rows = await db.lessonProgress.findMany({
      where: { userId, trackSlug },
      select: { lessonId: true },
    });
    const done = new Set(rows.map((row) => row.lessonId));
    const missing: number[] = [];
    for (let lesson = 1; lesson <= lessonCount; lesson++) {
      if (!done.has(lesson)) missing.push(lesson);
    }
    if (missing.length > 0) {
      return { missing } as const;
    }

    const existing = await db.certificate.findUnique({
      where: { userId_trackSlug: { userId, trackSlug } },
    });
    if (existing) return { certificate: existing, fresh: false } as const;

    const certificate = await db.certificate.create({
      data: { userId, trackSlug, trackName },
    });

    // The congratulations mail is transactional — the learner asked for the
    // certificate — so it ignores the digest opt-out. Best-effort as always.
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });
    if (user?.email) {
      const { subject, html } = certificateEmail({
        name: user.name,
        trackName,
        certificateUrl: absoluteUrl(`/certificates/${certificate.id}`),
      });
      void sendEmail({ to: user.email, subject, html }).catch(() => {});
    }

    return { certificate, fresh: true } as const;
  }, null);

  if (!persisted || !data) {
    return NextResponse.json(
      { error: 'Certificates need the database, which is currently unavailable.' },
      { status: 503 },
    );
  }

  if ('missing' in data && data.missing) {
    return NextResponse.json(
      {
        error: `Complete all ${lessonCount} lessons first — ${data.missing.length} still to go.`,
        missing: data.missing,
      },
      { status: 409 },
    );
  }

  if (!('certificate' in data) || !data.certificate) {
    return NextResponse.json({ error: 'Could not issue the certificate.' }, { status: 500 });
  }

  return NextResponse.json({
    certificate: {
      id: data.certificate.id,
      trackSlug,
      trackName,
      issuedAt: data.certificate.issuedAt,
    },
    url: `/certificates/${data.certificate.id}`,
    fresh: data.fresh,
  });
}
