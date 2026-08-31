import type { Metadata } from 'next';
import { Container } from '@/components/ui/primitives';
import { ThreadView } from '@/components/community/ThreadView';
import { prisma } from '@/lib/prisma';

/**
 * Question pages are indexable — an answered question is exactly the page a
 * search for the same problem should land on — so the title comes from the
 * thread rather than being a generic "Community".
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const thread = await prisma.communityThread
    .findUnique({ where: { id }, select: { title: true } })
    .catch(() => null);

  return {
    title: thread ? thread.title : 'Community',
    alternates: { canonical: `/community/${id}` },
  };
}

export default async function CommunityThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Container size="narrow" className="py-10 sm:py-14">
      <ThreadView threadId={id} />
    </Container>
  );
}
