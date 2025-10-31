/**
 * Operator Atmosphere
 * "type. test. repeat."
 *
 * ASCII terminal precision with deep matte blacks, scanline overlays,
 * and fast-linear motion. Square wave UI sounds for instant feedback.
 */

import type { Atmosphere } from './types'

export const operatorAtmosphere: Atmosphere = {
  background: {
    // Deep matte black gradient
    gradient: 'radial-gradient(ellipse at 50% 0%, #1A1C1F 0%, #0F1113 100%)',
    animated: false, // Static, no pulse
    grainOverlay: {
      src: '/assets/textures/scanline-grain.svg',
      opacity: 0.02,
      blendMode: 'overlay',
    },
    vignette: {
      opacity: 0.15,
    },
  },

  depth: {
    shadows: {
      panel: '0 4px 16px rgba(0, 0, 0, 0.5)',
      hover: '0 6px 24px rgba(0, 0, 0, 0.7)',
    },
    glows: {
      accent: '0 0 16px rgba(58, 169, 190, 0.15)',
      edge: '0 0 8px rgba(58, 169, 190, 0.08)',
    },
    parallax: {
      scale: 1.002, // Minimal
      translate: 2,
    },
  },

  motionSignature: 'fast-linear',

  soundscape: {
    ambientKey: 'operator', // Square wave ambient
    uiClickKey: 'square-blip-880', // 880Hz square
    hoverKey: 'square-blip-1760', // Higher octave
  },

  typographyTweak: {
    family: 'mono',
    weight: 400,
    tracking: 0.02,
  },

  microcopyTone: 'terse',
}
