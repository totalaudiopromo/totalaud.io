/**
 * Texture Design Tokens
 *
 * Visual effects, overlays, and atmospheric styling.
 * Includes gradients, shadows, glows, and theme-specific textures.
 *
 * Philosophy:
 * - Subtle: Background atmospherics
 * - Emphasis: Highlight important elements
 * - Dramatic: Hero sections, key moments
 */

/**
 * Shadow Tokens
 * Elevation-based shadow system
 */
export const shadows = {
  /** No shadow */
  none: 'none',

  /** Subtle hover effect */
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',

  /** Card elevation */
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',

  /** Modal, dropdown */
  lg: '0 10px 15px rgba(0, 0, 0, 0.15)',

  /** Dramatic focus */
  xl: '0 20px 25px rgba(0, 0, 0, 0.2)',

  /** Maximum depth */
  xxl: '0 25px 50px rgba(0, 0, 0, 0.25)',
} as const

/**
 * Glow Effects
 * Theme accent glows for emphasis
 */
export const glows = {
  /** Subtle accent glow */
  subtle: '0 0 20px rgba(58, 169, 190, 0.1)',

  /** Standard accent glow */
  normal: '0 0 40px rgba(58, 169, 190, 0.15)',

  /** Strong accent glow */
  strong: '0 0 60px rgba(58, 169, 190, 0.25)',

  /** Intense accent glow */
  intense: '0 0 80px rgba(58, 169, 190, 0.35)',
} as const

/**
 * Gradient Tokens
 * Linear and radial gradients for backgrounds
 */
export const gradients = {
  /** Subtle vertical fade */
  fade: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.05) 100%)',

  /** Accent gradient (top to bottom) */
  accent: 'linear-gradient(180deg, rgba(58, 169, 190, 0.1) 0%, rgba(58, 169, 190, 0) 100%)',

  /** Radial spotlight */
  spotlight: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 70%)',

  /** Dark vignette */
  vignette: 'radial-gradient(circle at center, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 100%)',

  /** Hero gradient (dramatic landing page) */
  hero: 'linear-gradient(135deg, rgba(58, 169, 190, 0.2) 0%, rgba(15, 17, 19, 0) 100%)',
} as const

/**
 * Border Styles
 * Border widths and styles for different themes
 */
export const borders = {
  /** No border */
  none: 'none',

  /** Subtle 1px */
  thin: '1px solid',

  /** Standard 2px */
  normal: '2px solid',

  /** Bold 3px */
  bold: '3px solid',

  /** Dramatic 4px */
  dramatic: '4px solid',
} as const

/**
 * Border Radius Tokens
 * Consistent corner rounding
 */
export const borderRadius = {
  /** No rounding (sharp corners) */
  none: '0',

  /** Subtle 2px */
  sm: '0.125rem',

  /** Standard 4px */
  md: '0.25rem',

  /** Rounded 8px */
  lg: '0.5rem',

  /** Very rounded 12px */
  xl: '0.75rem',

  /** Pill shape */
  full: '9999px',
} as const

/**
 * Backdrop Filters
 * Blur and frosted glass effects
 */
export const backdrops = {
  /** No blur */
  none: 'none',

  /** Subtle blur (4px) */
  subtle: 'blur(4px)',

  /** Standard blur (8px) */
  normal: 'blur(8px)',

  /** Strong blur (16px) */
  strong: 'blur(16px)',

  /** Frosted glass (blur + saturation) */
  frosted: 'blur(12px) saturate(180%)',
} as const

/**
 * Opacity Tokens
 * Consistent transparency levels
 */
export const opacity = {
  /** Completely hidden */
  hidden: 0,

  /** Very transparent */
  veryLight: 0.1,

  /** Light transparency */
  light: 0.25,

  /** Medium transparency */
  medium: 0.5,

  /** High transparency */
  high: 0.75,

  /** Nearly opaque */
  veryHigh: 0.9,

  /** Fully opaque */
  opaque: 1,
} as const

/**
 * Theme-Specific Textures
 * Different themes can have unique visual treatments
 */
export const themeTextures = {
  operator: {
    // ASCII terminal: Sharp, minimal
    border: borders.thin,
    radius: borderRadius.none,
    shadow: shadows.none,
    glow: glows.subtle,
    backdrop: backdrops.none,
  },

  guide: {
    // XP nostalgia: Soft, rounded
    border: borders.normal,
    radius: borderRadius.md,
    shadow: shadows.md,
    glow: glows.normal,
    backdrop: backdrops.subtle,
  },

  map: {
    // Aqua designer: Frosted, glassy
    border: borders.thin,
    radius: borderRadius.lg,
    shadow: shadows.sm,
    glow: glows.normal,
    backdrop: backdrops.frosted,
  },

  timeline: {
    // DAW producer: Modular, grid-based
    border: borders.bold,
    radius: borderRadius.sm,
    shadow: shadows.lg,
    glow: glows.strong,
    backdrop: backdrops.normal,
  },

  tape: {
    // Analogue warmth: Soft, organic
    border: borders.thin,
    radius: borderRadius.xl,
    shadow: shadows.md,
    glow: glows.subtle,
    backdrop: backdrops.subtle,
  },
} as const

/**
 * Texture Core Export
 * Central access point for all texture tokens
 */
export const textureCore = {
  shadows,
  glows,
  gradients,
  borders,
  borderRadius,
  backdrops,
  opacity,
  themes: themeTextures,
} as const

export type TextureCore = typeof textureCore

/**
 * Utility: Combine multiple box shadows
 * @example combineShadows(shadows.md, glows.normal)
 */
export function combineShadows(...shadows: string[]): string {
  return shadows.filter((s) => s !== 'none').join(', ')
}

/**
 * Utility: Create layered gradient
 * @example layerGradients(gradients.fade, gradients.accent)
 */
export function layerGradients(...gradients: string[]): string {
  return gradients.join(', ')
}

/**
 * Utility: Generate border CSS string
 * @example toBorder(borders.normal, '#3AA9BE') => "2px solid #3AA9BE"
 */
export function toBorder(borderStyle: string, colour: string): string {
  if (borderStyle === 'none') return 'none'
  return `${borderStyle} ${colour}`
}
