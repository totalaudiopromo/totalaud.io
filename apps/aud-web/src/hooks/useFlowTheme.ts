/**
 * useFlowTheme Hook
 *
 * Bridges ThemeContext with FlowCore personality system.
 * Provides theme-aware design tokens with motion, sound, texture, and tone.
 *
 * Phase 12.4: Theme Fusion - Personality-driven design tokens
 *
 * Usage:
 * ```tsx
 * import { useFlowTheme } from '@/hooks/useFlowTheme'
 *
 * function MyComponent() {
 *   const { personality, motion, sound, texture, colours } = useFlowTheme()
 *
 *   return (
 *     <motion.div
 *       transition={motion.transition}
 *       style={{
 *         background: colours.surface,
 *         boxShadow: texture.glow,
 *         borderColor: colours.accent
 *       }}
 *       onClick={() => playSound(sound.ui)}
 *     >
 *       {personality.name} - {personality.tagline}
 *     </motion.div>
 *   )
 * }
 * ```
 */

'use client'

import { flowCore } from '@/design/core'
import { getThemePersonality, type ThemeId, type ThemePersonality } from '@/design/core/themes'
import { useTheme } from '@aud-web/components/themes/ThemeResolver'
import { playSound, createSoundPlayer } from '@/design/core/sounds'

/**
 * FlowTheme - Complete theme personality system
 */
export interface FlowTheme {
  /** Active theme personality */
  personality: ThemePersonality

  /** Theme-specific colours */
  colours: ThemePersonality['colours']

  /** Theme-specific motion */
  motion: ThemePersonality['motion']

  /** Theme-specific sound */
  sound: ThemePersonality['sound'] & {
    /** Play UI click sound */
    playClick: () => void
    /** Play ambient sound */
    playAmbient: () => void
  }

  /** Theme-specific texture */
  texture: ThemePersonality['texture']

  /** Theme-specific atmosphere */
  atmosphere: ThemePersonality['atmosphere']

  /** Base FlowCore (all tokens) */
  core: typeof flowCore

  /** Active theme ID */
  activeTheme: ThemeId

  /** Switch theme function */
  setTheme: (themeId: ThemeId) => void
}

/**
 * useFlowTheme - Theme-aware FlowCore hook
 *
 * Returns complete theme personality system with type-safe tokens.
 * Automatically updates when theme changes via ThemeContext.
 */
export function useFlowTheme(): FlowTheme {
  // Get current theme from context
  const { currentTheme, setTheme } = useTheme()

  // Map legacy theme IDs to FlowCore theme IDs
  const themeId: ThemeId = (currentTheme as ThemeId) || 'operator'

  // Get theme personality
  const personality = getThemePersonality(themeId)

  // Create sound players (memoised via createSoundPlayer)
  const playClick = createSoundPlayer(personality.sound.ui)
  const playAmbient = createSoundPlayer(personality.sound.ambient)

  return {
    personality,
    colours: personality.colours,
    motion: personality.motion,
    sound: {
      ...personality.sound,
      playClick,
      playAmbient,
    },
    texture: personality.texture,
    atmosphere: personality.atmosphere,
    core: flowCore,
    activeTheme: themeId,
    setTheme: (newTheme: ThemeId) => setTheme(newTheme as any),
  }
}

/**
 * Convenience exports
 */
export { playSound, createSoundPlayer }
export type { ThemeId, ThemePersonality }
