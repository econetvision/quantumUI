'use client';

import { motion, type MotionProps } from 'motion/react';
import { useLearningMode } from './LearningModeProvider';

/**
 * Animation that obeys the learner's motion preference.
 *
 * Every Track 0 animation goes through here rather than importing `motion`
 * directly, so "reduce motion" cannot be honoured in some components and
 * forgotten in others. When motion is reduced the element still renders and
 * still ends in its final state — it simply arrives there instantly, so a
 * child who needs calm does not lose the content along with the movement.
 *
 * The provider already treats the OS `prefers-reduced-motion` as a floor, so
 * checking one value here covers both the system setting and the in-app one.
 */
export function MotionSafe({
  children,
  className = '',
  ...props
}: MotionProps & { children?: React.ReactNode; className?: string }) {
  const { reducedMotion } = useLearningMode();

  if (reducedMotion) {
    // Land on the animated end state without playing the transition.
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} {...props}>
      {children}
    </motion.div>
  );
}
