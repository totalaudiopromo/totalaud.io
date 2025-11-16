/**
 * Showreel Script Engine
 * Phase 17: Campaign Performance Playback - Script generation from campaign data
 */

import { nanoid } from 'nanoid'
import type {
  ShowreelScript,
  ShowreelScene,
  ShowreelSceneType,
} from './showreelTypes'
import type { ThemeId } from '@totalaud/os-state/campaign'

/**
 * Identity snapshot (from Phase 15)
 */
export interface IdentitySnapshot {
  takenAt: string
  leaderOS: ThemeId
  cohesion: number
  osMetrics: Record<
    ThemeId,
    {
      confidence: number
      riskTolerance: number
      empathy: number
    }
  >
}

/**
 * Intelligence narrative (from Phase 15)
 */
export interface IntelligenceNarrative {
  headline: string
  paragraphs: string[]
  keyMoments: Array<{
    timestamp: string
    description: string
  }>
  insights: {
    dominantOS: ThemeId
    strongestAlliance?: { osA: ThemeId; osB: ThemeId }
    biggestConflict?: { osA: ThemeId; osB: ThemeId }
    averageCohesion: number
    cohesionTrend: 'improving' | 'declining' | 'stable'
  }
}

/**
 * Evolution series (from Phase 15)
 */
export interface EvolutionSeries {
  os: ThemeId
  confidence: Array<{ timestamp: string; value: number }>
  riskTolerance: Array<{ timestamp: string; value: number }>
  empathy: Array<{ timestamp: string; value: number }>
  verbosity: Array<{ timestamp: string; value: number }>
  tempo: Array<{ timestamp: string; value: number }>
}

/**
 * Social summary (from Phase 14)
 */
export interface SocialSummary {
  leader: ThemeId
  support: ThemeId[]
  rebel?: ThemeId
  alliances: Array<{ osA: ThemeId; osB: ThemeId; strength: number }>
  conflicts: Array<{ osA: ThemeId; osB: ThemeId; tension: number }>
}

/**
 * Showreel context - all data needed to generate a script
 */
export interface ShowreelContext {
  campaignId: string
  snapshots: IdentitySnapshot[]
  narrative: IntelligenceNarrative
  evolutionSeries: EvolutionSeries[]
  relationshipSummary: SocialSummary
}

/**
 * Build a complete showreel script from campaign data
 */
export function buildShowreelScript(ctx: ShowreelContext): ShowreelScript {
  const scenes: ShowreelScene[] = []

  // 1. Intro - establish campaign + OS constellation
  scenes.push(buildIntroScene(ctx))

  // 2. OS Personalities - show OS roles
  scenes.push(buildOSPersonalitiesScene(ctx))

  // 3. Social Graph - show alliances/tension
  scenes.push(buildSocialGraphScene(ctx))

  // 4. Cohesion Arc - show cohesion over time
  scenes.push(buildCohesionArcScene(ctx))

  // 5. Timeline Focus - highlight key campaign moments
  if (ctx.narrative.keyMoments.length > 0) {
    scenes.push(buildTimelineFocusScene(ctx))
  }

  // 6. Performance Peak - live performance section
  scenes.push(buildPerformancePeakScene(ctx))

  // 7. Reflection - "what we learnt"
  scenes.push(buildReflectionScene(ctx))

  // 8. Outro - closing summary
  scenes.push(buildOutroScene(ctx))

  const totalDuration = scenes.reduce((sum, scene) => sum + scene.durationSeconds, 0)

  return {
    id: nanoid(),
    campaignId: ctx.campaignId,
    createdAt: new Date().toISOString(),
    totalDurationSeconds: totalDuration,
    scenes,
  }
}

/**
 * Scene builders
 */

function buildIntroScene(ctx: ShowreelContext): ShowreelScene {
  return {
    id: nanoid(),
    type: 'intro',
    title: 'Campaign Intelligence',
    subtitle: ctx.narrative.headline,
    durationSeconds: 10,
    camera: {
      mode: 'wide',
      intensity: 'subtle',
    },
    captions: [
      'Five OS personalities working together',
      ctx.narrative.headline,
      `Average cohesion: ${Math.round(ctx.narrative.insights.averageCohesion * 100)}%`,
    ],
  }
}

