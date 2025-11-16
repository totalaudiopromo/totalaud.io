/**
 * Ambient Audio Engine - Phase 29 Pass 5
 * Web Audio API-based soundscape system
 * Synthesises all sounds procedurally (no audio files)
 */

export type EffectName =
  | 'type'
  | 'highlight'
  | 'camera-pan'
  | 'message-pop'
  | 'playhead'
  | 'click'

export class AmbientEngine {
  private audioContext: AudioContext | null = null
  private masterGain: GainNode | null = null
  private ambientOscillator: OscillatorNode | null = null
  private ambientGain: GainNode | null = null
  private ambientFilter: BiquadFilterNode | null = null
  private isMuted: boolean = false
  private currentIntensity: number = 0.5
  private isInitialised: boolean = false

  /**
   * Initialise audio context and nodes
   * Must be called after user interaction
   */
  async init(): Promise<void> {
    if (this.isInitialised) return

    try {
      // Create AudioContext
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      // Create master gain node
      this.masterGain = this.audioContext.createGain()
      this.masterGain.connect(this.audioContext.destination)

      // Check localStorage for mute state
      const storedMute = localStorage.getItem('ambient-audio-muted')
      if (storedMute === 'true') {
        this.isMuted = true
        this.masterGain.gain.value = 0
      } else {
        this.masterGain.gain.value = 0.3 // Low master volume (30%)
      }

      this.isInitialised = true
    } catch (error) {
      console.error('[AmbientEngine] Failed to initialise:', error)
    }
  }

  /**
   * Start ambient bed drone
   */
  playAmbient(intensity: number = 0.5): void {
    if (!this.audioContext || !this.masterGain) return
    if (this.ambientOscillator) return // Already playing

    try {
      // Create ambient oscillator (low drone)
      this.ambientOscillator = this.audioContext.createOscillator()
      this.ambientOscillator.type = 'sine'

      // Create filter for smoothness
      this.ambientFilter = this.audioContext.createBiquadFilter()
      this.ambientFilter.type = 'lowpass'
      this.ambientFilter.frequency.value = 200
      this.ambientFilter.Q.value = 1

      // Create gain node for ambient
      this.ambientGain = this.audioContext.createGain()
      this.ambientGain.gain.value = 0

      // Connect: oscillator → filter → gain → master
      this.ambientOscillator.connect(this.ambientFilter)
      this.ambientFilter.connect(this.ambientGain)
      this.ambientGain.connect(this.masterGain)

      // Set frequency based on intensity (80-120Hz range)
      const baseFrequency = 80
      const frequencyRange = 40
      this.ambientOscillator.frequency.value = baseFrequency + intensity * frequencyRange

      // Start oscillator
      this.ambientOscillator.start()

      // Fade in ambient over 240ms
      this.ambientGain.gain.setValueAtTime(0, this.audioContext.currentTime)
      this.ambientGain.gain.exponentialRampToValueAtTime(
        intensity * 0.15, // Very subtle (15% of intensity)
        this.audioContext.currentTime + 0.24
      )

      this.currentIntensity = intensity
    } catch (error) {
      console.error('[AmbientEngine] Failed to play ambient:', error)
    }
  }

