/**
 * Adaptive Runtime Controller
 * Phase 21 - Main orchestrator for adaptive performance
 * British English, deterministic
 */

import type {
  PerformanceState,
  AudioState,
  SocialState,
  EvolutionState,
  SceneProgress,
  AdaptiveMetrics,
} from './adaptiveMonitor'
import { computeAdaptiveMetrics, resetMetricsHistory } from './adaptiveMonitor'
import {  runAdaptiveRules,
  validateDirective,
  deduplicateDirectives,
  type AdaptiveDirective,
} from './adaptiveRulesEngine'
import type { CreativeScore } from '../agents/intent/intent.types'
import {
  applyAdaptiveRewrites,
  type AdaptiveCreativeScore,
} from '../agents/intent/creativeScoreRewriter'
import { addAdaptiveLogEntry, type AdaptiveLogEntry } from './adaptiveLog'

/**
 * Adaptive loop callback
 * Called after each adaptive cycle
 */
export type AdaptiveLoopCallback = (
  metrics: AdaptiveMetrics,
  directives: AdaptiveDirective[],
  updatedScore: AdaptiveCreativeScore
) => void

/**
 * Adaptive runtime controller
 * Orchestrates the adaptive performance loop
 */
export class AdaptiveRuntimeController {
  private isRunning: boolean = false
  private intervalId: NodeJS.Timeout | null = null
  private callbacks: AdaptiveLoopCallback[] = []
  private creativeScore: CreativeScore | null = null
  private performanceState: PerformanceState | null = null
  private audioState: AudioState | null = null
  private socialState: SocialState | null = null
  private evolutionState: EvolutionState | null = null
  private sceneProgress: SceneProgress | null = null
  private barDuration: number = 2000 // Default: 2 seconds per bar (120 BPM, 4/4)
  private currentBar: number = 0

  constructor() {
    // Initialize
  }

  /**
   * Load creative score
   */
  loadScore(score: CreativeScore): void {
    this.creativeScore = score
  }

  /**
   * Set performance state
   */
  setPerformanceState(state: PerformanceState): void {
    this.performanceState = state
    this.currentBar = state.currentBar

    // Calculate bar duration from tempo
    const tempo = state.currentTempo || 120
    this.barDuration = (60 / tempo) * 4 * 1000 // 4 beats per bar, in milliseconds
  }

  /**
   * Set audio state
   */
  setAudioState(state: AudioState): void {
    this.audioState = state
  }

  /**
   * Set social state
   */
  setSocialState(state: SocialState): void {
    this.socialState = state
  }

  /**
   * Set evolution state
   */
  setEvolutionState(state: EvolutionState): void {
    this.evolutionState = state
  }

  /**
   * Set scene progress
   */
  setSceneProgress(progress: SceneProgress): void {
    this.sceneProgress = progress
  }

  /**
   * Start adaptive loop
   * Runs adaptive cycle every bar
   */
  startAdaptiveLoop(): void {
    if (this.isRunning) {
      console.warn('[AdaptiveRuntime] Already running')
      return
    }

    if (!this.creativeScore) {
      throw new Error('No creative score loaded. Call loadScore() first.')
    }

    // Initialize defaults if states not set
    this.ensureStatesInitialised()

    this.isRunning = true
    resetMetricsHistory()

    console.log('[AdaptiveRuntime] Starting adaptive loop')
    console.log(`[AdaptiveRuntime] Bar duration: ${this.barDuration}ms`)

    // Run immediately
    this.runAdaptiveCycle()

    // Run every bar
    this.intervalId = setInterval(() => {
      this.runAdaptiveCycle()
    }, this.barDuration)
  }

  /**
   * Stop adaptive loop
   */
  stopAdaptiveLoop(): void {
    if (!this.isRunning) {
      return
    }

    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

    this.isRunning = false
    console.log('[AdaptiveRuntime] Stopped adaptive loop')
  }

  /**
   * Subscribe to adaptive loop updates
   */
  subscribe(callback: AdaptiveLoopCallback): () => void {
    this.callbacks.push(callback)

    // Return unsubscribe function
    return () => {
      this.callbacks = this.callbacks.filter((cb) => cb !== callback)
    }
  }

  /**
   * Get current creative score
   */
  getScore(): CreativeScore | null {
    return this.creativeScore
  }

  /**
   * Check if running
   */
  isActive(): boolean {
    return this.isRunning
  }

  /**
   * Get current bar number
   */
  getCurrentBar(): number {
    return this.currentBar
  }

