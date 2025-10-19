/**
 * Sound Synthesis Engine
 * All sounds are generated programmatically via Web Audio API
 * No copyrighted samples - 100% custom synthesis
 */

import type { SoundConfig } from './types'

class AudioEngine {
  private context: AudioContext | null = null
  private enabled: boolean = true
  private volume: number = 0.3

  getContext(): AudioContext {
    if (!this.context) {
      this.context = new AudioContext()
    }
    return this.context
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume))
  }

  /**
   * Play a synthesized sound based on config
   */
  async play(config: SoundConfig): Promise<void> {
    if (!this.enabled) return

    const ctx = this.getContext()
    
    // Resume context if suspended (required for user interaction)
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }

    const now = ctx.currentTime

    if (config.type === 'synth') {
      this.playSynth(config, now)
    } else if (config.type === 'noise') {
      this.playNoise(config, now)
    } else if (config.type === 'sample' && config.samplePath) {
      await this.playSample(config.samplePath)
    }
  }

  private playSynth(config: SoundConfig, startTime: number) {
    const ctx = this.getContext()
    
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    // Configure oscillator
    osc.type = config.waveform || 'sine'
    osc.frequency.value = config.frequency || 440
    
    // Configure envelope (ADSR)
    const envelope = config.envelope || { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.1 }
    const duration = (config.duration || 200) / 1000 // Convert ms to seconds
    
    // Attack
    gain.gain.setValueAtTime(0, startTime)
    gain.gain.linearRampToValueAtTime(
      this.volume,
      startTime + envelope.attack
    )
    
    // Decay to sustain
    gain.gain.linearRampToValueAtTime(
      this.volume * envelope.sustain,
      startTime + envelope.attack + envelope.decay
    )
    
    // Hold sustain
    const releaseStart = startTime + duration - envelope.release
    gain.gain.setValueAtTime(
      this.volume * envelope.sustain,
      releaseStart
    )
    
    // Release
    gain.gain.linearRampToValueAtTime(
      0,
      releaseStart + envelope.release
    )
    
    // Connect and play
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.start(startTime)
    osc.stop(releaseStart + envelope.release)
  }

  private playNoise(config: SoundConfig, startTime: number) {
    const ctx = this.getContext()
    
    // Create noise buffer
    const bufferSize = ctx.sampleRate * 2 // 2 seconds of noise
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    
    const noiseType = config.noiseType || 'white'
    
    if (noiseType === 'white') {
      // White noise - equal power across all frequencies
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }
    } else if (noiseType === 'pink') {
      // Pink noise - 1/f power spectrum
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        b0 = 0.99886 * b0 + white * 0.0555179
        b1 = 0.99332 * b1 + white * 0.0750759
        b2 = 0.96900 * b2 + white * 0.1538520
        b3 = 0.86650 * b3 + white * 0.3104856
        b4 = 0.55000 * b4 + white * 0.5329522
        b5 = -0.7616 * b5 - white * 0.0168980
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362
        data[i] *= 0.11 // Compensation
        b6 = white * 0.115926
      }
    } else if (noiseType === 'brown') {
      // Brown noise - 1/f² power spectrum
      let lastOut = 0
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        data[i] = (lastOut + (0.02 * white)) / 1.02
        lastOut = data[i]
        data[i] *= 3.5 // Compensation
      }
    }
    
    const source = ctx.createBufferSource()
    const gain = ctx.createGain()
    
    source.buffer = buffer
    source.loop = config.duration ? config.duration > 2000 : false
    
    // Apply envelope
    const envelope = config.envelope || { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.1 }
    const duration = (config.duration || 200) / 1000
    
    gain.gain.setValueAtTime(0, startTime)
    gain.gain.linearRampToValueAtTime(this.volume * 0.3, startTime + envelope.attack)
    
    const releaseStart = startTime + duration - envelope.release
    gain.gain.setValueAtTime(this.volume * 0.3, releaseStart)
    gain.gain.linearRampToValueAtTime(0, releaseStart + envelope.release)
    
    source.connect(gain)
    gain.connect(ctx.destination)
    
    source.start(startTime)
    source.stop(releaseStart + envelope.release)
  }

  private async playSample(path: string) {
    const ctx = this.getContext()
    
    try {
      const response = await fetch(path)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
      
      const source = ctx.createBufferSource()
      const gain = ctx.createGain()
      
      source.buffer = audioBuffer
      gain.gain.value = this.volume
      
      source.connect(gain)
      gain.connect(ctx.destination)
      
      source.start(0)
    } catch (error) {
      console.warn('Failed to load audio sample:', path, error)
    }
  }

  /**
   * Play a chord (multiple notes)
   */
  async playChord(frequencies: number[], duration: number = 400) {
    if (!this.enabled) return

    const ctx = this.getContext()
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }

    const now = ctx.currentTime
    const durationSec = duration / 1000

    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.type = 'sine'
      osc.frequency.value = freq
      
      // Stagger attack slightly for each note
      const attackOffset = index * 0.02
      gain.gain.setValueAtTime(0, now + attackOffset)
      gain.gain.linearRampToValueAtTime(this.volume / frequencies.length, now + attackOffset + 0.05)
      gain.gain.setValueAtTime(this.volume / frequencies.length, now + durationSec - 0.1)
      gain.gain.linearRampToValueAtTime(0, now + durationSec)
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      osc.start(now + attackOffset)
      osc.stop(now + durationSec)
    })
  }
}

