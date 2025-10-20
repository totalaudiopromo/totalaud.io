/**
 * macOS Aqua Theme Configuration
 *
 * Personality: Thoughtful Designer
 * Aesthetic: Translucent layers, smooth parallax, glassy blur
 * Typography: Lowercase, refined, precise
 */

import type { ThemeConfig } from './types'

export const aquaTheme: ThemeConfig = {
  id: 'aqua',
  name: 'macos aqua',
  description: 'thoughtful designer — translucent layers, glassy precision',

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
      fast: 200,
      medium: 300,
      slow: 400,
    },
    easing: 'cubic-bezier(0.32, 0.72, 0, 1)', // Smooth parallax
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
    start: 'aqua-start',
    complete: 'aqua-complete',
    error: 'aqua-error',
    click: 'aqua-click',
    focus: 'aqua-focus',
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
    personality: 'thoughtful designer — precise and refined',
  },

  ambient: {
    gridMotion: 'drift',
    gridSpeed: 12,
    hoverScale: 1.03,
    hapticsEnabled: true,
  },
}
