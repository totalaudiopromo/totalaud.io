/**
 * Insight Agent Behaviour
 * Detects bottlenecks, generates analogue cards, and suggests optimisations
 */

import type { TimelineClip, CardType } from '@totalaud/os-state/campaign'
import type {
  AgentBehaviour,
  AgentBehaviourOutput,
} from '../runtime/agent-runner'
import type { AgentContext } from '../runtime/agent-context'
import { DEFAULT_AGENT_CAPABILITIES } from '../runtime/agent-context'

export const insightBehaviour: AgentBehaviour = {
  name: 'insight',
  description: 'Insight agent - detects patterns, generates cards, and optimises workflow',
  supportedClipTypes: ['analysis', 'story', 'custom'],
  capabilities: {
    ...DEFAULT_AGENT_CAPABILITIES,
    canCreateCards: true, // Primary card generator
    canModifyClips: true, // Can suggest timeline changes
  },

  canExecute(clip: TimelineClip, context: AgentContext): boolean {
    const metadata = clip.metadata as any
    return (
      clip.agentSource === 'insight' &&
      ['analysis', 'story', 'custom'].includes(metadata?.behaviourType)
    )
  },

  async execute(clip: TimelineClip, context: AgentContext): Promise<AgentBehaviourOutput> {
    const metadata = clip.metadata as any
    const payload = metadata?.payload || {}

    try {
      // Analyse timeline for patterns
      const analysis = await analyseTimeline(context)

      // Detect bottlenecks
      const bottlenecks = detectBottlenecks(context, analysis)

      // Generate sentiment cards
      const cardsToCreate = generateSentimentCards(analysis, bottlenecks, clip.id)

      // Suggest optimisations
      const optimisations = suggestOptimisations(bottlenecks, context)

      // Create clips for optimisation actions
      const clipsToCreate = optimisations
        .filter((opt) => opt.autoImplement)
        .map((opt, index) => ({
          name: `Optimise: ${opt.title}`,
          trackId: clip.trackId,
          startTime: clip.startTime + clip.duration + index * 3,
          duration: opt.estimatedDuration,
          colour: '#F59E0B',
          agentSource: opt.suggestedAgent as any,
          cardLinks: [],
          metadata: {
            behaviourType: 'custom',
            payload: {
              optimisationType: opt.type,
              parentInsightClip: clip.id,
            },
          },
        }))

      return {
        success: true,
        message: `Analysis complete: ${bottlenecks.length} bottlenecks detected, ${cardsToCreate.length} sentiment cards generated`,
        data: {
          analysis,
          bottlenecks,
          optimisations,
        },
        clipsToCreate,
        cardsToCreate,
      }
    } catch (error) {
      return {
        success: false,
        message: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  },
}

/**
 * Analyse timeline for patterns and performance
 */
async function analyseTimeline(context: AgentContext): Promise<TimelineAnalysis> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const { timeline, cards } = context

  return {
    totalClips: timeline.clips.length,
    totalCards: cards.cards.length,
    averageClipDuration: timeline.clips.length > 0
      ? timeline.clips.reduce((sum, c) => sum + c.duration, 0) / timeline.clips.length
      : 0,
    clipsByAgent: {
      scout: timeline.clips.filter((c) => c.agentSource === 'scout').length,
      coach: timeline.clips.filter((c) => c.agentSource === 'coach').length,
      tracker: timeline.clips.filter((c) => c.agentSource === 'tracker').length,
      insight: timeline.clips.filter((c) => c.agentSource === 'insight').length,
    },
    cardsByType: cards.cards.reduce((acc, card) => {
      acc[card.type] = (acc[card.type] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    timelineHealth: calculateTimelineHealth(timeline.clips.length, cards.cards.length),
    executedAt: new Date(),
  }
}

/**
 * Detect bottlenecks in the workflow
 */
function detectBottlenecks(
  context: AgentContext,
  analysis: TimelineAnalysis
): Bottleneck[] {
  const bottlenecks: Bottleneck[] = []

  // Too many clips without cards
  const clipsWithoutCards = context.timeline.clips.filter((c) => c.cardLinks.length === 0)
  if (clipsWithoutCards.length > 10) {
    bottlenecks.push({
      type: 'missing_sentiment',
      severity: 'medium',
      title: 'Many clips lack sentiment cards',
      description: `${clipsWithoutCards.length} clips don't have story cards attached`,
      affectedClips: clipsWithoutCards.map((c) => c.id),
      suggestedAction: 'Add sentiment cards to track emotional journey',
    })
  }

  // Agent imbalance
  if (analysis.clipsByAgent.scout > analysis.clipsByAgent.coach * 3) {
    bottlenecks.push({
      type: 'agent_imbalance',
      severity: 'low',
      title: 'Too much research, not enough planning',
      description: 'Scout agent is being used 3x more than Coach',
      suggestedAction: 'Balance research with strategic planning',
    })
  }

  // Low card diversity
  const cardTypes = Object.keys(analysis.cardsByType).length
  if (cardTypes < 3 && analysis.totalCards > 5) {
    bottlenecks.push({
      type: 'low_card_diversity',
      severity: 'low',
      title: 'Limited emotional range',
      description: `Only ${cardTypes} card types used out of 9 available`,
      suggestedAction: 'Track a wider range of emotions',
    })
  }

  // Timeline health check
  if (analysis.timelineHealth < 0.5) {
    bottlenecks.push({
      type: 'timeline_health',
      severity: 'high',
      title: 'Timeline needs optimisation',
      description: 'Overall workflow efficiency is below 50%',
      suggestedAction: 'Review clip sequences and agent assignments',
    })
  }

  return bottlenecks
}

/**
 * Generate sentiment cards based on analysis
 */
function generateSentimentCards(
  analysis: TimelineAnalysis,
  bottlenecks: Bottleneck[],
  clipId: string
): Array<{ type: string; content: string; linkedClipId: string }> {
  const cards: Array<{ type: string; content: string; linkedClipId: string }> = []

  // Excitement for good progress
  if (analysis.totalClips > 20 && analysis.timelineHealth > 0.7) {
    cards.push({
      type: 'excitement',
      content: `Amazing progress! ${analysis.totalClips} clips created with ${Math.round(analysis.timelineHealth * 100)}% efficiency.`,
      linkedClipId: clipId,
    })
  }

  // Clarity for balanced workflow
  if (
    Math.abs(analysis.clipsByAgent.scout - analysis.clipsByAgent.coach) < 3 &&
    analysis.totalClips > 10
  ) {
    cards.push({
      type: 'clarity',
      content: 'Campaign workflow is well-balanced between research and planning.',
      linkedClipId: clipId,
    })
  }

  // Doubt for bottlenecks
  if (bottlenecks.some((b) => b.severity === 'high')) {
    cards.push({
      type: 'doubt',
      content: `Detected ${bottlenecks.filter((b) => b.severity === 'high').length} critical bottlenecks that need attention.`,
      linkedClipId: clipId,
    })
  }

  // Breakthrough for milestone
  if (analysis.totalClips >= 50) {
    cards.push({
      type: 'breakthrough',
      content: 'Milestone reached! 50+ clips created. Campaign is taking shape.',
      linkedClipId: clipId,
    })
  }

  return cards
}

/**
 * Suggest optimisations
 */
function suggestOptimisations(
  bottlenecks: Bottleneck[],
  context: AgentContext
): Optimisation[] {
  return bottlenecks.map((bottleneck) => ({
    type: bottleneck.type,
    title: bottleneck.suggestedAction,
    description: bottleneck.description,
    impact: bottleneck.severity === 'high' ? 'high' : 'medium',
    estimatedDuration: 5,
    suggestedAgent: getSuggestedAgentForOptimisation(bottleneck.type),
    autoImplement: bottleneck.severity !== 'high', // Don't auto-implement critical changes
  }))
}

function getSuggestedAgentForOptimisation(type: string): string {
  const agentMap: Record<string, string> = {
    missing_sentiment: 'insight',
    agent_imbalance: 'coach',
    low_card_diversity: 'insight',
    timeline_health: 'coach',
  }
  return agentMap[type] || 'insight'
}

function calculateTimelineHealth(clipCount: number, cardCount: number): number {
  // Simple health metric: ratio of cards to clips
  if (clipCount === 0) return 1
  const cardRatio = Math.min(cardCount / clipCount, 1)
  const clipScore = Math.min(clipCount / 30, 1) // Ideal: 30+ clips
  return (cardRatio + clipScore) / 2
}

interface TimelineAnalysis {
  totalClips: number
  totalCards: number
  averageClipDuration: number
  clipsByAgent: Record<string, number>
  cardsByType: Record<string, number>
  timelineHealth: number
  executedAt: Date
}

interface Bottleneck {
  type: string
  severity: 'low' | 'medium' | 'high'
  title: string
  description: string
  affectedClips?: string[]
  suggestedAction: string
}

interface Optimisation {
  type: string
  title: string
  description: string
  impact: 'low' | 'medium' | 'high'
  estimatedDuration: number
  suggestedAgent: string
  autoImplement: boolean
}
