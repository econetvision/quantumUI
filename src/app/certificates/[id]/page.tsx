import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/primitives';
import { withDatabase } from '@/lib/db';
import { ORG_NAME, SITE_NAME } from '@/lib/site';

/**
 * A certificate of completion, addressable and printable.
 *
 * Public by design: the whole point of a shareable certificate is that anyone
 * holding the URL can verify it. The id is an unguessable cuid, so the URL is
 * the credential. `noindex` keeps recipients' names out of search results.
 */

export const metadata: Metadata = {
  title: 'Certificate of Completion',
  robots: { index: false, follow: false },
};

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: certificate } = await withDatabase(
    (db) =>
      db.certificate.findUnique({
        where: { id },
        select: {
          id: true,
          trackName: true,
          issuedAt: true,
          user: { select: { name: true, email: true } },
        },
      }),
    null,
  );

  if (!certificate) notFound();

  const recipient =
    certificate.user.name ?? certificate.user.email.split('@')[0];
  const issued = certificate.issuedAt.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Container size="narrow" className="py-10 sm:py-16">
      <div className="overflow-hidden rounded-2xl border-2 border-accent/40 bg-surface-raised p-8 text-center sm:p-14 print:border-black">
        <div className="flex items-center justify-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-alt font-mono text-lg font-bold text-accent-contrast"
          >
            Q
          </span>
          <span className="font-mono text-lg font-bold">
            Quantum<span className="text-accent">UI</span>
          </span>
        </div>
        <p className="mt-1 text-xs tracking-wide text-content-subtle">
          by {ORG_NAME}
        </p>

        <p className="mt-10 font-mono text-xs uppercase tracking-[0.3em] text-content-subtle">
          Certificate of Completion
        </p>

        <p className="mt-8 text-sm text-content-muted">This certifies that</p>
        <p className="mt-2 text-3xl font-bold sm:text-4xl">{recipient}</p>

        <p className="mt-6 text-sm text-content-muted">
          has successfully completed every lesson of the track
        </p>
        <p className="mt-2 font-mono text-xl font-bold text-accent sm:text-2xl">
          {certificate.trackName}
        </p>

        <p className="mt-8 text-sm text-content-muted">
          on the {SITE_NAME} interactive quantum computing curriculum
        </p>

        <div className="mx-auto mt-10 flex max-w-md items-end justify-between gap-6 border-t border-line pt-6 text-left">
          <div>
            <p className="font-mono text-xs text-content-subtle">Issued</p>
            <p className="mt-1 text-sm font-semibold">{issued}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs text-content-subtle">Serial</p>
            <p className="mt-1 break-all font-mono text-xs">{certificate.id}</p>
          </div>
        </div>

        <p className="mt-6 text-xs text-content-subtle">
          Issued by {ORG_NAME} · verify at this page&apos;s URL
        </p>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
        <Link href="/tracks" className="quantum-btn">
          Keep learning →
        </Link>
      </div>
    </Container>
  );
}