  /**
   * Set ambient intensity (0-1)
   */
  setIntensity(level: number): void {
    if (!this.audioContext || !this.ambientGain || !this.ambientOscillator) return

    try {
      const clampedLevel = Math.max(0, Math.min(1, level))
      this.currentIntensity = clampedLevel

      const now = this.audioContext.currentTime

      // Smoothly transition volume
      this.ambientGain.gain.cancelScheduledValues(now)
      this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, now)
      this.ambientGain.gain.exponentialRampToValueAtTime(
        Math.max(0.001, clampedLevel * 0.15), // Prevent zero for exponential ramp
        now + 0.24
      )

      // Smoothly transition frequency
      const baseFrequency = 80
      const frequencyRange = 40
      const targetFrequency = baseFrequency + clampedLevel * frequencyRange

      this.ambientOscillator.frequency.cancelScheduledValues(now)
      this.ambientOscillator.frequency.setValueAtTime(this.ambientOscillator.frequency.value, now)
      this.ambientOscillator.frequency.exponentialRampToValueAtTime(targetFrequency, now + 0.24)
    } catch (error) {
      console.error('[AmbientEngine] Failed to set intensity:', error)
    }
  }

  /**
   * Play interaction sound effects
   */
  playEffect(name: EffectName): void {
    if (!this.audioContext || !this.masterGain) return

    try {
      const now = this.audioContext.currentTime

      switch (name) {
        case 'type':
          this.playTypeSound(now)
          break
        case 'highlight':
          this.playHighlightSound(now)
          break
        case 'camera-pan':
          this.playCameraPanSound(now)
          break
        case 'message-pop':
          this.playMessagePopSound(now)
          break
        case 'playhead':
          this.playPlayheadSound(now)
          break
        case 'click':
          this.playClickSound(now)
          break
      }
    } catch (error) {
      console.error('[AmbientEngine] Failed to play effect:', error)
    }
  }

  /**
   * Mute all audio
   */
  mute(): void {
    if (!this.masterGain) return

    this.isMuted = true
    localStorage.setItem('ambient-audio-muted', 'true')

    // Immediately set master gain to 0
    this.masterGain.gain.setValueAtTime(0, this.audioContext!.currentTime)
  }

  /**
   * Unmute audio
   */
  unmute(): void {
    if (!this.masterGain) return

    this.isMuted = false
    localStorage.removeItem('ambient-audio-muted')

    // Fade master gain back in over 100ms
    const now = this.audioContext!.currentTime
    this.masterGain.gain.setValueAtTime(0, now)
    this.masterGain.gain.linearRampToValueAtTime(0.3, now + 0.1)
  }

  /**
   * Stop all sounds
   */
  stopAll(): void {
    try {
      // Stop ambient oscillator
      if (this.ambientOscillator) {
        this.ambientOscillator.stop()
        this.ambientOscillator.disconnect()
        this.ambientOscillator = null
      }

      if (this.ambientGain) {
        this.ambientGain.disconnect()
        this.ambientGain = null
      }

      if (this.ambientFilter) {
        this.ambientFilter.disconnect()
        this.ambientFilter = null
      }
    } catch (error) {
      console.error('[AmbientEngine] Failed to stop all:', error)
    }
  }

  /**
   * Get current mute state
   */
  getIsMuted(): boolean {
    return this.isMuted
  }

  // ============================================================
  // Sound Synthesis Methods
  // ============================================================

  /**
   * Type sound: Short noise burst + click
   */
  private playTypeSound(startTime: number): void {
    if (!this.audioContext || !this.masterGain) return

    // Create noise buffer for felt-pad sound
    const bufferSize = this.audioContext.sampleRate * 0.02 // 20ms
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp((-i / bufferSize) * 5) // Decay envelope
    }

    const noise = this.audioContext.createBufferSource()
    noise.buffer = buffer

    const noiseGain = this.audioContext.createGain()
    noiseGain.gain.value = 0.08 // Very subtle

    noise.connect(noiseGain)
    noiseGain.connect(this.masterGain)

    noise.start(startTime)

    // Add click component
    const click = this.audioContext.createOscillator()
    click.frequency.value = 800
    click.type = 'sine'

    const clickGain = this.audioContext.createGain()
    clickGain.gain.setValueAtTime(0.05, startTime)
    clickGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.02)

    click.connect(clickGain)
    clickGain.connect(this.masterGain)

    click.start(startTime)
    click.stop(startTime + 0.02)
  }

  /**
   * Highlight sound: Hollow ping/chime
   */
  private playHighlightSound(startTime: number): void {
    if (!this.audioContext || !this.masterGain) return

    const osc = this.audioContext.createOscillator()
    osc.type = 'sine'

    const gain = this.audioContext.createGain()

    // Frequency sweep: 440Hz → 880Hz over 60ms
    osc.frequency.setValueAtTime(440, startTime)
    osc.frequency.exponentialRampToValueAtTime(880, startTime + 0.06)

    // Envelope: quick attack, gentle decay
    gain.gain.setValueAtTime(0.12, startTime)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.06)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start(startTime)
    osc.stop(startTime + 0.06)
  }

  /**
   * Camera pan sound: Filtered noise sweep
   */
  private playCameraPanSound(startTime: number): void {
    if (!this.audioContext || !this.masterGain) return

    // Create noise buffer
    const bufferSize = this.audioContext.sampleRate * 0.2 // 200ms
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const noise = this.audioContext.createBufferSource()
    noise.buffer = buffer

    // Sweeping filter
    const filter = this.audioContext.createBiquadFilter()
    filter.type = 'lowpass'
    filter.Q.value = 5
    filter.frequency.setValueAtTime(200, startTime)
    filter.frequency.exponentialRampToValueAtTime(2000, startTime + 0.2)

    const gain = this.audioContext.createGain()
    gain.gain.setValueAtTime(0.1, startTime)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(this.masterGain)

    noise.start(startTime)
  }

  /**
   * Message pop sound: Glass tink
   */
  private playMessagePopSound(startTime: number): void {
    if (!this.audioContext || !this.masterGain) return

    // Two sine waves for glass-like quality
    const osc1 = this.audioContext.createOscillator()
    osc1.frequency.value = 2000
    osc1.type = 'sine'

    const osc2 = this.audioContext.createOscillator()
    osc2.frequency.value = 3000
    osc2.type = 'sine'

    const gain = this.audioContext.createGain()
    gain.gain.setValueAtTime(0.15, startTime)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.04)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(this.masterGain)

    osc1.start(startTime)
    osc2.start(startTime)
    osc1.stop(startTime + 0.04)
    osc2.stop(startTime + 0.04)
  }

  /**
   * Playhead tick: Subtle click
   */
  private playPlayheadSound(startTime: number): void {
    if (!this.audioContext || !this.masterGain) return

    const osc = this.audioContext.createOscillator()
    osc.frequency.value = 1200
    osc.type = 'sine'

    const gain = this.audioContext.createGain()
    gain.gain.setValueAtTime(0.08, startTime)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.015)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start(startTime)
    osc.stop(startTime + 0.015)
  }

  /**
   * Click sound: Matte button click
   */
  private playClickSound(startTime: number): void {
    if (!this.audioContext || !this.masterGain) return

    // Low frequency click
    const osc = this.audioContext.createOscillator()
    osc.frequency.value = 200
    osc.type = 'sine'

    // Brief noise burst
    const bufferSize = this.audioContext.sampleRate * 0.03 // 30ms
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp((-i / bufferSize) * 8)
    }

    const noise = this.audioContext.createBufferSource()
    noise.buffer = buffer

    const gain = this.audioContext.createGain()
    gain.gain.setValueAtTime(0.1, startTime)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.03)

    osc.connect(gain)
    noise.connect(gain)
    gain.connect(this.masterGain)

    osc.start(startTime)
    noise.start(startTime)
    osc.stop(startTime + 0.03)
  }
}
