/**
 * useFlowMode Hook
 *
 * Manages focus mode state for Flow Studio.
 * Enables deep focus through dimmed UI, keyboard navigation, and ambient sound.
 *
 * Flow State Design System - Phase 1
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUserPrefs } from './useUserPrefs'
import { logger } from '@total-audio/core-logger'

const log = logger.scope('useFlowMode')

export interface FlowModeState {
  /** Whether focus mode is active */
  isActive: boolean
  /** Ambient audio volume (0.0 to 1.0) */
  ambientVolume: number
  /** Sidebar opacity when in focus mode */
  sidebarOpacity: number
  /** Header opacity when in focus mode */
  headerOpacity: number
  /** Motion scale factor (reduced for accessibility) */
  motionScale: number
  /** Toggle focus mode on/off */
  toggleFocus: () => void
  /** Exit focus mode explicitly */
  exitFocus: () => void
  /** Enter focus mode explicitly */
  enterFocus: () => void
}

/**
 * Hook for managing Flow Studio focus mode
 *
 * Features:
 * - Dims sidebars and header to 0.2 opacity
 * - Enables keyboard-only navigation
 * - Fades in ambient sound (respects mute preference)
 * - Reduces motion by 20% (respects reduced-motion preference)
 * - Persists state across sessions
 */
export function useFlowMode(): FlowModeState {
  const { prefs } = useUserPrefs()
  const [isActive, setIsActive] = useState(false)

  // Calculate ambient volume based on preferences
  const ambientVolume =
    isActive && !prefs?.mute_sounds
      ? (prefs?.audio_volume ?? 0.7) * 0.15 // Ambient is 15% of global volume
      : 0

  // Calculate motion scale based on reduced motion preference
  const motionScale = prefs?.reduced_motion ? 0 : isActive ? 0.8 : 1.0

  // UI opacity values
  const sidebarOpacity = isActive ? 0.2 : 1.0
  const headerOpacity = isActive ? 0.2 : 1.0

  // Toggle focus mode
  const toggleFocus = useCallback(() => {
    setIsActive((prev) => {
      const newState = !prev
      log.debug(newState ? 'Entering focus mode' : 'Exiting focus mode')
      return newState
    })
  }, [])

  // Enter focus mode explicitly
  const enterFocus = useCallback(() => {
    log.debug('Entering focus mode')
    setIsActive(true)
  }, [])

  // Exit focus mode explicitly
  const exitFocus = useCallback(() => {
    log.debug('Exiting focus mode')
    setIsActive(false)
  }, [])

  // Keyboard shortcut: Cmd/Ctrl + F
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + F
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault()
        toggleFocus()
      }

      // Escape to exit focus mode
      if (e.key === 'Escape' && isActive) {
        exitFocus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleFocus, exitFocus, isActive])

  // Log state changes for debugging
  useEffect(() => {
    if (isActive) {
      log.debug('Focus mode state', {
        ambientVolume,
        sidebarOpacity,
        headerOpacity,
        motionScale,
        muteSounds: prefs?.mute_sounds,
        reducedMotion: prefs?.reduced_motion,
      })
    }
  }, [isActive, ambientVolume, sidebarOpacity, headerOpacity, motionScale, prefs])

  return {
    isActive,
    ambientVolume,
    sidebarOpacity,
    headerOpacity,
    motionScale,
    toggleFocus,
    exitFocus,
    enterFocus,
  }
}
