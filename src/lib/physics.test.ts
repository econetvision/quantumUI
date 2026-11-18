import { describe, expect, it } from 'vitest';
import {
  apply2x2,
  bohrLevel,
  bornProbability,
  checkQuantumNumbers,
  deBroglieWavelength,
  frequency,
  interfere,
  intrinsicCarriers,
  isNormalised,
  maxKineticEnergy,
  photonEnergy,
  photonMomentum,
  planckRadiance,
  sci,
  shm,
  transitionEnergy,
  wienPeak,
} from '@/lib/physics';

/**
 * Each test here is one question from the answer key, checked against the
 * functions the figures are drawn from.
 *
 * The point is not to test arithmetic. It is that a figure and its answer come
 * from the same source, so they cannot disagree — and if an answer key is
 * wrong, this fails in CI rather than in front of a learner who then has to
 * decide which of the two to believe.
 */
describe('answer key, checked against the physics', () => {
  it('Q26: (6e8)/(3e2) = 2e6 — exponents subtract', () => {
    expect((6e8 / 3e2) / 1e6).toBeCloseTo(2, 10);
  });

  it('Q27: halving λ doubles an inversely proportional quantity', () => {
    const q = (lambda: number) => 1 / lambda;
    expect(q(0.5) / q(1)).toBeCloseTo(2, 12);
  });

  it('Q28: mirror-image curves are π apart, and their sum cancels', () => {
    const atPi = interfere(Math.PI);
    for (const p of atPi) expect(p.sum).toBeCloseTo(0, 12);
    // ...and nothing else cancels, so 180° is the only answer that fits.
    for (const phi of [0, Math.PI / 2, 2 * Math.PI]) {
      const peak = Math.max(...interfere(phi).map((p) => Math.abs(p.sum)));
      expect(peak).toBeGreaterThan(0.5);
    }
  });

  it('Q30: i² = −1, a 180° turn on the complex plane', () => {
    // (0 + 1i)² = −1 + 0i
    const re = 0 * 0 - 1 * 1;
    const im = 0 * 1 + 1 * 0;
    expect(re).toBe(-1);
    expect(im).toBe(0);
  });

  it('Q31: [[0,1],[1,0]] swaps the components of [1,0]', () => {
    expect(apply2x2([0, 1, 1, 0], [1, 0])).toEqual([0, 1]);
    expect(apply2x2([0, 1, 1, 0], [0, 1])).toEqual([1, 0]);
  });

  it('Q33: SHM acceleration always points back to equilibrium', () => {
    for (const t of [0, 0.3, 0.7, 1.1, 2.4]) {
      const { x, acceleration } = shm(2, 1, t);
      if (Math.abs(x) > 1e-9) expect(Math.sign(acceleration)).toBe(-Math.sign(x));
    }
  });

  it('Q34: T = 0.020 s gives f = 50 Hz', () => {
    expect(frequency(0.02)).toBeCloseTo(50, 10);
  });

  it('Q35: odd multiples of π cancel, even multiples reinforce', () => {
    for (const k of [0, 1, 2, 3]) {
      const odd = Math.max(...interfere((2 * k + 1) * Math.PI).map((p) => Math.abs(p.sum)));
      const even = Math.max(...interfere(2 * k * Math.PI).map((p) => Math.abs(p.sum)));
      // Cancellation is exact at every sample; reinforcement peaks *between*
      // samples, so the sampled maximum approaches 2 without reaching it.
      // Asserting equality there would be testing the sampling rate.
      expect(odd).toBeCloseTo(0, 10);
      expect(even).toBeCloseTo(2, 3);
    }
  });

  it('Q36: the hotter curve is higher everywhere and peaks shorter', () => {
    const cool = 3000;
    const hot = 4500;
    for (const nm of [400, 700, 1200, 2000, 3000]) {
      const l = nm * 1e-9;
      expect(planckRadiance(l, hot)).toBeGreaterThan(planckRadiance(l, cool));
    }
    expect(wienPeak(hot)).toBeLessThan(wienPeak(cool));
  });

  it('Q38: below threshold, no intensity produces an electron', () => {
    const below = maxKineticEnergy(4.0e14, 5.0e14);
    expect(below.emits).toBe(false);
    expect(below.kMax).toBe(0);
  });

  it('Q40: Kmax against ν is a straight line of gradient h', () => {
    const threshold = 5.0e14;
    const a = maxKineticEnergy(7.0e14, threshold).kMax;
    const b = maxKineticEnergy(9.0e14, threshold).kMax;
    expect((b - a) / (9.0e14 - 7.0e14)).toBeCloseTo(6.63e-34, 40);
  });

  it('Q41: ν₀ = 5.0e14, ν = 7.0e14 gives Kmax = 1.33e-19 J', () => {
    const { kMax } = maxKineticEnergy(7.0e14, 5.0e14);
    expect(kMax / 1e-19).toBeCloseTo(1.33, 2);
    // The distractors are named in the walkthrough, so they must be what it says.
    expect(photonEnergy(5.0e14) / 1e-19).toBeCloseTo(3.32, 2); // B is the work function
    expect(photonEnergy(7.0e14) / 1e-19).toBeCloseTo(4.64, 2); // C is the whole photon
  });

  it('Q42: a 500 nm photon has p = 1.33e-27 kg m/s', () => {
    expect(photonMomentum(500e-9) / 1e-27).toBeCloseTo(1.33, 2);
  });

  it('Q44: the −1.51 eV to −13.6 eV transition emits 12.09 eV', () => {
    expect(bohrLevel(3)).toBeCloseTo(-1.51, 2);
    expect(bohrLevel(1)).toBeCloseTo(-13.6, 2);
    expect(transitionEnergy(3, 1)).toBeCloseTo(12.09, 2);
  });

  it('Q45: momenta p and 2p give wavelengths in the ratio 2 : 1', () => {
    const p = 1e-27;
    expect(deBroglieWavelength(p) / deBroglieWavelength(2 * p)).toBeCloseTo(2, 12);
  });

  it('Q47: an amplitude of 0.6i carries probability 0.36', () => {
    expect(bornProbability(0, 0.6)).toBeCloseTo(0.36, 12);
  });

  it('Q48: only 0.6 and 0.8 are normalised', () => {
    expect(isNormalised([0.6, 0.8]).normalised).toBe(true);
    for (const pair of [[0.5, 0.5], [0.7, 0.7], [0.8, 0.8]]) {
      expect(isNormalised(pair).normalised).toBe(false);
    }
    // The walkthrough claims 0.7/0.7 reaches 0.98 — check that too.
    expect(isNormalised([0.7, 0.7]).total).toBeCloseTo(0.98, 10);
  });

  it('Q49: only (3, 2, −1, +½) passes every rule', () => {
    expect(checkQuantumNumbers(3, 2, -1, 0.5).allowed).toBe(true);
    expect(checkQuantumNumbers(2, 2, 0, 0.5).allowed).toBe(false); // ℓ = n
    expect(checkQuantumNumbers(3, 1, 2, -0.5).allowed).toBe(false); // mℓ > ℓ
    expect(checkQuantumNumbers(1, 0, 0, 1).allowed).toBe(false); // ms = +1
  });

  it('Q50: intrinsic excitation makes electrons and holes in pairs', () => {
    const { electrons, holes } = intrinsicCarriers(7);
    expect(electrons).toBe(holes);
  });

  it('formats numbers the way the paper writes them', () => {
    expect(sci(1.33e-19)).toBe('1.33 × 10⁻¹⁹');
    expect(sci(2e6)).toBe('2.00 × 10⁶');
  });
});
