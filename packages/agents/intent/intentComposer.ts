/**
 * Intent Composer
 * Phase 20 - Convert IntentMap to CreativeScore
 * Deterministic creative score generation
 */

import type {
  IntentMap,
  CreativeScore,
  CreativeScene,
  CreativeSonicProfile,
  CreativeVisualProfile,
  CreativeEvent,
  BehaviourDirective,
  OSName,
} from './intent.types'

/**
 * Compose a CreativeScore from an IntentMap
 */
export function composeCreativeScore(intent: IntentMap): CreativeScore {
  const id = generateScoreId()
  const createdAt = new Date().toISOString()

  // Generate scenes from emotional curve
  const scenes = generateScenes(intent)

  // Generate sonic profile
  const sonicProfile = generateSonicProfile(intent)

  // Generate visual profile
  const visualProfile = generateVisualProfile(intent)

  // Generate event timeline
  const eventTimeline = generateEventTimeline(scenes, intent)

  // Generate behaviour directives
  const behaviourDirectivesByOS = generateBehaviourDirectives(scenes, intent)

  return {
    id,
    createdAt,
    duration: intent.durationSeconds,
    tempoCurve: intent.tempoCurve,
    scenes,
    sonicProfile,
    visualProfile,
    eventTimeline,
    behaviourDirectivesByOS,
    sourceIntent: intent,
  }
}

/**
 * Generate unique score ID
 */
