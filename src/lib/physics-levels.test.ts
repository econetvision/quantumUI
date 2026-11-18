import { describe, expect, it } from 'vitest';
import {
  apply2x2,
  bohrLevel,
  bornProbability,
  checkQuantumNumbers,
  combineAmplitudes,
  complexMagnitude,
  deBroglieWavelength,
  frequency,
  interfere,
  isNormalised,
  magneticNumbers,
  maxKineticEnergy,
  orbitalCount,
  PAULI_X,
  PAULI_Z,
  phaseForSeparation,
  photonEnergy,
  photonEnergyEv,
  photonMomentum,
  powerLawFactor,
  shellCapacity,
  shellOrbitals,
  shm,
  sinDeg,
  stoppingPotential,
  subshellCapacity,
  subshellCount,
  thresholdWavelengthNm,
  transitionEnergy,
  waveSpeed,
  wavelengthFromSpeed,
  wavelengthNmFromEv,
  ELECTRON_VOLT,
} from '@/lib/physics';

/**
 * Levels 1, 3 and 4 arrived as questions without an answer key. Every answer
 * in physics-mcq.ts for those seventy-five was derived here first, from the
 * same functions the figures are drawn from. If a derivation is wrong, this
 * fails in CI; a learner never meets the mistake.
 */
describe('Level 1 — Q1 to Q25', () => {
  it('Q1: 0.0000042 is 4.2 × 10⁻⁶', () => {
    expect(4.2e-6).toBeCloseTo(0.0000042, 12);
  });
  it('Q2: y ∝ x², doubling x quadruples y', () => {
    expect(powerLawFactor(1, 2, 2)).toBe(4);
  });
  it('Q3: sin 90° = 1', () => {
    expect(sinDeg(90)).toBe(1);
  });
  it('Q4: equal waves 180° apart sum to zero at every instant', () => {
    for (const p of interfere(Math.PI)) expect(p.sum).toBeCloseTo(0, 12);
  });
  it('Q5: 0.10 + 0.25 + 0.40 + 0.25 = 1.00', () => {
    expect(0.1 + 0.25 + 0.4 + 0.25).toBeCloseTo(1, 12);
  });
  it('Q6: |3 + 4i| = 5', () => {
    expect(complexMagnitude(3, 4)).toBe(5);
  });
  it('Q7: a 2×2 matrix on a 2-vector gives a 2-vector', () => {
    expect(apply2x2(PAULI_X, [1, 0])).toHaveLength(2);
  });
  it('Q9: 5 cycles in 2.0 s is 2.5 Hz', () => {
    expect(5 / 2).toBe(2.5);
  });
  it('Q10: v = fλ = 20 × 0.50 = 10 m/s', () => {
    expect(waveSpeed(20, 0.5)).toBe(10);
  });
  it('Q12: equal waves in phase give twice the amplitude', () => {
    const peak = Math.max(...interfere(0).map((p) => p.sum));
    expect(peak).toBeCloseTo(2, 3);
  });
  it('Q18: a 6.0 × 10¹⁴ Hz photon carries 3.98 × 10⁻¹⁹ J', () => {
    expect(photonEnergy(6.0e14) / 1e-19).toBeCloseTo(3.98, 2);
  });
  it('Q24: probabilities 0.36 and P normalise when P = 0.64', () => {
    expect(1 - 0.36).toBeCloseTo(0.64, 12);
  });
  it('Q25: for n = 3, ℓ = 2 is allowed and 3, −1, 4 are not', () => {
    expect(checkQuantumNumbers(3, 2, 0, 0.5).allowed).toBe(true);
    for (const l of [3, -1, 4]) expect(checkQuantumNumbers(3, l, 0, 0.5).allowed).toBe(false);
  });
});

