/**
 * Colour Tokens - Centralised Brand Palette
 *
 * Theme System Anti-Gimmick Refactor
 * All UI colours use these standardised definitions.
 * British English spelling throughout.
 */

/**
 * Brand colours - Totalaud.io visual identity
 */
export const brandColours = {
  // Primary brand colour
  slateCyan: '#3AA9BE', // Professional, calm, creative-tech
  slateCyanHover: '#6FC8B5', // Gentle depth for hover/focus states

  // Background system
  matteBlack: '#0F1113', // Landing page, deep charcoal
  surface: '#1A1C1F', // Elevated surfaces
  surfaceSubtle: '#0a0d10', // Deep navy (legacy)

  // Text hierarchy
  textPrimary: '#EAECEE', // Main copy
  textSecondary: '#A0A4A8', // Secondary/muted copy
  textTertiary: 'rgba(255, 255, 255, 0.5)', // Hints/placeholders

  // Borders
  border: '#2C2F33',
  borderSubtle: 'rgba(255, 255, 255, 0.1)',
  borderFocus: 'rgba(58, 169, 190, 0.4)', // Slate Cyan with transparency

  // Feedback states
  success: '#89DFF3', // Ice Cyan (harmonises with Slate Cyan brand)
  successCyan: '#89DFF3', // Alias for clarity
  error: '#FF6B6B',
  warning: '#FFC857',

  // Accent warm (for variety)
  accentWarm: '#D4A574',
} as const

/**
 * Semantic colour mappings
 * Use these instead of direct colour values
 */
export const semanticColours = {
  // Backgrounds
  background: brandColours.matteBlack,
  backgroundElevated: brandColours.surface,
  backgroundSubtle: brandColours.surfaceSubtle,

  // Text
  text: brandColours.textPrimary,
  textMuted: brandColours.textSecondary,
  textHint: brandColours.textTertiary,

  // Interactive
  accent: brandColours.slateCyan,
  accentHover: brandColours.slateCyanHover,
  accentSubtle: 'rgba(58, 169, 190, 0.04)', // For backgrounds

  // Borders
  border: brandColours.border,
  borderSubtle: brandColours.borderSubtle,
  borderActive: brandColours.slateCyan,
  borderFocus: brandColours.borderFocus,

  // States
  success: brandColours.success,
  error: brandColours.error,
  warning: brandColours.warning,
} as const

/**
 * Glow effects using brand colours
 */
export const glowEffects = {
  slateCyanSubtle: 'rgba(58, 169, 190, 0.15)',
  slateCyanMedium: 'rgba(58, 169, 190, 0.3)',
  slateCyanStrong: 'rgba(58, 169, 190, 0.6)',

  // For ambient backgrounds
  ambientGradient:
    'radial-gradient(circle at 50% 50%, rgba(58, 169, 190, 0.08) 0%, transparent 60%)',
} as const

/**
 * Helper: Get colour with opacity
 */
export function withOpacity(colour: string, opacity: number): string {
  // If already rgba, return as-is
  if (colour.startsWith('rgba')) return colour

  // If hex, convert to rgba
  if (colour.startsWith('#')) {
    const hex = colour.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }

  return colour
}
