/**
 * Design System - Typography Tokens
 *
 * Centralised typography system for totalaud.io
 * Phase 10.4: Global Design System Unification
 */

/**
 * Font families
 * All UI components reference these typeface stacks
 */
export const typography = {
  fonts: {
    // Sans-serif (primary UI)
    sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',

    // Monospace (code, console, technical UI)
    mono: '"JetBrains Mono", "Geist Mono", "IBM Plex Mono", Menlo, Monaco, "Courier New", monospace',

    // Editorial (landing page, hero sections)
    editorial: '"EB Garamond Variable", Georgia, serif',

    // Legacy font variables (for compatibility)
    geist: 'Geist Sans, system-ui',
    geistMono: 'Geist Mono, "IBM Plex Mono", monospace',
  },

  /**
   * Font weights
   */
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
  },

  /**
   * Font sizes
   * Base: 16px (1rem)
   */
  sizes: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },

  /**
   * Line heights
   */
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,
    loose: 1.8,
  },

  /**
   * Letter spacing
   */
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.02em',
    wider: '0.05em',
  },
} as const

/**
 * Typography presets for common UI patterns
 */
export const typographyPresets = {
  // Headings
  h1: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.semibold,
    lineHeight: typography.lineHeights.tight,
    letterSpacing: typography.letterSpacing.tight,
  },
  h2: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.semibold,
    lineHeight: typography.lineHeights.tight,
    letterSpacing: typography.letterSpacing.tight,
  },
  h3: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.medium,
    lineHeight: typography.lineHeights.normal,
    letterSpacing: typography.letterSpacing.normal,
  },

  // Body text
  body: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.regular,
    lineHeight: typography.lineHeights.normal,
    letterSpacing: typography.letterSpacing.normal,
  },
  bodySmall: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    lineHeight: typography.lineHeights.normal,
    letterSpacing: typography.letterSpacing.normal,
  },

  // Monospace
  code: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    lineHeight: typography.lineHeights.relaxed,
    letterSpacing: typography.letterSpacing.wide,
  },

  // Editorial
  editorial: {
    fontFamily: typography.fonts.editorial,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.regular,
    lineHeight: typography.lineHeights.relaxed,
    letterSpacing: typography.letterSpacing.normal,
  },
} as const
