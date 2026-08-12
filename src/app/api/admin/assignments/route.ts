import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import auth from '@/lib/auth';
import { withDatabase } from '@/lib/db';

/**
 * Assigned materials.
 *
 * The `Assignment` model has existed since the schema was written but nothing
 * ever read or wrote it — the dashboard kept assignments in component state, so
 * an instructor's work vanished on refresh and students never saw it at all.
 */

const CreateSchema = z.object({
  studentId: z.string().min(1).max(64),
  title: z.string().trim().min(1).max(200),
  trackSlug: z.string().max(80).optional(),
  labTopic: z.string().max(80).optional(),
  difficulty: z.enum(['easy', 'medium', 'complex']).optional(),
  dueDate: z.string().datetime().optional(),
});

async function currentUser() {
  const session = await auth.auth().catch(() => null);
  return session?.user as { id?: string; role?: string } | undefined;
}

export async function GET(request: NextRequest) {
  const user = await currentUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  }

  const studentId = request.nextUrl.searchParams.get('studentId');

  const { data, persisted } = await withDatabase(
    async (db) =>
      db.assignment.findMany({
        // Instructors see everything they assigned; students see only their own,
        // regardless of what the query string asks for.
        where:
          user.role === 'ADMIN'
            ? studentId
              ? { studentId }
              : {}
            : { studentId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 200,
      }),
    [],
  );

  return NextResponse.json({ assignments: data, databaseAvailable: persisted });
}

export async function POST(request: NextRequest) {
  const user = await currentUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  }
  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin role required.' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed request body.' }, { status: 400 });
  }

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid assignment.' },
      { status: 400 },
    );
  }

  const { dueDate, ...rest } = parsed.data;

  const { data, persisted } = await withDatabase(
    async (db) =>
      db.assignment.create({
        data: {
          ...rest,
          assignedById: user.id!,
          dueDate: dueDate ? new Date(dueDate) : null,
        },
      }),
    null,
  );

  if (!persisted) {
    return NextResponse.json(
      { error: 'The database is unavailable, so the assignment was not saved.' },
      { status: 503 },
    );
  }

  return NextResponse.json({ assignment: data }, { status: 201 });
}
