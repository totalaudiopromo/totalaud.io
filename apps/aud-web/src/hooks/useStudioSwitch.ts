/**
 * useStudioSwitch Hook
 *
 * Manages dynamic studio theme switching with cinematic transitions.
 * Phase 13.0: FlowCore Studio Aesthetics
 *
 * Features:
 * - 600-800ms ambient lighting cross-fade
 * - Audio loop cross-fade (via AmbientPlayer)
 * - 120-240ms panel Z-depth breathe animation
 * - Respects prefers-reduced-motion
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { getAmbientPlayer } from '@/design/core/sounds/ambient'
import { getAtmosphere } from '@/design/core/themes/atmospheres'
import type { ThemeId } from '@/design/core/themes/themes'

export interface StudioSwitchState {
  /** Is transition in progress */
  isTransitioning: boolean
  /** Current ambient lighting overlay opacity */
  lightingOpacity: number
  /** Panel breathe scale (1.0 - 1.01) */
  panelScale: number
}

/**
 * useStudioSwitch - Manages cinematic theme transitions
 *
 * @example
 * ```tsx
 * const { isTransitioning, lightingOpacity, panelScale } = useStudioSwitch()
 *
 * <div
 *   style={{
 *     opacity: lightingOpacity,
 *     transform: `scale(${panelScale})`
 *   }}
 * >
 *   ...panels
 * </div>
 * ```
 */
export function useStudioSwitch(): StudioSwitchState {
  const { theme } = useTheme()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [lightingOpacity, setLightingOpacity] = useState(0)
  const [panelScale, setPanelScale] = useState(1.0)
  const previousTheme = useRef<string | null>(null)
  const ambientPlayer = useRef(getAmbientPlayer())

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    // Initialize ambient player on mount
    if (!prefersReducedMotion) {
      ambientPlayer.current.initialize().catch((error) => {
        console.warn('[useStudioSwitch] Failed to initialize ambient player:', error)
      })
    }

    // Play ambient for current theme
    if (theme && !prefersReducedMotion) {
      ambientPlayer.current.play(theme as ThemeId, 600).catch((error) => {
        console.warn('[useStudioSwitch] Failed to play ambient:', error)
      })
    }

    previousTheme.current = theme
  }, [])

  useEffect(() => {
    // Skip if first render or same theme
    if (!previousTheme.current || previousTheme.current === theme) {
      return
    }

    // Skip animations if reduced motion
    if (prefersReducedMotion) {
      previousTheme.current = theme
      return
    }

    // Start transition
    setIsTransitioning(true)

    // Get theme atmosphere for lighting
    const atmosphere = getAtmosphere(theme as ThemeId)

    // Phase 1: Lighting cross-fade (0-400ms)
    setLightingOpacity(0.15) // Subtle overlay

    const lightingTimeout = setTimeout(() => {
      setLightingOpacity(0) // Fade out
    }, 400)

    // Phase 2: Panel breathe (200-440ms)
    const breatheStartTimeout = setTimeout(() => {
      setPanelScale(1.01) // Subtle expand
    }, 200)

    const breatheEndTimeout = setTimeout(() => {
      setPanelScale(1.0) // Return to normal
    }, 440)

    // Phase 3: Ambient audio cross-fade (0-600ms)
    ambientPlayer.current.play(theme as ThemeId, 600).catch((error) => {
      console.warn('[useStudioSwitch] Failed to cross-fade ambient:', error)
    })

    // End transition
    const transitionEndTimeout = setTimeout(() => {
      setIsTransitioning(false)
      previousTheme.current = theme
    }, 800)

    // Cleanup
    return () => {
      clearTimeout(lightingTimeout)
      clearTimeout(breatheStartTimeout)
      clearTimeout(breatheEndTimeout)
      clearTimeout(transitionEndTimeout)
    }
  }, [theme, prefersReducedMotion])

  return {
    isTransitioning,
    lightingOpacity,
    panelScale,
  }
}