describe('Level 3 — Q51 to Q75', () => {
  it('Q51: 1.2 × 10⁻⁸ / 3.0 × 10⁻⁹ = 4', () => {
    expect(1.2e-8 / 3.0e-9).toBeCloseTo(4, 10);
  });
  it('Q52: x = 3t² gives v = 6t = 12 m/s at t = 2', () => {
    const v = (t: number) => 6 * t;
    expect(v(2)).toBe(12);
  });
  it('Q53: 4.0 Hz for 2.5 s is 10 cycles', () => {
    expect(4 * 2.5).toBe(10);
  });
  it('Q54: λ = v/f = 240/80 = 3.0 m', () => {
    expect(wavelengthFromSpeed(240, 80)).toBe(3);
  });
  it('Q55: displacements +2.0 and −1.5 sum to +0.5 cm', () => {
    expect(2.0 + -1.5).toBeCloseTo(0.5, 12);
  });
  it('Q56: a quarter wavelength apart is π/2', () => {
    expect(phaseForSeparation(0.25, 1)).toBeCloseTo(Math.PI / 2, 12);
  });
  it('Q57: a 450 nm photon is 2.76 eV', () => {
    expect(photonEnergyEv(450)).toBeCloseTo(2.76, 2);
  });
  it('Q58: Φ = 2.0 eV, λ = 400 nm gives V₀ = 1.10 V', () => {
    expect(stoppingPotential(400, 2.0)).toBeCloseTo(1.1, 2);
  });
  it('Q59: Φ = 2.5 eV has threshold 496 nm', () => {
    expect(thresholdWavelengthNm(2.5)).toBeCloseTo(496, 0);
  });
  it('Q61: 1.8 eV is 2.88 × 10⁻¹⁹ J', () => {
    expect((1.8 * ELECTRON_VOLT) / 1e-19).toBeCloseTo(2.88, 2);
  });
  it('Q62: a 600 nm photon has p = 1.11 × 10⁻²⁷ kg m/s', () => {
    // h/λ is exactly 1.105e-27; the paper rounds half-up to 1.11, floating
    // point lands a hair below 1.105, so compare against the unrounded value.
    expect(photonMomentum(600e-9) / 1e-27).toBeCloseTo(1.105, 3);
  });
  it('Q63: −13.6 → −3.4 eV is 10.2 eV, i.e. 122 nm', () => {
    expect(transitionEnergy(2, 1)).toBeCloseTo(10.2, 1);
    expect(wavelengthNmFromEv(10.2)).toBeCloseTo(121.6, 0);
  });
  it('Q64: p = 3.0 × 10⁻²⁴ gives λ = 2.21 × 10⁻¹⁰ m', () => {
    expect(deBroglieWavelength(3.0e-24) / 1e-10).toBeCloseTo(2.21, 2);
  });
  it('Q65: a² + 0.8² = 1 gives a = 0.6', () => {
    expect(isNormalised([0.6, 0.8]).normalised).toBe(true);
    expect(Math.sqrt(1 - 0.64)).toBeCloseTo(0.6, 12);
  });
  it('Q66: distinguishable 1/2 and i/2 give total probability 1/2', () => {
    const { distinguishable } = combineAmplitudes({ re: 0.5, im: 0 }, { re: 0, im: 0.5 });
    expect(distinguishable).toBeCloseTo(0.5, 12);
  });
  it('Q67: Z on [1/√2, 1/√2] flips the second sign', () => {
    const r = Math.SQRT1_2;
    const out = apply2x2(PAULI_Z, [r, r]);
    expect(out[0]).toBeCloseTo(r, 12);
    expect(out[1]).toBeCloseTo(-r, 12);
  });
  it('Q68: n = 4 has 4 subshells', () => {
    expect(subshellCount(4)).toBe(4);
  });
  it('Q69: ℓ = 2 has 5 orbitals', () => {
    expect(orbitalCount(2)).toBe(5);
  });
  it('Q70: n = 3 holds 18 electrons', () => {
    expect(shellCapacity(3)).toBe(18);
  });
  it('Q71: n = 3, ℓ = 1 has 6 (mℓ, ms) combinations', () => {
    expect(subshellCapacity(1)).toBe(6);
  });
});

