import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import auth from '@/lib/auth';
import {
  RANGE_OPTIONS,
  getSiteStats,
  parseRange,
  percentChange,
} from '@/lib/analytics-stats';
import { formatDateTime, relativeTime } from '@/lib/format';
import { ActivityPanel } from '@/components/admin/ActivityPanel';
import { MetricCard } from '@/components/admin/MetricCard';
import { RankedBars } from '@/components/admin/RankedBars';
import { UsersTable } from '@/components/admin/UsersTable';
import {
  Badge,
  Callout,
  Container,
  EmptyState,
  PageHeader,
} from '@/components/ui/primitives';

export const metadata: Metadata = {
  title: 'Site analytics',
  description:
    'Accounts, sign-in history, traffic and interaction stats for QuantumUI.',
  // An admin-only page has nothing to gain from being crawled and something to
  // lose. `robots.ts` disallows /admin as well; this is the belt to that
  // braces, because a crawler that ignores robots.txt still honours the tag.
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Live numbers, so nothing about this page may be cached or prerendered.
 * Without this Next would try to build it statically and fail on `auth()`.
 */
export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  /*
   * Re-checked here even though src/proxy.ts already gates /admin.
   *
   * The proxy is a redirect layer for humans and the Next.js docs are explicit
   * that it may be hoisted to a CDN — it is not the security boundary. This
   * page reads every account's email and sign-in history, so it verifies the
   * session itself.
   */
  const session = await auth.auth().catch(() => null);
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user?.id) redirect('/login?callbackUrl=/admin/dashboard');
  if (user.role !== 'ADMIN') redirect('/unauthorized');

  const params = await searchParams;
  const rangeDays = parseRange(params.days);
  const stats = await getSiteStats(rangeDays);

  return (
    <Container size="wide" className="py-10 sm:py-14">
      <PageHeader
        eyebrow="Instructor tools"
        title="Site analytics"
        description="Who has an account, when they signed up, when they last signed in, and what everyone — signed in or not — is actually doing on the site."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin"
              className="inline-flex min-h-10 items-center rounded-lg border border-line px-3 font-mono text-xs text-content-muted transition-colors hover:border-line-strong hover:text-content"
            >
              ← Students &amp; assignments
            </Link>
            <RangePicker current={rangeDays} />
          </div>
        }
      />

      {!stats ? (
        <div className="mt-10">
          <EmptyState
            title="Analytics need the database"
            description={
              <>
                The stats on this page are read from Postgres and it is not
                reachable right now. Start it and run{' '}
                <code className="font-mono text-content">npm run db:push</code>{' '}
                so the analytics tables exist. Showing zeroes here would read as
                “nobody used the site”, which is a different and much more
                alarming claim than “we cannot tell”.
              </>
            }
            action={
              <Link href="/admin" className="quantum-btn">
                Back to instructor tools
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-10 space-y-8">
          <ActivityPanel
            daily={stats.daily}
            rangeDays={rangeDays}
            totals={{
              pageViews: stats.totals.pageViews,
              visitors: stats.totals.visitors,
              signIns: stats.totals.signIns,
              signUps: stats.totals.newUsers,
            }}
            deltas={{
              pageViews: percentChange(stats.totals.pageViews, stats.previous.pageViews),
              visitors: percentChange(stats.totals.visitors, stats.previous.visitors),
              signIns: percentChange(stats.totals.signIns, stats.previous.signIns),
              signUps: percentChange(stats.totals.newUsers, stats.previous.newUsers),
            }}
          />

          {/* Account-shaped measures, kept apart from the traffic tiles above:
              these describe the cohort, those describe the window. */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard label="Total accounts" value={stats.totals.users} />
            <MetricCard
              label={`Active (${rangeDays}d)`}
              value={stats.totals.activeUsers}
              hint="Signed in or made progress"
            />
            <MetricCard
              label="Never signed in"
              value={stats.totals.neverSignedIn}
              hint="Registered but never authenticated"
            />
            <MetricCard
              label={`Interactions (${rangeDays}d)`}
              value={stats.totals.interactions}
              delta={percentChange(
                stats.totals.interactions,
                stats.previous.interactions,
              )}
              deltaLabel={`vs previous ${rangeDays} days`}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <RankedBars
              title="Most visited pages"
              caption={`Page views in the last ${rangeDays} days`}
              rows={stats.topPages}
              unit="views"
              emptyMessage="No page views recorded yet in this window."
            />
            <RankedBars
              title="What people did"
              caption="Interactions, excluding navigation"
              rows={stats.eventBreakdown.filter((row) => row.name !== 'Page views')}
              unit="events"
              emptyMessage="No interactions recorded yet in this window."
            />
            <RankedBars
              title="Where they came from"
              caption="External referrers only; direct visits are not counted here"
              rows={stats.topReferrers}
              unit="visits"
              emptyMessage="No external referrers yet — traffic so far is direct."
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
            <RankedBars
              title="Accounts by role"
              caption="Every account, not just the current window"
              rows={stats.usersByRole}
              unit="accounts"
              emptyMessage="No accounts yet."
            />
            <RecentSignIns
              rows={stats.recentLogins}
              generatedAt={stats.generatedAt}
            />
          </div>

          <UsersTable
            roster={stats.roster}
            generatedAt={stats.generatedAt}
            rangeDays={rangeDays}
          />

          <Callout title="How these numbers are collected">
            Page views and interactions are counted first-party — no third-party
            script, no cookies, and no IP address is stored against them. A
            visitor is identified only by a random id their own browser
            generates. Browsers sending <span className="font-mono">Do Not Track</span>{' '}
            or Global Privacy Control are not counted at all, so traffic totals
            are a floor rather than an exact figure. Sign-in and sign-up times
            come from the authentication trail, which is exact. Days are bucketed
            in UTC. Generated {formatDateTime(stats.generatedAt)} UTC.
          </Callout>
        </div>
      )}
    </Container>
  );
}

