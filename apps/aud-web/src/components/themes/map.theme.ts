/**
 * Map Theme Configuration
 *
 * Posture: The Strategist
 * Use Case: Plotting a quarter, coordinating drops, seeing the whole
 * Primary Layout: Canvas (spatial planning with nodes and dependencies)
 * Core Value: Systems thinking at a glance
 */

import type { ThemeConfig } from './types'

export const mapTheme: ThemeConfig = {
  id: 'map',
  name: 'Map',
  description: 'the strategist — spatial planning, dependencies, campaign arcs',

  colors: {
    bg: '#1c1c1e',
    bgSecondary: '#2c2c2e',
    border: '#007aff',
    accent: '#007aff',
    text: '#f5f5f7',
    textSecondary: '#a1a1a6',
    success: '#30d158',
    error: '#ff453a',
    warning: '#ff9f0a',
    info: '#64d2ff',
  },

  motion: {
    duration: {
      fast: 120,
      medium: 240,
      slow: 400,
    },
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)', // Confident ease
    reducedMotionScale: 1.03,
  },

  typography: {
    fontFamily: '"Inter", "-apple-system", "SF Pro Display", sans-serif',
    fontFamilyMono: '"JetBrains Mono", "SF Mono", monospace',
    letterSpacing: '0.2px',
    textTransform: 'lowercase',
  },

  effects: {
    blur: '24px',
    opacity: {
      dim: 0.6,
      overlay: 0.88,
      disabled: 0.45,
    },
    overlay: `
      radial-gradient(circle at 30% 20%, rgba(0,122,255,0.08) 0%, transparent 50%)
    `,
  },

  sounds: {
    start: 'map-start',
    complete: 'map-complete',
    error: 'map-error',
    click: 'map-click',
    focus: 'map-focus',
  },

  layout: {
    borderStyle: 'solid',
    borderRadius: '16px',
    shadow: '0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,122,255,0.15)',
    depth: 4,
    glow: true,
    padding: '24px',
  },

  narrative: {
    tagline: 'craft with clarity.',
    personality: 'strategist — systems thinker, precise and spatial',
  },

  ambient: {
    gridMotion: 'drift',
    gridSpeed: 12,
    hoverScale: 1.03,
    hapticsEnabled: true,
  },

  workflow: {
    posture: 'map',
    primaryLayout: 'canvas',
    coreActions: ['add phase', 'attach target set', 'start automation', 'watch path heatmap'],
    inputModel: 'drag-connect',
    feedbackStyle: 'edge-heat',
  },

  microcopy: {
    tagline: 'when you think in systems.',
    emptyState: 'Connect two phases to see flow.',
    primaryCTA: 'Add Phase',
    onboardingHint: 'We'll stay out of your way.',
  },
}
