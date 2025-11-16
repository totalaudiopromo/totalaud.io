/**
 * Performance Clock
 * Phase 16: BPM-aware timing for Live Performance Mode
 */

export interface PerformanceClockState {
  bpm: number
  bar: number // 1, 2, 3, ...
  beatInBar: number // 1-4 (assuming 4/4 time)
  beatCount: number // total beats since start
  timeSinceBeat: number // ms since last beat
  lastTickAt: number // timestamp of last tick
  isRunning: boolean
}

export type ClockListener = (state: PerformanceClockState) => void

/**
 * Performance Clock
 * Manages BPM-aware timing for performance mode
 */
export class PerformanceClock {
  private state: PerformanceClockState
  private listeners: Set<ClockListener>
  private rafId: number | null = null
  private startTime: number = 0

  constructor(initialBpm: number = 120) {
    this.state = {
      bpm: initialBpm,
      bar: 1,
      beatInBar: 1,
      beatCount: 0,
      timeSinceBeat: 0,
      lastTickAt: 0,
      isRunning: false,
    }
    this.listeners = new Set()
  }

  /**
   * Start the clock
   */
  start(): void {
    if (this.state.isRunning) return

    this.state.isRunning = true
    this.startTime = performance.now()
    this.state.lastTickAt = this.startTime

    this.tick()
  }

  /**
   * Stop the clock
   */
  stop(): void {
    if (!this.state.isRunning) return

    this.state.isRunning = false

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  /**
   * Set BPM (smooth transition)
   */
  setBpm(bpm: number): void {
    // Clamp BPM to reasonable range
    this.state.bpm = Math.max(60, Math.min(240, bpm))
    this.notify()
  }

  /**
   * Subscribe to clock updates
   */
  subscribe(listener: ClockListener): () => void {
    this.listeners.add(listener)

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Get current state (immutable copy)
   */
  getState(): PerformanceClockState {
    return { ...this.state }
  }

  /**
   * Main animation loop tick
   */
  private tick = (): void => {
    if (!this.state.isRunning) return

    const now = performance.now()
    const delta = now - this.state.lastTickAt

    // Calculate beat duration in ms
    const beatDurationMs = (60 / this.state.bpm) * 1000

    // Update time since last beat
    this.state.timeSinceBeat += delta

    // Check if we've crossed a beat boundary
    if (this.state.timeSinceBeat >= beatDurationMs) {
      this.onBeat()
      this.state.timeSinceBeat = this.state.timeSinceBeat % beatDurationMs
    }

    this.state.lastTickAt = now
    this.notify()

    // Schedule next tick
    this.rafId = requestAnimationFrame(this.tick)
  }

  /**
   * Handle beat crossing
   */
  private onBeat(): void {
    this.state.beatCount++

    // Advance beat in bar
    this.state.beatInBar++

    // If we've completed a bar (4 beats in 4/4 time)
    if (this.state.beatInBar > 4) {
      this.state.beatInBar = 1
      this.state.bar++
    }
  }

  /**
   * Notify all listeners
   */
  private notify(): void {
    const immutableState = this.getState()
    this.listeners.forEach((listener) => {
      try {
        listener(immutableState)
      } catch (error) {
        console.error('[PerformanceClock] Listener error:', error)
      }
    })
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    const wasRunning = this.state.isRunning

    if (wasRunning) {
      this.stop()
    }

    this.state = {
      ...this.state,
      bar: 1,
      beatInBar: 1,
      beatCount: 0,
      timeSinceBeat: 0,
      lastTickAt: 0,
      isRunning: false,
    }

    this.notify()

    if (wasRunning) {
      this.start()
    }
  }
}
