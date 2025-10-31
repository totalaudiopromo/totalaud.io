/**
 * useScrollSound - Progressive Audio Layer
 *
 * Adds evolving sound layers as user scrolls through landing page.
 * Subtle WebAudio pings (-18 LUFS max) with 1-2s decay.
 * Tied to sound mute state, respects user preferences.
 *
 * Sound milestones:
 * - Hero (0-20%): Ambient base tone
 * - Proof section (20-40%): Add harmonic layer
 * - Demo section (40-60%): Add rhythm layer
 * - Close (60-100%): Full ambient soundscape
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import { MotionValue } from 'framer-motion'

interface UseScrollSoundOptions {
  scrollProgress: MotionValue<number>
  isMuted: boolean
}

export function useScrollSound({ scrollProgress, isMuted }: UseScrollSoundOptions) {
  const audioContextRef = useRef<AudioContext | null>(null)
  const [layersPlayed, setLayersPlayed] = useState({
    hero: false,
    proof: false,
    demo: false,
    close: false,
  })

  // Initialize Web Audio API on first interaction
  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
    }

    window.addEventListener('click', initAudio, { once: true })
    return () => window.removeEventListener('click', initAudio)
  }, [])

  // Play subtle tone at specific frequency
  const playTone = (frequency: number, duration: number = 1.5) => {
    if (isMuted || !audioContextRef.current) return

    const ctx = audioContextRef.current
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.value = frequency
    oscillator.type = 'sine' // Calm, pure tone

    // LUFS -18 (very subtle)
    const maxGain = 0.08

    // Smooth fade in/out
    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(maxGain, ctx.currentTime + 0.1)
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
  }

  // Listen to scroll progress and trigger sound layers
  useEffect(() => {
    const unsubscribe = scrollProgress.on('change', (progress) => {
      // Hero milestone (0-20%)
      if (progress > 0.05 && !layersPlayed.hero) {
        playTone(220, 2) // A3 - base ambient tone
        setLayersPlayed((prev) => ({ ...prev, hero: true }))
      }

      // Proof section milestone (20-40%)
      if (progress > 0.25 && !layersPlayed.proof) {
        playTone(440, 1.5) // A4 - harmonic layer
        setLayersPlayed((prev) => ({ ...prev, proof: true }))
      }

      // Demo section milestone (40-60%)
      if (progress > 0.45 && !layersPlayed.demo) {
        playTone(660, 1.5) // E5 - rhythm layer
        setLayersPlayed((prev) => ({ ...prev, demo: true }))
      }

      // Close milestone (60-100%)
      if (progress > 0.65 && !layersPlayed.close) {
        playTone(880, 2) // A5 - full ambient
        setLayersPlayed((prev) => ({ ...prev, close: true }))
      }
    })

    return () => unsubscribe()
  }, [scrollProgress, layersPlayed, isMuted])

  // Reset layers when user scrolls back to top
  useEffect(() => {
    const unsubscribe = scrollProgress.on('change', (progress) => {
      if (progress < 0.05) {
        setLayersPlayed({
          hero: false,
          proof: false,
          demo: false,
          close: false,
        })
      }
    })

    return () => unsubscribe()
  }, [scrollProgress])

  return {
    layersPlayed,
  }
}
