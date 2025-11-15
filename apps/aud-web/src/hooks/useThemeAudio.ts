/**
 * Theme Audio Hook
 * Minimal wrapper around theme-engine audio system
 * Phase 18: Stabilisation
 */

'use client'

import { useCallback } from 'react'
import { audioEngine, sounds, playAgentSound } from '@total-audio/core-theme-engine'

type SoundName = 'click' | 'success' | 'error'
type AgentId = 'broker' | 'scout' | 'coach' | 'tracker' | 'insight'
type AgentAction = 'start' | 'complete' | 'error'

/**
 * Minimal hook for theme-aware audio playback
 * Exposes only essential sound functions from theme-engine
 */
export function useThemeAudio() {
  const play = useCallback((soundName: SoundName) => {
    const soundFn = sounds[soundName]
    if (soundFn) {
      soundFn()
    }
  }, [])

  const playAgent = useCallback((agentId: AgentId, action: AgentAction) => {
    playAgentSound(agentId, action)
  }, [])

  const setEnabled = useCallback((enabled: boolean) => {
    audioEngine.setEnabled(enabled)
  }, [])

  const setVolume = useCallback((volume: number) => {
    audioEngine.setVolume(volume)
  }, [])

  return {
    play,
    playAgent,
    setEnabled,
    setVolume,
  }
}