// Singleton instance
export const audioEngine = new AudioEngine()

/**
 * Convenience functions for common UI sounds
 */
export const sounds = {
  click: () => audioEngine.play({
    type: 'synth',
    waveform: 'sine',
    frequency: 1200,
    duration: 50,
    envelope: { attack: 0.001, decay: 0.02, sustain: 0, release: 0.01 }
  }),

  success: () => audioEngine.playChord([523.25, 659.25, 783.99], 300), // C-E-G major

  error: () => audioEngine.play({
    type: 'synth',
    waveform: 'sawtooth',
    frequency: 220,
    duration: 300,
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.1 }
  }),

  setEnabled: (enabled: boolean) => audioEngine.setEnabled(enabled),
  setVolume: (volume: number) => audioEngine.setVolume(volume)
}

/**
 * Agent-Specific Sound Cues
 * Each agent has unique audio signatures for start, complete, and error states
 */
export const agentSounds = {
  /**
   * Broker - The Conductor
   * Warm, coordinating, professional
   */
  broker: {
    start: () => audioEngine.play({
      type: 'synth',
      waveform: 'sine',
      frequency: 220, // A3 - deep, authoritative
      duration: 300,
      envelope: { attack: 0.1, decay: 0.1, sustain: 0.5, release: 0.2 }
    }),
    complete: () => audioEngine.play({
      type: 'synth',
      waveform: 'sine',
      frequency: 440, // A4 - resolution
      duration: 150,
      envelope: { attack: 0.01, decay: 0.05, sustain: 0.3, release: 0.1 }
    }),
    error: () => audioEngine.play({
      type: 'synth',
      waveform: 'sawtooth',
      frequency: 185, // F#3 - dissonant
      duration: 400,
      envelope: { attack: 0.02, decay: 0.15, sustain: 0.2, release: 0.15 }
    })
  },

  /**
   * Scout - The Explorer
   * Bright, optimistic, searching
   */
  scout: {
    start: () => audioEngine.play({
      type: 'synth',
      waveform: 'triangle',
      frequency: 880, // A5 - bright, alert
      duration: 200,
      envelope: { attack: 0.01, decay: 0.05, sustain: 0.4, release: 0.1 }
    }),
    complete: () => audioEngine.playChord([880, 1046.5], 200), // A5-C6 - discovery
    error: () => audioEngine.play({
      type: 'synth',
      waveform: 'square',
      frequency: 740, // F#5 - searching failed
      duration: 300,
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.1 }
    })
  },

  /**
   * Coach - The Mentor
   * Supportive, confident, guiding
   */
  coach: {
    start: () => audioEngine.playChord([523.25, 659.25], 300), // C5-E5 - supportive interval
    complete: () => audioEngine.playChord([523.25, 659.25, 783.99], 400), // C5-E5-G5 - major chord success
    error: () => audioEngine.play({
      type: 'synth',
      waveform: 'sine',
      frequency: 494, // B4 - encouraging but incomplete
      duration: 400,
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.2 }
    })
  },

  /**
   * Tracker - The Analyst
   * Steady, rhythmic, precise
   */
  tracker: {
    start: () => {
      // Pulse rhythm - 120 BPM
      const ctx = audioEngine.getContext()
      const now = ctx.currentTime
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          audioEngine.play({
            type: 'synth',
            waveform: 'square',
            frequency: 330, // E4 - steady pulse
            duration: 100,
            envelope: { attack: 0.001, decay: 0.02, sustain: 0.3, release: 0.05 }
          })
        }, i * 250) // 240ms between pulses
      }
    },
    complete: () => audioEngine.play({
      type: 'synth',
      waveform: 'square',
      frequency: 440, // A4 - completion beep
      duration: 200,
      envelope: { attack: 0.001, decay: 0.05, sustain: 0.4, release: 0.1 }
    }),
    error: () => audioEngine.play({
      type: 'synth',
      waveform: 'square',
      frequency: 220, // A3 - low error beep
      duration: 300,
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.1 }
    })
  },

  /**
   * Insight - The Visionary
   * Ethereal, harmonic, thoughtful
   */
  insight: {
    start: () => {
      // Soft pad - multiple harmonics
      audioEngine.playChord([261.63, 329.63, 392.00, 523.25], 600) // C4-E4-G4-C5 harmonic series
    },
    complete: () => {
      // Harmonic sweep upward
      const frequencies = [261.63, 293.66, 329.63, 349.23, 392.00] // C-D-E-F-G ascending
      frequencies.forEach((freq, i) => {
        setTimeout(() => {
          audioEngine.play({
            type: 'synth',
            waveform: 'sine',
            frequency: freq,
            duration: 100,
            envelope: { attack: 0.01, decay: 0.05, sustain: 0.3, release: 0.1 }
          })
        }, i * 80)
      })
    },
    error: () => audioEngine.playChord([261.63, 277.18], 400) // C4-C#4 - dissonant minor 2nd
  }
}

/**
 * Helper function to play agent sound cues
 */
export const playAgentSound = (
  agentId: 'broker' | 'scout' | 'coach' | 'tracker' | 'insight',
  action: 'start' | 'complete' | 'error'
) => {
  const agent = agentSounds[agentId]
  if (agent && agent[action]) {
    agent[action]()
  }
}

