/**
 * Timeline Atmosphere
 * "sync. sequence. create."
 *
 * Filmic navy/purple gradient with horizontal ruler marks.
 * Elastic motion with saw wave temporal pulses.
 */

import type { Atmosphere } from './types'

export const timelineAtmosphere: Atmosphere = {
  background: {
    // Filmic navy to deep purple gradient
    gradient:
      'linear-gradient(180deg, rgba(25, 20, 35, 0.4) 0%, #0F1113 50%, rgba(15, 10, 20, 0.6) 100%)',
    animated: true, // Temporal pulse
    grainOverlay: {
      src: '/assets/textures/ruler-marks.svg',
      opacity: 0.03,
      blendMode: 'overlay',
    },
    vignette: {
      opacity: 0.14,
    },
  },

  depth: {
    shadows: {
      panel: '0 4px 20px rgba(15, 10, 30, 0.5)',
      hover: '0 6px 28px rgba(15, 10, 30, 0.7)',
    },
    glows: {
      accent: '0 0 18px rgba(58, 169, 190, 0.18)',
      edge: '0 0 10px rgba(120, 80, 190, 0.1)',
    },
    parallax: {
      scale: 1.006,
      translate: 5,
    },
  },

  motionSignature: 'elastic',

  soundscape: {
    ambientKey: 'timeline', // Rhythmic pulse
    uiClickKey: 'saw-pulse-880', // 880Hz sawtooth
    hoverKey: 'saw-pulse-660',
  },

  typographyTweak: {
    family: 'mono',
    weight: 500,
    tracking: 0.02,
  },

  microcopyTone: 'rhythmic',
}
