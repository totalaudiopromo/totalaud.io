/**
 * Timeline Theme Configuration
 *
 * Posture: The Sequencer
 * Use Case: Release week, day-by-day outreach, time-boxed pushes
 * Primary Layout: Tracks (time ruler with lanes: Research, Outreach, Follow-ups, Content)
 * Core Value: Execution you can feel
 */

import type { ThemeConfig } from './types'

export const timelineTheme: ThemeConfig = {
  id: 'timeline',
  name: 'Timeline',
  description: 'the sequencer — time-based execution, clips, automation lanes',

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
      fast: 120, // Micro-interactions
      medium: 240, // Lane open/close
      slow: 400, // Playhead sweep
    },
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)', // Steady glide
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
    start: 'timeline-start',
    complete: 'timeline-complete',
    error: 'timeline-error',
    click: 'timeline-click',
    focus: 'timeline-focus',
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
    personality: 'sequencer — time-based precision, execution-focused',
  },

  ambient: {
    gridMotion: 'pulse',
    gridSpeed: 0.5, // 120 BPM = 0.5s per beat
    hoverScale: 1.01,
    hapticsEnabled: true,
  },

  workflow: {
    posture: 'timeline',
    primaryLayout: 'tracks',
    coreActions: ['add clip', 'set duration', 'assign agent', 'arm automation'],
    inputModel: 'clip-drag',
    feedbackStyle: 'playhead-sweep',
  },

  microcopy: {
    tagline: 'when time is the instrument.',
    emptyState: 'No lanes armed. Drop in your week.',
    primaryCTA: 'Add Clip',
    onboardingHint: 'Calm Mode is ready when you are.',
  },
}
