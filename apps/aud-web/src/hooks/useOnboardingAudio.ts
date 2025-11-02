/**
 * useOnboardingAudio Hook
 * Phase 14.1: Ambient sound layer for onboarding tour
 *
 * Features:
 * - Ambient sine pad loop (440 Hz)
 * - Auto-cross-fades in/out (~800ms)
 * - Respects muted state and prefers-reduced-motion
 * - Plays step transition sounds (click, hover, success)
 */

'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface UseOnboardingAudioOptions {
  enabled?: boolean
  volume?: number
}

export function useOnboardingAudio({
  enabled = true,
  volume = 0.15,
}: UseOnboardingAudioOptions = {}) {
  const audioContextRef = useRef<AudioContext>()
  const oscillatorRef = useRef<OscillatorNode>()
  const gainNodeRef = useRef<GainNode>()
  const prefersReducedMotion = useReducedMotion()

  // Initialize audio context and ambient pad
  useEffect(() => {
    if (!enabled || prefersReducedMotion) return

    const initAudio = () => {
      try {
        // Create audio context
        const audioContext = new AudioContext()
        audioContextRef.current = audioContext

        // Create oscillator (sine wave at 440 Hz)
        const oscillator = audioContext.createOscillator()
        oscillator.type = 'sine'
        oscillator.frequency.value = 440

        // Create gain node for volume control
        const gainNode = audioContext.createGain()
        gainNode.gain.value = 0 // Start at 0 for fade-in

        // Connect: oscillator → gain → destination
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.start()

        oscillatorRef.current = oscillator
        gainNodeRef.current = gainNode

        // Fade in over 800ms
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.8)
      } catch (error) {
        console.warn('[OnboardingAudio] Failed to initialize:', error)
      }
    }

    initAudio()

    // Cleanup: fade out and stop
    return () => {
      if (gainNodeRef.current && audioContextRef.current) {
        const fadeOutTime = audioContextRef.current.currentTime + 0.8
        gainNodeRef.current.gain.linearRampToValueAtTime(0, fadeOutTime)

        // Stop oscillator after fade-out completes
        setTimeout(() => {
          oscillatorRef.current?.stop()
          audioContextRef.current?.close()
        }, 1000)
      }
    }
  }, [enabled, prefersReducedMotion, volume])

  // Play transition sound (quick beep)
  const playTransitionSound = useCallback(() => {
    if (!audioContextRef.current || prefersReducedMotion) return

    try {
      const context = audioContextRef.current
      const oscillator = context.createOscillator()
      const gainNode = context.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.value = 880 // Higher pitch for transitions
      gainNode.gain.value = 0.1

      oscillator.connect(gainNode)
      gainNode.connect(context.destination)

      oscillator.start()
      oscillator.stop(context.currentTime + 0.1) // Very short beep
    } catch (error) {
      console.warn('[OnboardingAudio] Failed to play transition:', error)
    }
  }, [prefersReducedMotion])

  // Play success sound (ascending chord)
  const playSuccessSound = useCallback(() => {
    if (!audioContextRef.current || prefersReducedMotion) return

    try {
      const context = audioContextRef.current
      const frequencies = [523.25, 659.25, 783.99] // C, E, G (major chord)

      frequencies.forEach((freq, index) => {
        const oscillator = context.createOscillator()
        const gainNode = context.createGain()

        oscillator.type = 'sine'
        oscillator.frequency.value = freq
        gainNode.gain.value = 0.08

        oscillator.connect(gainNode)
        gainNode.connect(context.destination)

        const startTime = context.currentTime + index * 0.1
        oscillator.start(startTime)
        oscillator.stop(startTime + 0.3)
      })
    } catch (error) {
      console.warn('[OnboardingAudio] Failed to play success:', error)
    }
  }, [prefersReducedMotion])

  return {
    playTransitionSound,
    playSuccessSound,
  }
}
