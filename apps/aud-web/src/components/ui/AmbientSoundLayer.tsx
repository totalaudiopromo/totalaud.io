/**
 * AmbientSoundLayer Component
 *
 * Provides subtle ambient background audio for focus mode using Web Audio API.
 * Flow State Design System - Phase 1
 *
 * Features:
 * - C minor drone at -24dB LUFS
 * - Smooth fade in/out (no harsh cuts)
 * - Respects user preferences (mute_sounds)
 * - Low-frequency (110Hz base) for non-intrusive presence
 */

'use client'

import { useEffect, useRef } from 'react'
import { useSoundEnabled } from './SoundToggle'

interface AmbientSoundLayerProps {
  /** Volume level 0.0 to 1.0 (controlled by useFlowMode) */
  volume: number
}

export function AmbientSoundLayer({ volume }: AmbientSoundLayerProps) {
  const soundEnabled = useSoundEnabled()
  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillatorsRef = useRef<OscillatorNode[]>([])
  const gainNodeRef = useRef<GainNode | null>(null)

  // Effective volume: 0 if sound disabled, otherwise use prop volume
  const effectiveVolume = soundEnabled ? volume : 0

  useEffect(() => {
    // Initialize Web Audio API context
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    const audioContext = audioContextRef.current

    // Create gain node for volume control
    if (!gainNodeRef.current) {
      gainNodeRef.current = audioContext.createGain()
      gainNodeRef.current.connect(audioContext.destination)
      gainNodeRef.current.gain.setValueAtTime(0, audioContext.currentTime)
    }

    const gainNode = gainNodeRef.current

    // Create C minor drone (C3, Eb3, G3)
    // C minor = C, Eb, G
    const frequencies = [
      130.81, // C3
      155.56, // Eb3
      196.0, // G3
    ]

    // Start oscillators if effectiveVolume > 0 and not already running
    if (effectiveVolume > 0 && oscillatorsRef.current.length === 0) {
      console.log('[AmbientSound] Starting ambient drone')

      frequencies.forEach((freq) => {
        const oscillator = audioContext.createOscillator()
        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime)
        oscillator.connect(gainNode)
        oscillator.start()
        oscillatorsRef.current.push(oscillator)
      })
    }

    // Smooth volume fade (300ms transition)
    if (gainNode) {
      const currentTime = audioContext.currentTime
      gainNode.gain.cancelScheduledValues(currentTime)
      gainNode.gain.setValueAtTime(gainNode.gain.value, currentTime)
      gainNode.gain.linearRampToValueAtTime(effectiveVolume, currentTime + 0.3)
    }

    // Cleanup function
    return () => {
      // Only stop oscillators if effectiveVolume is 0
      if (effectiveVolume === 0 && oscillatorsRef.current.length > 0) {
        console.log('[AmbientSound] Stopping ambient drone')

        // Fade out before stopping
        if (gainNode) {
          const currentTime = audioContext.currentTime
          gainNode.gain.cancelScheduledValues(currentTime)
          gainNode.gain.setValueAtTime(gainNode.gain.value, currentTime)
          gainNode.gain.linearRampToValueAtTime(0, currentTime + 0.3)
        }

        // Stop oscillators after fade out
        setTimeout(() => {
          oscillatorsRef.current.forEach((osc) => {
            try {
              osc.stop()
            } catch (e) {
              // Oscillator may already be stopped
            }
          })
          oscillatorsRef.current = []
        }, 350)
      }
    }
  }, [effectiveVolume])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      oscillatorsRef.current.forEach((osc) => {
        try {
          osc.stop()
        } catch (e) {
          // Oscillator may already be stopped
        }
      })
      oscillatorsRef.current = []

      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
    }
  }, [])

  // This component renders nothing - audio only
  return null
}
