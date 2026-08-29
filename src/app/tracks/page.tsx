import type { Metadata } from 'next';
import Link from 'next/link';
import { TrackDifficulty } from '@prisma/client';
import { Container, PageHeader } from '@/components/ui/primitives';
import { TracksGrid, type TrackCardData } from '@/components/tracks/TracksGrid';
import { TRACK_CONFIGS } from '@/lib/track-mapping';

export const metadata: Metadata = {
  // Stated explicitly so a link arriving with tracking parameters
  // (?utm_source=..., ?ref=...) consolidates onto one indexable URL instead of
  // splitting this page's ranking across every variant that ever gets shared.
  alternates: { canonical: '/tracks' },
  title: 'Learning Tracks',
  description:
    'Twelve structured quantum computing tracks, from qubits and gates through error correction, cryptography and variational algorithms.',
};

/** Icons live here rather than in TRACK_CONFIGS — presentation, not data. */
const TRACK_ICONS: Record<string, string> = {
  'quantum-fundamentals': '⚛️',
  'quantum-gates': '🔀',
  'qiskit-sdk-deep-dive': '🛠️',
  'quantum-entanglement': '🔗',
  'quantum-algorithms': '🧮',
  'quantum-teleportation-protocols': '🌀',
  'quantum-error-correction': '🛡️',
  'quantum-cryptography-qkd': '🔐',
  'variational-quantum-algorithms': '📡',
  'quantum-machine-learning': '🤖',
  'advanced-qiskit-topics': '💻',
  'ibm-cert-exam-prep': '🎓',
};

const DIFFICULTY_TONE = {
  [TrackDifficulty.BEGINNER]: 'success',
  [TrackDifficulty.INTERMEDIATE]: 'accent',
  [TrackDifficulty.ADVANCED]: 'warning',
  [TrackDifficulty.EXPERT]: 'danger',
} as const;

/**
 * Serializable card data for the client-side grid, which applies sequential
 * unlocking from localStorage. See src/components/tracks/TracksGrid.tsx.
 */
const TRACK_CARDS: TrackCardData[] = TRACK_CONFIGS.map((track) => ({
  slug: track.slug,
  title: track.title,
  description: track.description,
  difficulty: track.difficulty,
  labCount: track.labCount,
  estimatedHours: track.estimatedHours,
  icon: TRACK_ICONS[track.slug] ?? '⚛️',
  tone: DIFFICULTY_TONE[track.difficulty] ?? 'neutral',
}));

export default function TracksPage() {
  return (
    <Container className="py-10 sm:py-14">
      <PageHeader
        eyebrow="Curriculum"
        title="Learning tracks"
        description="Twelve tracks ordered so each builds on the last — from your first qubit to fault-tolerant computing and certification prep."
        actions={
          <Link href="/exam" className="quantum-btn">
            Practice exam
          </Link>
        }
      />

      {/* The sixteen-concept grid GIF that used to sit here has been split:
          each concept is now a full-resolution figure on the track that
          teaches it, rather than a 96px tile in a shared image. */}

      <div className="mt-12">
        <h2 className="font-mono text-lg font-bold">All 12 tracks</h2>
        <p className="mt-1.5 text-sm text-content-muted">
          Tracks unlock in order — finish the first lesson of a track to open
          the next one.
        </p>
        <TracksGrid tracks={TRACK_CARDS} />
      </div>
    </Container>
  );
}
