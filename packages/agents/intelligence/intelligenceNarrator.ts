/**
 * Intelligence Narrator
 * Phase 15: CIB 2.0 - Generates narrative insights from OS behaviour data
 */

import type { ThemeId } from '@totalaud/os-state/campaign'
import type {
  OSIdentitySnapshot,
  OSRelationship,
} from '@totalaud/os-state/campaign/campaign.types'
import type {
  EvolutionSeries,
  RelationshipSeries,
} from '@totalaud/os-state/campaign/slices/intelligenceSlice'

/**
 * Input for narrative generation
 */
export interface IntelligenceNarrativeInput {
  snapshots: OSIdentitySnapshot[]
  evolutionSeries: EvolutionSeries[]
  relationshipSeries: RelationshipSeries[]
  currentRelationships?: OSRelationship[]
}

/**
 * Key moment in the intelligence story
 */
export interface KeyMoment {
  at: string // ISO timestamp
  title: string
  description: string
  type: 'cohesion_drop' | 'cohesion_peak' | 'leader_shift' | 'conflict' | 'alliance' | 'evolution'
}

/**
 * Generated intelligence narrative
 */
export interface IntelligenceNarrative {
  headline: string
  paragraphs: string[]
  keyMoments: KeyMoment[]
  insights: {
    dominantOS?: ThemeId
    strongestAlliance?: { osA: ThemeId; osB: ThemeId }
    biggestConflict?: { osA: ThemeId; osB: ThemeId }
    averageCohesion: number
    cohesionTrend: 'improving' | 'declining' | 'stable'
  }
}

const OS_LABELS: Record<ThemeId, string> = {
  ascii: 'ASCII',
  xp: 'XP',
  aqua: 'Aqua',
  daw: 'DAW',
  analogue: 'Analogue',
}

const OS_PERSONALITIES: Record<ThemeId, string> = {
  ascii: 'minimal and logical',
  xp: 'enthusiastic and helpful',
  aqua: 'thoughtful and refined',
  daw: 'experimental and rhythmic',
  analogue: 'warm and empathetic',
}

/**
 * Generate intelligence narrative from data
 */
export function generateIntelligenceNarrative(
  input: IntelligenceNarrativeInput
): IntelligenceNarrative {
  const { snapshots, evolutionSeries, relationshipSeries, currentRelationships } = input

  // Analyse snapshots for cohesion trends
  const cohesionAnalysis = analyseCohesionTrends(snapshots)

  // Analyse relationships for alliances and conflicts
  const relationshipAnalysis = analyseRelationships(relationshipSeries, currentRelationships)

  // Analyse evolution for personality changes
  const evolutionAnalysis = analyseEvolution(evolutionSeries)

  // Find key moments
  const keyMoments = findKeyMoments(snapshots, relationshipSeries, evolutionSeries)

  // Generate headline
  const headline = generateHeadline(cohesionAnalysis, relationshipAnalysis, evolutionAnalysis)

  // Generate paragraphs
  const paragraphs = generateParagraphs(
    cohesionAnalysis,
    relationshipAnalysis,
    evolutionAnalysis,
    keyMoments
  )

  return {
    headline,
    paragraphs,
    keyMoments: keyMoments.slice(0, 5), // Top 5 moments
    insights: {
      dominantOS: relationshipAnalysis.dominantOS,
      strongestAlliance: relationshipAnalysis.strongestAlliance,
      biggestConflict: relationshipAnalysis.biggestConflict,
      averageCohesion: cohesionAnalysis.average,
      cohesionTrend: cohesionAnalysis.trend,
    },
  }
}

/**
 * Analyse cohesion trends
 */
function analyseCohesionTrends(snapshots: OSIdentitySnapshot[]) {
  if (snapshots.length === 0) {
    return { average: 0, trend: 'stable' as const, min: 0, max: 0 }
  }

  const scores = snapshots.map((s) => s.cohesion_score || 0)
  const average = scores.reduce((sum, s) => sum + s, 0) / scores.length
  const min = Math.min(...scores)
  const max = Math.max(...scores)

  // Determine trend by comparing first half to second half
  const midpoint = Math.floor(snapshots.length / 2)
  const firstHalf = scores.slice(0, midpoint)
  const secondHalf = scores.slice(midpoint)

  const firstAvg = firstHalf.reduce((sum, s) => sum + s, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, s) => sum + s, 0) / secondHalf.length

  const trend =
    secondAvg > firstAvg + 0.1 ? 'improving' : secondAvg < firstAvg - 0.1 ? 'declining' : 'stable'

  return { average, trend, min, max }
}

