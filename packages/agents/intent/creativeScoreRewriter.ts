/**
 * Creative Score Rewriter
 * Phase 21 - Apply adaptive directives to modify CreativeScore
 * British English, deterministic
 */

import type { CreativeScore, CreativeScene, OSName } from './intent.types'
import type { AdaptiveDirective } from '../../performance/adaptiveRulesEngine'

/**
 * Adaptive rewrite entry
 * Tracks changes made to the score
 */
export interface AdaptiveRewriteEntry {
  timestamp: number
  bar: number
  scene: number
  directive: AdaptiveDirective
  changeDescription: string
  affectedProperty: string
  oldValue: number | string | null
  newValue: number | string | null
}

/**
 * Extended CreativeScore with rewrite history
 */
export interface AdaptiveCreativeScore extends CreativeScore {
  rewriteHistory: AdaptiveRewriteEntry[]
  adaptiveMetadata: {
    totalRewrites: number
    lastRewriteTimestamp: number
    durationDrift: number // percentage
    structurePreserved: boolean
  }
}

/**
 * Apply adaptive directives to CreativeScore
 * Returns modified score with rewrite history
 */
export function applyAdaptiveRewrites(
  score: CreativeScore,
  directives: AdaptiveDirective[]
): AdaptiveCreativeScore {
  // Cast to adaptive score or initialize
  const adaptiveScore: AdaptiveCreativeScore = {
    ...score,
    rewriteHistory: (score as AdaptiveCreativeScore).rewriteHistory || [],
    adaptiveMetadata: (score as AdaptiveCreativeScore).adaptiveMetadata || {
      totalRewrites: 0,
      lastRewriteTimestamp: 0,
      durationDrift: 0,
      structurePreserved: true,
    },
  }

  // Apply each directive
  directives.forEach((directive) => {
    applyDirective(adaptiveScore, directive)
  })

  // Update metadata
  adaptiveScore.adaptiveMetadata.totalRewrites += directives.length
  adaptiveScore.adaptiveMetadata.lastRewriteTimestamp = Date.now()
  adaptiveScore.adaptiveMetadata.durationDrift = computeDurationDrift(adaptiveScore)
  adaptiveScore.adaptiveMetadata.structurePreserved = validateStructure(adaptiveScore)

  return adaptiveScore
}

/**
 * Apply a single directive to the score
 */
function applyDirective(score: AdaptiveCreativeScore, directive: AdaptiveDirective): void {
  switch (directive.type) {
    case 'tempo':
      applyTempoDirective(score, directive)
      break
    case 'density':
      applyDensityDirective(score, directive)
      break
    case 'scene':
      applySceneDirective(score, directive)
      break
    case 'osRole':
      applyOSRoleDirective(score, directive)
      break
    case 'visual':
      applyVisualDirective(score, directive)
      break
    case 'sonic':
      applySonicDirective(score, directive)
      break
    case 'tension':
      applyTensionDirective(score, directive)
      break
    case 'cohesion':
      applyCohesionDirective(score, directive)
      break
  }
}

/**
 * Apply tempo directive
 */
function applyTempoDirective(score: AdaptiveCreativeScore, directive: AdaptiveDirective): void {
  if (directive.target === 'next_2_scenes') {
    // Stabilise tempo for next 2 scenes
    const avgTempo = score.tempoCurve.reduce((a, b) => a + b, 0) / score.tempoCurve.length

    for (let i = 0; i < Math.min(2, score.scenes.length); i++) {
      const oldTempo = score.scenes[i].tempo
      score.scenes[i].tempo = avgTempo
      score.tempoCurve[i] = avgTempo

      logRewrite(score, directive, i, {
        changeDescription: `Stabilised tempo for scene ${i}`,
        affectedProperty: 'tempo',
        oldValue: oldTempo,
        newValue: avgTempo,
      })
    }
  } else if (directive.target === 'current_scene') {
    // Lock current scene tempo
    const currentTempo = score.tempoCurve[0] || 110
    logRewrite(score, directive, 0, {
      changeDescription: 'Locked tempo for current scene',
      affectedProperty: 'tempo',
      oldValue: null,
      newValue: currentTempo,
    })
  }
}

/**
 * Apply density directive
 */
