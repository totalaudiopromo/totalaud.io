/**
 * Design System - Colour Tokens
 *
 * Centralised colour palette for totalaud.io
 * Phase 10.4: Global Design System Unification
 * British English spelling throughout
 */

/**
 * Core colour palette
 * All UI components reference these standardised values
 */
export const colors = {
  // Background system
  background: '#0F1113', // Matte Black - primary background
  surface: '#1A1C1F', // Elevated surfaces, cards, panels
  surfaceSubtle: '#0a0d10', // Deep navy (legacy compatibility)

  // Text hierarchy
  textPrimary: '#EAECEE', // Primary text, headings
  textSecondary: '#A0A4A8', // Secondary/muted text
  textTertiary: 'rgba(255, 255, 255, 0.5)', // Hints, placeholders

  // Brand accent - Slate Cyan
  accent: '#3AA9BE', // Primary brand colour
  accentHover: '#6FC8B5', // Hover/focus states
  accentSubtle: 'rgba(58, 169, 190, 0.04)', // Subtle backgrounds

  // Borders
  border: '#2C2F33', // Standard border colour
  borderSubtle: 'rgba(255, 255, 255, 0.1)', // Subtle dividers
  borderActive: '#3AA9BE', // Active/selected borders
  borderFocus: 'rgba(58, 169, 190, 0.4)', // Focus state borders

  // Feedback states
  success: '#63C69C', // Success messages (mint - matches cyan family)
  error: '#FF6B6B', // Error messages
  warning: '#FFC857', // Warning messages

  // Accent warm (for variety)
  accentWarm: '#D4A574',
} as const

/**
 * Glow effects and shadows
 * Used for ambient backgrounds and hover states
 */
export const glows = {
  accentSubtle: 'rgba(58, 169, 190, 0.15)',
  accentMedium: 'rgba(58, 169, 190, 0.3)',
  accentStrong: 'rgba(58, 169, 190, 0.6)',

  // Ambient gradient (12s pulse cycle)
  ambientGradient:
    'radial-gradient(circle at 50% 50%, rgba(58, 169, 190, 0.08) 0%, transparent 60%)',
} as const

/**
 * Utility: Convert hex colour to rgba with opacity
 *
 * @param colour - Hex colour string (e.g. '#3AA9BE')
 * @param opacity - Opacity value 0-1
 * @returns RGBA colour string
 */
export function withOpacity(colour: string, opacity: number): string {
  // If already rgba, return as-is
  if (colour.startsWith('rgba')) return colour

  // Convert hex to rgba
  if (colour.startsWith('#')) {
    const hex = colour.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }

  return colour
}
