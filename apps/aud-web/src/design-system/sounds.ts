/**
 * Design System - Sound Tokens
 *
 * Centralised audio feedback for totalaud.io
 * Phase 10.4: Global Design System Unification
 * Uses Web Audio API for UI sound feedback
 */

/**
 * Sound token definition
 */
export interface SoundToken {
  frequency: number // Hz
  duration: number // ms
  type: OscillatorType // 'sine' | 'square' | 'sawtooth' | 'triangle'
  volume?: number // 0-1
}

/**
 * Core UI sounds
 * Used across all themes for consistent feedback
 */
export const sounds = {
  ui: {
    confirmShort: {
      frequency: 880, // A5
      duration: 60,
      type: 'sine' as OscillatorType,
      volume: 0.2,
    },
    taskArmed: {
      frequency: 1200, // D6
      duration: 80,
      type: 'square' as OscillatorType,
      volume: 0.15,
    },
    clipFired: {
      frequency: 660, // E5
      duration: 100,
      type: 'sawtooth' as OscillatorType,
      volume: 0.2,
    },
    parseComplete: {
      frequency: 440, // A4
      duration: 120,
      type: 'triangle' as OscillatorType,
      volume: 0.25,
    },
    errorSubtle: {
      frequency: 220, // A3
      duration: 150,
      type: 'square' as OscillatorType,
      volume: 0.3,
    },
    successSoft: {
      frequency: 1760, // A6
      duration: 100,
      type: 'sine' as OscillatorType,
      volume: 0.2,
    },
  },

  /**
   * Sound timings
   */
  timings: {
    fade: 0.24, // seconds
    pulse: 0.6, // seconds
  },
} as const

/**
 * Theme-specific sound banks
 * Each theme has its own sonic personality
 */
export const themeSounds = {
  operator: {
    start: { frequency: 880, duration: 50, type: 'square' as OscillatorType, volume: 0.15 },
    complete: { frequency: 1760, duration: 60, type: 'square' as OscillatorType, volume: 0.15 },
    error: { frequency: 220, duration: 100, type: 'square' as OscillatorType, volume: 0.25 },
    click: { frequency: 1200, duration: 30, type: 'square' as OscillatorType, volume: 0.1 },
    focus: { frequency: 660, duration: 40, type: 'square' as OscillatorType, volume: 0.12 },
  },
  guide: {
    start: { frequency: 523, duration: 120, type: 'sine' as OscillatorType, volume: 0.2 },
    complete: { frequency: 1047, duration: 150, type: 'sine' as OscillatorType, volume: 0.25 },
    error: { frequency: 277, duration: 180, type: 'sine' as OscillatorType, volume: 0.3 },
    click: { frequency: 880, duration: 80, type: 'sine' as OscillatorType, volume: 0.15 },
    focus: { frequency: 659, duration: 100, type: 'sine' as OscillatorType, volume: 0.18 },
  },
  map: {
    start: { frequency: 440, duration: 100, type: 'triangle' as OscillatorType, volume: 0.2 },
    complete: { frequency: 880, duration: 120, type: 'triangle' as OscillatorType, volume: 0.22 },
    error: { frequency: 220, duration: 140, type: 'triangle' as OscillatorType, volume: 0.28 },
    click: { frequency: 660, duration: 60, type: 'triangle' as OscillatorType, volume: 0.12 },
    focus: { frequency: 554, duration: 80, type: 'triangle' as OscillatorType, volume: 0.15 },
  },
  timeline: {
    start: { frequency: 493, duration: 90, type: 'sawtooth' as OscillatorType, volume: 0.18 },
    complete: { frequency: 987, duration: 110, type: 'sawtooth' as OscillatorType, volume: 0.2 },
    error: { frequency: 246, duration: 130, type: 'sawtooth' as OscillatorType, volume: 0.25 },
    click: { frequency: 740, duration: 50, type: 'sawtooth' as OscillatorType, volume: 0.1 },
    focus: { frequency: 622, duration: 70, type: 'sawtooth' as OscillatorType, volume: 0.13 },
  },
  tape: {
    start: { frequency: 280, duration: 400, type: 'sine' as OscillatorType, volume: 0.15 },
    complete: { frequency: 560, duration: 500, type: 'sine' as OscillatorType, volume: 0.18 },
    error: { frequency: 140, duration: 600, type: 'sine' as OscillatorType, volume: 0.22 },
    click: { frequency: 420, duration: 200, type: 'sine' as OscillatorType, volume: 0.08 },
    focus: { frequency: 350, duration: 300, type: 'sine' as OscillatorType, volume: 0.1 },
  },
} as const

/**
 * Play a UI sound using Web Audio API
 *
 * @param soundToken - Sound token from sounds.ui
 * @param options - Playback options
 */
export function playSound(
  soundToken: SoundToken,
  options: {
    muted?: boolean
    calmMode?: boolean
    volume?: number
  } = {}
): void {
  // Respect mute and calm mode
  if (options.muted || options.calmMode) return

  // Check browser support
  if (typeof window === 'undefined' || !window.AudioContext) return

  try {
    const audioContext = new AudioContext()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    // Configure oscillator
    oscillator.type = soundToken.type
    oscillator.frequency.value = soundToken.frequency

    // Configure volume
    const volume = options.volume ?? soundToken.volume ?? 0.3
    gainNode.gain.value = volume

    // Connect nodes
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Play sound
    oscillator.start()
    oscillator.stop(audioContext.currentTime + soundToken.duration / 1000)

    // Clean up
    setTimeout(() => {
      oscillator.disconnect()
      gainNode.disconnect()
      audioContext.close()
    }, soundToken.duration + 100)
  } catch (error) {
    // Silently fail - don't break UI
    console.warn('[Sound] Failed to play sound:', error)
  }
}

/**
 * Play a theme-specific sound
 *
 * @param theme - Current theme
 * @param soundType - Type of sound to play
 * @param options - Playback options
 */
export function playThemeSound(
  theme: keyof typeof themeSounds,
  soundType: keyof typeof themeSounds.operator,
  options: {
    muted?: boolean
    calmMode?: boolean
    volume?: number
  } = {}
): void {
  const sound = themeSounds[theme][soundType]
  playSound(sound, options)
}

/**
 * Create sound player for a specific theme
 *
 * @param theme - Current theme
 * @param options - Default playback options
 * @returns Sound player functions
 */
export function createSoundPlayer(
  theme: keyof typeof themeSounds,
  options: {
    muted?: boolean
    calmMode?: boolean
  } = {}
) {
  return {
    start: () => playThemeSound(theme, 'start', options),
    complete: () => playThemeSound(theme, 'complete', options),
    error: () => playThemeSound(theme, 'error', options),
    click: () => playThemeSound(theme, 'click', options),
    focus: () => playThemeSound(theme, 'focus', options),
  }
}
