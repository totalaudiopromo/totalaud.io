/**
 * Adaptive Rules Engine
 * Phase 21 - Deterministic rules for adaptive performance
 * British English, pure rule-based, no AI
 */

import type { AdaptiveMetrics, PerformanceState } from './adaptiveMonitor'
import type { CreativeScore, OSName } from '../agents/intent/intent.types'

/**
 * Adaptive directive type
 */
export type AdaptiveDirectiveType =
  | 'tempo'
  | 'density'
  | 'scene'
  | 'osRole'
  | 'visual'
  | 'sonic'
  | 'tension'
  | 'cohesion'

/**
 * Adaptive directive
 * Instruction to modify the performance
 */
export interface AdaptiveDirective {
  id: string
  type: AdaptiveDirectiveType
  target: string
  delta: number
  reasoning: string
  timestamp: number
  bar: number
  priority: number // 0-1, higher = more urgent
}

/**
 * Rule execution context
 */
interface RuleContext {
  metrics: AdaptiveMetrics
  score: CreativeScore
  performanceState: PerformanceState
  directives: AdaptiveDirective[]
}

/**
 * Run adaptive rules and generate directives
 * Called every bar by AdaptiveRuntimeController
 */
export function runAdaptiveRules(
  metrics: AdaptiveMetrics,
  creativeScore: CreativeScore,
  performanceState: PerformanceState
): AdaptiveDirective[] {
  const context: RuleContext = {
    metrics,
    score: creativeScore,
    performanceState,
    directives: [],
  }

  // Run all rule sets
  applyTensionRules(context)
  applyCohesionRules(context)
  applyTempoRules(context)
  applySceneRules(context)
  applyOSRoleRules(context)
  applyDensityRules(context)
  applyEnergyRules(context)

  // Sort by priority (highest first)
  context.directives.sort((a, b) => b.priority - a.priority)

  return context.directives
}

/**
 * Tension rules
 */
function applyTensionRules(context: RuleContext): void {
  const { metrics, performanceState } = context

  // Rule 1: Sustained high tension → reduce density
  if (metrics.tensionHistory.length >= 8) {
    const avgTension = metrics.tensionHistory.reduce((a, b) => a + b, 0) / metrics.tensionHistory.length
    if (avgTension > 0.75) {
      addDirective(context, {
        type: 'density',
        target: 'global',
        delta: -0.1,
        reasoning: 'Sustained high tension detected (avg > 0.75 over 8 bars), reducing density',
        priority: 0.8,
      })
      addDirective(context, {
        type: 'tension',
        target: 'global',
        delta: -0.15,
        reasoning: 'Reducing tension to restore balance',
        priority: 0.7,
      })
    }
  }

  // Rule 2: Tension spike → immediate density reduction
  if (metrics.tensionHistory.length >= 2) {
    const lastTension = metrics.tensionHistory[metrics.tensionHistory.length - 2]
    const currentTension = metrics.tension
    if (currentTension - lastTension > 0.25) {
      addDirective(context, {
        type: 'density',
        target: 'next_bar',
        delta: -0.05,
        reasoning: `Tension spike detected (+${((currentTension - lastTension) * 100).toFixed(0)}% in one bar)`,
        priority: 0.9,
      })
    }
  }

  // Rule 3: Very low tension with high scene progress → increase tension
  if (metrics.tension < 0.2 && performanceState.currentBar > 16) {
    addDirective(context, {
      type: 'tension',
      target: 'global',
      delta: 0.1,
      reasoning: 'Tension too low for this stage of performance',
      priority: 0.5,
    })
  }
}

/**
 * Cohesion rules
 */
function applyCohesionRules(context: RuleContext): void {
  const { metrics, score } = context

  // Rule 1: Low cohesion with low density → brighten lead OS
  if (metrics.cohesion < 0.4 && metrics.energy < 0.4) {
    const leadOS = getCurrentLeadOS(context)
    if (leadOS) {
      addDirective(context, {
        type: 'visual',
        target: leadOS,
        delta: 0.15,
        reasoning: 'Low cohesion and low density, brightening lead OS to improve focus',
        priority: 0.6,
      })
    }
  }

  // Rule 2: Low cohesion with high density → reduce DAW complexity
  if (metrics.cohesion < 0.4 && metrics.energy > 0.7) {
    addDirective(context, {
      type: 'sonic',
      target: 'ableton',
      delta: -0.1,
      reasoning: 'Low cohesion with high density, simplifying DAW/Ableton complexity',
      priority: 0.7,
    })
  }

  // Rule 3: Very low cohesion → boost cohesion directly
  if (metrics.cohesion < 0.3) {
    addDirective(context, {
      type: 'cohesion',
      target: 'global',
      delta: 0.15,
      reasoning: 'Critical low cohesion, applying direct cohesion boost',
      priority: 0.8,
    })
  }
}

