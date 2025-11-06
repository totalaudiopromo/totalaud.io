/**
 * FlowCore Colour Palette
 * Phase 15.4: Production Wiring & Demo Surface
 *
 * Core brand colours used throughout the console UI.
 * All values use British English spelling (colour not color).
 */

export const flowCoreColours = {
  // Core brand colours
  matteBlack: '#0F1113',
  slateCyan: '#3AA9BE',
  iceCyan: '#5CCFE6',

  // Text colours
  textPrimary: '#E5E7EB',
  textSecondary: '#9CA3AF',
  textTertiary: '#6B7280',

  // Semantic colours
  warningOrange: '#FB923C',
  errorRed: '#E57373',
  successGreen: '#4ADE80',

  // Background colours
  cardBackground: '#1A1C1E',
  darkGrey: '#1A1C1E',
  hoverGrey: '#252729',
  borderGrey: '#2A2C2E',
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  borderFocus: 'rgba(58, 169, 190, 0.4)',
} as const

export type FlowCoreColour = keyof typeof flowCoreColours
