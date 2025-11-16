/**
 * PerformanceEngine
 * Manages the evolution of performance state over time
 * Subscribes to PerformanceClock and updates state accordingly
 */

import type {
  PerformanceEngineConfig,
  PerformanceState,
  PerformanceClockSnapshot,
} from './performanceTypes';

export class PerformanceEngine {
  private config: PerformanceEngineConfig;
  private _state: PerformanceState;
  private unsubscribe: (() => void) | null = null;

  constructor(config: PerformanceEngineConfig) {
    this.config = config;
    this._state = { ...config.initialState };
  }

  get state(): PerformanceState {
    return this._state;
  }

  setState(state: Partial<PerformanceState>): void {
    this._state = { ...this._state, ...state };
  }

  start(): void {
    // Subscribe to clock ticks
    this.unsubscribe = this.config.clock.subscribe(this._onClockTick.bind(this));
  }

  stop(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  private _onClockTick(snapshot: PerformanceClockSnapshot): void {
    // Basic state evolution based on clock
    // This is a simple implementation - can be extended with more complex logic

    // Subtle momentum increase over time
    const momentumGrowth = 0.001 * snapshot.phase;
    const newMomentum = Math.min(1, this._state.momentum + momentumGrowth);

    this._state = {
      ...this._state,
      momentum: newMomentum,
    };
  }

  destroy(): void {
    this.stop();
  }
}
