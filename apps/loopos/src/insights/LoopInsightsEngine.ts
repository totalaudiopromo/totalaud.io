import { runAgent } from '@/agents/AgentExecutor'
import type { AgentInsight } from '@/agents/types'
import type { Node, Note, Momentum } from '@total-audio/loopos-db'

export interface LoopInsight {
  id: string
  type: 'momentum' | 'balance' | 'friction' | 'opportunity' | 'warning'
  title: string
  message: string
  priority: 'low' | 'medium' | 'high'
  actionable: boolean
  metadata?: Record<string, unknown>
}

/**
 * Generate insights about the current loop state
 */
export async function generateLoopInsights(
  nodes: Node[],
  notes: Note[],
  momentum: Momentum | null
): Promise<LoopInsight[]> {
  const context = buildLoopInsightsContext(nodes, notes, momentum)

  try {
    // Use the analyse agent to generate insights
    const output = await runAgent('analyse', context, {
      requestType: 'loop_health',
      totalNodes: nodes.length,
      totalNotes: notes.length,
      momentum: momentum?.momentum || 0,
    })

    // Convert agent insights to loop insights
    return convertAgentInsightsToLoopInsights(output.insights)
  } catch (error) {
    console.error('Error generating loop insights:', error)
    // Return rule-based insights if AI fails
    return generateRuleBasedInsights(nodes, notes, momentum)
  }
}

/**
 * Build context for insights generation
 */
function buildLoopInsightsContext(
  nodes: Node[],
  notes: Note[],
  momentum: Momentum | null
): string {
  const nodeStats = analyzeNodes(nodes)
  const noteStats = analyzeNotes(notes)
  const momentumStats = analyzeMomentum(momentum)

  return `Analyse the health of this creative loop and provide 3-5 key insights.

NODE STATISTICS:
- Total: ${nodes.length}
- Active: ${nodeStats.active}
- Completed: ${nodeStats.completed}
- High friction (7+): ${nodeStats.highFriction}
- Average priority: ${nodeStats.avgPriority.toFixed(1)}
- Type distribution:
  * Create: ${nodeStats.byType.create}
  * Promote: ${nodeStats.byType.promote}
  * Analyse: ${nodeStats.byType.analyse}
  * Refine: ${nodeStats.byType.refine}

NOTE STATISTICS:
- Total notes: ${notes.length}
- Ideas: ${noteStats.ideas}
- Tasks: ${noteStats.tasks}
- Blockers: ${noteStats.blockers}
- Wins: ${noteStats.wins}

MOMENTUM:
- Current: ${momentumStats.current}/100
- Streak: ${momentumStats.streak} days
- Trend: ${momentumStats.trend}
${momentumStats.lastGain ? `- Last gain: ${momentumStats.lastGain}` : ''}

AREAS TO ANALYSE:
1. Loop balance (are all phases represented?)
2. Momentum trends (gaining, dropping, stagnant?)
3. Friction points (what's slowing progress?)
4. Opportunities (what could amplify results?)
5. Warnings (what needs immediate attention?)

Provide specific, actionable insights that help the user understand their loop health and what to focus on.`
}

/**
 * Analyze nodes for statistics
 */
function analyzeNodes(nodes: Node[]) {
  const active = nodes.filter((n) => n.status === 'active').length
  const completed = nodes.filter((n) => n.status === 'completed').length
  const highFriction = nodes.filter((n) => n.friction >= 7).length
  const avgPriority =
    nodes.reduce((sum, n) => sum + n.priority, 0) / (nodes.length || 1)

  const byType = {
    create: nodes.filter((n) => n.type === 'create').length,
    promote: nodes.filter((n) => n.type === 'promote').length,
    analyse: nodes.filter((n) => n.type === 'analyse').length,
    refine: nodes.filter((n) => n.type === 'refine').length,
  }

  return { active, completed, highFriction, avgPriority, byType }
}

/**
 * Analyze notes for statistics
 */
function analyzeNotes(notes: Note[]) {
  return {
    ideas: notes.filter((n) => n.category === 'idea').length,
    tasks: notes.filter((n) => n.category === 'task').length,
    blockers: notes.filter((n) => n.category === 'blocker').length,
    wins: notes.filter((n) => n.category === 'win').length,
  }
}

