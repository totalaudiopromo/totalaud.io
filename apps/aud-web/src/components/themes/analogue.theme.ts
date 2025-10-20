/**
 * Analogue Studio Theme Configuration
 *
 * Personality: Hands-on, Textured, Quietly Confident
 * Aesthetic: Warm lo-fi studio, tape grain, gentle sine waves
 * Typography: Lowercase, monospace, warm beige tones
 */

import type { ThemeConfig } from './types'

export const analogueTheme: ThemeConfig = {
  id: 'analogue',
  name: 'analogue studio',
  description: 'hands-on, textured, quietly confident — human hands, warm signal',

  colors: {
    bg: '#1a1a18',
    bgSecondary: '#2b2b29',
    border: '#d3b98c',
    accent: '#d3b98c',
    text: '#f0eee9',
    textSecondary: '#a39e94',
    success: '#8fbc8f',
    error: '#cd8c95',
    warning: '#f4a460',
    info: '#87ceeb',
  },

  motion: {
    duration: {
      fast: 120,
      medium: 180,
      slow: 240,
    },
    easing: 'ease-in-out',
    reducedMotionScale: 1.02,
  },

  typography: {
    fontFamily: '"Inter", "JetBrains Mono", monospace',
    fontFamilyMono: '"JetBrains Mono", "Courier New", monospace',
    letterSpacing: '0.5px',
    textTransform: 'lowercase',
  },

  effects: {
    blur: '12px',
    opacity: {
      dim: 0.4,
      overlay: 0.94,
      disabled: 0.5,
    },
    overlay: `
      url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/></filter><rect width="300" height="300" filter="url(%23noise)" opacity="0.06"/></svg>')
    `,
  },

  sounds: {
    start: 'analogue-start',
    complete: 'analogue-complete',
    error: 'analogue-error',
    click: 'analogue-click',
    focus: 'analogue-focus',
  },

  layout: {
    borderStyle: 'solid',
    borderRadius: '8px',
    shadow: '0 4px 16px rgba(0,0,0,0.3)',
    depth: 2,
    glow: true,
    padding: '20px',
  },

  narrative: {
    tagline: 'touch the signal.',
    personality: 'hands-on tactile — warm and present',
  },

  ambient: {
    gridMotion: 'drift',
    gridSpeed: 10,
    hoverScale: 1.02,
    hapticsEnabled: true,
  },
}
