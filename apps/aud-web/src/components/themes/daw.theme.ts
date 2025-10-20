/**
 * DAW Workstation Theme Configuration
 *
 * Personality: Experimental Creator
 * Aesthetic: Tempo-synced precision, rhythmic pulses at 120 BPM
 * Typography: Lowercase, technical, systematic
 */

import type { ThemeConfig } from './types'

export const dawTheme: ThemeConfig = {
  id: 'daw',
  name: 'daw workstation',
  description: 'experimental creator — tempo-synced precision, rhythmic pulses',

  colors: {
    bg: '#0f0f0f',
    bgSecondary: '#1a1a1a',
    border: '#ff6b35',
    accent: '#ff6b35',
    text: '#e0e0e0',
    textSecondary: '#8a8a8a',
    success: '#4ecdc4',
    error: '#ff006e',
    warning: '#ffbe0b',
    info: '#8338ec',
  },

  motion: {
    duration: {
      fast: 125, // 16th note at 120 BPM (500ms / 4)
      medium: 250, // 8th note at 120 BPM (500ms / 2)
      slow: 500, // Quarter note at 120 BPM
    },
    easing: 'steps(4, jump-end)', // Rhythmic stepping
    reducedMotionScale: 1.0,
  },

  typography: {
    fontFamily: '"JetBrains Mono", "Roboto Mono", monospace',
    fontFamilyMono: '"JetBrains Mono", "Roboto Mono", monospace',
    letterSpacing: '0.4px',
    textTransform: 'lowercase',
  },

  effects: {
    blur: '4px',
    opacity: {
      dim: 0.35,
      overlay: 0.96,
      disabled: 0.3,
    },
    overlay: `
      repeating-linear-gradient(
        90deg,
        rgba(255,107,53,0.02) 0px,
        rgba(255,107,53,0.02) 2px,
        transparent 2px,
        transparent 8px
      )
    `,
  },

  sounds: {
    start: 'daw-start',
    complete: 'daw-complete',
    error: 'daw-error',
    click: 'daw-click',
    focus: 'daw-focus',
  },

  layout: {
    borderStyle: 'solid',
    borderRadius: '4px',
    shadow: '0 0 8px rgba(255,107,53,0.3), 0 4px 16px rgba(0,0,0,0.5)',
    depth: 1,
    glow: true,
    padding: '16px',
  },

  narrative: {
    tagline: 'sync. sequence. create.',
    personality: 'experimental creator — tempo-driven precision',
  },

  ambient: {
    gridMotion: 'pulse',
    gridSpeed: 0.5, // 120 BPM = 0.5s per beat
    hoverScale: 1.01,
    hapticsEnabled: true,
  },
}
