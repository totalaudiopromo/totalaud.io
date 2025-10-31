/**
 * Console Environment - Visual System
 *
 * Minimal, purposeful design inspired by studio tools.
 * No ornamentation - every pixel serves a function.
 */

export const consolePalette = {
  // Core colors
  background: {
    primary: '#0F1113', // Deep charcoal
    secondary: '#1A1D21', // Slightly lighter for panels
    tertiary: '#252A30', // Raised surfaces
  },

  // Accent colors
  accent: {
    primary: '#3AE1C2', // Teal - primary actions
    hover: '#4AEFD4', // Lighter teal
    muted: '#2AB89F', // Darker teal
  },

  // Text hierarchy
  text: {
    primary: '#E5E7EB', // Almost white - main content
    secondary: '#9CA3AF', // Gray - supporting text
    tertiary: '#6B7280', // Darker gray - labels
    disabled: '#4B5563', // Very dark gray
  },

  // Semantic colors
  semantic: {
    success: '#10B981', // Green
    error: '#EF4444', // Red
    warning: '#F59E0B', // Amber
    info: '#3B82F6', // Blue
  },

  // Borders and dividers
  border: {
    default: '#252A30', // Subtle dividers
    subtle: '#1F2428', // Even more subtle
    focus: '#3AE1C2', // Focus states
    hover: '#374151', // Interactive borders
  },

  // Grid overlay
  grid: {
    line: 'rgba(58, 225, 194, 0.03)', // Subtle 12px grid pattern
    lineWarning: '#F59E0B',
    lineError: '#EF4444',
    size: 12, // Grid unit in pixels
  },

  // Typography
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontMono: 'Space Grotesk, JetBrains Mono, monospace',
    fontSize: {
      small: '0.875rem', // 14px
      body: '1rem', // 16px
      h3: '1.125rem', // 18px
      h2: '1.25rem', // 20px
      h1: '1.5rem', // 24px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
    },
    letterSpacing: {
      tight: '-0.01em',
      normal: '0',
      wide: '0.05em',
    },
  },

  // Spacing (based on 12px grid)
  spacing: {
    elementPadding: '12px',
    panePadding: '24px',
    sectionMargin: '16px',
    containerPadding: '24px',
    gap: '24px',
  },

  // Layout Constants
  layout: {
    header: '64px',
    footer: '48px',
    sidebarWidth: '320px',
    paneMinWidth: '288px',
    maxWidth: '1440px',
  },

  // Depth Layers (z-index)
  depth: {
    base: 0,
    raised: 10,
    overlay: 20,
    modal: 30,
    tooltip: 40,
    notification: 50,
  },
} as const
