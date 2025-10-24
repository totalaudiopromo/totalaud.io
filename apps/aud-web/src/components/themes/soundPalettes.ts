/**
 * Sound Palettes - Procedural Audio per Theme
 *
 * Each theme has unique sound DNA using Web Audio API.
 * No audio files needed - all sounds generated procedurally.
 */

export interface SoundProfile {
  ambient: {
    type: OscillatorType
    frequency: number
    gain: number
    duration: number
  }
  interact: {
    type: OscillatorType
    frequency: number
    gain: number
    duration: number
  }
  success: {
    type: OscillatorType
    frequency: number
    gain: number
    duration: number
  }
  error: {
    type: OscillatorType
    frequency: number
    gain: number
    duration: number
  }
  focus: {
    type: OscillatorType
    frequency: number
    gain: number
    duration: number
  }
}

export const soundPalettes: Record<string, SoundProfile> = {
  ascii: {
    ambient: { type: 'square', frequency: 220, gain: 0.1, duration: 100 },
    interact: { type: 'square', frequency: 880, gain: 0.15, duration: 50 },
    success: { type: 'square', frequency: 1760, gain: 0.2, duration: 120 },
    error: { type: 'square', frequency: 110, gain: 0.25, duration: 200 },
    focus: { type: 'square', frequency: 440, gain: 0.12, duration: 30 },
  },
  xp: {
    ambient: { type: 'sine', frequency: 261, gain: 0.08, duration: 150 },
    interact: { type: 'sine', frequency: 523, gain: 0.12, duration: 100 },
    success: { type: 'sine', frequency: 784, gain: 0.18, duration: 240 },
    error: { type: 'sine', frequency: 196, gain: 0.2, duration: 300 },
    focus: { type: 'sine', frequency: 392, gain: 0.1, duration: 80 },
  },
  aqua: {
    ambient: { type: 'triangle', frequency: 349, gain: 0.06, duration: 200 },
    interact: { type: 'triangle', frequency: 698, gain: 0.1, duration: 150 },
    success: { type: 'triangle', frequency: 1047, gain: 0.15, duration: 400 },
    error: { type: 'triangle', frequency: 174, gain: 0.18, duration: 350 },
    focus: { type: 'triangle', frequency: 523, gain: 0.08, duration: 100 },
  },
  daw: {
    ambient: { type: 'sawtooth', frequency: 220, gain: 0.12, duration: 250 },
    interact: { type: 'sawtooth', frequency: 440, gain: 0.15, duration: 125 },
    success: { type: 'sawtooth', frequency: 880, gain: 0.2, duration: 500 },
    error: { type: 'sawtooth', frequency: 110, gain: 0.22, duration: 500 },
    focus: { type: 'sawtooth', frequency: 330, gain: 0.1, duration: 62 },
  },
  analogue: {
    ambient: { type: 'sine', frequency: 140, gain: 0.05, duration: 300 },
    interact: { type: 'sine', frequency: 280, gain: 0.08, duration: 200 },
    success: { type: 'sine', frequency: 420, gain: 0.12, duration: 600 },
    error: { type: 'sine', frequency: 98, gain: 0.15, duration: 700 },
    focus: { type: 'sine', frequency: 210, gain: 0.06, duration: 150 },
  },
}

/**
 * Play themed sound using Web Audio API
 */
export function playSound(
  themeName: string,
  soundType: keyof SoundProfile,
  userMuted: boolean = false
): void {
  if (userMuted || typeof window === 'undefined') return

  const profile = soundPalettes[themeName]
  if (!profile) return

  const sound = profile[soundType]
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.type = sound.type
  oscillator.frequency.value = sound.frequency

  gainNode.gain.setValueAtTime(sound.gain, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration / 1000)

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + sound.duration / 1000)
}
