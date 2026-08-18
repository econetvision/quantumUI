'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

/**
 * Shared by `/login` and `/signup` — Google draws no distinction between the
 * two (the first sign-in creates the account), so both pages get the same
 * button rather than a separate "sign up with Google" flow.
 */
export function GoogleSignInButton({
  callbackUrl = '/tracks',
  label = 'Continue with Google',
}: {
  callbackUrl?: string;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      // No `redirect: false` here: OAuth needs a full-page navigation to
      // Google's consent screen, which a fetch-style sign-in cannot do.
      onClick={() => {
        setLoading(true);
        void signIn('google', { callbackUrl });
      }}
      className="flex h-11 w-full items-center justify-center gap-2.5 rounded-lg border border-line bg-surface px-3 text-sm font-medium text-content transition-colors hover:bg-surface-raised disabled:opacity-60"
    >
      <GoogleMark />
      {loading ? 'Redirecting…' : label}
    </button>
  );
}

/** Google's brand mark. Inlined so it renders offline and needs no /public asset. */
function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" className="h-[18px] w-[18px]" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.83.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}
