import { prisma } from '@/lib/prisma';
import { isEmailEnabled, sendEmail } from '@/lib/email/mailer';
import { welcomeEmail } from '@/lib/email/templates';

/**
 * The welcome letter, sent once after the first completed sign-in.
 *
 * Called fire-and-forget from the auth flow — nothing here may throw into a
 * sign-in. The `updateMany` with `welcomeEmailSentAt: null` is an atomic
 * claim: two concurrent first sign-ins (double-submit, two tabs) race for one
 * row update, so exactly one wins and sends. If the SMTP send then fails the
 * stamp is reverted, and the next sign-in retries.
 */
export async function sendWelcomeIfFirstLogin(userId: string): Promise<void> {
  if (!isEmailEnabled()) return;

  try {
    const claimed = await prisma.user.updateMany({
      where: { id: userId, welcomeEmailSentAt: null },
      data: { welcomeEmailSentAt: new Date() },
    });
    if (claimed.count !== 1) return; // already welcomed

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });
    if (!user?.email) return;

    const { subject, html } = welcomeEmail(user.name);
    const sent = await sendEmail({ to: user.email, subject, html });

    if (!sent) {
      await prisma.user.update({
        where: { id: userId },
        data: { welcomeEmailSentAt: null },
        select: { id: true },
      });
    }
  } catch (error) {
    console.error('[email] welcome flow failed:', error);
  }
}
