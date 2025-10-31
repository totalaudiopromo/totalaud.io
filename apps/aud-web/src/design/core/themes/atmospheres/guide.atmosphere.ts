/**
 * Guide Atmosphere
 * "click. bounce. smile."
 *
 * Warm paper gradient with soft shadows and friendly motion.
 * Soft sine waves for approachable UI feedback.
 */

import type { Atmosphere } from './types'

export const guideAtmosphere: Atmosphere = {
  background: {
    // Warm coal to charcoal with subtle warmth
    gradient: 'radial-gradient(ellipse at 50% 30%, #2A2622 0%, #1A1815 50%, #0F1113 100%)',
    animated: true, // Gentle 12s pulse
    grainOverlay: {
      src: '/assets/textures/paper-grain.svg',
      opacity: 0.04,
      blendMode: 'multiply',
    },
    vignette: {
      opacity: 0.12,
    },
  },

  depth: {
    shadows: {
      panel: '0 3px 12px rgba(0, 0, 0, 0.3)',
      hover: '0 5px 20px rgba(0, 0, 0, 0.4)',
    },
    glows: {
      accent: '0 0 20px rgba(58, 169, 190, 0.12)',
      edge: '0 0 10px rgba(58, 169, 190, 0.06)',
    },
    parallax: {
      scale: 1.005,
      translate: 4,
    },
  },

  motionSignature: 'smooth',

  soundscape: {
    ambientKey: 'guide', // Soft ambient pad
    uiClickKey: 'sine-click-660', // 660Hz sine
    hoverKey: 'sine-hover-440', // Lower, gentle
  },

  typographyTweak: {
    family: 'sans',
    weight: 400,
    tracking: 0.01,
  },

  microcopyTone: 'friendly',
}
