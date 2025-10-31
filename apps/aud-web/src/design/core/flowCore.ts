/**
 * FlowCore Design System
 *
 * Central design token registry providing unified access to:
 * - Motion (easing curves, durations, transitions)
 * - Sounds (UI feedback, ambient audio)
 * - Typography (fonts, sizes, weights)
 * - Textures (visual effects, overlays)
 *
 * Purpose: Single source of truth for all design tokens across themes.
 * Integration: Works with ThemeContext to provide theme-aware tokens.
 */

import { motionCore } from './motion'
import { soundCore } from './sounds'
import { typographyCore } from './typography'
import { textureCore } from './textures'

/**
 * FlowCore - Unified Design System
 *
 * Usage:
 * ```tsx
 * import { flowCore } from '@/design/core/flowCore'
 *
 * // Access motion tokens
 * const transition = flowCore.motion.transitions.smooth
 *
 * // Access sound tokens
 * const clickSound = flowCore.sound.ui.click
 *
 * // Access typography
 * const headingFont = flowCore.typography.fonts.display
 * ```
 */
export const flowCore = {
  motion: motionCore,
  sound: soundCore,
  typography: typographyCore,
  texture: textureCore,
} as const

export type FlowCore = typeof flowCore

/**
 * Theme-aware design tokens
 * Extends flowCore with theme-specific overrides
 */
export interface ThemeFlowCore extends FlowCore {
  theme: {
    id: string
    name: string
    personality: string
  }
}

/**
 * Hook for accessing theme-aware FlowCore
 * To be implemented with ThemeContext integration
 */
export function useFlowCore(): ThemeFlowCore {
  // Placeholder - will integrate with ThemeContext
  return {
    ...flowCore,
    theme: {
      id: 'operator',
      name: 'Operator',
      personality: 'Minimal terminal aesthetics',
    },
  }
}
