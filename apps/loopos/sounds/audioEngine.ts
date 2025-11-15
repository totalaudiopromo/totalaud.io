/**
 * Minimal Web Audio API sound engine for LoopOS
 * Provides simple sound feedback for UI interactions
 */

// Audio context (lazy initialization)
let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioContext
}

// Sound types
export type SoundType = 'tick' | 'complete' | 'click' | 'whoosh' | 'error'

/**
 * Play a simple sound using Web Audio API oscillators
 */
export function playSound(type: SoundType, volume: number = 0.2): void {
  try {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    // Configure sound based on type
    switch (type) {
      case 'tick':
        // Short high beep (like metronome)
        oscillator.type = 'sine'
        oscillator.frequency.value = 880 // A5
        gainNode.gain.setValueAtTime(volume, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)
        break

      case 'complete':
        // Success chord (rising)
        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(523.25, ctx.currentTime) // C5
        oscillator.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.1) // E5
        gainNode.gain.setValueAtTime(volume, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
        break

      case 'click':
        // UI click
        oscillator.type = 'square'
        oscillator.frequency.value = 440
        gainNode.gain.setValueAtTime(volume * 0.5, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03)
        break

      case 'whoosh':
        // Sweep down
        oscillator.type = 'sawtooth'
        oscillator.frequency.setValueAtTime(1200, ctx.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.2)
        gainNode.gain.setValueAtTime(volume * 0.3, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
        break

      case 'error':
        // Low buzz
        oscillator.type = 'square'
        oscillator.frequency.value = 220
        gainNode.gain.setValueAtTime(volume * 0.4, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
        break
    }

    // Connect and play
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.5)
  } catch (error) {
    // Silently fail if Web Audio is not supported
    console.warn('Audio playback failed:', error)
  }
}

/**
 * Play a simple melody (array of frequencies and durations)
 */
export function playMelody(
  notes: Array<{ frequency: number; duration: number }>,
  volume: number = 0.2
): void {
  const ctx = getAudioContext()
  let startTime = ctx.currentTime

  notes.forEach((note) => {
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.value = note.frequency

    gainNode.gain.setValueAtTime(volume, startTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration)

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.start(startTime)
    oscillator.stop(startTime + note.duration)

    startTime += note.duration
  })
}

/**
 * Initialize audio context on user interaction (required by browsers)
 */
export function initAudio(): void {
  getAudioContext()
}
