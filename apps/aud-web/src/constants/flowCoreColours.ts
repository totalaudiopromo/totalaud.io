/**
 * FlowCore Colours & Motion Tokens
 * Phase 14.3: Operator Scene design system
 *
 * Centralised colour palette and motion timing for cinematic UI
 */

export const flowCoreColours = {
  // Base colours
  matteBlack: '#0F1113',
  darkGrey: '#1A1D1F', // Added for existing component compatibility
  textPrimary: '#FFFFFF',
  textSecondary: '#B0BEC5',
  textTertiary: '#78909C',
  textDisabled: '#546E7A',

  // Accent colours
  slateCyan: '#3AA9BE',
  iceCyan: '#89DFF3', // Added for existing component compatibility

  // UI elements
  borderGrey: '#263238',
  mediumGrey: '#37474F',
  backgroundGrey: '#1A1D1F',

  // State colours
  success: '#51CF66',
  warning: '#FFC107',
  error: '#FF5252',
  info: '#89DFF3',
} as const

export const flowCoreMotion = {
  // Timing tokens (in milliseconds)
  fast: 120, // Micro feedback
  normal: 240, // Pane transitions
  slow: 400, // Calm fades
  cinematic: 800, // Slow reveals

  // Easing curves
  easeOut: 'cubic-bezier(0.22, 1, 0.36, 1)',
  easeIn: 'cubic-bezier(0.64, 0, 0.78, 0)',
  easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
  easeStandard: 'cubic-bezier(0.42, 0, 0.58, 1)', // Added for existing component compatibility
} as const

export const flowCoreTypography = {
  fontFamily: {
    sans: 'var(--font-geist-sans)',
    mono: 'var(--font-geist-mono)',
  },
  fontSize: {
    tiny: '0.625rem', // 10px
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    small: '0.875rem', // 14px - alias for sm
    base: '1rem', // 16px
    body: '1rem', // 16px - alias for base
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    hero: '3.5rem', // 56px
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    bodyLineHeight: 1.6,
    heroLineHeight: 1.1,
  },
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.02em',
    heroTracking: '-0.02em',
  },
} as const

export type FlowCoreColour = keyof typeof flowCoreColours
export type FlowCoreMotion = keyof typeof flowCoreMotion
