/**
 * Render System Types
 * Types for browser-based video export of showreels
 */

import type { ShowreelScript } from '@totalaud/showreel';

export type RenderPresetId = 'showreel-720p-30' | 'showreel-1080p-30';

export interface RenderPreset {
  id: RenderPresetId;
  label: string;
  width: number;
  height: number;
  fps: number;
}

export const RENDER_PRESETS: RenderPreset[] = [
  {
    id: 'showreel-720p-30',
    label: '720p (HD, 30 FPS)',
    width: 1280,
    height: 720,
    fps: 30,
  },
  {
    id: 'showreel-1080p-30',
    label: '1080p (Full HD, 30 FPS)',
    width: 1920,
    height: 1080,
    fps: 30,
  },
];

export interface ShowreelRenderOptions {
  preset: RenderPresetId;
  includeCaptions?: boolean; // default: true
  includeHud?: boolean; // default: false
  includeSoundtrack?: boolean; // default: true
}

export interface ShowreelRenderJob {
  campaignId: string;
  script: ShowreelScript;
  options: ShowreelRenderOptions;
}

export interface ShowreelRenderResult {
  blob: Blob;
  fileName: string;
  mimeType: string; // e.g. video/webm
  durationSeconds: number;
}

export interface RenderProgress {
  phase: 'preparing' | 'rendering' | 'finalising' | 'complete';
  progress: number; // 0-1
  currentFrame?: number;
  totalFrames?: number;
  estimatedSecondsRemaining?: number;
}

export type RenderProgressCallback = (progress: RenderProgress) => void;
