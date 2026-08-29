import type { Metadata } from 'next';
import Link from 'next/link';
import { TrackDifficulty } from '@prisma/client';
import { Badge, Card, Container, PageHeader } from '@/components/ui/primitives';
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

      {/* Track 0 sits above the twelve because it is not one of them: no
          account, no maths, no prerequisites. Someone who lands on this page
          and finds twelve tracks all starting at "qubits and Dirac notation"
          has no way to tell that there is a gentler door — so it is named
          here rather than left to the nav. */}
      <div className="mt-10">
        <Card
          href="/learn/track-0"
          className="flex flex-col gap-4 border-accent/40 bg-accent/[0.04] sm:flex-row sm:items-center"
        >
          <span
            aria-hidden="true"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-accent/30 bg-surface-overlay text-3xl"
          >
            🌍
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-content-subtle">#0</span>
              <Badge tone="accent">start here</Badge>
              <Badge tone="neutral">no account needed</Badge>
            </div>
            <h2 className="mt-1.5 font-mono text-base font-bold leading-tight">
              Quantum World for Everyone
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-content-muted">
              The whole idea with no equations — then the same idea again with
              them, when you want it. Written for a curious ten-year-old and a
              working engineer at the same time, with a mode switch between.
            </p>
          </div>
          <span className="shrink-0 font-mono text-sm text-accent sm:self-end">
            Start &rarr;
          </span>
        </Card>
      </div>

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
