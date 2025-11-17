/**
 * Adaptive Monitor
 * Phase 21 - Real-time performance metrics computation
 * British English, deterministic, no AI
 */

import type { OSName } from '../agents/intent/intent.types'

/**
 * Performance state placeholder
 */
export interface PerformanceState {
  currentScene: number
  currentBar: number
  currentTempo: number
  osActivity: Record<OSName, 'idle' | 'thinking' | 'speaking' | 'charged'>
  osPriority: Record<OSName, number>
  sceneStartTime: number
  totalBars: number
}

/**
 * Audio state placeholder
 */
export interface AudioState {
  currentDensity: number
  currentBrightness: number
  layerCount: number
  percussiveIntensity: number
  padIntensity: number
}

/**
 * Social state placeholder
 */
export interface SocialState {
  osRelations: Record<OSName, Record<OSName, number>> // -1 to 1
  averageTrust: number
  averageSynergy: number
  averageTension: number
}

/**
 * Evolution state placeholder
 */
export interface EvolutionState {
  osEvolutionScores: Record<OSName, number>
  recentEvolutionEvents: number
  stabilityScore: number
}

/**
 * Scene progress information
 */
export interface SceneProgress {
  sceneIndex: number
  progress: number // 0-1
  expectedDuration: number // bars
  actualDuration: number // bars
  remainingDuration: number // bars
}

/**
 * Adaptive metrics computed every bar
 */
export interface AdaptiveMetrics {
  timestamp: number
  bar: number
  scene: number

  // Core metrics
  cohesion: number // 0-1, how unified the performance is
  tension: number // 0-1, current conflict level
  energy: number // 0-1, overall activity level

  // OS balance
  osBalance: Record<OSName, number> // 0-1, how much each OS is contributing

  // Structural metrics
  structuralDrift: number // 0-1, how far from intended structure
  densityTargetGap: number // difference between target and actual density
  tempoStability: number // 0-1, how stable tempo has been

  // Anomaly detection
  anomalyFlags: string[]

  // Historical context
  tensionHistory: number[] // last 8 bars
  cohesionHistory: number[] // last 8 bars
  energyHistory: number[] // last 8 bars
}

/**
 * History buffer for tracking trends
 */
class MetricsHistory {
  private tensionBuffer: number[] = []
  private cohesionBuffer: number[] = []
  private energyBuffer: number[] = []
  private maxSize = 8

  add(tension: number, cohesion: number, energy: number): void {
    this.tensionBuffer.push(tension)
    this.cohesionBuffer.push(cohesion)
    this.energyBuffer.push(energy)

    if (this.tensionBuffer.length > this.maxSize) {
      this.tensionBuffer.shift()
    }
    if (this.cohesionBuffer.length > this.maxSize) {
      this.cohesionBuffer.shift()
    }
    if (this.energyBuffer.length > this.maxSize) {
      this.energyBuffer.shift()
    }
  }

  getTensionHistory(): number[] {
    return [...this.tensionBuffer]
  }

  getCohesionHistory(): number[] {
    return [...this.cohesionBuffer]
  }

  getEnergyHistory(): number[] {
    return [...this.energyBuffer]
  }

  clear(): void {
    this.tensionBuffer = []
    this.cohesionBuffer = []
    this.energyBuffer = []
  }
}

/**
 * Global metrics history singleton
 */
const metricsHistory = new MetricsHistory()

/**
 * Compute adaptive metrics from current state
 * Called every bar by AdaptiveRuntimeController
 */