  /**
   * Run one adaptive cycle
   * This is the core adaptive loop
   */
  private runAdaptiveCycle(): void {
    if (!this.creativeScore || !this.performanceState || !this.audioState || !this.socialState || !this.evolutionState || !this.sceneProgress) {
      console.warn('[AdaptiveRuntime] Missing required state')
      return
    }

    this.currentBar++
    this.performanceState.currentBar = this.currentBar

    console.log(`[AdaptiveRuntime] === Bar ${this.currentBar} ===`)

    // Step 1: Compute metrics
    const metrics = computeAdaptiveMetrics(
      this.performanceState,
      this.audioState,
      this.socialState,
      this.evolutionState,
      this.sceneProgress
    )

    console.log(`[AdaptiveRuntime] Metrics - Cohesion: ${metrics.cohesion.toFixed(2)}, Tension: ${metrics.tension.toFixed(2)}, Energy: ${metrics.energy.toFixed(2)}`)

    // Step 2: Run adaptive rules
    let directives = runAdaptiveRules(metrics, this.creativeScore, this.performanceState)

    // Validate and deduplicate
    directives = directives.filter(validateDirective)
    directives = deduplicateDirectives(directives)

    console.log(`[AdaptiveRuntime] Generated ${directives.length} directives`)

    // Step 3: Apply rewrites to score
    let updatedScore: AdaptiveCreativeScore
    if (directives.length > 0) {
      updatedScore = applyAdaptiveRewrites(this.creativeScore, directives)
      this.creativeScore = updatedScore

      console.log(`[AdaptiveRuntime] Applied ${directives.length} directives, ${updatedScore.rewriteHistory.length} total rewrites`)
    } else {
      updatedScore = this.creativeScore as AdaptiveCreativeScore
    }

    // Step 4: Update engines (placeholders)
    this.updateBehaviourDirector(updatedScore)
    this.updateAudioEngine(updatedScore)
    this.updateSocialGraph(updatedScore)
    this.updateEvolutionEngine(updatedScore)
    this.updateVisualEngine(updatedScore)

    // Step 5: Log adaptive cycle
    const logEntry: AdaptiveLogEntry = {
      timestamp: Date.now(),
      bar: this.currentBar,
      scene: this.performanceState.currentScene,
      metrics,
      directives,
      rewrites: updatedScore.rewriteHistory.slice(-directives.length), // Last N rewrites
      affectedScene: this.performanceState.currentScene,
    }

    addAdaptiveLogEntry(logEntry)

    // Step 6: Notify subscribers
    this.callbacks.forEach((callback) => {
      callback(metrics, directives, updatedScore)
    })
  }

  /**
   * Ensure all states are initialised
   */
  private ensureStatesInitialised(): void {
    if (!this.performanceState) {
      this.performanceState = {
        currentScene: 0,
        currentBar: 0,
        currentTempo: 120,
        osActivity: {
          ascii: 'idle',
          xp: 'idle',
          aqua: 'idle',
          ableton: 'idle',
          punk: 'idle',
        },
        osPriority: {
          ascii: 0.5,
          xp: 0.5,
          aqua: 0.5,
          ableton: 0.5,
          punk: 0.5,
        },
        sceneStartTime: 0,
        totalBars: 0,
      }
    }

    if (!this.audioState) {
      this.audioState = {
        currentDensity: 0.5,
        currentBrightness: 0.5,
        layerCount: 3,
        percussiveIntensity: 0.5,
        padIntensity: 0.5,
      }
    }

    if (!this.socialState) {
      this.socialState = {
        osRelations: {
          ascii: { ascii: 1, xp: 0, aqua: 0, ableton: 0, punk: 0 },
          xp: { ascii: 0, xp: 1, aqua: 0, ableton: 0, punk: 0 },
          aqua: { ascii: 0, xp: 0, aqua: 1, ableton: 0, punk: 0 },
          ableton: { ascii: 0, xp: 0, aqua: 0, ableton: 1, punk: 0 },
          punk: { ascii: 0, xp: 0, aqua: 0, ableton: 0, punk: 1 },
        },
        averageTrust: 0.5,
        averageSynergy: 0.5,
        averageTension: 0.3,
      }
    }

    if (!this.evolutionState) {
      this.evolutionState = {
        osEvolutionScores: {
          ascii: 0.5,
          xp: 0.5,
          aqua: 0.5,
          ableton: 0.5,
          punk: 0.5,
        },
        recentEvolutionEvents: 0,
        stabilityScore: 0.8,
      }
    }

    if (!this.sceneProgress) {
      const firstScene = this.creativeScore?.scenes[0]
      this.sceneProgress = {
        sceneIndex: 0,
        progress: 0,
        expectedDuration: firstScene ? firstScene.duration / this.barDuration * 1000 : 8,
        actualDuration: 0,
        remainingDuration: firstScene ? firstScene.duration / this.barDuration * 1000 : 8,
      }
    }
  }

  /**
   * Update BehaviourDirector (placeholder)
   */
  private updateBehaviourDirector(score: AdaptiveCreativeScore): void {
    // Placeholder: Would integrate with actual BehaviourDirector
    // this.behaviourDirector?.applyScoreChanges(score)
    console.log('[AdaptiveRuntime] Updated BehaviourDirector')
  }

  /**
   * Update PerformanceAudioEngine (placeholder)
   */
  private updateAudioEngine(score: AdaptiveCreativeScore): void {
    // Placeholder: Would integrate with actual AudioEngine
    // this.audioEngine?.applySonicProfile(score.sonicProfile)
    console.log('[AdaptiveRuntime] Updated AudioEngine')
  }

  /**
   * Update SocialGraph (placeholder)
   */
  private updateSocialGraph(score: AdaptiveCreativeScore): void {
    // Placeholder: Would integrate with actual SocialGraph
    // this.socialGraph?.applyTensionAdjustments(...)
    console.log('[AdaptiveRuntime] Updated SocialGraph')
  }

  /**
   * Update EvolutionEngine (placeholder)
   */
  private updateEvolutionEngine(score: AdaptiveCreativeScore): void {
    // Placeholder: Would integrate with actual EvolutionEngine
    // this.evolutionEngine?.applyMicroAdjustments(...)
    console.log('[AdaptiveRuntime] Updated EvolutionEngine')
  }

  /**
   * Update VisualEngine (placeholder)
   */
  private updateVisualEngine(score: AdaptiveCreativeScore): void {
    // Placeholder: Would integrate with actual VisualEngine
    // this.visualEngine?.applyVisualProfile(score.visualProfile)
    console.log('[AdaptiveRuntime] Updated VisualEngine')
  }
}

/**
 * Create and start an adaptive runtime controller
 */
export function createAdaptiveRuntime(score: CreativeScore): AdaptiveRuntimeController {
  const runtime = new AdaptiveRuntimeController()
  runtime.loadScore(score)
  return runtime
}