/**
 * Tempo rules
 */
function applyTempoRules(context: RuleContext): void {
  const { metrics, performanceState } = context

  // Rule 1: Low tempo stability → stabilise next two scenes
  if (metrics.tempoStability < 0.5) {
    addDirective(context, {
      type: 'tempo',
      target: 'next_2_scenes',
      delta: 0, // Delta 0 means "stabilise"
      reasoning: `Tempo instability detected (${(metrics.tempoStability * 100).toFixed(0)}%), stabilising`,
        priority: 0.6,
    })
  }

  // Rule 2: Extreme tempo variance
  if (metrics.anomalyFlags.includes('tempo_variance')) {
    addDirective(context, {
      type: 'tempo',
      target: 'current_scene',
      delta: 0,
      reasoning: 'Extreme tempo variance, locking to current tempo',
      priority: 0.7,
    })
  }
}

/**
 * Scene rules
 */
function applySceneRules(context: RuleContext): void {
  const { metrics, performanceState, score } = context

  const currentScene = score.scenes[performanceState.currentScene]
  if (!currentScene) return

  // Rule 1: Scene running short due to adaptation → extend next
  if (metrics.structuralDrift > 0.3 && metrics.anomalyFlags.includes('scene_short')) {
    addDirective(context, {
      type: 'scene',
      target: 'next_scene',
      delta: 2, // Add 2 bars
      reasoning: 'Previous scene compressed, extending next scene by 2 bars',
      priority: 0.5,
    })
  }

  // Rule 2: Scene running long → compress remaining
  if (metrics.structuralDrift > 0.4 && metrics.anomalyFlags.includes('scene_long')) {
    addDirective(context, {
      type: 'scene',
      target: 'remaining_scenes',
      delta: -2, // Reduce 2 bars
      reasoning: 'Current scene overrun, compressing remaining scenes by 2 bars',
      priority: 0.6,
    })
  }

  // Rule 3: Overall duration drift > 10% → rebalance all scenes
  if (metrics.structuralDrift > 0.1) {
    addDirective(context, {
      type: 'scene',
      target: 'all_scenes',
      delta: 0, // Rebalance
      reasoning: `Structural drift ${(metrics.structuralDrift * 100).toFixed(0)}%, rebalancing scene durations`,
      priority: 0.4,
    })
  }
}

/**
 * OS role rules
 */
function applyOSRoleRules(context: RuleContext): void {
  const { metrics, score, performanceState } = context

  const osNames: OSName[] = ['ascii', 'xp', 'aqua', 'ableton', 'punk']

  // Rule 1: Prevent over-dominance (same OS leads 5+ scenes)
  const leadCounts = countOSLeadScenes(score, performanceState.currentScene)
  osNames.forEach((os) => {
    if (leadCounts[os] >= 5) {
      addDirective(context, {
        type: 'osRole',
        target: os,
        delta: -0.5, // Reduce priority/lead role
        reasoning: `OS ${os.toUpperCase()} has led ${leadCounts[os]} scenes, rotating lead`,
        priority: 0.6,
      })
    }
  })

  // Rule 2: Under-engagement (OS low activity for 8 bars)
  osNames.forEach((os) => {
    if (metrics.osBalance[os] < 0.2 && performanceState.currentBar >= 8) {
      const anomalyKey = `os_${os}_disengaged`
      if (metrics.anomalyFlags.includes(anomalyKey)) {
        addDirective(context, {
          type: 'osRole',
          target: os,
          delta: 0.3, // Boost activity
          reasoning: `OS ${os.toUpperCase()} disengaged for 8+ bars, forcing activation`,
          priority: 0.7,
        })
      }
    }
  })

  // Rule 3: Balance OS priority if one is too dominant
  osNames.forEach((os) => {
    if (metrics.osBalance[os] > 0.8) {
      addDirective(context, {
        type: 'osRole',
        target: os,
        delta: -0.2,
        reasoning: `OS ${os.toUpperCase()} too dominant (${(metrics.osBalance[os] * 100).toFixed(0)}%), rebalancing`,
        priority: 0.5,
      })
    }
  })
}

/**
 * Density rules
 */
