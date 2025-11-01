/**
 * FlowCore Design System – Colour Tokens
 * Phase 14: Unified Product Polish
 *
 * These colours define the core palette for the TotalAud.io brand.
 * Use these tokens throughout the application for consistency.
 *
 * British spelling: "colour" not "color" in documentation
 */

export const flowCoreColours = {
  // Primary Brand Colours
  slateCyan: '#3AA9BE',    // Primary accent - buttons, links, highlights
  iceCyan: '#89DFF3',      // Secondary accent - hovers, glows, success states
  onyx: '#0F1113',         // Deep background - main canvas colour

  // Neutral Greys
  matteBlack: '#0F1113',   // Primary background (alias of onyx)
  darkGrey: '#1A1D1F',     // Secondary background - cards, panels
  mediumGrey: '#2A2D2F',   // Tertiary background - hover states
  borderGrey: '#3A3D3F',   // Borders, dividers
  lightGrey: '#EAECEE',    // Primary text on dark backgrounds

  // Semantic Colours
  success: '#51CF66',      // Success states, positive trends
  warning: '#FFD93D',      // Warning states, neutral trends
  error: '#FF6B6B',        // Error states, negative trends
  info: '#89DFF3',         // Info states (alias of iceCyan)

  // Text Colours (for dark theme)
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textTertiary: 'rgba(255, 255, 255, 0.5)',
  textDisabled: 'rgba(255, 255, 255, 0.3)',

  // Surface Colours
  surface: 'rgba(26, 29, 31, 0.8)',        // Cards with subtle transparency
  surfaceElevated: 'rgba(42, 45, 47, 0.9)', // Elevated cards/modals
  surfaceOverlay: 'rgba(15, 17, 19, 0.95)', // Full-screen overlays

  // Accent Variations (for gradients/glows)
  slateCyanDark: '#2A8A9E',     // Darker variant
  slateCyanLight: '#5AC2D4',    // Lighter variant
  iceCyanDark: '#6AC8E3',       // Darker variant
  iceCyanLight: '#A8F0FF',      // Lighter variant
} as const

/**
 * FlowCore Motion Tokens
 * Consistent animation durations across the application
 */
export const flowCoreMotion = {
  // Duration (in milliseconds)
  fast: 120,       // Micro-interactions (button hover, checkbox)
  normal: 240,     // Component transitions (modal open, panel slide)
  slow: 400,       // Ambient effects (background animations, page transitions)

  // Easing Functions
  easeStandard: 'cubic-bezier(0.22, 1, 0.36, 1)',  // Default easing
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',            // Accelerating
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',           // Decelerating
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',       // Smooth both ends

  // Spring Animations (for Framer Motion)
  springGentle: { type: 'spring', damping: 25, stiffness: 300 },
  springBouncy: { type: 'spring', damping: 15, stiffness: 400 },
  springStiff: { type: 'spring', damping: 30, stiffness: 500 },
} as const

/**
 * FlowCore Typography Scale
 * Standardised font sizes and line heights
 */
export const flowCoreTypography = {
  // Font Families
  fontSans: 'var(--font-sans)', // Geist Sans / Inter
  fontMono: 'var(--font-mono)', // Geist Mono / IBM Plex Mono

  // Font Sizes (in px)
  hero: '48px',         // h1: Landing page headlines
  title: '32px',        // h2: Section titles
  subtitle: '24px',     // h3: Subsection titles
  body: '16px',         // p: Body text
  small: '14px',        // small: Secondary text
  tiny: '12px',         // tiny: Metadata, labels

  // Line Heights
  heroLineHeight: '1.2',
  titleLineHeight: '1.3',
  bodyLineHeight: '1.6',
  smallLineHeight: '1.5',

  // Letter Spacing
  heroTracking: '-0.02em',
  titleTracking: '-0.01em',
  bodyTracking: '0',
  smallTracking: '0.01em',
} as const

/**
 * FlowCore Spacing System (16px grid)
 * Use these values for consistent spacing throughout the application
 */
export const flowCoreSpacing = {
  xs: '4px',    // 0.25 × 16
  sm: '8px',    // 0.5 × 16
  md: '16px',   // 1 × 16 (base unit)
  lg: '24px',   // 1.5 × 16
  xl: '32px',   // 2 × 16
  '2xl': '48px', // 3 × 16
  '3xl': '64px', // 4 × 16
  '4xl': '96px', // 6 × 16
} as const

/**
 * FlowCore Border Radius
 * Consistent corner rounding
 */
export const flowCoreBorders = {
  radiusSmall: '4px',
  radiusMedium: '8px',
  radiusLarge: '12px',
  radiusRound: '9999px', // Fully rounded (pills, avatars)

  widthThin: '1px',
  widthMedium: '2px',
  widthThick: '3px',
} as const

/**
 * FlowCore Shadows
 * Elevation system for depth
 */
export const flowCoreShadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',

  // Glow Effects (for accents)
  glowSlateCyan: `0 0 20px -5px rgba(58, 169, 190, 0.4)`,
  glowIceCyan: `0 0 20px -5px rgba(137, 223, 243, 0.4)`,
} as const

/**
 * Helper function to create CSS custom properties from tokens
 * Usage: Add to root CSS or use in styled components
 */
export function createFlowCoreCSSVariables() {
  return {
    // Colours
    '--fc-slate-cyan': flowCoreColours.slateCyan,
    '--fc-ice-cyan': flowCoreColours.iceCyan,
    '--fc-onyx': flowCoreColours.onyx,
    '--fc-matte-black': flowCoreColours.matteBlack,
    '--fc-dark-grey': flowCoreColours.darkGrey,
    '--fc-medium-grey': flowCoreColours.mediumGrey,
    '--fc-border-grey': flowCoreColours.borderGrey,
    '--fc-light-grey': flowCoreColours.lightGrey,

    // Semantic
    '--fc-success': flowCoreColours.success,
    '--fc-warning': flowCoreColours.warning,
    '--fc-error': flowCoreColours.error,
    '--fc-info': flowCoreColours.info,

    // Text
    '--fc-text-primary': flowCoreColours.textPrimary,
    '--fc-text-secondary': flowCoreColours.textSecondary,
    '--fc-text-tertiary': flowCoreColours.textTertiary,

    // Motion
    '--fc-motion-fast': `${flowCoreMotion.fast}ms`,
    '--fc-motion-normal': `${flowCoreMotion.normal}ms`,
    '--fc-motion-slow': `${flowCoreMotion.slow}ms`,
    '--fc-motion-ease': flowCoreMotion.easeStandard,

    // Spacing
    '--fc-space-xs': flowCoreSpacing.xs,
    '--fc-space-sm': flowCoreSpacing.sm,
    '--fc-space-md': flowCoreSpacing.md,
    '--fc-space-lg': flowCoreSpacing.lg,
    '--fc-space-xl': flowCoreSpacing.xl,

    // Borders
    '--fc-radius-sm': flowCoreBorders.radiusSmall,
    '--fc-radius-md': flowCoreBorders.radiusMedium,
    '--fc-radius-lg': flowCoreBorders.radiusLarge,
  }
}

/**
 * Type-safe colour getter with TypeScript autocomplete
 */
export type FlowCoreColour = keyof typeof flowCoreColours

export function getFlowCoreColour(colour: FlowCoreColour): string {
  return flowCoreColours[colour]
}
