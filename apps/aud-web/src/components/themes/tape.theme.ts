/**
 * Tape Theme Configuration
 *
 * Posture: The Receipt
 * Use Case: Capturing ideas, writing drafts, turning thoughts into runs
 * Primary Layout: Journal (notes left, conversion panel right)
 * Core Value: Thoughts that become runs
 */

import type { ThemeConfig } from './types'

export const tapeTheme: ThemeConfig = {
  id: 'tape',
  name: 'Tape',
  description: 'the receipt — grounded notes turn into actions, living log with intent',

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
      medium: 240,
      slow: 400,
    },
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)', // Soft ease
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
    start: 'tape-start',
    complete: 'tape-complete',
    error: 'tape-error',
    click: 'tape-click',
    focus: 'tape-focus',
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
    personality: 'archivist — notes with intent, grounded and present',
  },

  ambient: {
    gridMotion: 'drift',
    gridSpeed: 10,
    hoverScale: 1.02,
    hapticsEnabled: true,
  },

  workflow: {
    posture: 'tape',
    primaryLayout: 'journal',
    coreActions: ['capture note', 'detect intent', 'propose actions', 'one-click commit'],
    inputModel: 'natural-lang',
    feedbackStyle: 'parse-propose',
  },

  microcopy: {
    tagline: 'when notes become runs.',
    emptyState: "Write a note. We'll turn it into work.",
    primaryCTA: 'Make it a Run',
    onboardingHint: 'Write it. Run it.',
  },
}
