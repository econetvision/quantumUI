import type { Metadata } from 'next';
import { Container, PageHeader } from '@/components/ui/primitives';
import { CommunityBoard } from '@/components/community/CommunityBoard';

export const metadata: Metadata = {
  alternates: { canonical: '/community' },
  title: 'Community',
  description:
    'Ask questions about quantum computing and get answers from other learners. Reading is open to everyone; sign in to ask or reply.',
};

export default function CommunityPage() {
  return (
    <Container className="py-10 sm:py-14">
      <PageHeader
        eyebrow="Ask together"
        title="Community"
        description="Stuck on a lab, a lesson, or a circuit that will not behave? Ask here — other learners and mentors answer. Reading is open to everyone; sign in to ask or reply."
      />
      <CommunityBoard />
    </Container>
  );
}
