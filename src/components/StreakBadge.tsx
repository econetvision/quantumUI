"use client";

import { useEffect, useState } from 'react';
import { getStreakData, hydrateFromServer, StreakData, STREAK_EVENT } from '@/lib/streak';

export default function StreakBadge() {
  const [data, setData] = useState<StreakData | null>(null);

  useEffect(() => {
    const handler = () => setData(getStreakData());
    // Defer the initial localStorage read past the sync effect body
    const t = setTimeout(handler, 0);
    window.addEventListener(STREAK_EVENT, handler);

    // Then reconcile with the account. Signed out or offline this is a no-op;
    // signed in on a new browser it is the difference between showing the
    // learner's real streak and showing them a zero. hydrateFromServer emits
    // STREAK_EVENT when it changes anything, so `handler` picks it up.
    void hydrateFromServer();

    return () => {
      clearTimeout(t);
      window.removeEventListener(STREAK_EVENT, handler);
    };
  }, []);

  if (!data) return null;

  const goalPct = Math.min(100, Math.round((data.xpToday / data.dailyGoal) * 100));

  return (
    <div className="flex items-center gap-3 text-sm font-mono">
      <span
        className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${
          data.streak > 0
            ? 'border-orange-500/40 text-orange-400 bg-orange-500/10'
            : 'border-gray-600/40 text-content-subtle'
        }`}
        title={`Current streak: ${data.streak} days (best: ${data.longestStreak})`}
      >
        🔥 {data.streak}
      </span>
      <span
        className="flex items-center gap-2 px-2 py-1 rounded-lg border border-blue-500/40 text-blue-400 bg-blue-500/10"
        title={`${data.xpToday}/${data.dailyGoal} XP today — ${data.xp} XP total`}
      >
        ⚡ {data.xp} XP
        <span className="w-16 h-1.5 bg-surface-sunken rounded-full overflow-hidden">
          <span
            className="block h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${goalPct}%` }}
          />
        </span>
      </span>
    </div>
  );
}
