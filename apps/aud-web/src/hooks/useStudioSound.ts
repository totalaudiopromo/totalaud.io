/**
 * useStudioSound Hook
 *
 * Provides sound configuration and playback for each Studio.
 * Each Studio has distinct ambient loops and UI sound effects.
 *
 * Phase 6: Enhancements - Sound & Feedback Layer
 */

import { useEffect, useRef, useCallback } from 'react'

export interface StudioSoundConfig {
  /** Ambient loop audio file */
  ambientLoop: string | null

  /** UI sound effects */
  uiSounds: {
    spawn: string | null
    execute: string | null
    complete: string | null
    error: string | null
    interact: string | null
  }

  /** Master volume (-40 to 0 dB, recommended -30) */
  volume: number

  /** Ambient loop volume multiplier (0-1) */
  ambientVolume: number

  /** UI sounds volume multiplier (0-1) */
  uiVolume: number
}

const SOUND_CONFIGS: Record<string, StudioSoundConfig> = {
  ascii: {
    ambientLoop: null, // Low hum + key clack (to be added)
    uiSounds: {
      spawn: null,
      execute: null,
      complete: null,
      error: null,
      interact: null, // Key click sound
    },
    volume: -30,
    ambientVolume: 0.3,
    uiVolume: 0.5,
  },

  xp: {
    ambientLoop: null, // Soft pop + bell (to be added)
    uiSounds: {
      spawn: null,
      execute: null,
      complete: null, // Chord progression
      error: null,
      interact: null, // UI pop
    },
    volume: -30,
    ambientVolume: 0.4,
    uiVolume: 0.6,
  },

  aqua: {
    ambientLoop: null, // Glassy water hum (to be added)
    uiSounds: {
      spawn: null,
      execute: null, // Swell
      complete: null,
      error: null,
      interact: null, // Droplet
    },
    volume: -32,
    ambientVolume: 0.25,
    uiVolume: 0.4,
  },

  daw: {
    ambientLoop: null, // Sub-bass metronome 120 BPM (to be added)
    uiSounds: {
      spawn: null,
      execute: null,
      complete: null, // Chord hit
      error: null,
      interact: null, // Tap sound
    },
    volume: -28,
    ambientVolume: 0.5,
    uiVolume: 0.7,
  },

  analogue: {
    ambientLoop: null, // Vinyl crackle (to be added)
    uiSounds: {
      spawn: null,
      execute: null,
      complete: null,
      error: null,
      interact: null, // Pen scratch
    },
    volume: -32,
    ambientVolume: 0.3,
    uiVolume: 0.4,
  },
}

/**
 * Hook for managing Studio audio
 */