/**
 * Plain links rather than a client-side control: the range is a URL parameter,
 * so a particular view is shareable and bookmarkable, the back button behaves,
 * and the page needs no JavaScript to change range.
 */
function RangePicker({ current }: { current: number }) {
  return (
    <div
      role="group"
      aria-label="Time range"
      className="flex items-center gap-1 rounded-lg border border-line p-1"
    >
      {RANGE_OPTIONS.map((days) => (
        <Link
          key={days}
          href={`/admin/dashboard?days=${days}`}
          aria-current={days === current ? 'true' : undefined}
          className={`inline-flex min-h-8 items-center rounded-md px-3 font-mono text-xs transition-colors ${
            days === current
              ? 'bg-accent-soft text-accent'
              : 'text-content-muted hover:text-content'
          }`}
        >
          {days}d
        </Link>
      ))}
    </div>
  );
}

function RecentSignIns({
  rows,
  generatedAt,
}: {
  rows: {
    id: number;
    at: string;
    name: string | null;
    email: string | null;
    provider: string | null;
  }[];
  generatedAt: string;
}) {
  return (
    <div className="quantum-card p-4 sm:p-5">
      <h3 className="font-mono text-sm font-bold text-content">Recent sign-ins</h3>
      <p className="mt-1 text-xs text-content-subtle">
        The most recent authentications, newest first
      </p>

      {rows.length === 0 ? (
        <p className="mt-5 text-sm text-content-subtle">
          No sign-ins recorded yet. Sign-in history starts from the first
          authentication after this feature was deployed — earlier sessions
          predate the audit trail and cannot be reconstructed.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-line">
          {rows.map((row) => (
            <li key={row.id} className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm text-content">
                  {row.name ?? row.email ?? 'Deleted account'}
                </p>
                <p className="truncate text-xs text-content-subtle">{row.email}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-mono text-xs text-content-muted">
                  {relativeTime(row.at, generatedAt)}
                </p>
                {row.provider && (
                  <Badge className="mt-1">{row.provider}</Badge>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
