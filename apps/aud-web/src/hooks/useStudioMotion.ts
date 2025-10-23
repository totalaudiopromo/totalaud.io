/**
 * useStudioMotion Hook
 *
 * Provides motion signature configurations for each Studio.
 * Now uses centralized motion library (/lib/motion.ts) for consistency.
 *
 * Phase 6.5: Motion Choreographer - Named Curves & Unified System
 */

import { useMemo } from 'react';
import { studioMotion, getTransition, type Transition } from '@aud-web/lib/motion';

export type TransitionSpeed = 'instant' | 'fast' | 'medium' | 'slow' | 'drift';

export interface StudioMotion {
  /** Animation name */
  name: string;

  /** Animation duration in seconds (Framer Motion format) */
  duration: number;

  /** CSS easing function */
  easing: string;

  /** Framer Motion spring config (optional) */
  spring?: {
    type: 'spring';
    stiffness: number;
    damping: number;
    mass: number;
  };

  /** Human-readable description */
  description: string;

  /** Semantic speed label for backwards compatibility */
  transitionSpeed: TransitionSpeed;
}

// Map Studio motion configs to hook interface
const MOTION_CONFIGS: Record<string, StudioMotion> = {
  ascii: {
    ...studioMotion.ascii,
    transitionSpeed: 'instant',
  },
  xp: {
    ...studioMotion.xp,
    transitionSpeed: 'fast',
  },
  aqua: {
    ...studioMotion.aqua,
    transitionSpeed: 'slow',
  },
  daw: {
    ...studioMotion.daw,
    transitionSpeed: 'medium',
  },
  analogue: {
    ...studioMotion.analogue,
    transitionSpeed: 'drift',
  },
};

/**
 * Get the motion configuration for a specific Studio theme
 */
export function useStudioMotion(theme: string): StudioMotion {
  const motion = useMemo(() => {
    return MOTION_CONFIGS[theme] || MOTION_CONFIGS.ascii;
  }, [theme]);

  return motion;
}

/**
 * Get Framer Motion transition config for a theme
 * Uses named curves from motion library
 */
export function getFramerTransition(theme: string): Transition {
  const curves: Record<string, keyof typeof import('@aud-web/lib/motion').transitions> = {
    ascii: 'snap',
    xp: 'bounce',
    aqua: 'dissolve',
    daw: 'pulse',
    analogue: 'drift',
  };

  const curveName = curves[theme] || 'snap';
  return getTransition(curveName);
}

/**
 * Get CSS transition string for a theme
 */
export function getCSSTransition(theme: string, property = 'all'): string {
  const config = MOTION_CONFIGS[theme] || MOTION_CONFIGS.ascii;
  return `${property} ${config.duration}s ${config.easing}`;
}
