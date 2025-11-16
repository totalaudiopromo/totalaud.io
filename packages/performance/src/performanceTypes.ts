/**
 * Performance System Types
 * Core types for the performance engine and clock system
 */

export type PerformanceClockState = 'idle' | 'running' | 'paused';

export interface PerformanceClockConfig {
  bpm: number;
  beatsPerBar: number;
  initialState?: PerformanceClockState;
}

export interface PerformanceClockSnapshot {
  elapsedMs: number;
  beat: number;
  bar: number;
  phase: number; // 0-1 within current beat
  state: PerformanceClockState;
}

export interface PerformanceTickCallback {
  (snapshot: PerformanceClockSnapshot): void;
}

/**
 * Performance State - represents the current state of a performance
 * with OS (Operating System) agents and their relationships
 */
export interface OSNode {
  id: string;
  name: string;
  colour: string;
  role: 'leader' | 'support' | 'rebel' | 'neutral';
  energy: number; // 0-1
  position?: { x: number; y: number }; // for rendering
}

export interface SocialEdge {
  from: string; // OS id
  to: string; // OS id
  synergy: number; // 0-1, line thickness
  trust: number; // -1 to 1, colour intensity
  tension: number; // 0-1, wobble factor
}

export interface PerformanceState {
  cohesion: number; // 0-1, overall harmony
  tension: number; // 0-1, overall conflict
  momentum: number; // 0-1, forward progress
  nodes: OSNode[];
  edges: SocialEdge[];
  currentNarrative?: string; // current story beat
}

/**
 * Performance Engine - manages the evolution of performance state
 */
export interface PerformanceEngineConfig {
  clock: PerformanceClock;
  initialState: PerformanceState;
}

/**
 * Performance Clock class (to be implemented)
 */
export interface PerformanceClock {
  readonly config: PerformanceClockConfig;
  readonly state: PerformanceClockState;

  start(): void;
  pause(): void;
  resume(): void;
  stop(): void;
  reset(): void;

  getSnapshot(): PerformanceClockSnapshot;
  subscribe(callback: PerformanceTickCallback): () => void;

  // For render mode - manual tick
  tick(deltaMs: number): void;
}