function generateScoreId(): string {
  return `score_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Generate scenes from intent
 */
function generateScenes(intent: IntentMap): CreativeScene[] {
  const sceneCount = intent.emotionalCurve.length
  const sceneDuration = intent.durationSeconds / sceneCount

  return intent.emotionalCurve.map((emotionalIntensity, i) => {
    const structure = intent.performanceStructure[i]
    const tempo = intent.tempoCurve[i] || intent.tempoCurve[0]

    // Determine OS roles for this scene
    const { leadOS, supportingOS, resistingOS } = determineOSRoles(
      intent,
      i,
      sceneCount
    )

    return {
      id: `scene_${i}`,
      startTime: i * sceneDuration,
      duration: sceneDuration,
      tempo,
      tension: structure.tension,
      cohesion: structure.cohesion,
      density: structure.density,
      emotionalIntensity,
      leadOS,
      supportingOS,
      resistingOS,
      description: generateSceneDescription(intent, i, sceneCount),
    }
  })
}

/**
 * Determine OS roles for a scene
 */
function determineOSRoles(
  intent: IntentMap,
  sceneIndex: number,
  sceneCount: number
): {
  leadOS: OSName | null
  supportingOS: OSName[]
  resistingOS: OSName | null
} {
  const allOS: OSName[] = ['ascii', 'xp', 'aqua', 'ableton', 'punk']

  // Lead OS from intent, or rotate through available
  let leadOS = intent.leadOS
  if (!leadOS) {
    // Rotate lead through scenes
    leadOS = allOS[sceneIndex % allOS.length]
  }

  // Resisting OS from intent
  let resistingOS = intent.resistingOS

  // If no resisting OS specified, pick one different from lead
  if (!resistingOS && leadOS) {
    const candidates = allOS.filter((os) => os !== leadOS)
    resistingOS = candidates[sceneIndex % candidates.length] || null
  }

  // Supporting OS are the others
  const supportingOS = allOS.filter(
    (os) => os !== leadOS && os !== resistingOS
  )

  return { leadOS, supportingOS, resistingOS }
}

/**
 * Generate scene description
 */
function generateSceneDescription(
  intent: IntentMap,
  sceneIndex: number,
  sceneCount: number
): string {
  const position =
    sceneIndex === 0
      ? 'Opening'
      : sceneIndex === sceneCount - 1
        ? 'Closing'
        : `Scene ${sceneIndex + 1}`

  const { style, arc } = intent
  const structure = intent.performanceStructure[sceneIndex]

  const tensionDesc =
    structure.tension > 0.7
      ? 'high tension'
      : structure.tension > 0.4
        ? 'moderate tension'
        : 'low tension'

  const cohesionDesc =
    structure.cohesion > 0.7
      ? 'unified'
      : structure.cohesion > 0.4
        ? 'balanced'
        : 'fragmented'

  return `${position}: ${style} ${arc} with ${tensionDesc}, ${cohesionDesc} OS interaction`
}

/**
 * Generate sonic profile from intent
 */
function generateSonicProfile(intent: IntentMap): CreativeSonicProfile {
  const { style } = intent

  // Base density on style
  const baseDensity: Record<typeof style, number> = {
    calm: 0.3,
    intense: 0.8,
    balanced: 0.5,
    fragmented: 0.6,
    focused: 0.6,
  }

  // Brightness based on style
  const brightness: Record<typeof style, number> = {
    calm: 0.4,
    intense: 0.9,
    balanced: 0.6,
    fragmented: 0.7,
    focused: 0.7,
  }

  // Rhythmic complexity
  const rhythmicComplexity: Record<typeof style, number> = {
    calm: 0.2,
    intense: 0.8,
    balanced: 0.5,
    fragmented: 0.9,
    focused: 0.4,
  }

  // Pad and percussive intensity
  const padIntensity: Record<typeof style, number> = {
    calm: 0.8,
    intense: 0.3,
    balanced: 0.5,
    fragmented: 0.4,
    focused: 0.6,
  }

  const percussiveIntensity: Record<typeof style, number> = {
    calm: 0.2,
    intense: 0.9,
    balanced: 0.5,
    fragmented: 0.7,
    focused: 0.5,
  }

  return {
    style,
    density: baseDensity[style],
    brightness: brightness[style],
    rhythmicComplexity: rhythmicComplexity[style],
    padIntensity: padIntensity[style],
    percussiveIntensity: percussiveIntensity[style],
  }
}

/**
 * Generate visual profile from intent palette
 */
function generateVisualProfile(intent: IntentMap): CreativeVisualProfile {
  const { palette } = intent

  // Brightness based on palette
  const brightnessMap: Record<typeof palette, number> = {
    warm: 0.6,
    cold: 0.5,
    neutral: 0.5,
    dark: 0.2,
    bright: 0.9,
  }

  // Contrast
  const contrastMap: Record<typeof palette, number> = {
    warm: 0.6,
    cold: 0.7,
    neutral: 0.5,
    dark: 0.8,
    bright: 0.6,
  }

  // Saturation
  const saturationMap: Record<typeof palette, number> = {
    warm: 0.8,
    cold: 0.7,
    neutral: 0.3,
    dark: 0.5,
    bright: 0.9,
  }

  // Vignette (edge darkening)
  const vignetteMap: Record<typeof palette, number> = {
    warm: 0.3,
    cold: 0.4,
    neutral: 0.2,
    dark: 0.7,
    bright: 0.1,
  }

  // Bloom (glow effect)
  const bloomMap: Record<typeof palette, number> = {
    warm: 0.5,
    cold: 0.3,
    neutral: 0.2,
    dark: 0.2,
    bright: 0.8,
  }

  // Colour bias
  const colourBiasMap: Record<
    typeof palette,
    { red: number; green: number; blue: number }
  > = {
    warm: { red: 0.4, green: 0.2, blue: -0.2 },
    cold: { red: -0.3, green: 0.1, blue: 0.5 },
    neutral: { red: 0, green: 0, blue: 0 },
    dark: { red: -0.1, green: -0.1, blue: -0.1 },
    bright: { red: 0.3, green: 0.3, blue: 0.3 },
  }

  return {
    palette,
    brightness: brightnessMap[palette],
    contrast: contrastMap[palette],
    saturation: saturationMap[palette],
    vignette: vignetteMap[palette],
    bloom: bloomMap[palette],
    colourBias: colourBiasMap[palette],
  }
}

/**
 * Generate event timeline from scenes
 */
function generateEventTimeline(
  scenes: CreativeScene[],
  intent: IntentMap
): CreativeEvent[] {
  const events: CreativeEvent[] = []

  scenes.forEach((scene, i) => {
    // Scene start marker
    events.push({
      id: `event_scene_start_${i}`,
      time: scene.startTime,
      type: 'scene_start',
      intensity: scene.emotionalIntensity,
      metadata: { sceneId: scene.id },
    })

    // Tension peaks (when tension > 0.7)
    if (scene.tension > 0.7) {
      events.push({
        id: `event_tension_peak_${i}`,
        time: scene.startTime + scene.duration * 0.5,
        type: 'tension_peak',
        intensity: scene.tension,
        targetOS: scene.resistingOS || undefined,
      })

      // Evolution spark at tension peaks
      events.push({
        id: `event_evolution_spark_${i}`,
        time: scene.startTime + scene.duration * 0.6,
        type: 'evolution_spark',
        intensity: scene.tension,
        targetOS: scene.leadOS || undefined,
      })
    }

    // Cohesion boosts (when cohesion > 0.7)
    if (scene.cohesion > 0.7) {
      events.push({
        id: `event_cohesion_boost_${i}`,
        time: scene.startTime + scene.duration * 0.7,
        type: 'cohesion_boost',
        intensity: scene.cohesion,
      })
    }

    // Tension releases (when tension drops significantly)
    if (i > 0 && scenes[i - 1].tension - scene.tension > 0.3) {
      events.push({
        id: `event_tension_release_${i}`,
        time: scene.startTime,
        type: 'tension_release',
        intensity: scenes[i - 1].tension - scene.tension,
      })
    }

    // Tempo shifts (when tempo changes > 10 BPM)
    if (i > 0 && Math.abs(scenes[i - 1].tempo - scene.tempo) > 10) {
      events.push({
        id: `event_tempo_shift_${i}`,
        time: scene.startTime,
        type: 'tempo_shift',
        intensity: Math.abs(scenes[i - 1].tempo - scene.tempo) / 50,
        metadata: {
          fromTempo: scenes[i - 1].tempo,
          toTempo: scene.tempo,
        },
      })
    }
  })

  return events.sort((a, b) => a.time - b.time)
}

/**
 * Generate behaviour directives for all OS
 */
function generateBehaviourDirectives(
  scenes: CreativeScene[],
  intent: IntentMap
): Record<OSName, BehaviourDirective[]> {
  const allOS: OSName[] = ['ascii', 'xp', 'aqua', 'ableton', 'punk']

  const directivesByOS: Record<OSName, BehaviourDirective[]> = {
    ascii: [],
    xp: [],
    aqua: [],
    ableton: [],
    punk: [],
  }

  scenes.forEach((scene, i) => {
    // Set activity for lead OS
    if (scene.leadOS) {
      directivesByOS[scene.leadOS].push({
        id: `directive_${scene.leadOS}_lead_${i}`,
        time: scene.startTime,
        targetOS: scene.leadOS,
        action: 'set_activity',
        params: {
          activityState: 'speaking',
          duration: scene.duration,
        },
      })

      directivesByOS[scene.leadOS].push({
        id: `directive_${scene.leadOS}_priority_${i}`,
        time: scene.startTime,
        targetOS: scene.leadOS,
        action: 'set_priority',
        params: {
          priority: 0.9,
          duration: scene.duration,
        },
      })
    }

    // Set activity for resisting OS
    if (scene.resistingOS) {
      directivesByOS[scene.resistingOS].push({
        id: `directive_${scene.resistingOS}_resist_${i}`,
        time: scene.startTime,
        targetOS: scene.resistingOS,
        action: 'set_activity',
        params: {
          activityState: 'charged',
          duration: scene.duration,
        },
      })

      // Boost tension for resisting OS
      if (scene.tension > 0.5) {
        directivesByOS[scene.resistingOS].push({
          id: `directive_${scene.resistingOS}_tension_${i}`,
          time: scene.startTime + scene.duration * 0.3,
          targetOS: scene.resistingOS,
          action: 'boost_tension',
          params: {
            tensionDelta: scene.tension * 0.5,
            duration: scene.duration * 0.4,
          },
        })
      }
    }

    // Set supporting OS to thinking/listening
    scene.supportingOS.forEach((os) => {
      directivesByOS[os].push({
        id: `directive_${os}_support_${i}`,
        time: scene.startTime,
        targetOS: os,
        action: 'set_activity',
        params: {
          activityState: scene.density > 0.6 ? 'thinking' : 'idle',
          duration: scene.duration,
        },
      })
    })

    // Trigger evolution at high tension points
    if (scene.tension > 0.7 && scene.leadOS) {
      directivesByOS[scene.leadOS].push({
        id: `directive_${scene.leadOS}_evolve_${i}`,
        time: scene.startTime + scene.duration * 0.6,
        targetOS: scene.leadOS,
        action: 'trigger_evolution',
        params: {
          duration: 0,
        },
      })
    }

    // Reduce tension at resolution points
    if (scene.cohesion > 0.7) {
      allOS.forEach((os) => {
        directivesByOS[os].push({
          id: `directive_${os}_resolve_${i}`,
          time: scene.startTime + scene.duration * 0.7,
          targetOS: os,
          action: 'reduce_tension',
          params: {
            tensionDelta: -0.3,
            duration: scene.duration * 0.3,
          },
        })
      })
    }
  })

  return directivesByOS
}

/**
 * Get summary statistics from a CreativeScore
 */
export function getScoreSummary(score: CreativeScore): {
  sceneCount: number
  averageTempo: number
  peakTension: number
  averageCohesion: number
  totalEvents: number
  totalDirectives: number
  dominantOS: OSName | null
} {
  const sceneCount = score.scenes.length
  const averageTempo =
    score.tempoCurve.reduce((a, b) => a + b, 0) / score.tempoCurve.length
  const peakTension = Math.max(...score.scenes.map((s) => s.tension))
  const averageCohesion =
    score.scenes.reduce((sum, s) => sum + s.cohesion, 0) / sceneCount
  const totalEvents = score.eventTimeline.length

  const totalDirectives = Object.values(score.behaviourDirectivesByOS).reduce(
    (sum, directives) => sum + directives.length,
    0
  )

  // Find dominant OS (most lead roles)
  const osLeadCounts: Record<OSName, number> = {
    ascii: 0,
    xp: 0,
    aqua: 0,
    ableton: 0,
    punk: 0,
  }

  score.scenes.forEach((scene) => {
    if (scene.leadOS) {
      osLeadCounts[scene.leadOS]++
    }
  })

  const dominantOS =
    (Object.entries(osLeadCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as
      | OSName
      | undefined) || null

  return {
    sceneCount,
    averageTempo: Math.round(averageTempo),
    peakTension: Math.round(peakTension * 100) / 100,
    averageCohesion: Math.round(averageCohesion * 100) / 100,
    totalEvents,
    totalDirectives,
    dominantOS,
  }
}