/**
 * Analyse relationships
 */
function analyseRelationships(
  relationshipSeries: RelationshipSeries[],
  currentRelationships?: OSRelationship[]
) {
  let dominantOS: ThemeId | undefined
  let strongestAlliance: { osA: ThemeId; osB: ThemeId } | undefined
  let biggestConflict: { osA: ThemeId; osB: ThemeId } | undefined

  if (currentRelationships && currentRelationships.length > 0) {
    // Find strongest alliance (highest trust + synergy)
    let maxAlliance = -Infinity
    for (const rel of currentRelationships) {
      const score = rel.trust + rel.synergy
      if (score > maxAlliance) {
        maxAlliance = score
        strongestAlliance = { osA: rel.osA as ThemeId, osB: rel.osB as ThemeId }
      }
    }

    // Find biggest conflict (highest tension)
    let maxTension = -Infinity
    for (const rel of currentRelationships) {
      if (rel.tension > maxTension) {
        maxTension = rel.tension
        biggestConflict = { osA: rel.osA as ThemeId, osB: rel.osB as ThemeId }
      }
    }

    // Find dominant OS (appears most in high-trust relationships)
    const osScores: Record<string, number> = {}
    for (const rel of currentRelationships) {
      if (rel.trust > 0.5) {
        osScores[rel.osA] = (osScores[rel.osA] || 0) + rel.trust
        osScores[rel.osB] = (osScores[rel.osB] || 0) + rel.trust
      }
    }

    const entries = Object.entries(osScores)
    if (entries.length > 0) {
      const [os] = entries.reduce((a, b) => (a[1] > b[1] ? a : b))
      dominantOS = os as ThemeId
    }
  }

  return { dominantOS, strongestAlliance, biggestConflict }
}

/**
 * Analyse evolution
 */
function analyseEvolution(evolutionSeries: EvolutionSeries[]) {
  const changes: Array<{ os: ThemeId; metric: string; change: number }> = []

  for (const series of evolutionSeries) {
    if (series.series.length < 2) continue

    const first = series.series[0]
    const last = series.series[series.series.length - 1]

    const confChange = Math.abs(last.confidence - first.confidence)
    const riskChange = Math.abs(last.riskTolerance - first.riskTolerance)
    const empathyChange = Math.abs(last.empathy - first.empathy)

    if (confChange > 0.2) {
      changes.push({ os: series.os, metric: 'confidence', change: confChange })
    }
    if (riskChange > 0.2) {
      changes.push({ os: series.os, metric: 'risk tolerance', change: riskChange })
    }
    if (empathyChange > 0.2) {
      changes.push({ os: series.os, metric: 'empathy', change: empathyChange })
    }
  }

  return { significantChanges: changes.slice(0, 3) }
}

/**
 * Find key moments
 */
function findKeyMoments(
  snapshots: OSIdentitySnapshot[],
  relationshipSeries: RelationshipSeries[],
  evolutionSeries: EvolutionSeries[]
): KeyMoment[] {
  const moments: KeyMoment[] = []

  // Find cohesion drops and peaks
  for (let i = 1; i < snapshots.length; i++) {
    const prev = snapshots[i - 1]
    const curr = snapshots[i]

    const drop = (prev.cohesion_score || 0) - (curr.cohesion_score || 0)

    if (drop > 0.2) {
      moments.push({
        at: curr.taken_at,
        title: 'Major cohesion drop',
        description: `Cohesion fell ${(drop * 100).toFixed(0)}% as tensions emerged between OS personalities`,
        type: 'cohesion_drop',
      })
    } else if (drop < -0.2) {
      moments.push({
        at: curr.taken_at,
        title: 'Cohesion peak',
        description: `Strong alignment achieved with ${((curr.cohesion_score || 0) * 100).toFixed(0)}% cohesion`,
        type: 'cohesion_peak',
      })
    }

    // Leader shifts
    if (prev.leader_os && curr.leader_os && prev.leader_os !== curr.leader_os) {
      moments.push({
        at: curr.taken_at,
        title: 'Leadership transition',
        description: `${OS_LABELS[prev.leader_os as ThemeId]} stepped back as ${OS_LABELS[curr.leader_os as ThemeId]} emerged as leader`,
        type: 'leader_shift',
      })
    }
  }

  // Sort by timestamp
  moments.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())

  return moments
}