function applyDensityDirective(score: AdaptiveCreativeScore, directive: AdaptiveDirective): void {
  if (directive.target === 'global' || directive.target === 'next_bar') {
    // Apply to all scenes
    score.scenes.forEach((scene, i) => {
      const oldDensity = scene.density
      scene.density = Math.max(0, Math.min(1, scene.density + directive.delta))

      logRewrite(score, directive, i, {
        changeDescription: `Adjusted global density by ${directive.delta > 0 ? '+' : ''}${directive.delta.toFixed(2)}`,
        affectedProperty: 'density',
        oldValue: oldDensity,
        newValue: scene.density,
      })
    })

    // Update sonic profile
    const oldSonicDensity = score.sonicProfile.density
    score.sonicProfile.density = Math.max(0, Math.min(1, score.sonicProfile.density + directive.delta))

    logRewrite(score, directive, 0, {
      changeDescription: 'Adjusted sonic profile density',
      affectedProperty: 'sonicProfile.density',
      oldValue: oldSonicDensity,
      newValue: score.sonicProfile.density,
    })
  } else if (directive.target === 'audio_layers') {
    // Adjust layer-related sonic properties
    const oldPercussive = score.sonicProfile.percussiveIntensity
    score.sonicProfile.percussiveIntensity = Math.max(0, Math.min(1, score.sonicProfile.percussiveIntensity + directive.delta))

    logRewrite(score, directive, 0, {
      changeDescription: 'Added audio layers (percussive intensity)',
      affectedProperty: 'sonicProfile.percussiveIntensity',
      oldValue: oldPercussive,
      newValue: score.sonicProfile.percussiveIntensity,
    })
  }
}

/**
 * Apply scene directive
 */
function applySceneDirective(score: AdaptiveCreativeScore, directive: AdaptiveDirective): void {
  if (directive.target === 'next_scene' && directive.delta !== 0) {
    // Extend/compress next scene
    const nextScene = score.scenes[1]
    if (nextScene) {
      const oldDuration = nextScene.duration
      const barDuration = 60 / nextScene.tempo * 4 // 4 beats per bar
      nextScene.duration += directive.delta * barDuration

      logRewrite(score, directive, 1, {
        changeDescription: `Adjusted next scene duration by ${directive.delta} bars`,
        affectedProperty: 'duration',
        oldValue: oldDuration,
        newValue: nextScene.duration,
      })
    }
  } else if (directive.target === 'remaining_scenes' && directive.delta !== 0) {
    // Compress remaining scenes
    score.scenes.slice(1).forEach((scene, i) => {
      const oldDuration = scene.duration
      const barDuration = 60 / scene.tempo * 4
      scene.duration = Math.max(barDuration * 2, scene.duration + directive.delta * barDuration)

      logRewrite(score, directive, i + 1, {
        changeDescription: `Compressed scene ${i + 1} by ${Math.abs(directive.delta)} bars`,
        affectedProperty: 'duration',
        oldValue: oldDuration,
        newValue: scene.duration,
      })
    })
  } else if (directive.target === 'all_scenes') {
    // Rebalance all scene durations
    rebalanceSceneDurations(score, directive)
  }
}

/**
 * Apply OS role directive
 */
function applyOSRoleDirective(score: AdaptiveCreativeScore, directive: AdaptiveDirective): void {
  const targetOS = directive.target as OSName

  if (directive.delta < 0) {
    // Reduce OS priority/lead role
    score.scenes.forEach((scene, i) => {
      if (scene.leadOS === targetOS) {
        // Rotate lead to a supporting OS
        const newLead = scene.supportingOS[0] || null
        const oldLead = scene.leadOS

        scene.leadOS = newLead
        if (newLead) {
          scene.supportingOS = scene.supportingOS.filter((os) => os !== newLead)
          scene.supportingOS.push(targetOS)
        }

        logRewrite(score, directive, i, {
          changeDescription: `Rotated lead OS from ${oldLead?.toUpperCase()} to ${newLead?.toUpperCase() || 'None'}`,
          affectedProperty: 'leadOS',
          oldValue: oldLead,
          newValue: newLead,
        })
      }
    })
  } else if (directive.delta > 0) {
    // Boost OS activity (make it lead if idle)
    let activated = false
    score.scenes.forEach((scene, i) => {
      if (!activated && scene.supportingOS.includes(targetOS)) {
        const oldLead = scene.leadOS
        scene.leadOS = targetOS
        scene.supportingOS = scene.supportingOS.filter((os) => os !== targetOS)
        if (oldLead) {
          scene.supportingOS.push(oldLead)
        }

        activated = true

        logRewrite(score, directive, i, {
          changeDescription: `Activated OS ${targetOS.toUpperCase()} as lead`,
          affectedProperty: 'leadOS',
          oldValue: oldLead,
          newValue: targetOS,
        })
      }
    })
  }
}

