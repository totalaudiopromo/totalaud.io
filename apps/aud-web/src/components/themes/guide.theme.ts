/**
 * Guide Theme Configuration
 *
 * Posture: The Pathfinder
 * Use Case: Starting a release, hand-holding a teammate, onboarding
 * Primary Layout: Wizard (single track with 4 steps, progress top, context right)
 * Core Value: Momentum without thinking
 */

import type { ThemeConfig } from './types'

export const guideTheme: ThemeConfig = {
  id: 'guide',
  name: 'Guide',
  description: 'the pathfinder — step-by-step flows, guardrails, undo comfort',

  colors: {
    bg: '#0055cc',
    bgSecondary: '#3399ff',
    border: '#ffa500',
    accent: '#00cc00',
    text: '#ffffff',
    textSecondary: '#e0e0e0',
    success: '#00cc00',
    error: '#ff3333',
    warning: '#ffcc00',
    info: '#66ccff',
  },

  motion: {
    duration: {
      fast: 120,
      medium: 240,
      slow: 400,
    },
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Reassuring spring bounce
    reducedMotionScale: 1.05,
  },

  typography: {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    fontFamilyMono: '"JetBrains Mono", "Courier New", monospace',
    letterSpacing: '0.3px',
    textTransform: 'lowercase',
  },

  effects: {
    blur: '8px',
    opacity: {
      dim: 0.5,
      overlay: 0.92,
      disabled: 0.4,
    },
    overlay: `
      linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)
    `,
  },

  sounds: {
    start: 'guide-start',
    complete: 'guide-complete',
    error: 'guide-error',
    click: 'guide-click',
    focus: 'guide-focus',
  },

  layout: {
    borderStyle: 'solid',
    borderRadius: '12px',
    shadow: '0 2px 12px rgba(0,85,204,0.4), 0 8px 24px rgba(0,85,204,0.2)',
    depth: 3,
    glow: true,
    padding: '18px',
  },

  narrative: {
    tagline: 'click. bounce. smile.',
    personality: 'pathfinder — warm and reassuring',
  },

  ambient: {
    gridMotion: 'pulse',
    gridSpeed: 8,
    hoverScale: 1.05,
    hapticsEnabled: true,
  },

  workflow: {
    posture: 'guide',
    primaryLayout: 'wizard',
    coreActions: ['define release', 'find targets', 'generate pitch', 'send + schedule'],
    inputModel: 'form-wizard',
    feedbackStyle: 'next-step-chip',
  },

  microcopy: {
    tagline: 'when you want a path.',
    emptyState: 'Nothing here yet. Start a release.',
    primaryCTA: 'Next Step',
    onboardingHint: 'You can always undo.',
  },
}
