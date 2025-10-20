/**
 * Windows XP Theme Configuration
 *
 * Personality: Nostalgic Enthusiast
 * Aesthetic: Soft gradients, spring easing, round corners
 * Typography: Lowercase, approachable, friendly
 */

import type { ThemeConfig } from './types'

export const xpTheme: ThemeConfig = {
  id: 'xp',
  name: 'windows xp',
  description: 'nostalgic enthusiast — friendly gradients, spring bounce',

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
      fast: 150,
      medium: 250,
      slow: 350,
    },
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Spring bounce
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
    start: 'xp-start',
    complete: 'xp-complete',
    error: 'xp-error',
    click: 'xp-click',
    focus: 'xp-focus',
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
    personality: 'nostalgic enthusiast — warm and playful',
  },

  ambient: {
    gridMotion: 'pulse',
    gridSpeed: 8,
    hoverScale: 1.05,
    hapticsEnabled: true,
  },
}
