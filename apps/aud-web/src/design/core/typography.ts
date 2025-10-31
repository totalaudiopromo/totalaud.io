/**
 * Typography Design Tokens
 *
 * Unified typography system providing consistent fonts, sizes, and styles.
 * Uses British English spelling (e.g., "colour" not "color").
 *
 * Philosophy:
 * - Display: Large headings, hero text
 * - Body: Readable content, optimal line length
 * - Mono: Code, terminal, technical UI
 * - Micro: Labels, captions, metadata
 */

/**
 * Font Families
 * Using @fontsource packages for GDPR compliance
 */
export const fonts = {
  /** Sans-serif for UI and body text */
  sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

  /** Monospace for code and terminal */
  mono: '"JetBrains Mono", "SF Mono", "Roboto Mono", Consolas, monospace',

  /** Display font for headings (can be customised per theme) */
  display: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
} as const

/**
 * Font Sizes (rem units for accessibility)
 * Base: 16px = 1rem
 */
export const sizes = {
  /** 48px - Hero headings */
  hero: '3rem',

  /** 36px - Page titles */
  xxl: '2.25rem',

  /** 30px - Section headings */
  xl: '1.875rem',

  /** 24px - Subsection headings */
  lg: '1.5rem',

  /** 18px - Large body text */
  md: '1.125rem',

  /** 16px - Base body text */
  base: '1rem',

  /** 14px - Small text, labels */
  sm: '0.875rem',

  /** 12px - Captions, metadata */
  xs: '0.75rem',

  /** 10px - Micro labels */
  micro: '0.625rem',
} as const

/**
 * Font Weights
 * Inter supports 300-700 from @fontsource
 */
export const weights = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const

/**
 * Line Heights
 * Optimised for readability
 */
export const lineHeights = {
  /** Tight for headings */
  tight: 1.2,

  /** Normal for body text */
  normal: 1.5,

  /** Relaxed for long-form content */
  relaxed: 1.75,

  /** Loose for micro text */
  loose: 2,
} as const

/**
 * Letter Spacing
 * Subtle tracking adjustments
 */
export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const

/**
 * Text Styles
 * Pre-composed typography configurations
 */
export const textStyles = {
  /** Hero heading (landing page) */
  hero: {
    fontSize: sizes.hero,
    fontWeight: weights.bold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.tight,
    fontFamily: fonts.display,
  },

  /** H1 - Page title */
  h1: {
    fontSize: sizes.xxl,
    fontWeight: weights.bold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.tight,
    fontFamily: fonts.display,
  },

  /** H2 - Section heading */
  h2: {
    fontSize: sizes.xl,
    fontWeight: weights.semibold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.normal,
    fontFamily: fonts.display,
  },

  /** H3 - Subsection heading */
  h3: {
    fontSize: sizes.lg,
    fontWeight: weights.semibold,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
    fontFamily: fonts.sans,
  },

  /** H4 - Card heading */
  h4: {
    fontSize: sizes.md,
    fontWeight: weights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
    fontFamily: fonts.sans,
  },

  /** Body - Standard content */
  body: {
    fontSize: sizes.base,
    fontWeight: weights.regular,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
    fontFamily: fonts.sans,
  },

  /** Body Large - Emphasis content */
  bodyLarge: {
    fontSize: sizes.md,
    fontWeight: weights.regular,
    lineHeight: lineHeights.relaxed,
    letterSpacing: letterSpacing.normal,
    fontFamily: fonts.sans,
  },

  /** Label - Form labels, UI labels */
  label: {
    fontSize: sizes.sm,
    fontWeight: weights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.wide,
    fontFamily: fonts.sans,
  },

  /** Caption - Metadata, timestamps */
  caption: {
    fontSize: sizes.xs,
    fontWeight: weights.regular,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
    fontFamily: fonts.sans,
  },

  /** Code - Inline code snippets */
  code: {
    fontSize: sizes.sm,
    fontWeight: weights.regular,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
    fontFamily: fonts.mono,
  },

  /** Terminal - Command line text */
  terminal: {
    fontSize: sizes.base,
    fontWeight: weights.regular,
    lineHeight: lineHeights.relaxed,
    letterSpacing: letterSpacing.wide,
    fontFamily: fonts.mono,
  },

  /** Micro - Very small labels */
  micro: {
    fontSize: sizes.micro,
    fontWeight: weights.medium,
    lineHeight: lineHeights.loose,
    letterSpacing: letterSpacing.wider,
    fontFamily: fonts.sans,
  },
} as const

/**
 * Maximum Line Lengths
 * Optimal reading width (characters)
 */
export const maxWidths = {
  /** Optimal reading width */
  prose: '70ch',

  /** Narrow columns */
  narrow: '45ch',

  /** Wide content */
  wide: '90ch',
} as const

/**
 * Typography Core Export
 * Central access point for all typography tokens
 */
export const typographyCore = {
  fonts,
  sizes,
  weights,
  lineHeights,
  letterSpacing,
  textStyles,
  maxWidths,
} as const

export type TypographyCore = typeof typographyCore

/**
 * Utility: Generate CSS class string from text style
 * @example toCSSClass(typographyCore.textStyles.h1)
 */
export function toCSSClass(style: (typeof textStyles)[keyof typeof textStyles]): string {
  return Object.entries(style)
    .map(([key, value]) => `${key}: ${value};`)
    .join(' ')
}

/**
 * Utility: Calculate fluid font size using clamp()
 * @param min Minimum size (rem)
 * @param preferred Preferred size (vw)
 * @param max Maximum size (rem)
 * @example fluidSize(1, 2.5, 3) => "clamp(1rem, 2.5vw, 3rem)"
 */
export function fluidSize(min: number, preferred: number, max: number): string {
  return `clamp(${min}rem, ${preferred}vw, ${max}rem)`
}
