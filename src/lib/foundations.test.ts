import type React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { FOUNDATION_LESSONS } from '@/lib/foundations-lessons';
import { ALL_TOPICS, SYLLABUS, TOPIC_QUESTIONS, getTopic, topicNeighbours } from '@/lib/foundations-syllabus';
import { PHYSICS_MCQS } from '@/lib/physics-mcq';

vi.mock('@/components/learning/LearningModeProvider', () => ({
  useLearningMode: () => ({ reducedMotion: true }),
}));

/**
 * The syllabus is a document the author handed over; these checks are the
 * difference between "adopted as printed" and "roughly transcribed".
 */
describe('the syllabus, as printed', () => {
  it('has nine modules and 106 topics in the printed counts', () => {
    expect(SYLLABUS.map((m) => m.topics.length)).toEqual([9, 10, 11, 11, 11, 10, 13, 19, 12]);
    expect(ALL_TOPICS.length).toBe(106);
  });

  it('numbers every row the way the document does', () => {
    for (const m of SYLLABUS) {
      expect(m.id).toMatch(/^0[1-9]$/);
      m.topics.forEach((t, i) => {
        expect(t.id).toBe(`${m.id}.${String(i + 1).padStart(2, '0')}`);
        expect(t.n).toBe(i + 1);
      });
    }
    expect(new Set(ALL_TOPICS.map((t) => t.id)).size).toBe(106);
  });

  it('gives every topic a unique URL within its module', () => {
    for (const m of SYLLABUS) {
      const slugs = m.topics.map((t) => t.slug);
      expect(new Set(slugs).size, m.title).toBe(slugs.length);
      for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
    expect(new Set(SYLLABUS.map((m) => m.slug)).size).toBe(9);
  });

  it('walks the whole hierarchy with previous/next, crossing module boundaries', () => {
    const first = topicNeighbours('01.01');
    expect(first.previous).toBeUndefined();
    expect(first.next?.topic.id).toBe('01.02');
    const boundary = topicNeighbours('01.09');
    expect(boundary.next?.topic.id).toBe('02.01');
    expect(boundary.next?.href).toBe('/learn/foundations/classical-physics-foundations/motion-position-velocity-and-acceleration');
    expect(topicNeighbours('09.12').next).toBeUndefined();
  });
});

describe('the question bank mapped onto the syllabus', () => {
  it('maps only real topics to real questions', () => {
    for (const [topicId, ids] of Object.entries(TOPIC_QUESTIONS)) {
      expect(getTopic(topicId), topicId).toBeDefined();
      for (const id of ids) expect(PHYSICS_MCQS.some((q) => q.id === id), `Q${id} for ${topicId}`).toBe(true);
      expect(new Set(ids).size, `${topicId} repeats a question`).toBe(ids.length);
    }
  });

  it('leaves no question of the hundred unassigned', () => {
    const assigned = new Set(Object.values(TOPIC_QUESTIONS).flat());
    const orphans = PHYSICS_MCQS.map((q) => q.id).filter((id) => !assigned.has(id));
    expect(orphans, 'questions with no topic').toEqual([]);
  });
});

describe('the lessons', () => {
  it('cover modules 01 and 02 completely, once each', () => {
    const topics = FOUNDATION_LESSONS.map((l) => l.topic);
    expect(new Set(topics).size).toBe(topics.length);
    for (const m of SYLLABUS.slice(0, 2)) {
      for (const t of m.topics) expect(topics, `${t.id} ${t.title}`).toContain(t.id);
    }
    for (const t of topics) expect(getTopic(t), t).toBeDefined();
  });

  it('are written three times, not once with extras', () => {
    for (const l of FOUNDATION_LESSONS) {
      const tiers = [l.kid, l.student, l.professional];
      for (const tier of tiers) {
        expect(tier.intro.length, `${l.topic} intro`).toBeGreaterThan(80);
        expect(tier.points.length, `${l.topic} points`).toBeGreaterThanOrEqual(3);
      }
      // Distinct texts per audience — the brief was "do not mix them up".
      expect(new Set(tiers.map((t) => t.intro)).size, `${l.topic} shares an intro between tiers`).toBe(3);
      expect(l.kid.math, `${l.topic} kid tier must not carry equations`).toBeUndefined();
      expect(l.student.math?.length ?? 0, `${l.topic} student tier needs equations`).toBeGreaterThan(0);
      expect(l.professional.math?.length ?? 0, `${l.topic} professional tier needs equations`).toBeGreaterThan(0);
    }
  });

  it('render their figures server-side without throwing', async () => {
    const { renderToStaticMarkup } = await import('react-dom/server');
    const { figureForSpec } = await import('@/components/physics-quiz/registry');
    for (const l of FOUNDATION_LESSONS) {
      for (const revealed of [false, true]) {
        const html = renderToStaticMarkup(figureForSpec(l.figure.animation, l.figure.params, revealed) as React.ReactElement);
        expect(html, `${l.topic}`).toContain('<svg');
        expect(html, `${l.topic} aria-label`).toMatch(/aria-label="[^"]{20,}"/);
        expect(html, `${l.topic} renders NaN`).not.toContain('NaN');
      }
    }
  });

  it('render their equations with KaTeX cleanly', async () => {
    const katex = (await import('katex')).default;
    for (const l of FOUNDATION_LESSONS) {
      for (const key of ['student', 'professional'] as const) {
        for (const src of l[key].math ?? []) {
          const html = katex.renderToString(src, {
            displayMode: true,
            throwOnError: false,
            strict: false,
            macros: { '\\ket': '\\left|#1\\right\\rangle', '\\bra': '\\left\\langle#1\\right|', '\\braket': '\\left\\langle#1\\middle|#2\\right\\rangle' },
          });
          expect(html, `${l.topic} ${key}: ${src}`).not.toContain('katex-error');
        }
      }
    }
  });
});
