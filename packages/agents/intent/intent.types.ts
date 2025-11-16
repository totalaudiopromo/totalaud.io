/**
 * Intent Engine Types
 * Phase 20 - Autonomous Composition System
 * British English, TypeScript strict mode
 */

import type { ThemeId } from '../../core/theme-engine/src/types'

/**
 * OS Name type alias for intent system
 * Maps to existing theme IDs
 */
export type OSName = ThemeId

/**
 * Creative style classifications
 */
export type IntentStyle = 'calm' | 'intense' | 'balanced' | 'fragmented' | 'focused'

/**
 * Narrative arc patterns
 */
export type IntentArc = 'rise' | 'fall' | 'oscillate' | 'resolve' | 'cycle'

/**
 * Visual/sonic colour palette
 */
export type IntentPalette = 'warm' | 'cold' | 'neutral' | 'dark' | 'bright'

/**
 * Performance structure segment
 * Defines tension, cohesion, and density for a time segment
 */
export interface PerformanceSegment {
  segment: number
  tension: number // 0-1, higher = more conflict
  cohesion: number // 0-1, higher = more unity
  density: number // 0-1, higher = more activity
}

/**
 * Intent Map - Parsed creative intent
 * Output of the Intent Parser
 */
export interface IntentMap {
  style: IntentStyle
  arc: IntentArc
  palette: IntentPalette
  leadOS: OSName | null
  resistingOS: OSName | null
  tempoCurve: number[] // Array of tempo checkpoints (BPM)
  emotionalCurve: number[] // 0-1 timeline of emotional intensity
  durationSeconds: number
  performanceStructure: PerformanceSegment[]
  keywords: string[]
}

/**
 * Creative Scene - A moment in the performance
 */
export interface CreativeScene {
  id: string
  startTime: number // Seconds from start
  duration: number // Duration in seconds
  tempo: number // BPM for this scene
  tension: number // 0-1
  cohesion: number // 0-1
  density: number // 0-1
  emotionalIntensity: number // 0-1
  leadOS: OSName | null
  supportingOS: OSName[]
  resistingOS: OSName | null
  description: string
}

/**
 * Sonic profile for the creative score
 */
export interface CreativeSonicProfile {
  style: IntentStyle
  density: number // 0-1, overall sonic density
  brightness: number // 0-1, timbral brightness
  rhythmicComplexity: number // 0-1, rhythm irregularity
  padIntensity: number // 0-1, ambient pad presence
  percussiveIntensity: number // 0-1, rhythmic element presence
}

/**
 * Visual profile for the creative score
 */
export interface CreativeVisualProfile {
  palette: IntentPalette
  brightness: number // 0-1
  contrast: number // 0-1
  saturation: number // 0-1
  vignette: number // 0-1, edge darkening
  bloom: number // 0-1, glow/bloom effect
  colourBias: {
    red: number // -1 to 1
    green: number // -1 to 1
    blue: number // -1 to 1
  }
}

/**
 * Creative Event - Timeline marker
 */
export interface CreativeEvent {
  id: string
  time: number // Seconds from start
  type: 'scene_start' | 'tension_peak' | 'tension_release' | 'evolution_spark' | 'cohesion_boost' | 'tempo_shift'
  intensity: number // 0-1
  targetOS?: OSName // Which OS this event affects
  metadata?: Record<string, unknown>
}

/**
 * OS Activity State
 */
export type OSActivityState = 'idle' | 'thinking' | 'speaking' | 'charged'

/**
 * Behaviour Directive - Instruction for an OS
 */
export interface BehaviourDirective {
  id: string
  time: number // Seconds from start
  targetOS: OSName
  action: 'set_activity' | 'set_priority' | 'boost_tension' | 'reduce_tension' | 'trigger_evolution' | 'speak' | 'listen'
  params: {
    activityState?: OSActivityState
    priority?: number // 0-1, speaking priority
    tensionDelta?: number // Change in tension (-1 to 1)
    duration?: number // Duration of effect in seconds
    message?: string // For 'speak' action
  }
}

/**
 * Creative Score - Structured performance plan
 * Output of the Intent Composer
 */
export interface CreativeScore {
  id: string
  createdAt: string
  duration: number // Total duration in seconds
  tempoCurve: number[] // BPM checkpoints throughout performance
  scenes: CreativeScene[]
  sonicProfile: CreativeSonicProfile
  visualProfile: CreativeVisualProfile
  eventTimeline: CreativeEvent[]
  behaviourDirectivesByOS: Record<OSName, BehaviourDirective[]>
  sourceIntent?: IntentMap // Optional reference to original intent
}

/**
 * Engine references for Behaviour Director
 */
export interface BehaviourDirectorEngines {
  performanceEngine?: unknown // Placeholder for PerformanceEngine
  audioEngine?: unknown // Placeholder for PerformanceAudioEngine
  evolutionEngine?: unknown // Placeholder for EvolutionEngine
  socialGraphEngine?: unknown // Placeholder for SocialGraphEngine
  fusionEngine?: unknown // Placeholder for FusionEngine
  visualEngine?: unknown // Placeholder for VisualEngine
}

/**
 * Intent Preset - Pre-configured intent patterns
 */
export interface IntentPreset {
  id: string
  name: string
  description: string
  intentText: string
  tags: string[]
}
