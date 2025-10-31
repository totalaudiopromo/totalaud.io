/**
 * Tape Atmosphere
 * "touch the signal."
 *
 * Dusted beige/copper warmth with film grain and light leaks.
 * Slow spring motion with warm sine waves. Serif typography for headings.
 */

import type { Atmosphere } from './types'

export const tapeAtmosphere: Atmosphere = {
  background: {
    // Dusted beige/copper gradient with warmth
    gradient:
      'radial-gradient(ellipse at 30% 40%, rgba(60, 45, 35, 0.15) 0%, #0F1113 50%, rgba(40, 30, 25, 0.1) 100%)',
    animated: true, // Gentle breathing
    grainOverlay: {
      src: '/assets/textures/film-grain.svg',
      opacity: 0.05,
      blendMode: 'soft-light',
    },
    vignette: {
      opacity: 0.2,
    },
  },

  depth: {
    shadows: {
      panel: '0 5px 24px rgba(40, 30, 25, 0.4)',
      hover: '0 8px 32px rgba(40, 30, 25, 0.6)',
    },
    glows: {
      accent: '0 0 28px rgba(58, 169, 190, 0.1)',
      edge: '0 0 14px rgba(180, 140, 100, 0.08)',
    },
    parallax: {
      scale: 1.008,
      translate: 6,
    },
  },

  motionSignature: 'slow-spring',

  soundscape: {
    ambientKey: 'tape', // Warm lo-fi crackle
    uiClickKey: 'sine-warm-440', // 440Hz warm sine
    hoverKey: 'sine-warm-280', // Lower warmth
  },

  typographyTweak: {
    family: 'serif',
    weight: 400,
    tracking: 0.005,
  },

  microcopyTone: 'reflective',
}
