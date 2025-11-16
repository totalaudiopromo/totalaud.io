/**
 * Showreel Types
 * Phase 17: Campaign Performance Playback
 */

import type { ThemeId } from '@totalaud/os-state/campaign'

/**
 * Scene types for showreel
 */
export type ShowreelSceneType =
  | 'intro'
  | 'timeline_focus'
  | 'os_personalities'
  | 'social_graph'
  | 'cohesion_arc'
  | 'performance_peak'
  | 'reflection'
  | 'outro'

/**
 * Camera mode for scene
 */
export type ShowreelCameraMode = 'wide' | 'orbit' | 'focus_os' | 'graph' | 'timeline'

/**
 * Camera intensity
 */
export type ShowreelCameraIntensity = 'subtle' | 'normal' | 'dramatic'

/**
 * Individual scene in the showreel
 */
export interface ShowreelScene {
  id: string
  type: ShowreelSceneType
  title: string
  subtitle?: string
  durationSeconds: number
  focus?: {
    os?: ThemeId | ThemeId[]
    clipId?: string
    cardId?: string
  }
  camera?: {
    mode?: ShowreelCameraMode
    intensity?: ShowreelCameraIntensity
  }
  captions?: string[]
}

/**
 * Complete showreel script
 */
export interface ShowreelScript {
  id: string
  campaignId: string
  createdAt: string
  totalDurationSeconds: number
  scenes: ShowreelScene[]
}
