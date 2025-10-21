import type { Transition, Variants } from 'framer-motion';

/**
 * Reusable Framer Motion transition presets for onboarding sequence.
 * UK English naming, lowercase, minimal and precise.
 */

// Easing curves
export const easings = {
  smooth: [0.16, 1, 0.3, 1], // Smooth ease-out
  bounce: [0.68, -0.55, 0.265, 1.55], // Spring bounce
  sharp: [0.4, 0, 0.2, 1], // Material Design standard
  linear: [0, 0, 1, 1], // No easing
};

// Duration presets (in seconds)
export const durations = {
  instant: 0.15,
  fast: 0.3,
  normal: 0.5,
  slow: 0.8,
  verySlow: 1.2,
};

// Fade transitions
export const fade: Transition = {
  duration: durations.normal,
  ease: easings.smooth,
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeFast: Transition = {
  duration: durations.fast,
  ease: easings.smooth,
};

export const fadeSlow: Transition = {
  duration: durations.slow,
  ease: easings.smooth,
};

// Slide transitions
export const slideUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const slideDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

// Scale transitions
export const scale: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

export const scaleTransition: Transition = {
  duration: durations.normal,
  ease: easings.smooth,
};

// Operator terminal specific
export const terminalLine: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const terminalLineTransition: Transition = {
  duration: 0.3,
  ease: easings.sharp,
};

// OS Selection pulse
export const selectionPulse: Variants = {
  initial: { opacity: 0.5, scale: 1 },
  animate: {
    opacity: [0.5, 1, 0.5],
    scale: [1, 1.02, 1],
  },
  exit: { opacity: 0, scale: 0.95 },
};

export const pulseTransition: Transition = {
  duration: 1,
  ease: easings.linear,
  repeat: Infinity,
};

// Logo morph transition
export const logoMorph: Variants = {
  initial: { opacity: 0, scale: 0.8, rotate: -5 },
  animate: { opacity: 1, scale: 1, rotate: 0 },
  exit: { opacity: 0, scale: 1.1, rotate: 5 },
};

export const logoTransition: Transition = {
  duration: durations.verySlow,
  ease: easings.smooth,
};

// Waveform draw animation
export const waveformDraw: Transition = {
  pathLength: {
    duration: 1.5,
    ease: easings.smooth,
  },
  opacity: {
    duration: 0.3,
  },
};

// Page transitions
export const pageTransition: Transition = {
  duration: durations.slow,
  ease: easings.smooth,
};

export const pageVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// Stagger children animation
export const staggerChildren = (delayBetween = 0.1): Transition => ({
  staggerChildren: delayBetween,
  delayChildren: 0.2,
});

// Spring presets
export const springConfig = {
  gentle: {
    type: 'spring' as const,
    stiffness: 100,
    damping: 15,
  },
  snappy: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 25,
  },
  bouncy: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 10,
  },
};

// Reduced motion variants (accessibility)
export const respectReducedMotion = (variants: Variants): Variants => {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }
  return variants;
};
