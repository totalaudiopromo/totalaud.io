/**
 * Agent Clip Suggestions
 * System for agents to suggest timeline clips based on campaign context
 */

import type { AgentSuggestion } from '@totalaud/os-state/campaign'

export type AgentType = 'scout' | 'coach' | 'tracker' | 'insight'

interface SuggestionContext {
  campaignGoal: string
  currentPhase: string
  recentActions: string[]
  timelineLength: number // in seconds
}

/**
 * Scout Agent Suggestions
 * Suggests research and discovery clips
 */
export function generateScoutSuggestions(
  context: SuggestionContext
): AgentSuggestion[] {
  const suggestions: AgentSuggestion[] = []

  // Always suggest initial research phase
  if (context.timelineLength < 100) {
    suggestions.push({
      id: crypto.randomUUID(),
      agentType: 'scout',
      clipName: 'Research radio stations',
      suggestedDuration: 30,
      suggestedStartTime: 0,
      rationale: 'Start by identifying 20-30 relevant radio stations',
      confidence: 0.9,
      metadata: {
        tags: ['research', 'discovery'],
        priority: 'high',
      },
      createdAt: new Date(),
    })

    suggestions.push({
      id: crypto.randomUUID(),
      agentType: 'scout',
      clipName: 'Build contact database',
      suggestedDuration: 45,
      suggestedStartTime: 35,
      rationale: 'Compile email addresses and social profiles',
      confidence: 0.85,
      metadata: {
        tags: ['database', 'contacts'],
        priority: 'high',
      },
      createdAt: new Date(),
    })
  }

  return suggestions
}

/**
 * Coach Agent Suggestions
 * Suggests content creation and messaging clips
 */
export function generateCoachSuggestions(
  context: SuggestionContext
): AgentSuggestion[] {
  const suggestions: AgentSuggestion[] = []

  // Suggest pitch drafting after research phase
  if (
    context.recentActions.includes('research') ||
    context.timelineLength > 50
  ) {
    suggestions.push({
      id: crypto.randomUUID(),
      agentType: 'coach',
      clipName: 'Draft initial pitch',
      suggestedDuration: 20,
      rationale: 'Create personalised email template based on research',
      confidence: 0.88,
      metadata: {
        tags: ['content', 'pitch'],
        priority: 'medium',
      },
      createdAt: new Date(),
    })

    suggestions.push({
      id: crypto.randomUUID(),
      agentType: 'coach',
      clipName: 'Review and refine messaging',
      suggestedDuration: 15,
      rationale: 'Optimise pitch for target audience',
      confidence: 0.75,
      metadata: {
        tags: ['review', 'optimisation'],
        priority: 'medium',
      },
      createdAt: new Date(),
    })
  }

  return suggestions
}

/**
 * Tracker Agent Suggestions
 * Suggests follow-up and monitoring clips
 */
export function generateTrackerSuggestions(
  context: SuggestionContext
): AgentSuggestion[] {
  const suggestions: AgentSuggestion[] = []

  // Suggest tracking after outreach
  if (
    context.recentActions.includes('outreach') ||
    context.timelineLength > 100
  ) {
    suggestions.push({
      id: crypto.randomUUID(),
      agentType: 'tracker',
      clipName: 'First follow-up wave',
      suggestedDuration: 25,
      rationale: 'Send follow-ups to non-responders after 7 days',
      confidence: 0.82,
      metadata: {
        tags: ['follow-up', 'outreach'],
        priority: 'high',
        scheduledDays: 7,
      },
      createdAt: new Date(),
    })

    suggestions.push({
      id: crypto.randomUUID(),
      agentType: 'tracker',
      clipName: 'Response tracking',
      suggestedDuration: 10,
      rationale: 'Monitor opens, clicks, and replies',
      confidence: 0.9,
      metadata: {
        tags: ['analytics', 'tracking'],
        priority: 'medium',
      },
      createdAt: new Date(),
    })
  }

  return suggestions
}

/**
 * Insight Agent Suggestions
 * Suggests analysis and optimisation clips
 */
export function generateInsightSuggestions(
  context: SuggestionContext
): AgentSuggestion[] {
  const suggestions: AgentSuggestion[] = []

  // Suggest analysis after campaign midpoint
  if (context.timelineLength > 150) {
    suggestions.push({
      id: crypto.randomUUID(),
      agentType: 'insight',
      clipName: 'Mid-campaign analysis',
      suggestedDuration: 20,
      rationale: 'Analyse performance metrics and adjust strategy',
      confidence: 0.87,
      metadata: {
        tags: ['analysis', 'optimisation'],
        priority: 'high',
      },
      createdAt: new Date(),
    })

    suggestions.push({
      id: crypto.randomUUID(),
      agentType: 'insight',
      clipName: 'Identify top performers',
      suggestedDuration: 15,
      rationale: 'Find which contacts are most engaged',
      confidence: 0.8,
      metadata: {
        tags: ['insights', 'segmentation'],
        priority: 'medium',
      },
      createdAt: new Date(),
    })
  }

  return suggestions
}

/**
 * Generate all agent suggestions for current context
 */
export function generateAllSuggestions(
  context: SuggestionContext
): AgentSuggestion[] {
  return [
    ...generateScoutSuggestions(context),
    ...generateCoachSuggestions(context),
    ...generateTrackerSuggestions(context),
    ...generateInsightSuggestions(context),
  ]
}

/**
 * Filter suggestions by confidence threshold
 */
export function filterByConfidence(
  suggestions: AgentSuggestion[],
  minConfidence: number = 0.7
): AgentSuggestion[] {
  return suggestions
    .filter((s) => s.confidence >= minConfidence)
    .sort((a, b) => b.confidence - a.confidence)
}