function buildOSPersonalitiesScene(ctx: ShowreelContext): ShowreelScene {
  const { leader, support, rebel } = ctx.relationshipSummary

  const captions = [`${leader.toUpperCase()} emerged as the natural leader`]

  if (support.length > 0) {
    captions.push(
      `Supported by ${support.map((os) => os.toUpperCase()).join(' and ')}`
    )
  }

  if (rebel) {
    captions.push(`${rebel.toUpperCase()} challenged conventions and pushed boundaries`)
  }

  return {
    id: nanoid(),
    type: 'os_personalities',
    title: 'OS Personalities',
    subtitle: 'Different roles, shared vision',
    durationSeconds: 12,
    focus: {
      os: leader,
    },
    camera: {
      mode: 'focus_os',
      intensity: 'normal',
    },
    captions,
  }
}

function buildSocialGraphScene(ctx: ShowreelContext): ShowreelScene {
  const { alliances, conflicts } = ctx.relationshipSummary
  const captions: string[] = []

  if (alliances.length > 0) {
    const strongest = alliances[0]
    captions.push(
      `${strongest.osA.toUpperCase()} and ${strongest.osB.toUpperCase()} formed the strongest alliance`
    )
  }

  if (conflicts.length > 0) {
    const biggest = conflicts[0]
    captions.push(
      `Creative tension between ${biggest.osA.toUpperCase()} and ${biggest.osB.toUpperCase()}`
    )
  }

  if (ctx.narrative.insights.strongestAlliance) {
    const { osA, osB } = ctx.narrative.insights.strongestAlliance
    captions.push(`Trust and synergy built between ${osA.toUpperCase()} and ${osB.toUpperCase()}`)
  }

  return {
    id: nanoid(),
    type: 'social_graph',
    title: 'OS Relationships',
    subtitle: 'Trust, tension, and collaboration',
    durationSeconds: 12,
    camera: {
      mode: 'graph',
      intensity: 'normal',
    },
    captions,
  }
}

function buildCohesionArcScene(ctx: ShowreelContext): ShowreelScene {
  const { cohesionTrend, averageCohesion } = ctx.narrative.insights

  const captions: string[] = []

  if (cohesionTrend === 'improving') {
    captions.push('Cohesion improved as the campaign progressed')
    captions.push('OSs learnt to work together more effectively')
  } else if (cohesionTrend === 'declining') {
    captions.push('Creative tensions emerged over time')
    captions.push('Different visions led to healthy debate')
  } else {
    captions.push('Cohesion remained steady throughout')
    captions.push('A balanced and stable collaboration')
  }

  captions.push(`Final cohesion: ${Math.round(averageCohesion * 100)}%`)

  return {
    id: nanoid(),
    type: 'cohesion_arc',
    title: 'Cohesion Journey',
    subtitle: `Trend: ${cohesionTrend}`,
    durationSeconds: 10,
    camera: {
      mode: 'orbit',
      intensity: 'subtle',
    },
    captions,
  }
}

function buildTimelineFocusScene(ctx: ShowreelContext): ShowreelScene {
  const keyMoments = ctx.narrative.keyMoments.slice(0, 3)
  const captions = keyMoments.map((moment) => moment.description)

  return {
    id: nanoid(),
    type: 'timeline_focus',
    title: 'Key Moments',
    subtitle: 'Campaign highlights',
    durationSeconds: 12,
    camera: {
      mode: 'timeline',
      intensity: 'normal',
    },
    captions,
  }
}

function buildPerformancePeakScene(ctx: ShowreelContext): ShowreelScene {
  return {
    id: nanoid(),
    type: 'performance_peak',
    title: 'Live Collaboration',
    subtitle: 'OSs working in real-time',
    durationSeconds: 15,
    camera: {
      mode: 'orbit',
      intensity: 'dramatic',
    },
    captions: [
      'Watch the OS collective perform',
      'Real-time collaboration and evolution',
      'This is the future of creative intelligence',
    ],
  }
}

function buildReflectionScene(ctx: ShowreelContext): ShowreelScene {
  const captions = ctx.narrative.paragraphs.slice(0, 2)

  return {
    id: nanoid(),
    type: 'reflection',
    title: 'Reflections',
    subtitle: 'What we learnt',
    durationSeconds: 12,
    camera: {
      mode: 'wide',
      intensity: 'subtle',
    },
    captions,
  }
}

function buildOutroScene(ctx: ShowreelContext): ShowreelScene {
  return {
    id: nanoid(),
    type: 'outro',
    title: 'Campaign Complete',
    subtitle: ctx.narrative.headline,
    durationSeconds: 8,
    camera: {
      mode: 'wide',
      intensity: 'subtle',
    },
    captions: [
      'A living record of collaborative intelligence',
      'Built with totalaud.io',
      'Your cinematic creative collaborator',
    ],
  }
}
