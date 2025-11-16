/**
 * Cross-OS Reasoning Engine
 * Enables collaboration and synthesis across all 5 OS personalities
 */

import type {
  ThemeId,
  AgentName,
  TimelineClip,
  AnalogueCard,
  CampaignMeta,
  FusionOutput,
  FusionMessage,
} from '@totalaud/os-state/campaign'
import {
  getAgentPersonality,
  formatAgentMessage,
  type OSType,
} from '../personalities/osPersonalities'
import { processEvolutionEvent } from '../evolution/evolutionEngine'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface FusionFocus {
  type: 'clip' | 'card' | 'campaign'
  id: string
  data: TimelineClip | AnalogueCard | CampaignMeta
}

export interface CrossOsReasoningContext {
  focus: FusionFocus
  previousMessages: FusionMessage[]
  agent: AgentName
  currentOS: ThemeId
}

/**
 * Generate a contribution from an agent in a specific OS
 */
export async function generateOSContribution({
  focus,
  previousMessages,
  agent,
  os,
}: {
  focus: FusionFocus
  previousMessages: FusionMessage[]
  agent: AgentName
  os: ThemeId
}): Promise<{
  summary: string
  recommendations: string[]
  sentiment: 'positive' | 'neutral' | 'cautious' | 'critical'
}> {
  const personality = getAgentPersonality(agent as AgentName, os as OSType)

  // Get previous OS contributions
  const previousOSMessages = previousMessages.filter((msg) => msg.os !== os)

  // Generate OS-specific analysis based on focus type and personality
  const contribution = analyseFromPerspective({
    focus,
    agent,
    os,
    personality,
    previousOSMessages,
  })

  return contribution
}

/**
 * Analyse the focus from a specific OS perspective
 */
function analyseFromPerspective({
  focus,
  agent,
  os,
  personality,
  previousOSMessages,
}: {
  focus: FusionFocus
  agent: AgentName
  os: ThemeId
  personality: any
  previousOSMessages: FusionMessage[]
}): {
  summary: string
  recommendations: string[]
  sentiment: 'positive' | 'neutral' | 'cautious' | 'critical'
} {
  // This is a simplified version that generates OS-specific perspectives
  // In a full implementation, this would call LLMs with OS-specific prompts

  const baseAnalysis = getBaseAnalysis(focus)

  // Apply OS personality to the analysis
  const summary = formatAgentMessage({
    agent,
    os: os as OSType,
    baseMessage: baseAnalysis.summary,
  })

  // Generate recommendations based on OS personality
  const recommendations = baseAnalysis.recommendations.map((rec, index) => {
    // Apply OS-specific framing to recommendations
    return applyOSFraming(rec, os, personality, index)
  })

  // Determine sentiment based on previous messages and OS personality
  const sentiment = determineSentiment(
    os,
    previousOSMessages,
    baseAnalysis.baseline
  )

  return { summary, recommendations, sentiment }
}

/**
 * Get baseline analysis of the focus object
 */
function getBaseAnalysis(focus: FusionFocus): {
  summary: string
  recommendations: string[]
  baseline: 'positive' | 'neutral' | 'cautious' | 'critical'
} {
  switch (focus.type) {
    case 'clip':
      return analyseClip(focus.data as TimelineClip)
    case 'card':
      return analyseCard(focus.data as AnalogueCard)
    case 'campaign':
      return analyseCampaign(focus.data as CampaignMeta)
    default:
      return {
        summary: 'Analysis pending',
        recommendations: ['Review and refine'],
        baseline: 'neutral',
      }
  }
}

function analyseClip(clip: TimelineClip) {
  return {
    summary: `Analysing clip "${clip.name}" at ${Math.floor(clip.startTime / 60)}m${Math.floor(clip.startTime % 60)}s`,
    recommendations: [
      'Verify timing and placement',
      'Check for conflicts with adjacent clips',
      'Ensure proper agent assignment',
    ],
    baseline: 'neutral' as const,
  }
}

function analyseCard(card: AnalogueCard) {
  return {
    summary: `Analysing ${card.type} card: "${card.content.substring(0, 50)}..."`,
    recommendations: [
      'Review emotional resonance',
      'Check timeline linkage',
      'Consider card placement in narrative',
    ],
    baseline: card.type === 'hope' || card.type === 'breakthrough' ? 'positive' : 'neutral' as const,
  }
}