export function useStudioSound(theme: string) {
  const config = SOUND_CONFIGS[theme] || SOUND_CONFIGS.ascii
  const ambientRef = useRef<HTMLAudioElement | null>(null)
  const contextRef = useRef<AudioContext | null>(null)

  // Initialize audio context
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (!contextRef.current) {
      contextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    return () => {
      if (contextRef.current?.state === 'running') {
        contextRef.current.suspend()
      }
    }
  }, [])

  // Play ambient loop
  const playAmbient = useCallback(() => {
    if (!config.ambientLoop || typeof window === 'undefined') return

    if (!ambientRef.current) {
      ambientRef.current = new Audio(config.ambientLoop)
      ambientRef.current.loop = true
      ambientRef.current.volume = config.ambientVolume
    }

    ambientRef.current.play().catch((err) => {
      console.log('[StudioSound] Ambient playback blocked:', err)
    })
  }, [config.ambientLoop, config.ambientVolume])

  // Stop ambient loop
  const stopAmbient = useCallback(() => {
    if (ambientRef.current) {
      ambientRef.current.pause()
      ambientRef.current.currentTime = 0
    }
  }, [])

  // Crossfade to new ambient (when switching Studios)
  const crossfadeAmbient = useCallback(
    (newTheme: string, duration = 1500) => {
      const newConfig = SOUND_CONFIGS[newTheme]
      if (!newConfig?.ambientLoop) {
        stopAmbient()
        return
      }

      // Fade out current
      if (ambientRef.current) {
        const fadeOutInterval = setInterval(() => {
          if (ambientRef.current && ambientRef.current.volume > 0.01) {
            ambientRef.current.volume -= 0.05
          } else {
            clearInterval(fadeOutInterval)
            stopAmbient()

            // Fade in new
            ambientRef.current = new Audio(newConfig.ambientLoop!)
            ambientRef.current.loop = true
            ambientRef.current.volume = 0
            ambientRef.current.play()

            const fadeInInterval = setInterval(() => {
              if (ambientRef.current && ambientRef.current.volume < newConfig.ambientVolume) {
                ambientRef.current.volume += 0.05
              } else {
                clearInterval(fadeInInterval)
              }
            }, duration / 20)
          }
        }, duration / 20)
      }
    },
    [stopAmbient]
  )

  // Play UI sound effect
  const playSound = useCallback(
    (type: keyof StudioSoundConfig['uiSounds']) => {
      const soundFile = config.uiSounds[type]
      if (!soundFile || typeof window === 'undefined') return

      const audio = new Audio(soundFile)
      audio.volume = config.uiVolume
      audio.play().catch((err) => {
        console.log(`[StudioSound] ${type} sound blocked:`, err)
      })
    },
    [config.uiSounds, config.uiVolume]
  )

  // Generate procedural sound (for prototyping without audio files)
  const playProceduralSound = useCallback(
    (frequency: number, duration: number, type: OscillatorType = 'sine') => {
      if (!contextRef.current || typeof window === 'undefined') return

      const ctx = contextRef.current
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.type = type
      oscillator.frequency.value = frequency

      gainNode.gain.setValueAtTime(config.uiVolume * 0.3, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + duration)
    },
    [config.uiVolume]
  )

  return {
    config,
    playAmbient,
    stopAmbient,
    crossfadeAmbient,
    playSound,
    playProceduralSound,
  }
}

/**
 * Studio-specific procedural sound profiles
 *
 * Phase 2: Motion-Synced Audio
 * Durations now match motion system for unified feel (< 50ms variance target)
 *
 * Motion durations from /lib/motion.ts:
 * - ascii: 0.12s (snap)
 * - xp: 0.4s (normal)
 * - aqua: 0.6s (smooth)
 * - daw: 0.5s (beat)
 * - analogue: 0.8s (slow)
 */
export const STUDIO_SOUND_PROFILES = {
  ascii: {
    interact: { frequency: 880, duration: 0.12, type: 'square' as OscillatorType }, // Synced with snap motion
    execute: { frequency: 1760, duration: 0.12, type: 'square' as OscillatorType }, // Instant response
    complete: { frequency: 440, duration: 0.12, type: 'square' as OscillatorType }, // Sharp completion
  },
  xp: {
    interact: { frequency: 523, duration: 0.24, type: 'sine' as OscillatorType }, // Synced with fast motion
    execute: { frequency: 659, duration: 0.4, type: 'sine' as OscillatorType }, // Bouncy normal motion
    complete: { frequency: 784, duration: 0.4, type: 'sine' as OscillatorType }, // Playful completion
  },
  aqua: {
    interact: { frequency: 698, duration: 0.4, type: 'triangle' as OscillatorType }, // Synced with normal motion
    execute: { frequency: 831, duration: 0.6, type: 'triangle' as OscillatorType }, // Smooth dissolve
    complete: { frequency: 988, duration: 0.6, type: 'triangle' as OscillatorType }, // Fluid completion
  },
  daw: {
    interact: { frequency: 440, duration: 0.24, type: 'sawtooth' as OscillatorType }, // Synced with fast motion
    execute: { frequency: 554, duration: 0.5, type: 'sawtooth' as OscillatorType }, // Tempo-locked (120 BPM)
    complete: { frequency: 659, duration: 0.5, type: 'sawtooth' as OscillatorType }, // Rhythmic completion
  },
  analogue: {
    interact: { frequency: 280, duration: 0.6, type: 'sine' as OscillatorType }, // Synced with smooth motion
    execute: { frequency: 330, duration: 0.8, type: 'sine' as OscillatorType }, // Gentle drift
    complete: { frequency: 392, duration: 0.8, type: 'sine' as OscillatorType }, // Warm completion
  },
}
