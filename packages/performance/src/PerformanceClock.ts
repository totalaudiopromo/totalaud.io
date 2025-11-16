/**
 * PerformanceClock
 * Deterministic timing system for performances and showreels
 * Supports both real-time (RAF-based) and manual tick modes (for rendering)
 */

import type {
  PerformanceClockConfig,
  PerformanceClockState,
  PerformanceClockSnapshot,
  PerformanceTickCallback,
  PerformanceClock as IPerformanceClock,
} from './performanceTypes';

export class PerformanceClock implements IPerformanceClock {
  readonly config: PerformanceClockConfig;

  private _state: PerformanceClockState;
  private _elapsedMs: number = 0;
  private _lastTickTime: number = 0;
  private _rafId: number | null = null;
  private _subscribers: Set<PerformanceTickCallback> = new Set();
  private _manualMode: boolean = false;

  constructor(config: PerformanceClockConfig) {
    this.config = config;
    this._state = config.initialState ?? 'idle';
  }

  get state(): PerformanceClockState {
    return this._state;
  }

  /**
   * Enable manual tick mode (for rendering)
   * When enabled, clock only advances via tick() calls
   */
  setManualMode(enabled: boolean): void {
    this._manualMode = enabled;
    if (enabled && this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  start(): void {
    if (this._state === 'running') return;

    this._state = 'running';
    this._lastTickTime = performance.now();

    if (!this._manualMode) {
      this._scheduleNextTick();
    }
  }

  pause(): void {
    if (this._state !== 'running') return;

    this._state = 'paused';
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  resume(): void {
    if (this._state !== 'paused') return;

    this._state = 'running';
    this._lastTickTime = performance.now();

    if (!this._manualMode) {
      this._scheduleNextTick();
    }
  }

  stop(): void {
    this._state = 'idle';
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  reset(): void {
    this.stop();
    this._elapsedMs = 0;
    this._lastTickTime = 0;
  }

  /**
   * Manual tick - for deterministic rendering
   * Only works when manualMode is enabled
   */
  tick(deltaMs: number): void {
    if (!this._manualMode) {
      console.warn('tick() called but manual mode is not enabled');
      return;
    }

    if (this._state !== 'running') return;

    this._elapsedMs += deltaMs;
    this._notifySubscribers();
  }

  getSnapshot(): PerformanceClockSnapshot {
    const msPerBeat = (60000 / this.config.bpm);
    const msPerBar = msPerBeat * this.config.beatsPerBar;

    const totalBeats = this._elapsedMs / msPerBeat;
    const beat = Math.floor(totalBeats);
    const bar = Math.floor(beat / this.config.beatsPerBar);
    const phase = totalBeats - beat; // 0-1 within current beat

    return {
      elapsedMs: this._elapsedMs,
      beat,
      bar,
      phase,
      state: this._state,
    };
  }

  subscribe(callback: PerformanceTickCallback): () => void {
    this._subscribers.add(callback);
    return () => {
      this._subscribers.delete(callback);
    };
  }

  private _scheduleNextTick(): void {
    if (this._manualMode) return;

    this._rafId = requestAnimationFrame((now) => {
      if (this._state !== 'running') return;

      const deltaMs = now - this._lastTickTime;
      this._lastTickTime = now;
      this._elapsedMs += deltaMs;

      this._notifySubscribers();
      this._scheduleNextTick();
    });
  }

  private _notifySubscribers(): void {
    const snapshot = this.getSnapshot();
    this._subscribers.forEach((callback) => {
      callback(snapshot);
    });
  }

  destroy(): void {
    this.stop();
    this._subscribers.clear();
  }
}