function analyseCampaign(campaign: CampaignMeta) {
  return {
    summary: `Campaign overview: "${campaign.name}" - ${campaign.goal}`,
    recommendations: [
      'Review overall campaign structure',
      'Assess agent coverage',
      'Check for missing touchpoints',
    ],
    baseline: 'neutral' as const,
  }
}

/**
 * Apply OS-specific framing to a recommendation
 */
function applyOSFraming(
  rec: string,
  os: ThemeId,
  personality: any,
  index: number
): string {
  switch (os) {
    case 'ascii':
      return `> ${rec.toUpperCase()}`

    case 'xp':
      return `${index + 1}. ${rec}! 🎯`

    case 'aqua':
      return `${rec}. I recommend proceeding with this adjustment.`

    case 'daw':
      return `[track:${index + 1}] ${rec} • sync: ${Math.floor(Math.random() * 100)}%`

    case 'analogue':
      return `${rec}... it feels right.`

    default:
      return rec
  }
}

/**
 * Determine sentiment based on OS personality and previous messages
 */
function determineSentiment(
  os: ThemeId,
  previousMessages: FusionMessage[],
  baseline: 'positive' | 'neutral' | 'cautious' | 'critical'
): 'positive' | 'neutral' | 'cautious' | 'critical' {
  // OS-specific sentiment tendencies
  const osTendencies: Record<
    ThemeId,
    'positive' | 'neutral' | 'cautious' | 'critical'
  > = {
    ascii: 'neutral', // Factual
    xp: 'positive', // Optimistic
    aqua: 'cautious', // Professional caution
    daw: 'neutral', // Technical
    analogue: 'positive', // Warm
  }

  // If there's tension in previous messages, adjust accordingly
  const hasTension = previousMessages.some((msg) =>
    msg.content.message.toLowerCase().includes('concern')
  )

  if (hasTension && os !== 'xp') {
    return 'cautious'
  }

  return osTendencies[os]
}

/**
 * Execute full cross-OS reasoning across all 5 OSs
 */
export async function executeCrossOsReasoning({
  focus,
  agent,
  osContributors = ['ascii', 'xp', 'aqua', 'daw', 'analogue'],
}: {
  focus: FusionFocus
  agent: AgentName
  osContributors?: ThemeId[]
}): Promise<FusionOutput> {
  const messages: FusionMessage[] = []

  // Generate contributions from each OS in sequence (allowing cross-referencing)
  const perOS: FusionOutput['perOS'] = {} as any

  for (const os of osContributors) {
    const contribution = await generateOSContribution({
      focus,
      previousMessages: messages,
      agent,
      os,
    })

    perOS[os] = contribution

    // Add to message history for next OS to reference
    messages.push({
      id: crypto.randomUUID(),
      sessionId: '', // Will be set by caller
      os,
      agent,
      role: 'agent',
      content: {
        message: contribution.summary,
        recommendations: contribution.recommendations,
      },
      createdAt: new Date().toISOString(),
    })
  }

  // Synthesise unified summary
  const unifiedSummary = synthesiseUnifiedSummary(perOS, focus)

  // Find points of agreement
  const pointsOfAgreement = findAgreements(perOS)

  // Find points of tension
  const pointsOfTension = findTensions(perOS)

  return {
    perOS,
    unifiedSummary,
    pointsOfAgreement,
    pointsOfTension,
  }
}

/**
 * Synthesise a unified summary from all OS perspectives
 */
function synthesiseUnifiedSummary(
  perOS: FusionOutput['perOS'],
  focus: FusionFocus
): string {
  const summaries = Object.values(perOS).map((contrib) => contrib.summary)

  // Create a cohesive summary that honours all perspectives
  const focusName =
    focus.type === 'clip'
      ? (focus.data as TimelineClip).name
      : focus.type === 'card'
        ? `${(focus.data as AnalogueCard).type} card`
        : (focus.data as CampaignMeta).name

  return `After collaborative analysis across all 5 OS perspectives, the consensus on "${focusName}" shows a blend of technical precision (ASCII/DAW), optimism (XP), professionalism (Aqua), and emotional intelligence (Analogue). This multi-dimensional view provides a complete picture for decision-making.`
}

/**
 * Find common recommendations across OSs
 */
