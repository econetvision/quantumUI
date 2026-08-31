'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useLearningMode } from './LearningModeProvider';

/**
 * A short particle burst for the moment a learner finishes something —
 * completing a lab question deserves more ceremony than a button greying out,
 * especially for the eight-year-olds Track 0 is written for.
 *
 * Renders inside a `relative` parent and bursts from its centre. Fire it by
 * incrementing `burstKey`; the burst cleans itself up after ~1.2s.
 *
 * Imports `motion` directly rather than through MotionSafe because the reduced
 * -motion behaviour differs: MotionSafe lands on the final state, but a burst's
 * final state is "gone", so here reduced motion renders nothing at all — the
 * button's own completed state already tells the learner what happened.
 */
const EMOJI = ['✨', '🎉', '⭐', '💫', '🎈', '🌟'];

export function CelebrationBurst({ burstKey }: { burstKey: number }) {
  const { reducedMotion } = useLearningMode();
  // A burst is live from the moment its key arrives until its timer marks it
  // expired — derived at render, so the effect only schedules the expiry.
  const [expiredKey, setExpiredKey] = useState(0);

  useEffect(() => {
    if (burstKey <= 0) return;
    const timer = setTimeout(() => setExpiredKey(burstKey), 1200);
    return () => clearTimeout(timer);
  }, [burstKey]);

  const active = burstKey > 0 && expiredKey < burstKey;
  if (reducedMotion || !active) return null;

  const particles = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    // Staggered radii so the burst reads as a scatter, not a perfect ring.
    const distance = 44 + (i % 3) * 20;
    return {
      id: `${burstKey}-${i}`,
      emoji: EMOJI[i % EMOJI.length],
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance,
      rotate: i % 2 === 0 ? 140 : -140,
    };
  });

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute text-base"
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
          animate={{ x: p.dx, y: p.dy, opacity: 0, scale: 1.2, rotate: p.rotate }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        >
          {p.emoji}
        </motion.span>
      ))}
    </span>
  );
}
