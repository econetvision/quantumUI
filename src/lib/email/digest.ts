import { prisma } from '@/lib/prisma';
import { isEmailEnabled, sendEmail } from '@/lib/email/mailer';
import { progressDigestEmail } from '@/lib/email/templates';

/**
 * Weekly and monthly progress digests: XP, streak, lessons and labs completed
 * in the window, certificates earned. Invoked by the cron routes under
 * /api/cron/*.
 *
 * Idempotent by stamp: each user's `weeklyDigestSentAt` / `monthlyDigestSentAt`
 * is checked against the period, so a cron retry (or an overlapping manual
 * trigger) never double-sends. Recipients are limited to accounts active
 * within a grace window — a learner who left months ago should stop hearing
 * from us, not get a "quiet month" email forever.
 */

const BATCH_LIMIT = 200; // one cron invocation's budget; the stamp makes reruns pick up the rest

const PERIODS = {
  weekly: {
    windowDays: 7,
    activityDays: 30,
    stampField: 'weeklyDigestSentAt' as const,
    // Resend only if the last one is older than ~90% of the period, so a cron
    // that fires slightly early does not skip a whole week.
    minGapMs: 6 * 24 * 60 * 60 * 1000,
  },
  monthly: {
    windowDays: 30,
    activityDays: 90,
    stampField: 'monthlyDigestSentAt' as const,
    minGapMs: 27 * 24 * 60 * 60 * 1000,
  },
};

export interface DigestRunResult {
  enabled: boolean;
  candidates: number;
  sent: number;
  failed: number;
}

export async function runDigest(period: 'weekly' | 'monthly'): Promise<DigestRunResult> {
  if (!isEmailEnabled()) {
    return { enabled: false, candidates: 0, sent: 0, failed: 0 };
  }

  const config = PERIODS[period];
  const now = Date.now();
  const windowStart = new Date(now - config.windowDays * 24 * 60 * 60 * 1000);
  const activityCutoff = new Date(now - config.activityDays * 24 * 60 * 60 * 1000);
  const stampCutoff = new Date(now - config.minGapMs);

  const users = await prisma.user.findMany({
    where: {
      emailOptOut: false,
      lastActivityAt: { gte: activityCutoff },
      OR: [
        { [config.stampField]: null },
        { [config.stampField]: { lt: stampCutoff } },
      ],
    },
    select: {
      id: true,
      email: true,
      name: true,
      totalXP: true,
      currentStreak: true,
      longestStreak: true,
    },
    orderBy: { lastActivityAt: 'desc' },
    take: BATCH_LIMIT,
  });

  let sent = 0;
  let failed = 0;

  for (const user of users) {
    const [lessonsCompleted, labsPassed, certificates] = await Promise.all([
      prisma.lessonCompletion.count({
        where: { userId: user.id, completedAt: { gte: windowStart } },
      }),
      prisma.labAttempt.count({
        where: { userId: user.id, passed: true, createdAt: { gte: windowStart } },
      }),
      prisma.certificate.count({ where: { userId: user.id } }),
    ]);

    const { subject, html } = progressDigestEmail(period, {
      name: user.name,
      totalXP: user.totalXP,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lessonsCompleted,
      labsPassed,
      certificates,
    });

    const ok = await sendEmail({ to: user.email, subject, html });
    if (ok) {
      sent++;
      await prisma.user.update({
        where: { id: user.id },
        data: { [config.stampField]: new Date() },
        select: { id: true },
      });
    } else {
      failed++;
    }
  }

  return { enabled: true, candidates: users.length, sent, failed };
}
