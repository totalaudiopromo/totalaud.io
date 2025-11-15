import { runAgent } from '@/agents/AgentExecutor'
import type { AgentAction } from '@/agents/types'
import type { Node, Momentum } from '@total-audio/loopos-db'

/**
 * Generate daily priority actions based on loop state
 */
export async function generateDailyActions(
  nodes: Node[],
  momentum: Momentum | null
): Promise<AgentAction[]> {
  // Build context from current loop state
  const context = buildDailyActionsContext(nodes, momentum)

  try {
    // Use the refine agent to generate optimized daily actions
    const output = await runAgent('refine', context, {
      requestType: 'daily_actions',
      nodeCount: nodes.length,
      momentum: momentum?.momentum || 0,
      streak: momentum?.streak || 0,
    })

    // Return the generated actions
    return output.actions
  } catch (error) {
    console.error('Error generating daily actions:', error)
    // Return fallback actions if AI fails
    return generateFallbackActions(nodes)
  }
}

/**
 * Build context string from loop state
 */
function buildDailyActionsContext(
  nodes: Node[],
  momentum: Momentum | null
): string {
  const activeNodes = nodes.filter((n) => n.status === 'active')
  const upcomingNodes = nodes.filter((n) => n.status === 'upcoming')
  const completedNodes = nodes.filter((n) => n.status === 'completed')

  const nodesByType = {
    create: nodes.filter((n) => n.type === 'create').length,
    promote: nodes.filter((n) => n.type === 'promote').length,
    analyse: nodes.filter((n) => n.type === 'analyse').length,
    refine: nodes.filter((n) => n.type === 'refine').length,
  }

  const highPriorityNodes = nodes
    .filter((n) => n.priority >= 7 && n.status !== 'completed')
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5)

  let context = `I need you to generate 5 priority actions for today based on my creative loop state.

LOOP OVERVIEW:
- Total nodes: ${nodes.length}
- Active nodes: ${activeNodes.length}
- Upcoming nodes: ${upcomingNodes.length}
- Completed nodes: ${completedNodes.length}

NODES BY TYPE:
- Create: ${nodesByType.create}
- Promote: ${nodesByType.promote}
- Analyse: ${nodesByType.analyse}
- Refine: ${nodesByType.refine}

MOMENTUM:
- Current momentum: ${momentum?.momentum || 0}/100
- Current streak: ${momentum?.streak || 0} days
${momentum?.last_gain ? `- Last gain: ${new Date(momentum.last_gain).toLocaleDateString()}` : ''}

HIGH PRIORITY NODES:
${highPriorityNodes.length > 0 ? highPriorityNodes.map((n) => `- ${n.title} (${n.type}, priority: ${n.priority}, friction: ${n.friction})`).join('\n') : '- None'}

Generate 5 specific, actionable tasks I should focus on TODAY to:
1. Maintain or increase momentum
2. Address high-priority nodes
3. Keep the loop balanced across all four phases
4. Reduce friction where possible

Each action should be clear, specific, and achievable within today.`

  return context
}

/**
 * Generate fallback actions if AI fails
 */
function generateFallbackActions(nodes: Node[]): AgentAction[] {
  const activeNodes = nodes
    .filter((n) => n.status === 'active')
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5)

  if (activeNodes.length === 0) {
    return [
      {
        id: 'fallback-1',
        title: 'Review your creative loop',
        description: 'Take 15 minutes to review your loop and add new nodes',
        priority: 'medium',
        estimatedTime: '15 minutes',
        category: 'planning',
      },
    ]
  }

  return activeNodes.map((node, index) => ({
    id: `fallback-${index}`,
    title: `Work on: ${node.title}`,
    description: node.description || `Complete this ${node.type} task`,
    priority: node.priority >= 7 ? 'high' : 'medium',
    estimatedTime: 'TBD',
    category: node.type,
  }))
}

/**
 * Refresh daily actions (can be called on demand or scheduled)
 */
export async function refreshDailyActions(
  nodes: Node[],
  momentum: Momentum | null
): Promise<AgentAction[]> {
  return generateDailyActions(nodes, momentum)
}
