import { describe, expect, it } from 'vitest';
import {
  applyGate,
  cAbs2,
  cnot,
  collapse,
  GATES,
  probabilityMap,
  zeroState,
} from '@/lib/quantum-sim';
import { TRACK0_LESSONS } from '@/lib/track0-lessons';
import { TRACK_CONFIGS } from '@/lib/track-mapping';

/**
 * The lessons make specific, checkable claims about what the interactives will
 * show. If the simulator ever disagrees with the prose, the prose is wrong and
 * a child is being taught something false — so the claims are asserted here
 * rather than trusted.
 *
 * These are deliberately phrased as the lesson phrases them.
 */
describe('claims the Track 0 lessons make', () => {
  it('lesson 8: applying H twice returns exactly |0>, the paths to |1> cancelling', () => {
    const out = applyGate(applyGate(zeroState(1), GATES.H, 0), GATES.H, 0);
    const p = probabilityMap(out);
    expect(p['0']).toBeCloseTo(1, 12);
    expect(p['1'] ?? 0).toBeCloseTo(0, 12);
  });

  it('lesson 8: H then Z then H gives |1> with certainty — the opposite ending', () => {
    const mid = applyGate(zeroState(1), GATES.H, 0);
    const out = applyGate(applyGate(mid, GATES.Z, 0), GATES.H, 0);
    const p = probabilityMap(out);
    expect(p['1']).toBeCloseTo(1, 12);
    expect(p['0'] ?? 0).toBeCloseTo(0, 12);
  });

  it('lesson 8: the two circuits are indistinguishable at the midpoint', () => {
    // This is the whole argument that phase is physical: identical probabilities
    // halfway, opposite certainties at the end.
    const afterH = applyGate(zeroState(1), GATES.H, 0);
    const afterHZ = applyGate(afterH, GATES.Z, 0);
    const a = probabilityMap(afterH);
    const b = probabilityMap(afterHZ);
    expect(a['0']).toBeCloseTo(b['0'], 12);
    expect(a['1']).toBeCloseTo(b['1'], 12);
    // ...and yet the states differ, in the sign only.
    expect(afterH.amplitudes[1].re).toBeCloseTo(-afterHZ.amplitudes[1].re, 12);
  });

  it('lesson 6: the Bell pair has genuinely zero amplitude on 01 and 10', () => {
    const bell = cnot(applyGate(zeroState(2), GATES.H, 0), 0, 1);
    expect(cAbs2(bell.amplitudes[1])).toBeCloseTo(0, 12); // |01>
    expect(cAbs2(bell.amplitudes[2])).toBeCloseTo(0, 12); // |10>
    const p = probabilityMap(bell);
    expect(p['00']).toBeCloseTo(0.5, 12);
    expect(p['11']).toBeCloseTo(0.5, 12);
  });

  it('lesson 6: measuring a Bell pair never yields a disagreement', () => {
    // Deterministic RNG sweep rather than sampling, so this cannot flake.
    const bell = cnot(applyGate(zeroState(2), GATES.H, 0), 0, 1);
    for (let i = 0; i < 200; i += 1) {
      const r = i / 200;
      const { outcome } = collapse(bell, () => r);
      expect(['00', '11']).toContain(outcome);
    }
  });

  it('lesson 6 control: without the CNOT, all four outcomes are possible', () => {
    // The comparison the interactive offers has to actually differ, or the
    // demonstration proves nothing.
    const independent = applyGate(applyGate(zeroState(2), GATES.H, 0), GATES.H, 1);
    const p = probabilityMap(independent);
    for (const k of ['00', '01', '10', '11']) expect(p[k]).toBeCloseTo(0.25, 12);
  });

  it('lesson 7: X flips, and every gate offered is its own inverse', () => {
    expect(probabilityMap(applyGate(zeroState(1), GATES.X, 0))['1']).toBeCloseTo(1, 12);
    for (const g of ['X', 'H', 'Z'] as const) {
      const back = applyGate(applyGate(zeroState(1), GATES[g], 0), GATES[g], 0);
      expect(probabilityMap(back)['0']).toBeCloseTo(1, 12);
    }
  });

  it('lesson 5: Z changes the state but no probability', () => {
    const before = applyGate(zeroState(1), GATES.H, 0);
    const after = applyGate(before, GATES.Z, 0);
    expect(probabilityMap(after)['0']).toBeCloseTo(probabilityMap(before)['0'], 12);
    expect(after.amplitudes[1].re).not.toBeCloseTo(before.amplitudes[1].re, 6);
  });
});

describe('Track 0 structure', () => {
  it('has twelve lessons in contiguous order with unique slugs', () => {
    expect(TRACK0_LESSONS).toHaveLength(12);
    expect(TRACK0_LESSONS.map((l) => l.order)).toEqual([...Array(12)].map((_, i) => i + 1));
    expect(new Set(TRACK0_LESSONS.map((l) => l.slug)).size).toBe(12);
  });

  it('every lesson has a kid tier and a quiz — the two things a lesson cannot ship without', () => {
    for (const l of TRACK0_LESSONS) {
      expect(l.kid.intro.length, l.slug).toBeGreaterThan(0);
      expect(l.kid.points.length, l.slug).toBeGreaterThan(0);
      expect(l.quiz.length, l.slug).toBeGreaterThan(0);
    }
  });

  it('every quiz answer indexes a real option', () => {
    for (const l of TRACK0_LESSONS) {
      for (const q of l.quiz) {
        expect(q.answer, `${l.slug}: ${q.q}`).toBeGreaterThanOrEqual(0);
        expect(q.answer, `${l.slug}: ${q.q}`).toBeLessThan(q.options.length);
        expect(q.hint.length, `${l.slug}: ${q.q}`).toBeGreaterThan(0);
      }
    }
  });

  it('bridges point at routes that exist in this app', () => {
    // A dead bridge link is worse than none: it sends the one learner who was
    // ready for more into a 404. Checked against the real track list rather
    // than a URL pattern, because a plausible-looking slug that does not exist
    // is exactly the failure a shape check waves through.
    const trackSlugs = new Set(TRACK_CONFIGS.map((t) => t.slug));
    const standalone = new Set(['/playground', '/labs', '/algorithms', '/exam', '/curriculum']);
    for (const l of TRACK0_LESSONS) {
      if (!l.bridge) continue;
      const { href } = l.bridge;
      if (href.startsWith('/tracks/')) {
        expect(trackSlugs.has(href.slice('/tracks/'.length)), `${l.slug} -> ${href}`).toBe(true);
      } else {
        expect(standalone.has(href), `${l.slug} -> ${href}`).toBe(true);
      }
    }
  });
});
