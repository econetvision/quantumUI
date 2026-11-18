'use client';

import type { ReactNode } from 'react';
import type { AnimationId, FigureParams, PhysicsMCQ } from '@/lib/physics-mcq';
import type { ArithmeticOp } from '@/lib/physics-steps';
import {
  BlackbodyCurves,
  EnergyLevels,
  PhaseDifference,
  PhotocurrentIntensity,
  ProbabilityBars,
  WaveCancellation,
} from './animations/LoadBearing';
import {
  BohrStability,
  BornRule,
  ComplexRotation,
  DeBroglieRatio,
  ElectronHolePairs,
  InverseProportion,
  KmaxVsFrequency,
  MatrixAction,
  Normalisation,
  PeriodFrequency,
  PhotoelectricThreshold,
  PlanckQuanta,
  QuantumNumbers,
  ShmRestoring,
  TangentSlope,
  WhichPath,
} from './animations/Concepts';
import {
  AmplitudeSum,
  Arithmetic,
  ComplexMagnitude,
  DecimalShift,
  DisplacementSum,
  EnergyLedger,
  PhaseSeparation,
  PowerLaw,
  ShellCounting,
  UnitCircle,
  WaveSpeed,
} from './animations/Foundations';

/**
 * Animation id to component, in two states, fed by the question's params.
 *
 * `question` is what a learner sees while deciding; `answer` is what they see
 * once they have. For most figures these are the same loop, but where the
 * figure *is* the question — the blackbody curves, the energy levels, the
 * probability bars — the answer state adds the annotation that would have
 * given the answer away: peak markers, the photon label, the tallest bar
 * highlighted.
 *
 * Showing the annotated version up front would turn those questions into
 * reading comprehension.
 */
type Render = (params: FigureParams) => ReactNode;

interface Entry {
  question: Render;
  answer?: Render;
}

// Typed readers for the loosely typed params bag. Each figure's defaults are
// the Level 2 question it was first drawn for, so missing keys fall through.
const num = (p: FigureParams, key: string): number | undefined =>
  typeof p[key] === 'number' ? (p[key] as number) : undefined;
const str = <T extends string>(p: FigureParams, key: string): T | undefined =>
  typeof p[key] === 'string' ? (p[key] as T) : undefined;
const bool = (p: FigureParams, key: string): boolean | undefined =>
  typeof p[key] === 'boolean' ? (p[key] as boolean) : undefined;
const list = (p: FigureParams, key: string): number[] | undefined =>
  Array.isArray(p[key]) ? (p[key] as number[]) : undefined;

