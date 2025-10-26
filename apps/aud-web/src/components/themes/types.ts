/**
 * Theme System Types
 *
 * Theme System Anti-Gimmick Refactor - Posture-Based Workflows
 * Each theme represents a distinct way of working, not just visual styling
 */

export type OSTheme = 'operator' | 'guide' | 'map' | 'timeline' | 'tape'
export type ThemePosture = OSTheme // Alias for clarity in workflow contexts

export interface ThemeColors {
  bg: string
  bgSecondary: string
  border: string
  accent: string
  text: string
  textSecondary: string
  success: string
  error: string
  warning: string
  info: string
}

export interface ThemeMotion {
  duration: {
    fast: number
    medium: number
    slow: number
  }
  easing: string
  reducedMotionScale: number
}

export interface ThemeTypography {
  fontFamily: string
  fontFamilyMono: string
  letterSpacing: string
  textTransform: 'none' | 'lowercase' | 'uppercase'
}

export interface ThemeEffects {
  blur: string
  opacity: {
    dim: number
    overlay: number
    disabled: number
  }
  overlay?: string // CSS for overlay effects (scanlines, grain, etc)
}

export interface ThemeSounds {
  start: string // sound ID for agent start
  complete: string // sound ID for agent complete
  error: string // sound ID for agent error
  click: string // sound ID for UI click
  focus: string // sound ID for focus mode enter
}

export interface ThemeLayout {
  borderStyle: 'solid' | 'dashed' | 'dotted' | 'none'
  borderRadius: string
  shadow: string
  depth: number // z-index layering intensity
  glow: boolean
  padding: string
}

export interface ThemeNarrative {
  tagline: string // short theme-specific tagline
  personality: string // creative mindset descriptor
}

export interface ThemeAmbient {
  gridMotion: 'none' | 'drift' | 'pulse' | 'jitter'
  gridSpeed: number // duration in seconds
  hoverScale: number // scale multiplier on hover
  hapticsEnabled: boolean
}

export interface ThemeWorkflow {
  posture: ThemePosture
  primaryLayout: 'split-cli' | 'wizard' | 'canvas' | 'tracks' | 'journal'
  coreActions: string[]  // Top-level actions available
  inputModel: 'command-bar' | 'form-wizard' | 'drag-connect' | 'clip-drag' | 'natural-lang'
  feedbackStyle: 'inline-ticks' | 'next-step-chip' | 'edge-heat' | 'playhead-sweep' | 'parse-propose'
}

export interface ThemeMicrocopy {
  tagline: string        // "when you need speed."
  emptyState: string     // "Nothing here yet. Add one thing that matters."
  primaryCTA: string     // Theme-specific action label
  onboardingHint: string // One-liner for first-time users
}

export interface ThemeConfig {
  id: OSTheme
  name: string
  description: string
  colors: ThemeColors
  motion: ThemeMotion
  typography: ThemeTypography
  effects: ThemeEffects
  sounds: ThemeSounds
  layout: ThemeLayout
  narrative: ThemeNarrative
  ambient: ThemeAmbient
  workflow: ThemeWorkflow
  microcopy: ThemeMicrocopy
}

export interface ThemeContextValue {
  currentTheme: OSTheme
  themeConfig: ThemeConfig
  setTheme: (theme: OSTheme, playTransitionSound?: boolean) => void
  isLoading: boolean
  adaptiveContext?: any
  activityMonitor?: any
  getAdaptiveAdjustments?: () => any
  getTone?: (messageType: string) => string
  playSound?: (soundType: string) => void
  getMotionProfile?: () => any
}
