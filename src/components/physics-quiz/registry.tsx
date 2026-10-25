'use client';

import type { ReactNode } from 'react';
import type { AnimationId } from '@/lib/physics-mcq';
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
  ExponentDivision,
  InverseProportion,
  KmaxVsFrequency,
  MatrixSwap,
  Normalisation,
  PeriodFrequency,
  PhotoelectricThreshold,
  PhotonArithmetic,
  PlanckQuanta,
  QuantumNumbers,
  ShmRestoring,
  TangentSlope,
  WhichPath,
} from './animations/Concepts';

/**
 * Animation id to component, in two states.
 *
 * `question` is what a learner sees while deciding; `answer` is what they see
 * once they have. For most figures these are the same loop, but where the
 * figure *is* the question — the blackbody curves, the energy levels, the
 * probability bars — the answer state adds the annotation that would have
 * given the answer away: peak markers, the photon label, the tallest bar
 * highlighted.
 *
 * Showing the annotated version up front would turn five of these questions
 * into reading comprehension.
 */
interface Entry {
  question: ReactNode;
  answer?: ReactNode;
}

export const ANIMATIONS: Record<AnimationId, Entry> = {
  'exponent-division': { question: <ExponentDivision /> },
  'inverse-proportion': { question: <InverseProportion /> },
  'phase-difference': { question: <PhaseDifference /> },
  'probability-bars': {
    question: <ProbabilityBars />,
    answer: <ProbabilityBars highlightMax />,
  },
  'complex-rotation': { question: <ComplexRotation /> },
  'matrix-swap': { question: <MatrixSwap /> },
  'tangent-slope': { question: <TangentSlope /> },
  'shm-restoring': { question: <ShmRestoring /> },
  'period-frequency': { question: <PeriodFrequency /> },
  'wave-cancellation': { question: <WaveCancellation /> },
  'blackbody-curves': {
    question: <BlackbodyCurves />,
    answer: <BlackbodyCurves markPeaks />,
  },
  'planck-quanta': { question: <PlanckQuanta /> },
  'photoelectric-threshold': { question: <PhotoelectricThreshold /> },
  'photocurrent-intensity': {
    question: <PhotocurrentIntensity />,
    answer: <PhotocurrentIntensity annotate />,
  },
  'kmax-vs-frequency': { question: <KmaxVsFrequency /> },
  'photon-arithmetic': { question: <PhotonArithmetic /> },
  'bohr-stability': { question: <BohrStability /> },
  'energy-levels': {
    question: <EnergyLevels />,
    answer: <EnergyLevels showPhoton />,
  },
  'de-broglie-ratio': { question: <DeBroglieRatio /> },
  'which-path': { question: <WhichPath /> },
  'born-rule': { question: <BornRule /> },
  'normalisation': { question: <Normalisation /> },
  'quantum-numbers': { question: <QuantumNumbers /> },
  'electron-hole-pairs': { question: <ElectronHolePairs /> },
};

/**
 * Q42 asks about momentum while Q41 asks about energy, and both are served by
 * PhotonArithmetic. The registry is keyed on animation id rather than question
 * id, so the momentum variant is selected here.
 */
export function figureFor(
  animation: AnimationId,
  questionId: number,
  revealed: boolean,
): ReactNode {
  if (animation === 'photon-arithmetic') {
    return <PhotonArithmetic mode={questionId === 42 ? 'momentum' : 'energy'} />;
  }
  const entry = ANIMATIONS[animation];
  return revealed ? (entry.answer ?? entry.question) : entry.question;
}