export const ANIMATIONS: Record<AnimationId, Entry> = {
  arithmetic: {
    question: (p) => <Arithmetic op={str<ArithmeticOp>(p, 'op') ?? 'divide-sci'} a={num(p, 'a') ?? 1} b={num(p, 'b')} />,
  },
  'decimal-shift': {
    question: (p) => <DecimalShift value={str(p, 'value') ?? '0.0000042'} places={num(p, 'places') ?? 6} />,
  },
  'power-law': {
    question: (p) => <PowerLaw k={num(p, 'k') ?? 2} from={num(p, 'from') ?? 1} to={num(p, 'to') ?? 2} />,
  },
  'inverse-proportion': {
    question: (p) => <InverseProportion from={num(p, 'from')} to={num(p, 'to')} quantity={str(p, 'quantity')} />,
  },
  'unit-circle': { question: (p) => <UnitCircle deg={num(p, 'deg') ?? 90} /> },
  'complex-magnitude': { question: (p) => <ComplexMagnitude re={num(p, 're') ?? 3} im={num(p, 'im') ?? 4} /> },
  'complex-rotation': { question: () => <ComplexRotation /> },
  'matrix-action': {
    question: (p) => (
      <MatrixAction
        matrix={str<'X' | 'Z'>(p, 'matrix')}
        vector={list(p, 'vector')}
        labels={str(p, 'labels')}
        repeat={num(p, 'repeat')}
        emphasis={str<'shape'>(p, 'emphasis')}
      />
    ),
  },
  'tangent-slope': {
    question: (p) => <TangentSlope curve={str<'throw' | 'quadratic'>(p, 'curve')} at={num(p, 'at')} />,
  },
  'shm-restoring': { question: (p) => <ShmRestoring trace={bool(p, 'trace')} /> },
  'period-frequency': {
    question: (p) => (
      <PeriodFrequency cycles={num(p, 'cycles')} seconds={num(p, 'seconds')} ask={str<'frequency' | 'cycles'>(p, 'ask')} />
    ),
  },
  'wave-speed': {
    question: (p) => (
      <WaveSpeed f={num(p, 'f') ?? 20} lambda={num(p, 'lambda')} v={num(p, 'v')} ask={str<'v' | 'lambda'>(p, 'ask') ?? 'v'} />
    ),
  },
  'phase-difference': { question: (p) => <PhaseDifference deg={num(p, 'deg')} /> },
  'phase-separation': {
    question: (p) => (
      <PhaseSeparation d={num(p, 'd') ?? 0.25} lambda={num(p, 'lambda') ?? 1} v={num(p, 'v')} f={num(p, 'f')} />
    ),
  },
  'wave-cancellation': { question: (p) => <WaveCancellation holdDeg={num(p, 'holdDeg')} /> },
  'displacement-sum': {
    question: (p) => <DisplacementSum a={num(p, 'a') ?? 2} b={num(p, 'b') ?? -1.5} amplitude={num(p, 'amplitude') ?? 3} />,
  },
  'probability-bars': {
    question: (p) => <ProbabilityBars values={list(p, 'values')} stack={bool(p, 'stack')} />,
    answer: (p) => <ProbabilityBars values={list(p, 'values')} stack={bool(p, 'stack')} highlightMax={!bool(p, 'stack')} />,
  },
  'blackbody-curves': {
    question: (p) => <BlackbodyCurves classical={bool(p, 'classical')} />,
    answer: (p) => <BlackbodyCurves classical={bool(p, 'classical')} markPeaks />,
  },
  'planck-quanta': { question: () => <PlanckQuanta /> },
  'photoelectric-threshold': { question: (p) => <PhotoelectricThreshold sweep={bool(p, 'sweep')} /> },
  'photocurrent-intensity': {
    question: (p) => <PhotocurrentIntensity ratio={num(p, 'ratio')} />,
    answer: (p) => <PhotocurrentIntensity ratio={num(p, 'ratio')} annotate />,
  },
  'kmax-vs-frequency': { question: (p) => <KmaxVsFrequency secondThreshold={num(p, 'secondThreshold')} /> },
  'energy-ledger': {
    question: (p) => (
      <EnergyLedger
        phiEv={num(p, 'phiEv') ?? 2}
        photonNm={num(p, 'photonNm')}
        photonEv={num(p, 'photonEv')}
        compareNm={num(p, 'compareNm')}
        intensity={num(p, 'intensity')}
        define={bool(p, 'define')}
      />
    ),
  },
  'bohr-stability': { question: () => <BohrStability /> },
  'energy-levels': {
    question: (p) => (
      <EnergyLevels
        from={num(p, 'from')}
        to={num(p, 'to')}
        levels={list(p, 'levels')}
        path={list(p, 'path')}
        spectrum={bool(p, 'spectrum')}
        wavelength={bool(p, 'wavelength')}
      />
    ),
    answer: (p) => (
      <EnergyLevels
        from={num(p, 'from')}
        to={num(p, 'to')}
        levels={list(p, 'levels')}
        path={list(p, 'path')}
        spectrum={bool(p, 'spectrum')}
        wavelength={bool(p, 'wavelength')}
        showPhoton
      />
    ),
  },
  'de-broglie-ratio': {
    question: (p) => <DeBroglieRatio ratio={num(p, 'ratio')} frequency={bool(p, 'frequency')} />,
  },
  'which-path': { question: (p) => <WhichPath mode={str<'toggle' | 'build'>(p, 'mode')} /> },
  'born-rule': { question: (p) => <BornRule rotate={bool(p, 'rotate')} /> },
  'normalisation': {
    question: (p) => (
      <Normalisation
        known={list(p, 'known')}
        solve={bool(p, 'solve')}
        amplitudes={bool(p, 'amplitudes')}
        knownLabel={str(p, 'knownLabel')}
      />
    ),
  },
  'amplitude-sum': {
    question: (p) => (
      <AmplitudeSum
        a={list(p, 'a')}
        b={list(p, 'b')}
        mode={str<'distinguishable' | 'indistinguishable' | 'sweep'>(p, 'mode') ?? 'indistinguishable'}
        labelA={str(p, 'labelA')}
        labelB={str(p, 'labelB')}
      />
    ),
  },
  'quantum-numbers': { question: (p) => <QuantumNumbers sets={str(p, 'sets')} /> },
  'shell-counting': {
    question: (p) => (
      <ShellCounting
        n={num(p, 'n') ?? 3}
        l={num(p, 'l')}
        ml={num(p, 'ml')}
        highlight={str<'subshells' | 'orbitals' | 'electrons' | 'pairing' | 'ml'>(p, 'highlight') ?? 'electrons'}
      />
    ),
  },
  'electron-hole-pairs': { question: (p) => <ElectronHolePairs cooling={bool(p, 'cooling')} /> },
};

/** The figure for a question, in its pre- or post-answer state. */
export function figureFor(question: PhysicsMCQ, revealed: boolean): ReactNode {
  const entry = ANIMATIONS[question.animation];
  const params = question.params ?? {};
  return revealed ? (entry.answer ?? entry.question)(params) : entry.question(params);
}
