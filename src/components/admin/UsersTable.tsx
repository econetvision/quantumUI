'use client';

import { useMemo, useState } from 'react';
import type { RosterRow } from '@/lib/analytics-stats';
import { formatCount, formatDateTime, relativeTime } from '@/lib/format';

/**
 * Every account, with when it was created and when it last authenticated.
 *
 * Sorting and filtering happen in the browser over a roster the server already
 * sent. At the size this platform is built for (the query caps at 500 accounts)
 * that is instant and costs no round trip; past that the right move is server
 * pagination, not a bigger payload — noted here so the tradeoff is visible
 * rather than discovered.
 */

type SortKey =
  | 'signedUpAt'
  | 'lastLoginAt'
  | 'loginCount'
  | 'totalXP'
  | 'eventsInRange'
  | 'name';

const COLUMNS: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: 'name', label: 'Account' },
  { key: 'signedUpAt', label: 'Signed up' },
  { key: 'lastLoginAt', label: 'Last sign-in' },
  { key: 'loginCount', label: 'Sign-ins', numeric: true },
  { key: 'eventsInRange', label: 'Actions', numeric: true },
  { key: 'totalXP', label: 'XP', numeric: true },
];

const ROLE_TONE: Record<string, string> = {
  ADMIN: 'border-accent-alt/40 bg-accent-alt-soft text-accent-alt',
  ENTERPRISE: 'border-success/40 bg-success-soft text-success',
  PRO: 'border-accent/40 bg-accent-soft text-accent',
  STUDENT: 'border-warning/40 bg-warning-soft text-warning',
  FREE: 'border-line bg-surface-overlay text-content-muted',
};

export function UsersTable({
  roster,
  generatedAt,
  rangeDays,
}: {
  roster: RosterRow[];
  /** The server's clock at render time — see the note in src/lib/format.ts. */
  generatedAt: string;
  rangeDays: number;
}) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('signedUpAt');
  const [ascending, setAscending] = useState(false);
  const [onlyNeverSignedIn, setOnlyNeverSignedIn] = useState(false);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const filtered = roster.filter((row) => {
      if (onlyNeverSignedIn && row.lastLoginAt) return false;
      if (!needle) return true;
      return (
        row.email.toLowerCase().includes(needle) ||
        (row.name ?? '').toLowerCase().includes(needle) ||
        row.role.toLowerCase().includes(needle)
      );
    });

    const direction = ascending ? 1 : -1;

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case 'name':
          return direction * (a.name ?? a.email).localeCompare(b.name ?? b.email);
        case 'signedUpAt':
          return direction * (Date.parse(a.signedUpAt) - Date.parse(b.signedUpAt));
        case 'lastLoginAt': {
          // Never-signed-in accounts sort to the far end rather than mixing in
          // with the oldest sign-ins, which would read as "logged in in 1970".
          const left = a.lastLoginAt ? Date.parse(a.lastLoginAt) : -Infinity;
          const right = b.lastLoginAt ? Date.parse(b.lastLoginAt) : -Infinity;
          return direction * (left - right);
        }
        default:
          return direction * (a[sort] - b[sort]);
      }
    });
  }, [roster, query, sort, ascending, onlyNeverSignedIn]);

  const toggleSort = (key: SortKey) => {
    if (key === sort) {
      setAscending((value) => !value);
      return;
    }
    setSort(key);
    // Names read best A→Z; everything else is "most recent / largest first".
    setAscending(key === 'name');
  };

  const neverSignedIn = roster.filter((row) => !row.lastLoginAt).length;

  return (
    <section aria-labelledby="roster-heading" className="quantum-card overflow-hidden">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line p-4 sm:p-5">
        <div>
          <h2 id="roster-heading" className="font-mono text-sm font-bold text-content">
            Accounts
          </h2>
          <p className="mt-1 text-xs text-content-subtle">
            {formatCount(rows.length)} of {formatCount(roster.length)} shown · “Actions”
            counts interactions in the last {rangeDays} days
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="roster-search">
            Search accounts
          </label>
          <input
            id="roster-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email or role"
            className="min-h-10 w-56 rounded-lg border border-line bg-surface-sunken px-3 text-sm text-content outline-none placeholder:text-content-subtle focus:border-accent"
          />
          <button
            type="button"
            onClick={() => setOnlyNeverSignedIn((value) => !value)}
            aria-pressed={onlyNeverSignedIn}
            className={`min-h-10 rounded-lg border px-3 font-mono text-xs transition-colors ${
              onlyNeverSignedIn
                ? 'border-accent bg-accent-soft text-accent'
                : 'border-line text-content-muted hover:border-line-strong hover:text-content'
            }`}
          >
            Never signed in ({formatCount(neverSignedIn)})
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[52rem] text-sm">
          <caption className="sr-only">
            Every account with sign-up date, last sign-in and activity totals
          </caption>
          <thead>
            <tr className="border-b border-line text-left">
              {COLUMNS.map((column) => {
                const isSorted = sort === column.key;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={
                      isSorted ? (ascending ? 'ascending' : 'descending') : 'none'
                    }
                    className={`px-4 py-3 font-mono text-xs font-normal ${
                      column.numeric ? 'text-right' : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className={`inline-flex items-center gap-1 transition-colors hover:text-content ${
                        isSorted ? 'text-accent' : 'text-content-subtle'
                      }`}
                    >
                      {column.label}
                      <span aria-hidden="true" className="text-[10px]">
                        {isSorted ? (ascending ? '▲' : '▼') : '↕'}
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className="px-4 py-10 text-center text-sm text-content-subtle"
                >
                  No account matches that filter.
                </td>
              </tr>
            )}

            {rows.map((row) => {
              const lastLogin = relativeTime(row.lastLoginAt, generatedAt);

              return (
                <tr key={row.id} className="border-b border-line last:border-0">
                  <th scope="row" className="max-w-[18rem] px-4 py-3 text-left font-normal">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-content">
                        {row.name ?? '—'}
                      </span>
                      <span
                        className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] ${
                          ROLE_TONE[row.role] ?? ROLE_TONE.FREE
                        }`}
                      >
                        {row.role}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-content-subtle">
                      {row.email}
                    </span>
                  </th>

                  <td className="whitespace-nowrap px-4 py-3 text-xs text-content-muted">
                    {formatDateTime(row.signedUpAt)}
                    <span className="mt-0.5 block text-content-subtle">
                      {relativeTime(row.signedUpAt, generatedAt)}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-xs">
                    {row.lastLoginAt ? (
                      <>
                        <span className="text-content-muted">
                          {formatDateTime(row.lastLoginAt)}
                        </span>
                        <span className="mt-0.5 block text-content-subtle">
                          {lastLogin}
                        </span>
                      </>
                    ) : (
                      /* Stated in words, not by an empty cell — "never" and
                         "we did not record it" look identical otherwise. */
                      <span className="text-content-subtle">Never signed in</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-content-muted">
                    {formatCount(row.loginCount)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-content-muted">
                    {formatCount(row.eventsInRange)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-content">
                    {formatCount(row.totalXP)}
                    <span className="mt-0.5 block text-[10px] text-content-subtle">
                      {formatCount(row.labsPassed)}/{formatCount(row.labAttempts)} labs
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
