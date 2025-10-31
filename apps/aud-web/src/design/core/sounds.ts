/**
 * Sound Design Tokens
 *
 * Unified sound system providing consistent UI feedback across themes.
 * Integrates with Web Audio API for synthesised sounds.
 *
 * Philosophy:
 * - UI Sounds: Quick feedback (100-200ms)
 * - Ambient Sounds: Background atmosphere (looping)
 * - Notifications: Attention-grabbing alerts
 */

/**
 * Oscillator Types
 * Available waveforms for Web Audio API synthesis
 */
export type OscillatorType = 'sine' | 'square' | 'sawtooth' | 'triangle'

/**
 * Sound Configuration
 * Defines parameters for synthesising a sound via Web Audio API
 */
export interface SoundConfig {
  /** Waveform type */
  type: OscillatorType
  /** Frequency in Hz */
  frequency: number
  /** Duration in milliseconds */
  duration: number
  /** Volume (0-1) */
  volume: number
  /** Optional envelope for fade in/out */
  envelope?: {
    attack: number // ms
    decay: number // ms
    sustain: number // 0-1
    release: number // ms
  }
}

/**
 * UI Sound Tokens
 * Quick feedback sounds for user interactions
 */
export const uiSounds = {
  /** Button click / tap */
  click: {
    type: 'sine' as const,
    frequency: 880, // A5
    duration: 100,
    volume: 0.3,
  },

  /** Hover / focus */
  hover: {
    type: 'sine' as const,
    frequency: 440, // A4
    duration: 80,
    volume: 0.2,
  },

  /** Success confirmation */
  success: {
    type: 'sine' as const,
    frequency: 1760, // A6
    duration: 150,
    volume: 0.4,
    envelope: {
      attack: 10,
      decay: 40,
      sustain: 0.6,
      release: 100,
    },
  },

  /** Error alert */
  error: {
    type: 'square' as const,
    frequency: 220, // A3
    duration: 200,
    volume: 0.4,
  },

  /** Notification ping */
  notification: {
    type: 'triangle' as const,
    frequency: 1320, // E6
    duration: 120,
    volume: 0.35,
  },

  /** Modal open */
  modalOpen: {
    type: 'sine' as const,
    frequency: 660, // E5
    duration: 180,
    volume: 0.3,
  },

  /** Modal close */
  modalClose: {
    type: 'sine' as const,
    frequency: 440, // A4
    duration: 150,
    volume: 0.25,
  },

  /** Command execute */
  command: {
    type: 'square' as const,
    frequency: 880, // A5
    duration: 120,
    volume: 0.35,
  },

  /** Agent spawn */
  agentSpawn: {
    type: 'triangle' as const,
    frequency: 1320, // E6
    duration: 200,
    volume: 0.4,
    envelope: {
      attack: 20,
      decay: 80,
      sustain: 0.7,
      release: 100,
    },
  },
} as const

/**
 * Ambient Sound Tokens
 * Background atmospheric sounds (typically looping)
 */
export const ambientSounds = {
  /** Subtle background hum */
  hum: {
    type: 'sine' as const,
    frequency: 110, // A2
    duration: 2000,
    volume: 0.1,
  },

  /** Atmospheric pad */
  pad: {
    type: 'triangle' as const,
    frequency: 220, // A3
    duration: 4000,
    volume: 0.15,
  },

  /** Rhythmic pulse */
  pulse: {
    type: 'sine' as const,
    frequency: 55, // A1
    duration: 1000,
    volume: 0.12,
  },
} as const

/**
 * Theme-Specific Sound Overrides
 * Different themes can override base sounds with their own personality
 */
export const themeSoundOverrides = {
  operator: {
    // ASCII terminal theme uses square waves (harsher, digital)
    click: {
      type: 'square' as const,
      frequency: 880,
      duration: 100,
      volume: 0.3,
    },
    ambient: ambientSounds.hum,
  },

  guide: {
    // XP theme uses sine waves (softer, nostalgic)
    click: {
      type: 'sine' as const,
      frequency: 880,
      duration: 120,
      volume: 0.3,
    },
    ambient: ambientSounds.pad,
  },

  map: {
    // Aqua theme uses triangle waves (smooth, designer)
    click: {
      type: 'triangle' as const,
      frequency: 880,
      duration: 110,
      volume: 0.3,
    },
    ambient: ambientSounds.pad,
  },

  timeline: {
    // DAW theme uses sawtooth (producer, experimental)
    click: {
      type: 'sawtooth' as const,
      frequency: 880,
      duration: 100,
      volume: 0.3,
    },
    ambient: ambientSounds.pulse,
  },

  tape: {
    // Analogue theme uses gentle sine (warm, human)
    click: {
      type: 'sine' as const,
      frequency: 440,
      duration: 150,
      volume: 0.25,
    },
    ambient: ambientSounds.hum,
  },
} as const

/**
 * Sound Core Export
 * Central access point for all sound tokens
 */
export const soundCore = {
  ui: uiSounds,
  ambient: ambientSounds,
  themes: themeSoundOverrides,
} as const

export type SoundCore = typeof soundCore

/**
 * Utility: Play a sound using Web Audio API
 * @param config Sound configuration
 * @param context Optional AudioContext (creates new if not provided)
 */
export function playSound(config: SoundConfig, context?: AudioContext): void {
  if (typeof window === 'undefined') return // SSR guard

  const ctx = context || new AudioContext()
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.type = config.type
  oscillator.frequency.value = config.frequency

  // Apply envelope if provided
  if (config.envelope) {
    const { attack, decay, sustain, release } = config.envelope
    const now = ctx.currentTime

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(config.volume, now + attack / 1000)
    gainNode.gain.linearRampToValueAtTime(config.volume * sustain, now + (attack + decay) / 1000)
    gainNode.gain.setValueAtTime(config.volume * sustain, now + (config.duration - release) / 1000)
    gainNode.gain.linearRampToValueAtTime(0, now + config.duration / 1000)
  } else {
    gainNode.gain.value = config.volume
  }

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + config.duration / 1000)
}

/**
 * Utility: Create a reusable sound player
 * @example
 * const playClick = createSoundPlayer(soundCore.ui.click)
 * playClick() // Play click sound
 */
export function createSoundPlayer(config: SoundConfig): () => void {
  let audioContext: AudioContext | null = null

  return () => {
    if (typeof window === 'undefined') return

    if (!audioContext) {
      audioContext = new AudioContext()
    }

    playSound(config, audioContext)
  }
}
