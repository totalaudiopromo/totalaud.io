/**
 * Theme System Types
 *
 * Multi-OS Flow Dashboard System - Phase 2
 * Base type definitions for theme variants and abstractions
 */

export type OSTheme = 'ascii' | 'xp' | 'aqua' | 'ableton' | 'punk'

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

export interface ThemeConfig {
  id: OSTheme
  name: string
  description: string
  colors: ThemeColors
  motion: ThemeMotion
  typography: ThemeTypography
  effects: ThemeEffects
  sounds: ThemeSounds
}

export interface ThemeContextValue {
  currentTheme: OSTheme
  themeConfig: ThemeConfig
  setTheme: (theme: OSTheme) => void
  isLoading: boolean
}