function findAgreements(perOS: FusionOutput['perOS']): string[] {
  const allRecommendations = Object.values(perOS).flatMap(
    (contrib) => contrib.recommendations
  )

  // Find common themes (simplified - in production would use NLP)
  const themes = new Map<string, number>()

  allRecommendations.forEach((rec) => {
    const normalised = rec.toLowerCase()
    if (normalised.includes('review') || normalised.includes('check')) {
      themes.set('review', (themes.get('review') || 0) + 1)
    }
    if (normalised.includes('timing') || normalised.includes('placement')) {
      themes.set('timing', (themes.get('timing') || 0) + 1)
    }
    if (normalised.includes('agent')) {
      themes.set('agent', (themes.get('agent') || 0) + 1)
    }
  })

  // Return themes mentioned by 3+ OSs
  return Array.from(themes.entries())
    .filter(([, count]) => count >= 3)
    .map(([theme]) => `All OSs agree: ${theme} needs attention`)
}

/**
 * Find conflicting perspectives across OSs
 */
function findTensions(perOS: FusionOutput['perOS']): string[] {
  const tensions: string[] = []

  const sentiments = Object.entries(perOS).map(([os, contrib]) => ({
    os,
    sentiment: contrib.sentiment,
  }))

  // Check for sentiment divergence
  const hasPositive = sentiments.some((s) => s.sentiment === 'positive')
  const hasCritical = sentiments.some((s) => s.sentiment === 'critical')

  if (hasPositive && hasCritical) {
    tensions.push(
      'Sentiment divergence: some OSs are optimistic while others express caution'
    )
  }

  return tensions
}

/**
 * Create fusion card data from fusion output
 */
export function createFusionCardFromOutput(
  output: FusionOutput,
  sessionId: string,
  osContributors: ThemeId[]
): {
  osContributors: ThemeId[]
  unifiedSummary: string
  pointsOfAgreement: string[]
  pointsOfTension: string[]
  recommendedNextMoves: string[]
  sessionId: string
} {
  // Collect all unique recommendations
  const allRecommendations = Object.values(output.perOS).flatMap(
    (contrib) => contrib.recommendations
  )

  // Take top 5 most common (simplified)
  const recommendedNextMoves = allRecommendations.slice(0, 5)

  return {
    osContributors,
    unifiedSummary: output.unifiedSummary,
    pointsOfAgreement: output.pointsOfAgreement,
    pointsOfTension: output.pointsOfTension,
    recommendedNextMoves,
    sessionId,
  }
}

/**
 * Trigger OS Evolution events based on fusion consensus/tension
 * Called after fusion reasoning completes
 */
export async function triggerFusionEvolution({
  output,
  userId,
  campaignId,
  osContributors,
}: {
  output: FusionOutput
  userId: string
  campaignId?: string
  osContributors: ThemeId[]
}): Promise<void> {
  const hasConsensus = output.pointsOfAgreement.length >= 1
  const hasTension = output.pointsOfTension.length >= 1

  // Determine which OSs are in agreement vs tension
  const sentimentCounts = new Map<string, { os: ThemeId; sentiment: string }[]>()

  for (const [os, contrib] of Object.entries(output.perOS)) {
    const sentiment = contrib.sentiment || 'neutral'
    if (!sentimentCounts.has(sentiment)) {
      sentimentCounts.set(sentiment, [])
    }
    sentimentCounts.get(sentiment)!.push({ os: os as ThemeId, sentiment })
  }

  // Find majority sentiment
  let majoritySentiment: string | null = null
  let maxCount = 0
  for (const [sentiment, oses] of sentimentCounts.entries()) {
    if (oses.length > maxCount) {
      maxCount = oses.length
      majoritySentiment = sentiment
    }
  }

  // Trigger evolution for each OS
  for (const os of osContributors) {
    try {
      const contrib = output.perOS[os]
      const sentiment = contrib.sentiment || 'neutral'
      const isInMajority = sentiment === majoritySentiment && maxCount >= 3

      if (hasConsensus && isInMajority) {
        // This OS agrees with consensus → confidence boost
        await processEvolutionEvent(
          {
            type: 'fusion_agreement',
            os,
            meta: {
              sentiment,
              agreements: output.pointsOfAgreement.length,
            },
            timestamp: new Date().toISOString(),
          },
          userId,
          campaignId
        )
      } else if (hasTension && !isInMajority) {
        // This OS is out of sync → caution increase
        await processEvolutionEvent(
          {
            type: 'fusion_tension',
            os,
            meta: {
              sentiment,
              tensions: output.pointsOfTension.length,
            },
            timestamp: new Date().toISOString(),
          },
          userId,
          campaignId
        )
      }
    } catch (error) {
      console.error(`[FusionEvolution] Failed to evolve ${os}:`, error)
      // Continue with other OSs
    }
  }
}
