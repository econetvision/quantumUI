import { ORG_NAME, SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/site';

/**
 * HTML email templates: welcome letter, weekly/monthly progress digests and
 * certificate notifications.
 *
 * All styling is inline and table-free because email clients strip
 * stylesheets; the palette is the site's accent pair on a light card, which
 * renders acceptably in both light- and dark-mode clients.
 */

const ACCENT = '#4d8dff';
const ACCENT_ALT = '#a78bfa';
const INK = '#0b1220';
const MUTED = '#5b6472';

function layout(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#eef1f6;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${INK};">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
    <div style="padding:18px 4px;">
      <span style="display:inline-block;width:34px;height:34px;line-height:34px;border-radius:9px;background:linear-gradient(135deg,${ACCENT},${ACCENT_ALT});color:#06101f;font-weight:700;text-align:center;font-family:monospace;font-size:18px;">Q</span>
      <span style="font-family:monospace;font-size:18px;font-weight:700;margin-left:8px;">Quantum<span style="color:${ACCENT};">UI</span></span>
      <span style="font-size:11px;color:${MUTED};margin-left:8px;">by ${ORG_NAME}</span>
    </div>
    <div style="background:#ffffff;border-radius:14px;padding:28px 24px;border:1px solid #dfe4ec;">
      <h1 style="margin:0 0 14px;font-size:20px;line-height:1.3;">${title}</h1>
      ${bodyHtml}
    </div>
    <p style="font-size:11px;color:${MUTED};padding:16px 6px;line-height:1.5;">
      ${SITE_NAME} by ${ORG_NAME} · <a href="${SITE_URL}" style="color:${ACCENT};">${SITE_URL.replace(/^https?:\/\//, '')}</a><br/>
      You are receiving this because you have a ${SITE_NAME} account.
    </p>
  </div>
</body>
</html>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:${ACCENT};color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:11px 22px;border-radius:9px;margin-top:6px;">${label}</a>`;
}

function statRow(items: { label: string; value: string }[]): string {
  const cells = items
    .map(
      (item) => `<div style="flex:1;min-width:100px;background:#f4f6fb;border-radius:10px;padding:12px;margin:4px;text-align:center;display:inline-block;width:28%;">
        <div style="font-size:22px;font-weight:700;">${item.value}</div>
        <div style="font-size:11px;color:${MUTED};text-transform:uppercase;letter-spacing:0.06em;margin-top:2px;">${item.label}</div>
      </div>`,
    )
    .join('');
  return `<div style="margin:14px -4px;">${cells}</div>`;
}

export function welcomeEmail(name: string | null): { subject: string; html: string } {
  const greeting = name ? `Hi ${name},` : 'Hi,';
  return {
    subject: `Welcome to ${SITE_NAME} 🎉`,
    html: layout(
      `Welcome to ${SITE_NAME}!`,
      `<p style="line-height:1.6;font-size:14px;">${greeting}</p>
      <p style="line-height:1.6;font-size:14px;">
        Your account is ready. You now have a home for your quantum computing
        journey — twelve structured tracks, hands-on labs running on a real
        statevector simulator, and IBM certification prep.
      </p>
      <p style="line-height:1.6;font-size:14px;">A few things worth knowing:</p>
      <ul style="line-height:1.8;font-size:14px;padding-left:20px;">
        <li><strong>Tracks unlock in order</strong> — finish the first lesson of a track to open the next.</li>
        <li><strong>XP &amp; streaks</strong> — every lab and lesson earns XP; daily activity builds your streak.</li>
        <li><strong>Certificates</strong> — complete every lesson in a track and we issue you a certificate of completion.</li>
        <li><strong>Progress emails</strong> — we'll send you a weekly and monthly summary of your XP, streak and completed lessons.</li>
      </ul>
      ${button(absoluteUrl('/tracks'), 'Start learning →')}`,
    ),
  };
}

export interface DigestStats {
  name: string | null;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  lessonsCompleted: number; // in the digest window
  labsPassed: number; // in the digest window
  certificates: number; // lifetime
}

export function progressDigestEmail(
  period: 'weekly' | 'monthly',
  stats: DigestStats,
): { subject: string; html: string } {
  const label = period === 'weekly' ? 'week' : 'month';
  const greeting = stats.name ? `Hi ${stats.name},` : 'Hi,';
  const active = stats.lessonsCompleted > 0 || stats.labsPassed > 0;

  return {
    subject: `Your ${label} on ${SITE_NAME}: ${stats.totalXP} XP · ${stats.currentStreak}-day streak`,
    html: layout(
      `Your ${label} in review`,
      `<p style="line-height:1.6;font-size:14px;">${greeting}</p>
      <p style="line-height:1.6;font-size:14px;">
        ${
          active
            ? `Here is what you accomplished this ${label}:`
            : `It was a quiet ${label} — your progress is safe and waiting for you.`
        }
      </p>
      ${statRow([
        { label: 'Total XP', value: `${stats.totalXP}` },
        { label: 'Streak', value: `${stats.currentStreak}🔥` },
        { label: 'Best streak', value: `${stats.longestStreak}` },
      ])}
      ${statRow([
        { label: `Lessons this ${label}`, value: `${stats.lessonsCompleted}` },
        { label: `Labs passed`, value: `${stats.labsPassed}` },
        { label: 'Certificates', value: `${stats.certificates}` },
      ])}
      <p style="line-height:1.6;font-size:14px;">
        ${
          stats.currentStreak > 0
            ? `Keep the ${stats.currentStreak}-day streak alive — one lab a day is all it takes.`
            : 'Start a new streak today — one lab is all it takes.'
        }
      </p>
      ${button(absoluteUrl('/tracks'), 'Continue learning →')}`,
    ),
  };
}

export function certificateEmail(options: {
  name: string | null;
  trackName: string;
  certificateUrl: string;
}): { subject: string; html: string } {
  const greeting = options.name ? `Congratulations ${options.name}!` : 'Congratulations!';
  return {
    subject: `Your ${SITE_NAME} certificate: ${options.trackName} 🏆`,
    html: layout(
      `Certificate of completion`,
      `<p style="line-height:1.6;font-size:14px;">${greeting}</p>
      <p style="line-height:1.6;font-size:14px;">
        You have completed every lesson in <strong>${options.trackName}</strong>.
        ${SITE_NAME} by ${ORG_NAME} has issued your certificate of completion —
        view it, print it, or share the link below; anyone with the URL can
        verify it.
      </p>
      ${button(options.certificateUrl, 'View your certificate →')}
      <p style="line-height:1.6;font-size:13px;color:${MUTED};margin-top:16px;">
        The next track in the curriculum is already unlocked for you.
      </p>`,
    ),
  };
}
