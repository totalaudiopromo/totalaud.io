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
 * Integrates with ThemeContext to provide theme-specific overrides
 *
 * Usage:
 * ```tsx
 * import { useFlowCore } from '@/design/core'
 *
 * function MyComponent() {
 *   const { motion, sound, typography, texture, theme } = useFlowCore()
 *
 *   return (
 *     <motion.div
 *       transition={motion.transitions.smooth}
 *       onClick={() => sound.ui.click.play()}
 *     >
 *       <h1 style={typography.textStyles.hero}>Hello {theme.name}</h1>
 *     </motion.div>
 *   )
 * }
 * ```
 */
export function useFlowCore(): ThemeFlowCore {
  // Check if running in browser (SSR guard)
  if (typeof window === 'undefined') {
    return {
      ...flowCore,
      theme: {
        id: 'operator',
        name: 'Operator',
        personality: 'Minimal terminal aesthetics',
      },
    }
  }

  // Dynamic import to avoid SSR issues
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { useTheme } = require('@/contexts/ThemeContext')
  const { theme, themeConfig } = useTheme()

  // Return FlowCore with theme context
  return {
    ...flowCore,
    theme: {
      id: theme,
      name: themeConfig.name,
      personality: themeConfig.tagline || themeConfig.description,
    },
  }
}
