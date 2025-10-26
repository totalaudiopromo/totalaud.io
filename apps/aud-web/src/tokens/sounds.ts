/**
 * Sound Tokens - Centralised Audio Feedback
 *
 * Theme System Anti-Gimmick Refactor
 * All UI sounds use these standardised definitions.
 * Respects Calm Mode and user's sound muted preference.
 */

/**
 * Sound token definition
 */
export interface SoundToken {
  frequency: number // Hz
  duration: number // ms
  type: OscillatorType // 'sine' | 'square' | 'sawtooth' | 'triangle'
  volume?: number // 0-1, default 0.3
}

/**
 * Core sound tokens used across all themes
 */
export const soundTokens = {
  'confirm-short': {
    frequency: 880, // A5
    duration: 60,
    type: 'sine' as OscillatorType,
    volume: 0.2,
  },
  'task-armed': {
    frequency: 1200, // D6
    duration: 80,
    type: 'square' as OscillatorType,
    volume: 0.15,
  },
  'clip-fired': {
    frequency: 660, // E5
    duration: 100,
    type: 'sawtooth' as OscillatorType,
    volume: 0.2,
  },
  'parse-complete': {
    frequency: 440, // A4
    duration: 120,
    type: 'triangle' as OscillatorType,
    volume: 0.25,
  },
  'error-subtle': {
    frequency: 220, // A3
    duration: 150,
    type: 'square' as OscillatorType,
    volume: 0.3,
  },
  'success-soft': {
    frequency: 1760, // A6
    duration: 100,
    type: 'sine' as OscillatorType,
    volume: 0.2,
  },
} as const

/**
 * Theme-specific sound banks
 * Each theme can have its own sound palette
 */
export const themeSoundBanks = {
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
 * Play a sound token using Web Audio API
 *
 * @param soundId - The sound token ID or custom sound definition
 * @param options - Playback options
 */
export function playSound(
  soundId: keyof typeof soundTokens | SoundToken,
  options: {
    muted?: boolean
    calmMode?: boolean
    volume?: number
  } = {}
): void {
  // Respect mute and calm mode
  if (options.muted || options.calmMode) return

  // Check if browser supports Web Audio API
  if (typeof window === 'undefined' || !window.AudioContext) return

  try {
    const audioContext = new AudioContext()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    // Get sound definition
    const sound: SoundToken =
      typeof soundId === 'string' ? soundTokens[soundId] : soundId

    // Configure oscillator
    oscillator.type = sound.type
    oscillator.frequency.value = sound.frequency

    // Configure gain (volume)
    const volume = options.volume ?? sound.volume ?? 0.3
    gainNode.gain.value = volume

    // Connect nodes
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Play sound
    oscillator.start()
    oscillator.stop(audioContext.currentTime + sound.duration / 1000)

    // Clean up after sound finishes
    setTimeout(() => {
      oscillator.disconnect()
      gainNode.disconnect()
      audioContext.close()
    }, sound.duration + 100)
  } catch (error) {
    // Silently fail - don't break UI for sound errors
    console.warn('[Sound] Failed to play sound:', error)
  }
}

/**
 * Play a theme-specific sound
 *
 * @param theme - The current theme
 * @param soundType - The type of sound to play
 * @param options - Playback options
 */
export function playThemeSound(
  theme: keyof typeof themeSoundBanks,
  soundType: keyof typeof themeSoundBanks.operator,
  options: {
    muted?: boolean
    calmMode?: boolean
    volume?: number
  } = {}
): void {
  const sound = themeSoundBanks[theme][soundType]
  playSound(sound, options)
}

/**
 * Create a sound player hook for use in components
 *
 * @param theme - The current theme
 * @param options - Default playback options
 * @returns Sound player functions
 */
export function createSoundPlayer(
  theme: keyof typeof themeSoundBanks,
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
    custom: (soundId: keyof typeof soundTokens) => playSound(soundId, options),
  }
}
