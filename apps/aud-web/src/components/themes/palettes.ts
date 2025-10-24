/**
 * Theme Palettes - Consolidated Color Systems
 *
 * Five studio personalities with data-driven color definitions.
 * Applied via data-theme attribute on <html> for instant switching.
 */

export interface ThemePalette {
  bg: string
  bgSecondary: string
  bgTertiary: string
  accent: string
  accentDim: string
  text: string
  textSecondary: string
  textTertiary: string
  border: string
  borderSubtle: string
  success: string
  error: string
  warning: string
  info: string
}

export const palettes: Record<string, ThemePalette> = {
  /**
   * ASCII - Minimalist Producer
   * "type. test. repeat."
   * Black terminal, green text, zero compromise
   */
  ascii: {
    bg: '#0C0C0C',
    bgSecondary: '#121212',
    bgTertiary: '#1A1A1A',
    accent: '#3AE1C2',
    accentDim: '#2BA893',
    text: '#E5E7EB',
    textSecondary: '#9CA3AF',
    textTertiary: '#6B7280',
    border: '#3AE1C2',
    borderSubtle: '#2BA893',
    success: '#3AE1C2',
    error: '#FF5555',
    warning: '#FFB86C',
    info: '#8BE9FD',
  },

  /**
   * XP - Nostalgic Optimist
   * "click. bounce. smile."
   * Bright, friendly, playful spring
   */
  xp: {
    bg: '#F2F6FF',
    bgSecondary: '#E8EFFF',
    bgTertiary: '#D9E4FF',
    accent: '#3870FF',
    accentDim: '#2A5BE0',
    text: '#1B1E24',
    textSecondary: '#4B5563',
    textTertiary: '#9CA3AF',
    border: '#3870FF',
    borderSubtle: '#A8C5FF',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3870FF',
  },

  /**
   * Aqua - Perfectionist Designer
   * "craft with clarity."
   * Translucent glass, deep blue, blurred edges
   */
  aqua: {
    bg: '#0E151B',
    bgSecondary: '#1A2530',
    bgTertiary: '#243545',
    accent: '#00B3FF',
    accentDim: '#008FCC',
    text: '#E2F2FF',
    textSecondary: '#9DB8CE',
    textTertiary: '#6B8599',
    border: '#00B3FF',
    borderSubtle: '#1A4F6B',
    success: '#00D9A0',
    error: '#FF4D6D',
    warning: '#FFB020',
    info: '#00B3FF',
  },

  /**
   * DAW - Experimental Creator
   * "sync. sequence. create."
   * Dark studio, purple accent, 120 BPM tempo-synced
   */
  daw: {
    bg: '#121212',
    bgSecondary: '#1C1C1C',
    bgTertiary: '#272727',
    accent: '#A076F9',
    accentDim: '#7F5EC9',
    text: '#F3F3F3',
    textSecondary: '#B3B3B3',
    textTertiary: '#808080',
    border: '#A076F9',
    borderSubtle: '#4A4464',
    success: '#6BCF7F',
    error: '#FF6B6B',
    warning: '#FFD93D',
    info: '#6C9CFF',
  },

  /**
   * Analogue - Human Hands
   * "touch the signal."
   * Warm paper, sepia tones, soft lo-fi textures
   */
  analogue: {
    bg: '#F6F1E8',
    bgSecondary: '#EDE6D8',
    bgTertiary: '#E3D9C8',
    accent: '#C47E34',
    accentDim: '#A36829',
    text: '#1E1C19',
    textSecondary: '#5C5854',
    textTertiary: '#8E8A85',
    border: '#C47E34',
    borderSubtle: '#D9B990',
    success: '#7A9C59',
    error: '#C74E3C',
    warning: '#D98B3C',
    info: '#5B8BA8',
  },
}

/**
 * CSS Variable Names
 * Applied to :root[data-theme="..."]
 */
export const cssVariableMap = {
  '--theme-bg': 'bg',
  '--theme-bg-secondary': 'bgSecondary',
  '--theme-bg-tertiary': 'bgTertiary',
  '--theme-accent': 'accent',
  '--theme-accent-dim': 'accentDim',
  '--theme-text': 'text',
  '--theme-text-secondary': 'textSecondary',
  '--theme-text-tertiary': 'textTertiary',
  '--theme-border': 'border',
  '--theme-border-subtle': 'borderSubtle',
  '--theme-success': 'success',
  '--theme-error': 'error',
  '--theme-warning': 'warning',
  '--theme-info': 'info',
} as const

/**
 * Apply theme palette to document root
 */
export function applyPalette(themeName: string): void {
  const palette = palettes[themeName]
  if (!palette) {
    console.warn(`[Palettes] Theme "${themeName}" not found, falling back to ascii`)
    return applyPalette('ascii')
  }

  const root = document.documentElement
  root.setAttribute('data-theme', themeName)

  // Apply CSS variables
  Object.entries(cssVariableMap).forEach(([cssVar, paletteKey]) => {
    const value = palette[paletteKey as keyof ThemePalette]
    root.style.setProperty(cssVar, value)
  })

  console.log(`[Palettes] Applied "${themeName}" palette`)
}

/**
 * Get current palette from data-theme attribute
 */
export function getCurrentPalette(): ThemePalette {
  const themeName = document.documentElement.getAttribute('data-theme') || 'ascii'
  return palettes[themeName] || palettes.ascii
}

/**
 * Color utility: Adjust brightness for adaptive logic
 */
export function adjustBrightness(color: string, factor: number): string {
  // Parse hex color
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // Adjust brightness
  const adjust = (value: number) => {
    const adjusted = Math.round(value * factor)
    return Math.max(0, Math.min(255, adjusted))
  }

  const newR = adjust(r).toString(16).padStart(2, '0')
  const newG = adjust(g).toString(16).padStart(2, '0')
  const newB = adjust(b).toString(16).padStart(2, '0')

  return `#${newR}${newG}${newB}`
}