/**
 * Apply visual directive
 */
function applyVisualDirective(score: AdaptiveCreativeScore, directive: AdaptiveDirective): void {
  const targetOS = directive.target as OSName

  // Brighten visual for specific OS (affects visual profile brightness)
  const oldBrightness = score.visualProfile.brightness
  score.visualProfile.brightness = Math.max(0, Math.min(1, score.visualProfile.brightness + directive.delta))

  logRewrite(score, directive, 0, {
    changeDescription: `Brightened visuals for ${targetOS.toUpperCase()}`,
    affectedProperty: 'visualProfile.brightness',
    oldValue: oldBrightness,
    newValue: score.visualProfile.brightness,
  })
}

/**
 * Apply sonic directive
 */
function applySonicDirective(score: AdaptiveCreativeScore, directive: AdaptiveDirective): void {
  if (directive.target === 'ableton') {
    // Reduce DAW complexity (rhythmic complexity)
    const oldComplexity = score.sonicProfile.rhythmicComplexity
    score.sonicProfile.rhythmicComplexity = Math.max(0, Math.min(1, score.sonicProfile.rhythmicComplexity + directive.delta))

    logRewrite(score, directive, 0, {
      changeDescription: 'Reduced DAW/Ableton rhythmic complexity',
      affectedProperty: 'sonicProfile.rhythmicComplexity',
      oldValue: oldComplexity,
      newValue: score.sonicProfile.rhythmicComplexity,
    })
  } else if (directive.target === 'percussion') {
    // Add percussion
    const oldPercussive = score.sonicProfile.percussiveIntensity
    score.sonicProfile.percussiveIntensity = Math.max(0, Math.min(1, score.sonicProfile.percussiveIntensity + directive.delta))

    logRewrite(score, directive, 0, {
      changeDescription: 'Added percussive elements',
      affectedProperty: 'sonicProfile.percussiveIntensity',
      oldValue: oldPercussive,
      newValue: score.sonicProfile.percussiveIntensity,
    })
  } else if (directive.target === 'brightness') {
    // Increase sonic brightness
    const oldBrightness = score.sonicProfile.brightness
    score.sonicProfile.brightness = Math.max(0, Math.min(1, score.sonicProfile.brightness + directive.delta))

    logRewrite(score, directive, 0, {
      changeDescription: 'Increased sonic brightness',
      affectedProperty: 'sonicProfile.brightness',
      oldValue: oldBrightness,
      newValue: score.sonicProfile.brightness,
    })
  }
}

/**
 * Apply tension directive
 */
function applyTensionDirective(score: AdaptiveCreativeScore, directive: AdaptiveDirective): void {
  score.scenes.forEach((scene, i) => {
    const oldTension = scene.tension
    scene.tension = Math.max(0, Math.min(1, scene.tension + directive.delta))

    logRewrite(score, directive, i, {
      changeDescription: `Adjusted tension by ${directive.delta > 0 ? '+' : ''}${directive.delta.toFixed(2)}`,
      affectedProperty: 'tension',
      oldValue: oldTension,
      newValue: scene.tension,
    })
  })
}

/**
 * Apply cohesion directive
 */
function applyCohesionDirective(score: AdaptiveCreativeScore, directive: AdaptiveDirective): void {
  score.scenes.forEach((scene, i) => {
    const oldCohesion = scene.cohesion
    scene.cohesion = Math.max(0, Math.min(1, scene.cohesion + directive.delta))

    logRewrite(score, directive, i, {
      changeDescription: `Boosted cohesion by ${directive.delta > 0 ? '+' : ''}${directive.delta.toFixed(2)}`,
      affectedProperty: 'cohesion',
      oldValue: oldCohesion,
      newValue: scene.cohesion,
    })
  })
}

/**
 * Rebalance scene durations to match original total duration
 */
