import { NextResponse, type NextRequest } from 'next/server';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { isDatabaseAvailable } from '@/lib/db';

/**
 * Account creation.
 *
 * The Credentials provider in `src/lib/auth.ts` compares a bcrypt hash against
 * `User.password`, so accounts have to be created somewhere — there was no
 * route doing it, which is why the signup form could only ever fake success.
 */
const RegisterSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(200),
});

export async function POST(request: NextRequest) {
  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      {
        error:
          'Accounts need the database. Start it with `docker compose up -d db` (or `brew services start mysql`) and run `npm run db:push`. Every track and lab works without an account.',
        code: 'DB_UNAVAILABLE',
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed request body.' }, { status: 400 });
  }

  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid details.' },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      // Deliberately explicit: this is a learning platform, not a service where
      // account enumeration is a meaningful threat, and a vague error here just
      // leaves people stuck at the signup form.
      return NextResponse.json(
        { error: 'An account with that email already exists. Try signing in.' },
        { status: 409 },
      );
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: await hash(password, 12),
      },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('[register] failed:', error);
    return NextResponse.json(
      { error: 'Could not create the account. Please try again.' },
      { status: 500 },
    );
  }
}
