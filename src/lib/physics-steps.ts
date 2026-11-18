import {
  ELECTRON_VOLT,
  HC_EV_NM,
  PLANCK,
  deBroglieWavelength,
  maxKineticEnergy,
  photonEnergy,
  photonEnergyEv,
  photonMomentum,
  sci,
  thresholdWavelengthNm,
} from '@/lib/physics';

/**
 * The worked-arithmetic figures, as data.
 *
 * Thirteen questions across the four levels are "plug the numbers in" — a
 * photon energy, a de Broglie wavelength, a threshold wavelength. They share
 * one three-stage figure (formula → substitution → result), so what differs
 * per question is only which computation to run. Those computations live here
 * rather than in the component so the numbers on screen are produced by the
 * same functions physics-levels.test.ts checks the answer key against. A
 * figure cannot show 1.33 × 10⁻¹⁹ J while the key says something else.
 */
export type ArithmeticOp =
  | 'divide-sci'
  | 'photon-energy-hz'
  | 'photon-energy-nm'
  | 'photon-momentum-nm'
  | 'de-broglie'
  | 'threshold-nm'
  | 'ev-to-joule'
  | 'kmax-hz'
  | 'energy-ratio-nm';

export interface ArithmeticSteps {
  formula: string;
  substitution: string;
  result: string;
  /** Names the distractors, where the paper's walkthrough does. */
  note?: string;
}

/** Plain for ordinary magnitudes, scientific otherwise — as the paper prints them. */
function plain(value: number): string {
  if (Math.abs(value) >= 0.01 && Math.abs(value) < 10000) {
    const text = Number(value.toPrecision(3)).toString();
    return text;
  }
  return sci(value);
}

export function arithmeticSteps(op: ArithmeticOp, a: number, b = 0): ArithmeticSteps {
  switch (op) {
    case 'divide-sci': {
      const v = a / b;
      return {
        formula: `${sci(a, 1)} ÷ ${sci(b, 1)}`,
        substitution: `coefficients divide · exponents subtract`,
        result: plain(v),
      };
    }
    case 'photon-energy-hz': {
      const e = photonEnergy(a);
      return {
        formula: 'E = hν',
        substitution: `${sci(PLANCK)} × ${sci(a, 1)}`,
        result: `${sci(e)} J`,
        note: `that is ${(e / ELECTRON_VOLT).toFixed(2)} eV — a visible photon`,
      };
    }
    case 'photon-energy-nm': {
      const e = photonEnergyEv(a);
      return {
        formula: 'E = hc / λ',
        substitution: `${HC_EV_NM} eV nm ÷ ${a} nm`,
        result: `${e.toFixed(2)} eV`,
      };
    }
    case 'photon-momentum-nm': {
      const lambda = a * 1e-9;
      const p = photonMomentum(lambda);
      return {
        formula: 'p = h / λ',
        substitution: `${sci(PLANCK)} ÷ ${sci(lambda)}`,
        result: `${sci(p)} kg m s⁻¹`,
        note: `the photon's energy is ${sci(photonEnergy(3e8 / lambda))} J — a different quantity`,
      };
    }
    case 'de-broglie': {
      const l = deBroglieWavelength(a);
      return {
        formula: 'λ = h / p',
        substitution: `${sci(PLANCK)} ÷ ${sci(a, 1)}`,
        result: `${sci(l)} m`,
        note: `about ${(l / 1e-9).toFixed(2)} nm — the scale of atomic spacings`,
      };
    }
    case 'threshold-nm': {
      const l = thresholdWavelengthNm(a);
      return {
        formula: 'λ₀ = hc / Φ',
        substitution: `${HC_EV_NM} eV nm ÷ ${a} eV`,
        result: `${Math.round(l)} nm`,
        note: 'longer wavelengths than this eject nothing, however bright',
      };
    }
    case 'ev-to-joule': {
      const j = a * ELECTRON_VOLT;
      return {
        formula: 'Kₘₐₓ = eV₀',
        substitution: `${sci(ELECTRON_VOLT, 2)} C × ${a} V`,
        result: `${sci(j)} J`,
      };
    }
    case 'kmax-hz': {
      const { kMax, workFunction } = maxKineticEnergy(a, b);
      return {
        formula: 'Kₘₐₓ = h(ν − ν₀)',
        substitution: `${sci(PLANCK)} × ${sci(a - b, 1)}`,
        result: `${sci(kMax)} J`,
        note: `work function Φ = ${sci(workFunction)} J · whole photon = ${sci(photonEnergy(a))} J — those two are the distractors`,
      };
    }
    case 'energy-ratio-nm': {
      const ea = photonEnergyEv(a);
      const eb = photonEnergyEv(b);
      return {
        formula: 'E = hc / λ  →  E ∝ 1/λ',
        substitution: `${a} nm: ${ea.toFixed(2)} eV · ${b} nm: ${eb.toFixed(2)} eV`,
        result: `ratio ${plain(ea / eb)} : 1`,
      };
    }
  }
}