function rebalanceSceneDurations(score: AdaptiveCreativeScore, directive: AdaptiveDirective): void {
  const originalDuration = score.duration
  const currentDuration = score.scenes.reduce((sum, scene) => sum + scene.duration, 0)
  const ratio = originalDuration / currentDuration

  score.scenes.forEach((scene, i) => {
    const oldDuration = scene.duration
    scene.duration *= ratio

    logRewrite(score, directive, i, {
      changeDescription: 'Rebalanced scene duration',
      affectedProperty: 'duration',
      oldValue: oldDuration,
      newValue: scene.duration,
    })
  })
}

/**
 * Log a rewrite entry
 */
function logRewrite(
  score: AdaptiveCreativeScore,
  directive: AdaptiveDirective,
  sceneIndex: number,
  params: Omit<AdaptiveRewriteEntry, 'timestamp' | 'bar' | 'scene' | 'directive'>
): void {
  const entry: AdaptiveRewriteEntry = {
    timestamp: directive.timestamp,
    bar: directive.bar,
    scene: sceneIndex,
    directive,
    ...params,
  }

  score.rewriteHistory.push(entry)
}

/**
 * Compute duration drift percentage
 */
function computeDurationDrift(score: AdaptiveCreativeScore): number {
  const originalDuration = score.duration
  const currentDuration = score.scenes.reduce((sum, scene) => sum + scene.duration, 0)
  return ((currentDuration - originalDuration) / originalDuration) * 100
}

/**
 * Validate that score structure is preserved
 */
function validateStructure(score: AdaptiveCreativeScore): boolean {
  // Check duration drift is within ±10%
  const drift = Math.abs(computeDurationDrift(score))
  if (drift > 10) {
    return false
  }

  // Check that arc type is preserved (if source intent exists)
  if (score.sourceIntent) {
    // Arc validation would require checking emotional curve progression
    // For now, assume preserved
  }

  // Check that palette hasn't changed
  if (score.sourceIntent && score.visualProfile.palette !== score.sourceIntent.palette) {
    return false
  }

  return true
}

/**
 * Insert a micro-scene for smoother transitions
 */
export function insertMicroScene(
  score: AdaptiveCreativeScore,
  afterSceneIndex: number,
  duration: number = 4 // 4 seconds default
): void {
  const prevScene = score.scenes[afterSceneIndex]
  const nextScene = score.scenes[afterSceneIndex + 1]

  if (!prevScene || !nextScene) {
    return
  }

  const microScene: CreativeScene = {
    id: `microScene_${Date.now()}`,
    startTime: prevScene.startTime + prevScene.duration,
    duration,
    tempo: (prevScene.tempo + nextScene.tempo) / 2,
    tension: (prevScene.tension + nextScene.tension) / 2,
    cohesion: (prevScene.cohesion + nextScene.cohesion) / 2,
    density: (prevScene.density + nextScene.density) / 2,
    emotionalIntensity: (prevScene.emotionalIntensity + nextScene.emotionalIntensity) / 2,
    leadOS: prevScene.leadOS,
    supportingOS: [...prevScene.supportingOS],
    resistingOS: prevScene.resistingOS,
    description: `Transition: ${prevScene.description} → ${nextScene.description}`,
  }

  score.scenes.splice(afterSceneIndex + 1, 0, microScene)

  // Adjust start times for subsequent scenes
  for (let i = afterSceneIndex + 2; i < score.scenes.length; i++) {
    score.scenes[i].startTime += duration
  }
}

/**
 * Get rewrite summary statistics
 */
export function getRewriteSummary(score: AdaptiveCreativeScore): {
  totalRewrites: number
  rewritesByType: Record<string, number>
  rewritesByScene: Record<number, number>
  durationDrift: number
  structurePreserved: boolean
} {
  const rewritesByType: Record<string, number> = {}
  const rewritesByScene: Record<number, number> = {}

  score.rewriteHistory.forEach((entry) => {
    // By type
    rewritesByType[entry.directive.type] = (rewritesByType[entry.directive.type] || 0) + 1

    // By scene
    rewritesByScene[entry.scene] = (rewritesByScene[entry.scene] || 0) + 1
  })

  return {
    totalRewrites: score.adaptiveMetadata.totalRewrites,
    rewritesByType,
    rewritesByScene,
    durationDrift: score.adaptiveMetadata.durationDrift,
    structurePreserved: score.adaptiveMetadata.structurePreserved,
  }
}
