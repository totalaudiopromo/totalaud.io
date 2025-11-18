/**
 * Animation Utilities
 * Flow State compliant animation configurations
 */

import type { Variants } from 'framer-motion';

/**
 * Window open/close animation
 */
export const windowVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.24,
      ease: [0.4, 0, 0.2, 1], // ease-out
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
};

/**
 * Window minimise animation
 */
export const minimiseVariants: Variants = {
  normal: {
    scale: 1,
    opacity: 1,
  },
  minimised: {
    scale: 0.5,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

/**
 * Dock item hover animation
 */
export const dockItemVariants: Variants = {
  idle: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.1,
    y: -8,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
};

/**
 * Notification animation
 */
export const notificationVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 100,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.24,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    x: 100,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Command palette animation
 */
export const commandPaletteVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: -20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: -20,
    transition: {
      duration: 0.15,
    },
  },
};

/**
 * Theme transition animation
 */
export const themeTransitionDuration = 0.5;

/**
 * Standard easing functions (Flow State compliant)
 */
export const easing = {
  easeOut: [0.4, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  easeInOut: [0.4, 0, 0.2, 1],
};
