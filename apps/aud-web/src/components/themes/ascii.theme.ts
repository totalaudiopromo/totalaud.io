/**
 * ASCII Theme Configuration
 *
 * Personality: Minimalist Producer
 * Aesthetic: Black-and-white terminal, scan-line overlay, no easing
 * Typography: Monospace only, uppercase commands
 */

import type { ThemeConfig } from './types'

export const asciiTheme: ThemeConfig = {
  id: 'ascii',
  name: 'ASCII Terminal',
  description: 'minimalist producer — black and white terminal aesthetic',

  colors: {
    bg: '#000000',
    bgSecondary: '#0a0a0a',
    border: '#00ff00',
    accent: '#00ff00',
    text: '#00ff00',
    textSecondary: '#008800',
    success: '#00ff00',
    error: '#ff0000',
    warning: '#ffff00',
    info: '#00ffff',
  },

  motion: {
    duration: {
      fast: 0, // No animation for ASCII
      medium: 0,
      slow: 0,
    },
    easing: 'linear', // No easing curves
    reducedMotionScale: 0, // Always instant
  },

  typography: {
    fontFamily: '"JetBrains Mono", "Courier New", monospace',
    fontFamilyMono: '"JetBrains Mono", "Courier New", monospace',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },

  effects: {
    blur: 'none',
    opacity: {
      dim: 0.3,
      overlay: 0.95,
      disabled: 0.5,
    },
    overlay: `
      repeating-linear-gradient(
        0deg,
        rgba(0, 255, 0, 0.03) 0px,
        rgba(0, 255, 0, 0.03) 1px,
        transparent 1px,
        transparent 3px
      )
    `,
  },

  sounds: {
    start: 'ascii-beep',
    complete: 'ascii-done',
    error: 'ascii-error',
    click: 'ascii-click',
    focus: 'ascii-focus',
  },

  layout: {
    borderStyle: 'solid',
    borderRadius: '0px',
    shadow: 'none',
    depth: 0,
    glow: false,
    padding: '16px',
  },

  narrative: {
    tagline: 'type. test. repeat.',
    personality: 'minimalist producer — systematic execution',
  },

  ambient: {
    gridMotion: 'none',
    gridSpeed: 0,
    hoverScale: 1.0,
    hapticsEnabled: true,
  },
}
