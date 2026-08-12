import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Card, Container, PageHeader } from '@/components/ui/primitives';

export const metadata: Metadata = {
  title: 'Plans',
  description: 'Compare the free, Pro and Enterprise plans for QuantumUI.',
};

const PLANS = [
  {
    name: 'FREE',
    price: 'Free',
    tagline: 'Everything you need to learn',
    features: [
      'All 12 learning tracks',
      'Interactive labs and lab shell',
      'Live circuit execution on the SDK',
      'Algorithm gallery',
      'Sample exam questions',
    ],
    current: true,
  },
  {
    name: 'PRO',
    price: '$29/mo',
    tagline: 'For certification candidates',
    features: [
      'Everything in Free',
      'Full 240-question exam bank',
      'Four timed mock exams',
      'Weak-area analytics',
      'Priority support',
    ],
    current: false,
  },
  {
    name: 'ENTERPRISE',
    price: '$99/mo',
    tagline: 'For teams and institutions',
    features: [
      'Everything in Pro',
      'Team management and cohorts',
      'Custom content authoring',
      'API access',
      'QpiAI cloud/QPU credits',
    ],
    current: false,
  },
];

export default function UpgradePage() {
  return (
    <Container className="py-10 sm:py-14">
      <PageHeader
        eyebrow="Plans"
        title="Choose a plan"
        description="The entire curriculum — every track, lab and live circuit execution — is free. Paid plans add certification exam tooling and team features."
      />

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <Card
            key={plan.name}
            className={`flex flex-col ${plan.current ? 'border-accent' : ''}`}
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-mono text-base font-bold">{plan.name}</h2>
              {plan.current && <Badge tone="accent">Current</Badge>}
            </div>

            <p className="mt-1 text-xs text-content-subtle">{plan.tagline}</p>
            <p className="mt-3 font-mono text-2xl font-bold">{plan.price}</p>

            <ul className="mt-5 flex-1 space-y-2">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-sm text-content-muted"
                >
                  <span aria-hidden="true" className="mt-0.5 text-accent">
                    ✓
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {plan.current ? (
              <Link
                href="/tracks"
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg border border-line-strong px-5 font-mono text-sm font-bold transition-colors hover:border-accent hover:text-accent"
              >
                Start learning
              </Link>
            ) : (
              <Link href="/signup" className="quantum-btn mt-6 w-full">
                Choose {plan.name}
              </Link>
            )}
          </Card>
        ))}
      </div>
    </Container>
  );
}
