/**
 * Map Atmosphere
 * "craft with clarity."
 *
 * Blueprint aesthetic with cyan-tinted fog and precision grid overlay.
 * Triangle wave sonar pings for spatial awareness.
 */

import type { Atmosphere } from './types'

export const mapAtmosphere: Atmosphere = {
  background: {
    // Cyan-tinted blueprint fog
    gradient:
      'radial-gradient(ellipse at 50% 50%, rgba(58, 169, 190, 0.08) 0%, #0F1113 60%, #0A0C0E 100%)',
    animated: false,
    grainOverlay: {
      src: '/assets/textures/grid-overlay.svg',
      opacity: 0.02,
      blendMode: 'screen',
    },
    vignette: {
      opacity: 0.18,
    },
  },

  depth: {
    shadows: {
      panel: '0 2px 8px rgba(0, 0, 0, 0.4)',
      hover: '0 4px 16px rgba(58, 169, 190, 0.2)',
    },
    glows: {
      accent: '0 0 24px rgba(58, 169, 190, 0.2)',
      edge: '0 0 12px rgba(58, 169, 190, 0.1)',
    },
    parallax: {
      scale: 1.003,
      translate: 3,
    },
  },

  motionSignature: 'snappy',

  soundscape: {
    ambientKey: 'map', // Sonar-like ambient
    uiClickKey: 'triangle-ping-880', // Triangle wave
    hoverKey: 'triangle-ping-660',
  },

  typographyTweak: {
    family: 'mono',
    weight: 500,
    tracking: 0.015,
  },

  microcopyTone: 'strategic',
}
