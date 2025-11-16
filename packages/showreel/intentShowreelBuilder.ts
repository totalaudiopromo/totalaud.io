/**
 * Intent Showreel Builder
 * Phase 20 - Build showreel from CreativeScore
 */

import type { CreativeScore, CreativeScene } from '../agents/intent/intent.types'

/**
 * Showreel Script - A visual/audio performance script
 */
export interface ShowreelScript {
  id: string
  title: string
  duration: number
  scenes: ShowreelScene[]
  metadata: {
    createdAt: string
    sourceScoreId: string
    style: string
    arc: string
  }
}

/**
 * Showreel Scene - A scene in the showreel
 */
export interface ShowreelScene {
  id: string
  title: string
  startTime: number
  duration: number
  cameraAngle: 'wide' | 'close' | 'overhead' | 'dynamic'
  lighting: 'bright' | 'dim' | 'dramatic' | 'ambient'
  osPresence: {
    primary: string | null
    secondary: string[]
    hidden: string[]
  }
  effects: {
    glitch: boolean
    bloom: boolean
    vignette: boolean
    particleIntensity: number
  }
  audio: {
    tempo: number
    volume: number
    layers: string[]
  }
  narration?: string
}

/**
 * Build a ShowreelScript from a CreativeScore
 */
export function buildIntentShowreel(score: CreativeScore): ShowreelScript {
  const scenes = score.scenes.map((scene, i) => buildShowreelScene(scene, i, score))

  return {
    id: `showreel_${score.id}`,
    title: generateShowreelTitle(score),
    duration: score.duration,
    scenes,
    metadata: {
      createdAt: new Date().toISOString(),
      sourceScoreId: score.id,
      style: score.sonicProfile.style,
      arc: score.sourceIntent?.arc || 'unknown',
    },
  }
}

/**
 * Build a ShowreelScene from a CreativeScene
 */
function buildShowreelScene(
  scene: CreativeScene,
  index: number,
  score: CreativeScore
): ShowreelScene {
  // Determine camera angle based on tension and density
  const cameraAngle = determineCameraAngle(scene.tension, scene.density)

  // Determine lighting based on emotional intensity and visual profile
  const lighting = determineLighting(scene.emotionalIntensity, score.visualProfile.brightness)

  // OS presence
  const osPresence = {
    primary: scene.leadOS,
    secondary: scene.supportingOS,
    hidden: scene.resistingOS ? [scene.resistingOS] : [],
  }

  // Visual effects based on visual profile
  const effects = {
    glitch: scene.tension > 0.7,
    bloom: score.visualProfile.bloom > 0.5,
    vignette: score.visualProfile.vignette > 0.5,
    particleIntensity: scene.density,
  }

  // Audio settings
  const audio = {
    tempo: scene.tempo,
    volume: 0.5 + scene.emotionalIntensity * 0.5,
    layers: determineAudioLayers(scene, score.sonicProfile),
  }

  // Optional narration for key moments
  const narration = generateNarration(scene, index, score)

  return {
    id: `showreel_scene_${index}`,
    title: scene.description,
    startTime: scene.startTime,
    duration: scene.duration,
    cameraAngle,
    lighting,
    osPresence,
    effects,
    audio,
    narration,
  }
}

/**
 * Determine camera angle from tension and density
 */
function determineCameraAngle(
  tension: number,
  density: number
): 'wide' | 'close' | 'overhead' | 'dynamic' {
  if (tension > 0.7 && density > 0.6) {
    return 'dynamic' // High energy, moving camera
  } else if (tension < 0.3) {
    return 'wide' // Calm, establishing shot
  } else if (density > 0.7) {
    return 'close' // Busy, focus on details
  } else {
    return 'overhead' // Medium, observational
  }
}

/**
 * Determine lighting from emotional intensity and brightness
 */
function determineLighting(
  intensity: number,
  brightness: number
): 'bright' | 'dim' | 'dramatic' | 'ambient' {
  if (brightness > 0.7 && intensity > 0.6) {
    return 'bright' // High energy, bright
  } else if (brightness < 0.3) {
    return 'dim' // Dark, mysterious
  } else if (intensity > 0.7) {
    return 'dramatic' // High intensity, dramatic lighting
  } else {
    return 'ambient' // Medium, soft ambient
  }
}

/**
 * Determine audio layers based on scene and sonic profile
 */
function determineAudioLayers(scene: CreativeScene, sonicProfile: any): string[] {
  const layers: string[] = []

  // Always have rhythm base
  layers.push('rhythm')

  // Add pads if intensity is high enough
  if (sonicProfile.padIntensity > 0.5) {
    layers.push('pads')
  }

  // Add percussion if intensity is high
  if (sonicProfile.percussiveIntensity > 0.6) {
    layers.push('percussion')
  }

  // Add melody if cohesion is high
  if (scene.cohesion > 0.6) {
    layers.push('melody')
  }

  // Add bass if density is high
  if (scene.density > 0.5) {
    layers.push('bass')
  }

  return layers
}

/**
 * Generate narration for key scenes
 */
function generateNarration(
  scene: CreativeScene,
  index: number,
  score: CreativeScore
): string | undefined {
  // Only generate narration for first, middle, and last scenes
  const isKeyScene =
    index === 0 || index === Math.floor(score.scenes.length / 2) || index === score.scenes.length - 1

  if (!isKeyScene) {
    return undefined
  }

  if (index === 0) {
    return `Beginning: ${scene.description}`
  } else if (index === score.scenes.length - 1) {
    return `Resolution: ${scene.description}`
  } else {
    return `Transition: ${scene.description}`
  }
}

/**
 * Generate showreel title from score
 */
function generateShowreelTitle(score: CreativeScore): string {
  const style = score.sonicProfile.style
  const palette = score.visualProfile.palette
  const arc = score.sourceIntent?.arc || 'journey'

  return `${style.charAt(0).toUpperCase() + style.slice(1)} ${arc} in ${palette} tones`
}

/**
 * Export showreel script as JSON
 */
export function exportShowreelJSON(script: ShowreelScript): string {
  return JSON.stringify(script, null, 2)
}

/**
 * Export showreel script as Markdown
 */
export function exportShowreelMarkdown(script: ShowreelScript): string {
  const lines: string[] = []

  lines.push(`# ${script.title}`)
  lines.push('')
  lines.push(`**Duration:** ${script.duration}s`)
  lines.push(`**Style:** ${script.metadata.style}`)
  lines.push(`**Arc:** ${script.metadata.arc}`)
  lines.push(`**Created:** ${new Date(script.metadata.createdAt).toLocaleString('en-GB')}`)
  lines.push('')

  lines.push('## Scenes')
  lines.push('')

  script.scenes.forEach((scene, i) => {
    lines.push(`### Scene ${i + 1}: ${scene.title}`)
    lines.push('')
    lines.push(`- **Time:** ${scene.startTime}s - ${scene.startTime + scene.duration}s`)
    lines.push(`- **Camera:** ${scene.cameraAngle}`)
    lines.push(`- **Lighting:** ${scene.lighting}`)
    lines.push(`- **Primary OS:** ${scene.osPresence.primary || 'None'}`)
    lines.push(`- **Tempo:** ${scene.audio.tempo} BPM`)
    lines.push(`- **Audio Layers:** ${scene.audio.layers.join(', ')}`)

    if (scene.narration) {
      lines.push('')
      lines.push(`> "${scene.narration}"`)
    }

    lines.push('')
  })

  return lines.join('\n')
}
