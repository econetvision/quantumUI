import type React from 'react';
import { describe, expect, it, vi } from 'vitest';

// Figures read the learner's reduced-motion preference through this provider.
// Mocked so they render on the server here, holding their final frame.
vi.mock('@/components/learning/LearningModeProvider', () => ({
  useLearningMode: () => ({ reducedMotion: true }),
}));
import { PHYSICS_MCQS, getQuestion, questionsForLevel } from '@/lib/physics-mcq';

/**
 * Structural checks on the question bank.
 *
 * The expensive mistakes here are silent ones: an answer index pointing at the
 * wrong option, or a question that says "the curves shown" with no figure
 * declared. Neither throws, neither fails a build, and both are only visible
 * to a learner who then cannot tell whether they or the paper is wrong.
 */
describe('physics MCQ bank', () => {
  it('has unique, contiguous question numbers', () => {
    const ids = PHYSICS_MCQS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    const sorted = [...ids].sort((a, b) => a - b);
    for (let i = 1; i < sorted.length; i += 1) {
      expect(sorted[i], `gap before Q${sorted[i]}`).toBe(sorted[i - 1] + 1);
    }
  });

  it('every answer indexes a real option', () => {
    for (const q of PHYSICS_MCQS) {
      expect(q.answer, `Q${q.id}`).toBeGreaterThanOrEqual(0);
      expect(q.answer, `Q${q.id}`).toBeLessThan(q.options.length);
    }
  });

  it('every question has at least two options and no duplicates', () => {
    for (const q of PHYSICS_MCQS) {
      expect(q.options.length, `Q${q.id}`).toBeGreaterThanOrEqual(2);
      expect(new Set(q.options).size, `Q${q.id} has a repeated option`).toBe(q.options.length);
    }
  });

  it('every question carries a walkthrough that says something', () => {
    for (const q of PHYSICS_MCQS) {
      expect(q.reason.length, `Q${q.id}`).toBeGreaterThan(40);
      expect(q.prompt.length, `Q${q.id}`).toBeGreaterThan(10);
    }
  });

  it('questions whose wording depends on a figure declare one', () => {
    // "the two curves shown", "the displayed distribution", "the levels shown".
    // If the prompt refers to something visual, the figure is load-bearing and
    // must be flagged, because the renderer treats those differently.
    const refersToFigure = /\b(shown|displayed|curves? a and b)\b/i;
    for (const q of PHYSICS_MCQS) {
      if (refersToFigure.test(q.prompt)) {
        expect(q.figureIsLoadBearing, `Q${q.id} refers to a figure but is not flagged`).toBe(true);
      }
    }
  });

  it('flags exactly the five questions the paper draws figures for', () => {
    const loadBearing = PHYSICS_MCQS.filter((q) => q.figureIsLoadBearing).map((q) => q.id);
    expect(loadBearing).toEqual([28, 29, 36, 39, 44]);
  });

  it('looks questions up by id and by level', () => {
    expect(getQuestion(41)?.answer).toBe(0);
    expect(getQuestion(999)).toBeUndefined();
    for (const level of [1, 2, 3, 4]) {
      const set = questionsForLevel(level);
      expect(set.length, `level ${level}`).toBe(25);
      expect(set[0].id).toBe((level - 1) * 25 + 1);
      expect(set[24].id).toBe(level * 25);
    }
    expect(PHYSICS_MCQS.length).toBe(100);
  });

  it('keeps each level to its own slice of the paper', () => {
    for (const q of PHYSICS_MCQS) {
      expect(q.level, `Q${q.id}`).toBe(Math.ceil(q.id / 25));
    }
  });
});

/**
 * A question naming an animation with no registry entry renders a blank space
 * where the figure should be. Nothing throws, nothing fails to build, and for
 * the five load-bearing figures it makes the question unanswerable — so the
 * mapping is checked rather than trusted.
 */
describe('every question has a figure to draw', () => {
  it('maps each referenced animation to a registry entry', async () => {
    const { ANIMATIONS } = await import('@/components/physics-quiz/registry');
    for (const q of PHYSICS_MCQS) {
      expect(
        Object.hasOwn(ANIMATIONS, q.animation),
        `Q${q.id} names "${q.animation}", which the registry does not provide`,
      ).toBe(true);
    }
  });

  it('leaves no registry entry unused', async () => {
    const { ANIMATIONS } = await import('@/components/physics-quiz/registry');
    const { FOUNDATION_LESSONS } = await import('@/lib/foundations-lessons');
    // A figure may be drawn by a question, by a lesson, or by both.
    const used = new Set<string>([
      ...PHYSICS_MCQS.map((q) => q.animation),
      ...FOUNDATION_LESSONS.map((l) => l.figure.animation),
    ]);
    for (const key of Object.keys(ANIMATIONS)) {
      expect(used.has(key as never), `"${key}" is registered but no question uses it`).toBe(true);
    }
  });

  it('gives the load-bearing figures a distinct answer state', async () => {
    // These five are the question. Their revealed state adds the annotation
    // that would have given the answer away if shown up front.
    const { ANIMATIONS } = await import('@/components/physics-quiz/registry');
    for (const q of PHYSICS_MCQS.filter((x) => x.figureIsLoadBearing)) {
      const entry = ANIMATIONS[q.animation];
      if (q.animation === 'phase-difference') continue; // the sweep is its own reveal
      expect(entry.answer, `Q${q.id} has no annotated answer figure`).toBeDefined();
    }
  });
});

/**
 * Every question's figure, rendered server-side in both states.
 *
 * Params are a loosely typed bag, so a misspelt key or a number where a list
 * was expected compiles fine and only fails when the figure draws. Rendering
 * all two hundred states here turns that into a test failure with the question
 * number in the message.
 */
describe('every figure renders in both states', () => {
  it('renders without throwing and names the figure for screen readers', async () => {
    const { renderToStaticMarkup } = await import('react-dom/server');
    const { figureFor } = await import('@/components/physics-quiz/registry');
    for (const q of PHYSICS_MCQS) {
      for (const revealed of [false, true]) {
        const html = renderToStaticMarkup(figureFor(q, revealed) as React.ReactElement);
        expect(html, `Q${q.id} ${revealed ? 'answer' : 'question'} state`).toContain('<svg');
        expect(html, `Q${q.id} has no aria-label`).toMatch(/aria-label="[^"]{20,}"/);
        expect(html, `Q${q.id} renders NaN`).not.toContain('NaN');
      }
    }
  });
});