export function computeAdaptiveMetrics(
  performanceState: PerformanceState,
  audioState: AudioState,
  socialState: SocialState,
  evolutionState: EvolutionState,
  sceneProgress: SceneProgress
): AdaptiveMetrics {
  const timestamp = Date.now()

  // Compute cohesion (0-1)
  const cohesion = computeCohesion(performanceState, socialState, audioState)

  // Compute tension (0-1)
  const tension = computeTension(socialState, performanceState, sceneProgress)

  // Compute energy (0-1)
  const energy = computeEnergy(audioState, performanceState)

  // Update history
  metricsHistory.add(tension, cohesion, energy)

  // Compute OS balance
  const osBalance = computeOSBalance(performanceState, audioState)

  // Compute structural drift
  const structuralDrift = computeStructuralDrift(sceneProgress, performanceState)

  // Compute density gap
  const densityTargetGap = computeDensityGap(audioState, sceneProgress)

  // Compute tempo stability
  const tempoStability = computeTempoStability(performanceState)

  // Detect anomalies
  const anomalyFlags = detectAnomalies(
    cohesion,
    tension,
    energy,
    osBalance,
    metricsHistory,
    performanceState
  )

  return {
    timestamp,
    bar: performanceState.currentBar,
    scene: performanceState.currentScene,
    cohesion,
    tension,
    energy,
    osBalance,
    structuralDrift,
    densityTargetGap,
    tempoStability,
    anomalyFlags,
    tensionHistory: metricsHistory.getTensionHistory(),
    cohesionHistory: metricsHistory.getCohesionHistory(),
    energyHistory: metricsHistory.getEnergyHistory(),
  }
}

/**
 * Compute cohesion metric
 * High cohesion = OS working together, low density variance
 */
function computeCohesion(
  performanceState: PerformanceState,
  socialState: SocialState,
  audioState: AudioState
): number {
  // Average synergy from social state
  const synergy = socialState.averageSynergy

  // OS activity alignment (all active or all idle = high cohesion)
  const osActivities = Object.values(performanceState.osActivity)
  const activeCount = osActivities.filter((a) => a === 'speaking' || a === 'charged').length
  const activityAlignment = activeCount === 0 || activeCount === osActivities.length ? 1.0 : activeCount / osActivities.length

  // Audio layer consistency
  const layerConsistency = Math.min(1, audioState.layerCount / 5)

  // Weighted average
  const cohesion = synergy * 0.5 + activityAlignment * 0.3 + layerConsistency * 0.2

  return Math.max(0, Math.min(1, cohesion))
}

/**
 * Compute tension metric
 * High tension = conflict, high social tension, scene progress issues
 */
function computeTension(
  socialState: SocialState,
  performanceState: PerformanceState,
  sceneProgress: SceneProgress
): number {
  // Social tension component
  const socialTension = socialState.averageTension

  // Scene timing stress (if scene running long or short)
  const timingStress = Math.abs(sceneProgress.actualDuration - sceneProgress.expectedDuration) / sceneProgress.expectedDuration

  // OS conflict (count of low-relation pairs)
  let conflictCount = 0
  const osNames: OSName[] = ['ascii', 'xp', 'aqua', 'ableton', 'punk']
  osNames.forEach((os1) => {
    osNames.forEach((os2) => {
      if (os1 !== os2) {
        const relation = socialState.osRelations[os1]?.[os2] || 0
        if (relation < -0.3) {
          conflictCount++
        }
      }
    })
  })
  const conflictScore = Math.min(1, conflictCount / 10)

  // Weighted average
  const tension = socialTension * 0.5 + timingStress * 0.3 + conflictScore * 0.2

  return Math.max(0, Math.min(1, tension))
}

/**
 * Compute energy metric
 * High energy = high density, many layers, fast tempo
 */
function computeEnergy(
  audioState: AudioState,
  performanceState: PerformanceState
): number {
  // Density component
  const densityEnergy = audioState.currentDensity

  // Layer count component
  const layerEnergy = Math.min(1, audioState.layerCount / 5)

  // Tempo component (normalised to 60-180 BPM range)
  const tempoEnergy = (performanceState.currentTempo - 60) / 120

  // Percussive intensity
  const percussiveEnergy = audioState.percussiveIntensity

  // Weighted average
  const energy = densityEnergy * 0.3 + layerEnergy * 0.2 + tempoEnergy * 0.3 + percussiveEnergy * 0.2

  return Math.max(0, Math.min(1, energy))
}

/**
 * Compute OS balance
 * How much each OS is contributing to the performance
 */
