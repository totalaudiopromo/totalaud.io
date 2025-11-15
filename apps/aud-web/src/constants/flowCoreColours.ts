/**
 * FlowCore Colour Palette
 * Phase 15.4: Production Wiring & Demo Surface
 *
 * Core brand colours used throughout the console UI.
 * All values use British English spelling (colour not color).
 */

export const flowCoreColours = {
  // Core brand colours
  matteBlack: 'var(--flowcore-colour-bg)',
  slateCyan: 'var(--flowcore-colour-accent)',
  iceCyan: 'var(--flowcore-colour-accent-hover)',

  // Text colours
  textPrimary: 'var(--flowcore-colour-fg)',
  textSecondary: 'rgba(236, 239, 241, 0.72)',
  textTertiary: 'rgba(236, 239, 241, 0.48)',

  // Semantic colours
  warningOrange: 'var(--flowcore-colour-warning)',
  errorRed: 'var(--flowcore-colour-error)',
  successGreen: 'var(--flowcore-colour-success)',

  // Background colours
  cardBackground: 'color-mix(in srgb, var(--flowcore-colour-bg) 92%, #ffffff 8%)',
  darkGrey: 'color-mix(in srgb, var(--flowcore-colour-bg) 86%, #ffffff 14%)',
  hoverGrey: 'color-mix(in srgb, var(--flowcore-colour-bg) 80%, #ffffff 20%)',
  borderGrey: 'var(--flowcore-colour-border)',
  borderSubtle: 'rgba(236, 239, 241, 0.12)',
  borderFocus: 'rgba(58, 169, 190, 0.45)',
  overlayStrong: 'var(--flowcore-overlay-strong)',
  overlaySoft: 'var(--flowcore-overlay-soft)',
  overlayAccent: 'var(--flowcore-overlay-accent)',
  purple: '#a855f7',
  amber: '#f59e0b',
  grey: 'rgba(236, 239, 241, 0.5)',
  slateCyanHover: 'var(--flowcore-colour-accent-hover)',
  hoverDarkGrey: 'color-mix(in srgb, var(--flowcore-colour-bg) 70%, #ffffff 30%)',
} as const

export type FlowCoreColour = keyof typeof flowCoreColours