/**
 * Generate headline
 */
function generateHeadline(
  cohesion: any,
  relationships: any,
  evolution: any
): string {
  const { dominantOS, strongestAlliance, biggestConflict } = relationships
  const { trend } = cohesion

  if (dominantOS && trend === 'improving') {
    return `${OS_LABELS[dominantOS]} takes the lead as OS cohesion steadily improves`
  }

  if (strongestAlliance && biggestConflict) {
    const { osA: allyA, osB: allyB } = strongestAlliance
    const { osA: confA, osB: confB } = biggestConflict
    return `Strong ${OS_LABELS[allyA]}-${OS_LABELS[allyB]} alliance forms while ${OS_LABELS[confA]} and ${OS_LABELS[confB]} navigate tension`
  }

  if (dominantOS) {
    return `${OS_LABELS[dominantOS]} emerges as the guiding voice in your OS collective`
  }

  if (trend === 'improving') {
    return 'Your OS collective is finding harmony and alignment'
  }

  if (trend === 'declining') {
    return 'Tensions are reshaping the dynamics of your OS collective'
  }

  return 'Your OS ecosystem is actively evolving and adapting'
}

/**
 * Generate paragraphs
 */
function generateParagraphs(
  cohesion: any,
  relationships: any,
  evolution: any,
  moments: KeyMoment[]
): string[] {
  const paragraphs: string[] = []

  // Opening paragraph about overall trends
  const { trend, average } = cohesion
  const cohesionDesc =
    average > 0.7 ? 'strong collaboration' : average > 0.4 ? 'moderate tension' : 'significant conflict'

  paragraphs.push(
    `Over the course of this campaign, your five OS personalities have formed a ${cohesionDesc} dynamic. ` +
      `Cohesion levels have been ${trend === 'improving' ? 'steadily improving' : trend === 'declining' ? 'gradually declining' : 'holding relatively stable'}, ` +
      `with an average score of ${(average * 100).toFixed(0)}%.`
  )

  // Paragraph about leadership and dominance
  const { dominantOS, strongestAlliance, biggestConflict } = relationships
  if (dominantOS || strongestAlliance) {
    let leadershipText = ''

    if (dominantOS) {
      leadershipText += `${OS_LABELS[dominantOS]}, ${OS_PERSONALITIES[dominantOS]}, has emerged as the most influential voice in the collective. `
    }

    if (strongestAlliance) {
      const { osA, osB } = strongestAlliance
      leadershipText += `A particularly strong alliance formed between ${OS_LABELS[osA]} and ${OS_LABELS[osB]}, with high levels of trust and synergy reinforcing their collaboration.`
    }

    if (leadershipText) {
      paragraphs.push(leadershipText.trim())
    }
  }

  // Paragraph about conflicts and tensions
  if (biggestConflict) {
    const { osA, osB } = biggestConflict
    paragraphs.push(
      `The most notable source of creative tension emerged between ${OS_LABELS[osA]} and ${OS_LABELS[osB]}. ` +
        `This dynamic, while challenging at times, has created opportunities for the collective to explore alternative perspectives and refine decisions through healthy debate.`
    )
  }

  // Paragraph about evolution if significant
  if (evolution.significantChanges.length > 0) {
    const change = evolution.significantChanges[0]
    paragraphs.push(
      `Individual OS personalities also evolved significantly. ${OS_LABELS[change.os]}'s ${change.metric} shifted notably, ` +
        `reflecting how campaign experiences shaped each OS's approach and behaviour over time.`
    )
  }

  return paragraphs
}