function computeOSBalance(
  performanceState: PerformanceState,
  audioState: AudioState
): Record<OSName, number> {
  const osNames: OSName[] = ['ascii', 'xp', 'aqua', 'ableton', 'punk']
  const balance: Record<OSName, number> = {
    ascii: 0,
    xp: 0,
    aqua: 0,
    ableton: 0,
    punk: 0,
  }

  osNames.forEach((os) => {
    // Activity contribution
    const activity = performanceState.osActivity[os]
    let activityScore = 0
    switch (activity) {
      case 'speaking':
        activityScore = 1.0
        break
      case 'charged':
        activityScore = 0.8
        break
      case 'thinking':
        activityScore = 0.5
        break
      case 'idle':
        activityScore = 0.1
        break
    }

    // Priority contribution
    const priority = performanceState.osPriority[os] || 0.5

    // Combined balance
    balance[os] = activityScore * 0.7 + priority * 0.3
  })

  return balance
}

/**
 * Compute structural drift
 * How far the performance has drifted from intended structure
 */
function computeStructuralDrift(
  sceneProgress: SceneProgress,
  performanceState: PerformanceState
): number {
  // Scene timing drift
  const timingDrift = Math.abs(sceneProgress.actualDuration - sceneProgress.expectedDuration) / sceneProgress.expectedDuration

  // Overall bar count drift (if available)
  // For now, just use scene timing
  const drift = timingDrift

  return Math.max(0, Math.min(1, drift))
}

/**
 * Compute density target gap
 * Difference between target density and actual
 */
function computeDensityGap(
  audioState: AudioState,
  sceneProgress: SceneProgress
): number {
  // This would come from the CreativeScore scene target
  // For now, assume target is 0.5 (will be replaced with actual target)
  const targetDensity = 0.5
  const actualDensity = audioState.currentDensity

  return actualDensity - targetDensity
}

/**
 * Compute tempo stability
 * How stable the tempo has been recently
 */
function computeTempoStability(performanceState: PerformanceState): number {
  // Would need tempo history to compute variance
  // For now, return 1.0 (stable)
  // TODO: Implement tempo variance tracking
  return 1.0
}

/**
 * Detect anomalies in metrics
 */
function detectAnomalies(
  cohesion: number,
  tension: number,
  energy: number,
  osBalance: Record<OSName, number>,
  history: MetricsHistory,
  performanceState: PerformanceState
): string[] {
  const flags: string[] = []

  // High tension sustained
  const tensionHistory = history.getTensionHistory()
  if (tensionHistory.length >= 8) {
    const avgTension = tensionHistory.reduce((a, b) => a + b, 0) / tensionHistory.length
    if (avgTension > 0.75) {
      flags.push('sustained_high_tension')
    }
  }

  // Tension spike
  if (tensionHistory.length >= 2) {
    const lastTension = tensionHistory[tensionHistory.length - 2]
    const currentTension = tension
    if (currentTension - lastTension > 0.25) {
      flags.push('tension_spike')
    }
  }

  // Low cohesion
  if (cohesion < 0.4) {
    flags.push('low_cohesion')
  }

  // Energy collapse
  const energyHistory = history.getEnergyHistory()
  if (energyHistory.length >= 2) {
    const lastEnergy = energyHistory[energyHistory.length - 2]
    const currentEnergy = energy
    if (lastEnergy - currentEnergy > 0.3) {
      flags.push('energy_collapse')
    }
  }

  // OS over-dominance
  const osNames: OSName[] = ['ascii', 'xp', 'aqua', 'ableton', 'punk']
  osNames.forEach((os) => {
    if (osBalance[os] > 0.8) {
      flags.push(`os_${os}_dominant`)
    }
  })

  // OS under-engagement
  osNames.forEach((os) => {
    if (osBalance[os] < 0.1) {
      flags.push(`os_${os}_disengaged`)
    }
  })

  return flags
}

/**
 * Reset metrics history (for testing or new performance)
 */
export function resetMetricsHistory(): void {
  metricsHistory.clear()
}

/**
 * Get current metrics history (for debugging)
 */
export function getMetricsHistory(): {
  tension: number[]
  cohesion: number[]
  energy: number[]
} {
  return {
    tension: metricsHistory.getTensionHistory(),
    cohesion: metricsHistory.getCohesionHistory(),
    energy: metricsHistory.getEnergyHistory(),
  }
}