/**
 * Analyze momentum for statistics
 */
function analyzeMomentum(momentum: Momentum | null) {
  const current = momentum?.momentum || 0
  const streak = momentum?.streak || 0
  const lastGain = momentum?.last_gain
    ? new Date(momentum.last_gain).toLocaleDateString()
    : null

  let trend = 'unknown'
  if (current >= 70) trend = 'strong'
  else if (current >= 40) trend = 'moderate'
  else if (current >= 20) trend = 'weak'
  else trend = 'critical'

  return { current, streak, trend, lastGain }
}

/**
 * Convert agent insights to loop insights
 */
function convertAgentInsightsToLoopInsights(
  agentInsights: AgentInsight[]
): LoopInsight[] {
  return agentInsights.map((insight, index) => {
    let type: LoopInsight['type'] = 'opportunity'
    let priority: LoopInsight['priority'] = 'medium'

    // Map agent insight type to loop insight type
    switch (insight.type) {
      case 'warning':
        type = 'warning'
        priority = 'high'
        break
      case 'success':
        type = 'momentum'
        priority = 'low'
        break
      case 'recommendation':
        type = 'opportunity'
        priority = 'medium'
        break
      case 'observation':
        type = 'balance'
        priority = 'low'
        break
    }

    return {
      id: `insight-${index}`,
      type,
      title: extractTitle(insight.message),
      message: insight.message,
      priority,
      actionable: insight.type === 'recommendation' || insight.type === 'warning',
      metadata: insight.data,
    }
  })
}

/**
 * Extract a title from insight message (first sentence)
 */
function extractTitle(message: string): string {
  const firstSentence = message.split('.')[0] || message
  return firstSentence.length > 60
    ? firstSentence.substring(0, 57) + '...'
    : firstSentence
}

/**
 * Generate rule-based insights (fallback)
 */
function generateRuleBasedInsights(
  nodes: Node[],
  notes: Note[],
  momentum: Momentum | null
): LoopInsight[] {
  const insights: LoopInsight[] = []

  // Momentum insight
  if (momentum) {
    if (momentum.momentum < 20) {
      insights.push({
        id: 'momentum-low',
        type: 'warning',
        title: 'Momentum critically low',
        message:
          'Your momentum has dropped below 20. Focus on completing high-priority tasks to rebuild momentum.',
        priority: 'high',
        actionable: true,
      })
    } else if (momentum.momentum > 70) {
      insights.push({
        id: 'momentum-high',
        type: 'momentum',
        title: 'Strong momentum',
        message: `You're on a ${momentum.streak}-day streak with ${momentum.momentum} momentum. Keep it up!`,
        priority: 'low',
        actionable: false,
      })
    }
  }

  // Balance insight
  const nodesByType = {
    create: nodes.filter((n) => n.type === 'create').length,
    promote: nodes.filter((n) => n.type === 'promote').length,
    analyse: nodes.filter((n) => n.type === 'analyse').length,
    refine: nodes.filter((n) => n.type === 'refine').length,
  }

  const missingTypes = Object.entries(nodesByType)
    .filter(([, count]) => count === 0)
    .map(([type]) => type)

  if (missingTypes.length > 0) {
    insights.push({
      id: 'balance-missing',
      type: 'balance',
      title: 'Loop imbalance detected',
      message: `Your loop is missing ${missingTypes.join(', ')} nodes. Add tasks in these areas for a balanced creative process.`,
      priority: 'medium',
      actionable: true,
    })
  }

  // Friction insight
  const highFrictionNodes = nodes.filter((n) => n.friction >= 7)
  if (highFrictionNodes.length > 0) {
    insights.push({
      id: 'friction-high',
      type: 'friction',
      title: 'High friction tasks detected',
      message: `You have ${highFrictionNodes.length} high-friction tasks. Consider breaking them down or delegating.`,
      priority: 'medium',
      actionable: true,
    })
  }

  // Blocker insight
  const blockers = notes.filter((n) => n.category === 'blocker')
  if (blockers.length > 0) {
    insights.push({
      id: 'blockers-present',
      type: 'warning',
      title: 'Active blockers found',
      message: `You have ${blockers.length} documented blockers. Address these to unblock your progress.`,
      priority: 'high',
      actionable: true,
    })
  }

  return insights
}
