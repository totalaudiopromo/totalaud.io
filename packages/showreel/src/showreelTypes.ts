/**
 * Showreel System Types
 * Types for showreel scripts, scenes, and playback
 */

import type { PerformanceState } from '@totalaud/performance';

export type ShowreelSceneType =
  | 'intro'
  | 'social_graph'
  | 'cohesion_arc'
  | 'tension_peak'
  | 'evolution_spark'
  | 'resolution'
  | 'outro';

export interface ShowreelScene {
  id: string;
  type: ShowreelSceneType;
  title: string;
  subtitle?: string;
  durationSeconds: number;

  // Visual emphasis
  emphasisMode: 'constellation' | 'graph' | 'leader' | 'evolution' | 'full';

  // Performance state snapshot for this scene
  performanceSnapshot?: Partial<PerformanceState>;

  // Captions/narration
  captions?: ShowreelCaption[];
}

export interface ShowreelCaption {
  text: string;
  startTime: number; // seconds from scene start
  durationSeconds: number;
}

export interface ShowreelScript {
  id: string;
  campaignId: string;
  title: string;
  totalDurationSeconds: number;
  scenes: ShowreelScene[];
  createdAt: Date;
}

export interface ShowreelPlayerState {
  currentSceneIndex: number;
  sceneElapsedSeconds: number;
  totalElapsedSeconds: number;
  isComplete: boolean;
  currentCaption?: string;
}

/**
 * Showreel Player interface
 */
export interface ShowreelPlayer {
  readonly script: ShowreelScript;
  readonly state: ShowreelPlayerState;

  start(): void;
  pause(): void;
  resume(): void;
  stop(): void;
  reset(): void;

  seekToScene(sceneIndex: number): void;
  seekToTime(seconds: number): void;

  getCurrentScene(): ShowreelScene | null;
  subscribe(callback: (state: ShowreelPlayerState) => void): () => void;

  // For render mode - manual tick
  tick(deltaSeconds: number): void;
}
