import type { Metadata } from 'next';
import Link from 'next/link';
import { TrackDifficulty } from '@prisma/client';
import { Container, PageHeader, Card, Badge } from '@/components/ui/primitives';
import { TRACK_CONFIGS, type TrackConfig } from '@/lib/track-mapping';

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

function TrackCard({ track, index }: { track: TrackConfig; index: number }) {
  return (
    <Card href={`/tracks/${track.slug}`} className="flex h-full flex-col gap-3">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-overlay text-xl"
        >
          {TRACK_ICONS[track.slug] ?? '⚛️'}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-content-subtle">
              #{index + 1}
            </span>
            <Badge tone={DIFFICULTY_TONE[track.difficulty] ?? 'neutral'}>
              {track.difficulty.toLowerCase()}
            </Badge>
          </div>
          <h2 className="mt-1 font-mono text-sm font-bold leading-tight">
            {track.title}
          </h2>
        </div>
      </div>

      <p className="line-clamp-3 text-xs leading-relaxed text-content-muted">
        {track.description}
      </p>

      <div className="mt-auto flex items-center justify-between border-t border-line pt-3 font-mono text-xs text-content-subtle">
        <span className="flex gap-3">
          <span>{track.labCount} labs</span>
          <span>{track.estimatedHours}h</span>
        </span>
        <span className="text-accent">Start →</span>
      </div>
    </Card>
  );
}

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
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRACK_CONFIGS.map((track, index) => (
            <TrackCard key={track.slug} track={track} index={index} />
          ))}
        </div>
      </div>
    </Container>
  );
}
