'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useId, useState } from 'react';
import { signIn } from 'next-auth/react';
import { Callout, Card, Container } from '@/components/ui/primitives';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

function LoginForm() {
  // Labels were previously not associated with their inputs, so screen readers
  // and click-to-focus both failed. useId keeps the pairing unique.
  const emailId = useId();
  const passwordId = useId();

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/tracks';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      // NextAuth collapses every credential failure into one code; a missing
      // database surfaces the same way, so point at both possibilities.
      setError(
        'Could not sign in. Check your email and password — and if the database is not running, sign-in is unavailable (all learning content still works without an account).',
      );
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <Container size="narrow" className="flex flex-col items-center py-14 sm:py-20">
      <Card className="w-full max-w-md">
        <h1 className="text-center text-xl font-bold sm:text-2xl">
          Welcome back
        </h1>
        <p className="mt-1.5 text-center text-sm text-content-muted">
          Sign in to keep your progress and streaks
        </p>

        <div className="mt-7">
          <GoogleSignInButton callbackUrl={callbackUrl} label="Sign in with Google" />
        </div>

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-line" />
          <span className="font-mono text-xs uppercase tracking-wider text-content-subtle">
            or
          </span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor={emailId}
              className="block font-mono text-xs font-bold uppercase tracking-wider text-content-subtle"
            >
              Email
            </label>
            <input
              id={emailId}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              className="mt-1.5 h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm text-content placeholder:text-content-subtle"
            />
          </div>

          <div>
            <label
              htmlFor={passwordId}
              className="block font-mono text-xs font-bold uppercase tracking-wider text-content-subtle"
            >
              Password
            </label>
            <input
              id={passwordId}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
              className="mt-1.5 h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm text-content placeholder:text-content-subtle"
            />
          </div>

          {error && (
            <div role="alert">
              <Callout tone="warning">{error}</Callout>
            </div>
          )}

          <button type="submit" disabled={loading} className="quantum-btn w-full">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 space-y-2 text-center text-sm">
          <p>
            <Link href="/tracks" className="text-accent hover:underline">
              Browse the curriculum without an account →
            </Link>
          </p>
          <p className="text-content-subtle">
            No account yet?{' '}
            <Link href="/signup" className="text-accent hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </Card>
    </Container>
  );
}

/**
 * `useSearchParams` (for the post-login `callbackUrl`) must sit inside a
 * Suspense boundary, otherwise the whole route opts out of static rendering.
 */
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <Container size="narrow" className="py-14 sm:py-20">
          <p className="loading-quantum text-center font-mono text-sm text-content-muted">
            Loading…
          </p>
        </Container>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
