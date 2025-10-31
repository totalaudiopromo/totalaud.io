/**
 * Ambient Soundscapes
 *
 * Per-theme ambient audio loops with cross-fade support.
 * Uses Web Audio API for seamless playback and theme transitions.
 *
 * Phase 13.0: FlowCore Studio Aesthetics
 */

import type { ThemeId } from '../themes/themes'

/**
 * Ambient Audio Configuration
 */
export interface AmbientConfig {
  /** Theme identifier */
  themeId: ThemeId
  /** Audio file path (relative to /public) */
  src: string
  /** Volume level (0-1) */
  volume: number
  /** Loop duration in seconds */
  loopDuration: number
  /** LUFS target (-18 to -22) */
  lufs: number
}

/**
 * Ambient configurations for each theme
 */
export const ambientConfigs: Record<ThemeId, AmbientConfig> = {
  operator: {
    themeId: 'operator',
    src: '/assets/sound/ambient/operator.ogg',
    volume: 0.15,
    loopDuration: 8,
    lufs: -20,
  },
  guide: {
    themeId: 'guide',
    src: '/assets/sound/ambient/guide.ogg',
    volume: 0.18,
    loopDuration: 12,
    lufs: -18,
  },
  map: {
    themeId: 'map',
    src: '/assets/sound/ambient/map.ogg',
    volume: 0.14,
    loopDuration: 10,
    lufs: -22,
  },
  timeline: {
    themeId: 'timeline',
    src: '/assets/sound/ambient/timeline.ogg',
    volume: 0.16,
    loopDuration: 4, // 120 BPM = 4 beats
    lufs: -19,
  },
  tape: {
    themeId: 'tape',
    src: '/assets/sound/ambient/tape.ogg',
    volume: 0.12,
    loopDuration: 16, // Slow, warm breathing
    lufs: -20,
  },
}

/**
 * Ambient Audio Player
 * Manages playback, cross-fades, and theme transitions
 */
export class AmbientPlayer {
  private audioContext: AudioContext | null = null
  private currentSource: AudioBufferSourceNode | null = null
  private currentGain: GainNode | null = null
  private currentTheme: ThemeId | null = null
  private audioBuffers: Map<ThemeId, AudioBuffer> = new Map()
  private isMuted: boolean = false

  /**
   * Initialize audio context and preload all ambient loops
   */
  async initialize(): Promise<void> {
    // Check for reduced motion preference
    if (this.shouldReduceMotion()) {
      console.log('[AmbientPlayer] Reduced motion enabled - ambient disabled')
      return
    }

    // Create audio context
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    // Preload all ambient loops
    await Promise.all(
      Object.values(ambientConfigs).map(async (config) => {
        try {
          const response = await fetch(config.src)
          const arrayBuffer = await response.arrayBuffer()
          const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer)
          this.audioBuffers.set(config.themeId, audioBuffer)
        } catch (error) {
          console.warn(`[AmbientPlayer] Failed to load ${config.themeId} ambient:`, error)
        }
      })
    )
  }

  /**
   * Play ambient for a specific theme with cross-fade
   */
  async play(themeId: ThemeId, crossFadeDuration: number = 600): Promise<void> {
    if (!this.audioContext || this.isMuted || this.shouldReduceMotion()) {
      return
    }

    // If same theme, do nothing
    if (this.currentTheme === themeId) {
      return
    }

    const config = ambientConfigs[themeId]
    const buffer = this.audioBuffers.get(themeId)

    if (!buffer) {
      console.warn(`[AmbientPlayer] No buffer loaded for ${themeId}`)
      return
    }

    // Create new source and gain
    const newSource = this.audioContext.createBufferSource()
    const newGain = this.audioContext.createGain()

    newSource.buffer = buffer
    newSource.loop = true
    newSource.connect(newGain)
    newGain.connect(this.audioContext.destination)

    // Start at 0 volume for cross-fade
    newGain.gain.value = 0

    // Start playback
    newSource.start(0)

    // Cross-fade
    const currentTime = this.audioContext.currentTime
    const fadeDuration = crossFadeDuration / 1000

    // Fade out old source
    if (this.currentGain) {
      this.currentGain.gain.setValueAtTime(this.currentGain.gain.value, currentTime)
      this.currentGain.gain.linearRampToValueAtTime(0, currentTime + fadeDuration)
    }

    // Fade in new source
    newGain.gain.setValueAtTime(0, currentTime)
    newGain.gain.linearRampToValueAtTime(config.volume, currentTime + fadeDuration)

    // Stop old source after fade
    if (this.currentSource) {
      setTimeout(() => {
        this.currentSource?.stop()
      }, crossFadeDuration)
    }

    // Update current references
    this.currentSource = newSource
    this.currentGain = newGain
    this.currentTheme = themeId
  }

  /**
   * Stop ambient playback
   */
  stop(fadeDuration: number = 300): void {
    if (!this.audioContext || !this.currentGain) {
      return
    }

    const currentTime = this.audioContext.currentTime
    const fade = fadeDuration / 1000

    this.currentGain.gain.setValueAtTime(this.currentGain.gain.value, currentTime)
    this.currentGain.gain.linearRampToValueAtTime(0, currentTime + fade)

    setTimeout(() => {
      this.currentSource?.stop()
      this.currentSource = null
      this.currentGain = null
      this.currentTheme = null
    }, fadeDuration)
  }

  /**
   * Toggle mute state
   */
  toggleMute(): void {
    this.isMuted = !this.isMuted

    if (this.isMuted) {
      this.stop()
    } else if (this.currentTheme) {
      this.play(this.currentTheme)
    }
  }

  /**
   * Check if reduced motion is enabled
   */
  private shouldReduceMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): ThemeId | null {
    return this.currentTheme
  }

  /**
   * Check if muted
   */
  isMutedState(): boolean {
    return this.isMuted
  }
}

/**
 * Get ambient configuration for a theme
 */
export function getAmbientForTheme(themeId: ThemeId): AmbientConfig {
  return ambientConfigs[themeId]
}

/**
 * Singleton instance
 */
let ambientPlayerInstance: AmbientPlayer | null = null

/**
 * Get or create ambient player instance
 */
export function getAmbientPlayer(): AmbientPlayer {
  if (!ambientPlayerInstance) {
    ambientPlayerInstance = new AmbientPlayer()
  }
  return ambientPlayerInstance
}
