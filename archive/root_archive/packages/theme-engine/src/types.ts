/**
 * Theme Engine Types
 * Defines the structure for TotalAud.io's visual and sonic identity system
 */

export type ThemeId = 'ascii' | 'xp' | 'aqua' | 'ableton' | 'punk'

export interface ThemePalette {
  background: string
  foreground: string
  accent: string
  secondary: string
  border: string
  success: string
  warning: string
  error: string
}

export interface ThemeTypography {
  fontFamily: string
  monoFamily: string
  headingWeight: number
  bodyWeight: number
  lineHeight: number
}

export interface ThemeTexture {
  overlay?: string // Path to overlay texture PNG
  pattern?: string // Path to repeating pattern
  opacity: number // 0-1 opacity for textures
}

export interface ThemeMotion {
  intro: 'fade' | 'glitch' | 'bounce' | 'pulse' | 'jitter'
  transition: 'smooth' | 'snap' | 'elastic'
  duration: number // Default animation duration in ms
  easing: string // CSS easing function
}

export interface ThemeSounds {
  boot: SoundConfig
  click: SoundConfig
  agentSpeak: SoundConfig
  success: SoundConfig
  error: SoundConfig
  ambient?: SoundConfig
}

export interface SoundConfig {
  type: 'synth' | 'noise' | 'sample'
  // For synth
  waveform?: OscillatorType
  frequency?: number
  duration?: number
  envelope?: {
    attack: number
    decay: number
    sustain: number
    release: number
  }
  // For noise
  noiseType?: 'white' | 'pink' | 'brown'
  // For sample (user-provided only)
  samplePath?: string
}

export interface ThemeEffects {
  scanlines?: boolean
  noise?: boolean
  glow?: boolean
  vignette?: boolean
  grain?: boolean
}

export interface ThemeManifest {
  id: ThemeId
  name: string
  description: string
  mood: string
  palette: ThemePalette
  typography: ThemeTypography
  textures: ThemeTexture
  motion: ThemeMotion
  sounds: ThemeSounds
  effects: ThemeEffects
}

export interface ThemeContextValue {
  currentTheme: ThemeId
  theme: ThemeManifest
  setTheme: (id: ThemeId) => void
  cycleTheme: () => void
  isLoaded: boolean
}