describe('Level 4 — Q76 to Q100', () => {
  it('Q76: y ∝ √x, 4 × 10⁻⁶ → 9 × 10⁻⁶ scales y by 1.5', () => {
    expect(powerLawFactor(4e-6, 9e-6, 0.5)).toBeCloseTo(1.5, 10);
  });
  it('Q77: at π/2 apart, when one is at a crest the other is at zero', () => {
    const pts = interfere(Math.PI / 2);
    const atCrest = pts.reduce((best, p) => (p.a > best.a ? p : best));
    expect(atCrest.b).toBeCloseTo(0, 1);
  });
  it('Q78: 50 Hz at 20 m/s gives λ = 0.40 m; 0.10 m apart is π/2', () => {
    const lambda = wavelengthFromSpeed(20, 50);
    expect(lambda).toBeCloseTo(0.4, 12);
    expect(phaseForSeparation(0.1, lambda)).toBeCloseTo(Math.PI / 2, 10);
  });
  it('Q79: 1 − (0.12 + 0.28 + 0.35) = 0.25', () => {
    expect(1 - (0.12 + 0.28 + 0.35)).toBeCloseTo(0.25, 12);
  });
  it('Q80: indistinguishable 1/2 and −1/2 cancel to probability 0', () => {
    expect(combineAmplitudes({ re: 0.5, im: 0 }, { re: -0.5, im: 0 }).indistinguishable).toBe(0);
  });
  it('Q81: b = i/√2 normalised means a = 1/√2', () => {
    expect(bornProbability(0, Math.SQRT1_2)).toBeCloseTo(0.5, 12);
    expect(Math.sqrt(1 - 0.5)).toBeCloseTo(Math.SQRT1_2, 12);
  });
  it('Q83: λ₀ = 620 nm; V₀ rises by 0.62 V going from 500 nm to 400 nm', () => {
    const phi = photonEnergyEv(620);
    expect(phi).toBeCloseTo(2.0, 2);
    const rise = stoppingPotential(400, phi) - stoppingPotential(500, phi);
    expect(rise).toBeCloseTo(0.62, 2);
  });
  it('Q84: larger threshold frequency means smaller Kmax at the same ν', () => {
    const nu = 9e14;
    expect(maxKineticEnergy(nu, 6e14).kMax).toBeLessThan(maxKineticEnergy(nu, 5e14).kMax);
  });
  it('Q85: 3.5 eV photon, Φ = 2.0 eV gives Kmax = 1.5 eV', () => {
    expect(3.5 - 2.0).toBeCloseTo(1.5, 12);
  });
  it('Q86: a 400 nm photon carries twice the energy of an 800 nm one', () => {
    expect(photonEnergyEv(400) / photonEnergyEv(800)).toBeCloseTo(2, 12);
  });
  it('Q87: shortening λ by 20% raises p by a factor 1.25', () => {
    expect(photonMomentum(0.8) / photonMomentum(1)).toBeCloseTo(1.25, 12);
  });
  it('Q88: −3.4 → −5.0 → −13.6 emits 1.6 eV then 8.6 eV', () => {
    expect(-3.4 - -5.0).toBeCloseTo(1.6, 12);
    expect(-5.0 - -13.6).toBeCloseTo(8.6, 12);
  });
  it('Q89: tripling p cuts λ to a third and, at fixed speed, triples f', () => {
    const p = 1e-27;
    expect(deBroglieWavelength(3 * p) / deBroglieWavelength(p)).toBeCloseTo(1 / 3, 12);
    const v = 1;
    expect((v / deBroglieWavelength(3 * p)) / (v / deBroglieWavelength(p))).toBeCloseTo(3, 10);
  });
  it('Q91: 1/√2 and e^{iπ}/√2 sum to zero', () => {
    const r = Math.SQRT1_2;
    expect(combineAmplitudes({ re: r, im: 0 }, { re: -r, im: 0 }).indistinguishable).toBeCloseTo(0, 12);
  });
  it('Q92: X applied twice is the identity', () => {
    for (const v of [[1, 0], [0, 1], [0.6, 0.8]] as [number, number][]) {
      const back = apply2x2(PAULI_X, apply2x2(PAULI_X, v));
      expect(back[0]).toBeCloseTo(v[0], 12);
      expect(back[1]).toBeCloseTo(v[1], 12);
    }
  });
  it('Q93: ℓ = 2 gives mℓ = −2 … +2', () => {
    expect(magneticNumbers(2)).toEqual([-2, -1, 0, 1, 2]);
  });
  it('Q94: n = 4, ℓ = 3 holds 14 electrons', () => {
    expect(subshellCapacity(3)).toBe(14);
  });
  it('Q95: a single orbital holds 2 electrons', () => {
    expect(subshellCapacity(0)).toBe(2);
  });
  it('Q96: (4, 2, 3, +½) fails only the mℓ rule', () => {
    const { rules } = checkQuantumNumbers(4, 2, 3, 0.5);
    const failing = rules.filter((r) => !r.ok).map((r) => r.rule);
    expect(failing).toEqual(['−ℓ ≤ mℓ ≤ +ℓ']);
  });
  it('Q97: a full n = 2 shell has 4 orbitals and 8 electrons', () => {
    expect(shellOrbitals(2)).toBe(4);
    expect(shellCapacity(2)).toBe(8);
  });
  it('Q99: x = A cos ωt is zero a quarter period on', () => {
    const omega = 2 * Math.PI;
    expect(shm(omega, 1, 0).velocity).toBeCloseTo(0, 12);
    expect(shm(omega, 1, 0.25).x).toBeCloseTo(0, 12);
  });
  it('Q100 relies on the Bohr levels the figure draws', () => {
    expect(bohrLevel(1)).toBeCloseTo(-13.6, 2);
    expect(frequency(0.02)).toBe(50);
  });
});
