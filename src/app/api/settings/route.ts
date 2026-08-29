import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import auth from '@/lib/auth';
import { withDatabase } from '@/lib/db';
import { getSiteSettings, invalidateSiteSettings, SITE_SETTING_KEYS } from '@/lib/site-settings';

/**
 * Site-wide settings: feature flags and the maintenance banner.
 *
 * GET is public because the flags decide what the navigation offers — the
 * client needs them before it knows who the visitor is. Nothing secret lives
 * here; anything that shouldn't be world-readable belongs in an env var.
 * PATCH is admin-only.
 */

export async function GET() {
  return NextResponse.json({ settings: await getSiteSettings() });
}

const PatchSchema = z
  .object({
    track0Enabled: z.boolean().optional(),
    kidModeDefault: z.boolean().optional(),
    showConfetti: z.boolean().optional(),
    maintenanceBanner: z.string().max(500).optional(),
  })
  .strict();

export async function PATCH(request: NextRequest) {
  const session = await auth.auth().catch(() => null);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  }
  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin role required.' }, { status: 403 });
  }

  const parsed = PatchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Unrecognised setting.', detail: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const entries = Object.entries(parsed.data);
  if (entries.length === 0) {
    return NextResponse.json({ error: 'No settings supplied.' }, { status: 400 });
  }

  const { persisted } = await withDatabase(async (db) => {
    // One row per key, so flipping a flag never rewrites an unrelated one and
    // updatedAt stays meaningful per setting.
    for (const [key, value] of entries) {
      await db.siteSetting.upsert({
        where: { key },
        update: { value: value as never },
        create: { key, value: value as never },
      });
    }
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'site_settings_update',
        metadata: parsed.data as never,
      },
    });
    return true;
  }, null);

  if (!persisted) {
    return NextResponse.json(
      { error: 'Settings need the database.', code: 'DB_UNAVAILABLE' },
      { status: 503 },
    );
  }

  invalidateSiteSettings();
  return NextResponse.json({ settings: await getSiteSettings(), keys: SITE_SETTING_KEYS });
}
