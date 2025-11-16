/**
 * Showreel Player
 * Phase 17: Campaign Performance Playback - Headless playback controller
 */

import type { PerformanceClock } from '@totalaud/performance'
import type { ShowreelScript, ShowreelScene } from './showreelTypes'

/**
 * Showreel player state
 */
export interface ShowreelPlayerState {
  script: ShowreelScript
  isPlaying: boolean
  currentSceneIndex: number
  sceneElapsedSeconds: number
  totalElapsedSeconds: number
}

/**
 * Player state listener
 */
export type ShowreelPlayerListener = (state: ShowreelPlayerState) => void

/**
 * Showreel Player
 * Drives showreel playback using PerformanceClock as timing source
 */
export class ShowreelPlayer {
  private state: ShowreelPlayerState
  private listeners: Set<ShowreelPlayerListener>
  private clock: PerformanceClock
  private clockUnsubscribe: (() => void) | null = null
  private lastTickTime: number = 0

  constructor(script: ShowreelScript, clock: PerformanceClock) {
    this.clock = clock
    this.listeners = new Set()
    this.state = {
      script,
      isPlaying: false,
      currentSceneIndex: 0,
      sceneElapsedSeconds: 0,
      totalElapsedSeconds: 0,
    }
  }

  /**
   * Start playback
   */
  play(): void {
    if (this.state.isPlaying) return

    this.state.isPlaying = true
    this.lastTickTime = performance.now()

    // Subscribe to clock for timing
    this.clockUnsubscribe = this.clock.subscribe(() => {
      this.onClockTick()
    })

    // Start clock if not already running
    this.clock.start()

    this.notify()
  }

  /**
   * Pause playback
   */
  pause(): void {
    if (!this.state.isPlaying) return

    this.state.isPlaying = false

    if (this.clockUnsubscribe) {
      this.clockUnsubscribe()
      this.clockUnsubscribe = null
    }

    this.notify()
  }

  /**
   * Stop playback and reset to beginning
   */
  stop(): void {
    this.pause()

    this.state.currentSceneIndex = 0
    this.state.sceneElapsedSeconds = 0
    this.state.totalElapsedSeconds = 0

    this.notify()
  }

  /**
   * Jump to specific scene
   */
  goToScene(index: number): void {
    if (index < 0 || index >= this.state.script.scenes.length) {
      return
    }

    // Calculate total elapsed time up to this scene
    let totalElapsed = 0
    for (let i = 0; i < index; i++) {
      totalElapsed += this.state.script.scenes[i].durationSeconds
    }

    this.state.currentSceneIndex = index
    this.state.sceneElapsedSeconds = 0
    this.state.totalElapsedSeconds = totalElapsed
    this.lastTickTime = performance.now()

    this.notify()
  }

  /**
   * Subscribe to player state changes
   */
  subscribe(listener: ShowreelPlayerListener): () => void {
    this.listeners.add(listener)

    // Immediately notify with current state
    listener(this.state)

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Get current scene
   */
  getCurrentScene(): ShowreelScene | null {
    return this.state.script.scenes[this.state.currentSceneIndex] || null
  }

  /**
   * Get current state
   */
  getState(): ShowreelPlayerState {
    return { ...this.state }
  }

  /**
   * Handle clock tick
   */
  private onClockTick(): void {
    if (!this.state.isPlaying) return

    const now = performance.now()
    const deltaSeconds = (now - this.lastTickTime) / 1000
    this.lastTickTime = now

    // Update elapsed times
    this.state.sceneElapsedSeconds += deltaSeconds
    this.state.totalElapsedSeconds += deltaSeconds

    // Check if we should advance to next scene
    const currentScene = this.getCurrentScene()
    if (!currentScene) {
      this.pause()
      return
    }

    if (this.state.sceneElapsedSeconds >= currentScene.durationSeconds) {
      // Move to next scene
      const nextIndex = this.state.currentSceneIndex + 1

      if (nextIndex >= this.state.script.scenes.length) {
        // End of showreel
        this.pause()
        return
      }

      this.state.currentSceneIndex = nextIndex
      this.state.sceneElapsedSeconds = 0
    }

    this.notify()
  }

  /**
   * Notify all listeners
   */
  private notify(): void {
    this.listeners.forEach((listener) => {
      listener(this.state)
    })
  }
}
