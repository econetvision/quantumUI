import type { FigureSpec } from '@/lib/foundations-syllabus';

/**
 * A foundations lesson: one syllabus topic, three audiences.
 *
 * Unlike Track 0, the tiers here are not cumulative and do not fall back.
 * A ten-year-old, a sixth-former and a working engineer each get their own
 * intro, their own points and (for the latter two) their own equations,
 * written for them — switching mode swaps the whole text, never appends to
 * it. Every tier is required so a topic cannot ship for one audience only.
 */
export interface FoundationTier {
  /** The lead paragraph. */
  intro: string;
  /** Three to five body points. */
  points: string[];
  /** Display equations, LaTeX without delimiters. Rendered server-side. */
  math?: string[];
}

export interface FoundationLesson {
  /** Syllabus id, e.g. "02.06". */
  topic: string;
  minutes: number;
  /** The animated figure computed from src/lib/physics.ts. */
  figure: FigureSpec;
  kid: FoundationTier;
  student: FoundationTier;
  professional: FoundationTier;
}
