'use client';

import Link from 'next/link';
import { useId, useState } from 'react';
import { signIn } from 'next-auth/react';
import { Callout, Card, Container } from '@/components/ui/primitives';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

type TierType = 'FREE' | 'PRO' | 'ENTERPRISE';

const TIERS: { name: TierType; price: string; features: string[] }[] = [
  {
    name: 'FREE',
    price: 'Free',
    features: ['All 12 tracks', 'Interactive labs', 'Live circuit execution'],
  },
  {
    name: 'PRO',
    price: '$29/mo',
    features: ['Everything in Free', 'Mock exams', 'Progress analytics', 'Priority support'],
  },
  {
    name: 'ENTERPRISE',
    price: '$99/mo',
    features: ['Everything in Pro', 'Team management', 'Custom content', 'API access'],
  },
];

export default function SignupPage() {
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTier, setSelectedTier] = useState<TierType>('FREE');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? 'Could not create the account.');
        setLoading(false);
        return;
      }

      // Sign straight in so the user never types their password twice.
      const signInResult = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      setLoading(false);

      if (signInResult?.error) {
        setError('Account created, but sign-in failed. Try signing in manually.');
        return;
      }

      // Full document navigation rather than router.push — see the note in
      // src/app/login/page.tsx. The client cache holds the proxy's signed-out
      // redirect for /tracks and would replay it without consulting the
      // server, dropping a brand-new account back onto the login form.
      window.location.assign('/tracks');
    } catch {
      setLoading(false);
      setError('Could not reach the server. Please try again.');
    }
  }

  const field =
    'mt-1.5 h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm text-content placeholder:text-content-subtle';
  const labelClass =
    'block font-mono text-xs font-bold uppercase tracking-wider text-content-subtle';

  return (
    <Container size="narrow" className="py-14 sm:py-20">
      <Card className="mx-auto w-full max-w-md">
        <h1 className="text-center text-xl font-bold sm:text-2xl">
          Create an account
        </h1>
        <p className="mt-1.5 text-center text-sm text-content-muted">
          Track your progress across the curriculum
        </p>

        <fieldset className="mt-7">
          <legend className={labelClass}>Plan</legend>
          <div className="mt-2 grid gap-2">
            {TIERS.map((tier) => (
              <label
                key={tier.name}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                  selectedTier === tier.name
                    ? 'border-accent bg-accent-soft'
                    : 'border-line hover:border-line-strong'
                }`}
              >
                <input
                  type="radio"
                  name="tier"
                  value={tier.name}
                  checked={selectedTier === tier.name}
                  onChange={() => setSelectedTier(tier.name)}
                  className="mt-1 h-4 w-4 accent-[var(--accent)]"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-mono text-sm font-bold">
                      {tier.name}
                    </span>
                    <span className="font-mono text-sm text-content-muted">
                      {tier.price}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-xs text-content-muted">
                    {tier.features.join(' · ')}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-6">
          <GoogleSignInButton label="Sign up with Google" />
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
            <label htmlFor={nameId} className={labelClass}>
              Name
            </label>
            <input
              id={nameId}
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              placeholder="Ada Lovelace"
              required
              className={field}
            />
          </div>

          <div>
            <label htmlFor={emailId} className={labelClass}>
              Email
            </label>
            <input
              id={emailId}
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              placeholder="you@example.com"
              required
              className={field}
            />
          </div>

          <div>
            <label htmlFor={passwordId} className={labelClass}>
              Password
            </label>
            <input
              id={passwordId}
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={form.password}
              onChange={(event) =>
                setForm({ ...form, password: event.target.value })
              }
              placeholder="At least 8 characters"
              required
              className={field}
            />
          </div>

          {error && (
            <div role="alert">
              <Callout tone="warning">{error}</Callout>
            </div>
          )}

          <button type="submit" disabled={loading} className="quantum-btn w-full">
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div className="mt-6 space-y-2 text-center text-sm">
          <p>
            <Link href="/tracks" className="text-accent hover:underline">
              Start learning without an account →
            </Link>
          </p>
          <p className="text-content-subtle">
            Already registered?{' '}
            <Link href="/login" className="text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </Container>
  );
}