function applyDensityRules(context: RuleContext): void {
  const { metrics } = context

  // Rule 1: Density gap too large
  if (Math.abs(metrics.densityTargetGap) > 0.2) {
    const delta = -metrics.densityTargetGap * 0.5 // Move 50% towards target
    addDirective(context, {
      type: 'density',
      target: 'global',
      delta,
      reasoning: `Density gap ${(metrics.densityTargetGap * 100).toFixed(0)}%, correcting`,
      priority: 0.5,
    })
  }

  // Rule 2: Low energy with low density → add layers
  if (metrics.energy < 0.3 && metrics.densityTargetGap < -0.1) {
    addDirective(context, {
      type: 'density',
      target: 'audio_layers',
      delta: 0.1,
      reasoning: 'Low energy and low density, adding audio layers',
      priority: 0.6,
    })
  }
}

/**
 * Energy rules
 */
function applyEnergyRules(context: RuleContext): void {
  const { metrics } = context

  // Rule 1: Energy collapse → add percussion
  if (metrics.anomalyFlags.includes('energy_collapse')) {
    addDirective(context, {
      type: 'sonic',
      target: 'percussion',
      delta: 0.2,
      reasoning: 'Energy collapse detected, adding percussion',
      priority: 0.8,
    })
  }

  // Rule 2: Sustained low energy (not intended for calm styles)
  const avgEnergy = metrics.energyHistory.reduce((a, b) => a + b, 0) / (metrics.energyHistory.length || 1)
  if (avgEnergy < 0.3 && metrics.energyHistory.length >= 4) {
    addDirective(context, {
      type: 'sonic',
      target: 'brightness',
      delta: 0.1,
      reasoning: 'Sustained low energy, increasing sonic brightness',
      priority: 0.5,
    })
  }

  // Rule 3: Energy too high for too long (risk of listener fatigue)
  if (avgEnergy > 0.8 && metrics.energyHistory.length >= 8) {
    addDirective(context, {
      type: 'density',
      target: 'global',
      delta: -0.05,
      reasoning: 'Sustained high energy, introducing brief respite',
      priority: 0.4,
    })
  }
}

/**
 * Helper: Add directive to context
 */
function addDirective(
  context: RuleContext,
  params: Omit<AdaptiveDirective, 'id' | 'timestamp' | 'bar'>
): void {
  const directive: AdaptiveDirective = {
    ...params,
    id: `directive_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    timestamp: Date.now(),
    bar: context.metrics.bar,
  }

  context.directives.push(directive)
}

/**
 * Helper: Get current lead OS
 */
function getCurrentLeadOS(context: RuleContext): OSName | null {
  const currentScene = context.score.scenes[context.performanceState.currentScene]
  return currentScene?.leadOS || null
}

/**
 * Helper: Count how many scenes each OS has led (up to current scene)
 */
function countOSLeadScenes(score: CreativeScore, currentSceneIndex: number): Record<OSName, number> {
  const counts: Record<OSName, number> = {
    ascii: 0,
    xp: 0,
    aqua: 0,
    ableton: 0,
    punk: 0,
  }

  score.scenes.slice(0, currentSceneIndex + 1).forEach((scene) => {
    if (scene.leadOS) {
      counts[scene.leadOS]++
    }
  })

  return counts
}

/**
 * Validate directive (ensure delta is within acceptable range)
 */
export function validateDirective(directive: AdaptiveDirective): boolean {
  // Deltas must be between -0.25 and 0.25 (except for scene duration which uses bars)
  if (directive.type !== 'scene' && directive.type !== 'tempo') {
    if (Math.abs(directive.delta) > 0.25) {
      console.warn(`[AdaptiveRules] Directive ${directive.id} has excessive delta: ${directive.delta}`)
      return false
    }
  }

  // Scene deltas must be between -4 and 4 bars
  if (directive.type === 'scene') {
    if (Math.abs(directive.delta) > 4) {
      console.warn(`[AdaptiveRules] Scene directive ${directive.id} has excessive delta: ${directive.delta} bars`)
      return false
    }
  }

  return true
}

/**
 * Filter directives to avoid conflicts
 */
export function deduplicateDirectives(directives: AdaptiveDirective[]): AdaptiveDirective[] {
  const seen = new Map<string, AdaptiveDirective>()

  directives.forEach((directive) => {
    const key = `${directive.type}_${directive.target}`
    const existing = seen.get(key)

    if (!existing || directive.priority > existing.priority) {
      seen.set(key, directive)
    }
  })

  return Array.from(seen.values())
}
