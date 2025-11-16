/**
 * Design Tokens - totalaud.io OS Constellation
 * Unified design system for cohesive, cinematic UX
 */

// ============================================================
// COLOURS
// ============================================================

export const colours = {
  // Core
  background: '#0F1113',
  accent: '#3AA9BE',

  // Surfaces
  panel: 'rgba(255, 255, 255, 0.03)',
  panelHover: 'rgba(255, 255, 255, 0.05)',

  // Borders
  border: 'rgba(255, 255, 255, 0.06)',
  borderHover: 'rgba(255, 255, 255, 0.12)',
  borderAccent: 'rgba(58, 169, 190, 0.3)',

  // Glows
  glow: 'rgba(58, 169, 190, 0.4)',
  glowSubtle: 'rgba(58, 169, 190, 0.15)',

  // Text
  foreground: '#FFFFFF',
  foregroundMuted: 'rgba(255, 255, 255, 0.7)',
  foregroundSubtle: 'rgba(255, 255, 255, 0.5)',
  foregroundFaint: 'rgba(255, 255, 255, 0.3)',

  // States
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
} as const

// ============================================================
// RADII
// ============================================================

export const radii = {
  xs: '4px',
  sm: '6px',
  md: '10px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
} as const

// ============================================================
// SPACING
// ============================================================

export const spacing = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
} as const

// ============================================================
// SHADOWS
// ============================================================

export const shadows = {
  subtle: '0px 6px 12px rgba(0, 0, 0, 0.2)',
  medium: '0px 10px 24px rgba(0, 0, 0, 0.3)',
  strong: '0px 16px 32px rgba(0, 0, 0, 0.4)',
  glow: '0px 0px 18px rgba(58, 169, 190, 0.25)',
  glowStrong: '0px 0px 24px rgba(58, 169, 190, 0.4)',
} as const

// ============================================================
// TYPOGRAPHY
// ============================================================

export const typography = {
  // Font families
  fontSystem: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontMono: 'ui-monospace, "SF Mono", "Cascadia Code", Consolas, monospace',

  // Font sizes
  h1: {
    size: '28px',
    weight: '600',
    lineHeight: '1.3',
  },
  h2: {
    size: '22px',
    weight: '500',
    lineHeight: '1.4',
  },
  h3: {
    size: '18px',
    weight: '500',
    lineHeight: '1.4',
  },
  body: {
    size: '15px',
    weight: '400',
    lineHeight: '1.6',
  },
  small: {
    size: '13px',
    weight: '400',
    lineHeight: '1.5',
  },
  tiny: {
    size: '11px',
    weight: '400',
    lineHeight: '1.4',
  },
} as const

// ============================================================
// Z-INDEX SCALE
// ============================================================

export const zIndex = {
  base: 0,
  overlay: 10,
  dropdown: 20,
  modal: 30,
  toast: 40,
  tooltip: 50,
} as const

// ============================================================
// HELPERS
// ============================================================

/**
 * Get spacing value by number
 */
export const getSpacing = (value: keyof typeof spacing): string => spacing[value]

/**
 * Get radius value by size
 */
export const getRadius = (size: keyof typeof radii): string => radii[size]

/**
 * Get shadow value by type
 */
export const getShadow = (type: keyof typeof shadows): string => shadows[type]
