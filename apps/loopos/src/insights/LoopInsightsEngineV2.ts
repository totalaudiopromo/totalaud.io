/**
 * Loop Health v2 Engine
 * Advanced health monitoring and insights for LoopOS
 */

import type { LoopOSNode, LoopOSMomentum } from '@total-audio/loopos-db'
import { SequenceEngine } from '../sequence/SequenceEngine'

export interface LoopHealthScore {
  overall: number // 0-100
  dependency_health: number
  sequence_health: number
  momentum_health: number
  balance_health: number
  workload_health: number
}

export interface LoopInsight {
  type:
    | 'dependency'
    | 'sequence'
    | 'momentum'
    | 'balance'
    | 'workload'
    | 'creative_fatigue'
    | 'missing_feedback'
    | 'optimization'
  severity: 'critical' | 'warning' | 'info' | 'success'
  title: string
  description: string
  affected_node_ids?: string[]
  recommended_actions?: string[]
}

export interface LoopHealthReport {
  health_score: LoopHealthScore
  warnings: string[]
  insights: LoopInsight[]
  recommended_next_actions: string[]
  momentum_trend: 'rising' | 'stable' | 'declining' | 'critical'
  workload_status: 'underutilised' | 'optimal' | 'high' | 'overheating'
}

export class LoopInsightsEngineV2 {
  /**
   * Analyse loop health and generate comprehensive report
   */
  static analyseLoopHealth(
    nodes: LoopOSNode[],
    momentum: LoopOSMomentum | null
  ): LoopHealthReport {
    const sequenceMap = SequenceEngine.analyseSequence(nodes)

    const health_score = this.calculateHealthScores(nodes, sequenceMap, momentum)
    const insights = this.generateInsights(nodes, sequenceMap, momentum)
    const warnings = this.generateWarnings(sequenceMap, insights)
    const recommended_next_actions = this.generateRecommendations(nodes, sequenceMap, momentum, insights)
    const momentum_trend = this.calculateMomentumTrend(momentum)
    const workload_status = this.calculateWorkloadStatus(nodes)

    return {
      health_score,
      warnings,
      insights,
      recommended_next_actions,
      momentum_trend,
      workload_status,
    }
  }

  /**
   * Calculate health scores across all dimensions
   */
  private static calculateHealthScores(
    nodes: LoopOSNode[],
    sequenceMap: ReturnType<typeof SequenceEngine.analyseSequence>,
    momentum: LoopOSMomentum | null
  ): LoopHealthScore {
    const dependency_health = this.calculateDependencyHealth(sequenceMap)
    const sequence_health = this.calculateSequenceHealth(nodes, sequenceMap)
    const momentum_health = this.calculateMomentumHealth(momentum)
    const balance_health = this.calculateBalanceHealth(nodes)
    const workload_health = this.calculateWorkloadHealth(nodes)

    const overall = Math.round(
      (dependency_health +
        sequence_health +
        momentum_health +
        balance_health +
        workload_health) /
        5
    )

    return {
      overall,
      dependency_health,
      sequence_health,
      momentum_health,
      balance_health,
      workload_health,
    }
  }

  /**
   * Dependency health (no circular, no missing, no blocked)
   */
  private static calculateDependencyHealth(
    sequenceMap: ReturnType<typeof SequenceEngine.analyseSequence>
  ): number {
    const circularErrors = sequenceMap.warnings.filter((w) => w.type === 'circular').length
    const missingErrors = sequenceMap.warnings.filter((w) => w.type === 'missing_dependency').length
    const blockedWarnings = sequenceMap.warnings.filter((w) => w.type === 'blocked').length

    if (circularErrors > 0 || missingErrors > 0) return 0
    if (blockedWarnings > 5) return 30
    if (blockedWarnings > 2) return 60
    if (blockedWarnings > 0) return 80

    return 100
  }

  /**
   * Sequence health (progress, completion rate)
   */
  private static calculateSequenceHealth(
    nodes: LoopOSNode[],
    sequenceMap: ReturnType<typeof SequenceEngine.analyseSequence>
  ): number {
    const progress = SequenceEngine.getSequenceProgress(nodes)

    if (progress.total === 0) return 50 // No nodes yet

    const completionRate = progress.percentage
    const hasInProgress = progress.in_progress > 0

    let score = completionRate

    // Bonus for active progress
    if (hasInProgress && completionRate < 100) {
      score = Math.min(score + 10, 100)
    }

    // Penalty for stalled sequences
    if (progress.pending > 0 && progress.in_progress === 0 && progress.completed === 0) {
      score = Math.max(score - 20, 0)
    }

    return Math.round(score)
  }

  /**
   * Momentum health (current level, streak, decay)
   */
  private static calculateMomentumHealth(momentum: LoopOSMomentum | null): number {
    if (!momentum) return 50 // No momentum data yet

    const currentPercentage = (momentum.current_momentum / momentum.max_momentum) * 100

    if (currentPercentage >= 80) return 100
    if (currentPercentage >= 60) return 85
    if (currentPercentage >= 40) return 70
    if (currentPercentage >= 20) return 50
    if (currentPercentage >= 10) return 30

    return 10 // Critical
  }

  /**
   * Balance health (creative vs promotional mix)
   */
  private static calculateBalanceHealth(nodes: LoopOSNode[]): number {
    const creative = nodes.filter((n) => n.node_type === 'creative').length
    const promotional = nodes.filter((n) => n.node_type === 'promotional').length
    const total = nodes.length

    if (total === 0) return 50

    const creativeRatio = creative / total
    const promotionalRatio = promotional / total

    // Ideal: 40-60% creative, 20-40% promotional
    if (creativeRatio >= 0.4 && creativeRatio <= 0.6) {
      if (promotionalRatio >= 0.2 && promotionalRatio <= 0.4) {
        return 100 // Perfect balance
      }
      return 80
    }

    // Too much promotional, not enough creative
    if (promotionalRatio > 0.6) return 40

    // All creative, no promotion
    if (creativeRatio > 0.8) return 50

    return 70
  }

  /**
   * Workload health (not overloaded, not idle)
   */
  private static calculateWorkloadHealth(nodes: LoopOSNode[]): number {
    const inProgress = nodes.filter((n) => n.status === 'in_progress').length
    const pending = nodes.filter((n) => n.status === 'pending').length
    const total = nodes.length

    if (total === 0) return 50

    // Optimal: 2-4 in progress
    if (inProgress >= 2 && inProgress <= 4) {
      if (pending > 0) return 100 // Healthy pipeline
      return 90 // Good but running low on pending
    }

    // Too many in progress (overheating)
    if (inProgress > 6) return 30

    // One in progress (acceptable)
    if (inProgress === 1) return 75

    // None in progress but pending exists
    if (inProgress === 0 && pending > 0) return 60

    // Idle (nothing happening)
    if (inProgress === 0 && pending === 0) return 40

    return 70
  }

  /**
   * Generate insights from node and momentum data
   */
  private static generateInsights(
    nodes: LoopOSNode[],
    sequenceMap: ReturnType<typeof SequenceEngine.analyseSequence>,
    momentum: LoopOSMomentum | null
  ): LoopInsight[] {
    const insights: LoopInsight[] = []

    // Dependency insights
    const circularWarnings = sequenceMap.warnings.filter((w) => w.type === 'circular')
    for (const warning of circularWarnings) {
      insights.push({
        type: 'dependency',
        severity: 'critical',
        title: 'Circular dependency detected',
        description: warning.message,
        affected_node_ids: warning.node_ids,
        recommended_actions: ['Break the circular dependency by removing one of the dependencies'],
      })
    }

    // Workload insights
    const inProgress = nodes.filter((n) => n.status === 'in_progress')
    if (inProgress.length > 6) {
      insights.push({
        type: 'workload',
        severity: 'warning',
        title: 'Workload overheating',
        description: `You have ${inProgress.length} nodes in progress. This may lead to creative fatigue.`,
        affected_node_ids: inProgress.map((n) => n.id),
        recommended_actions: [
          'Focus on completing current tasks before starting new ones',
          'Consider archiving low-priority nodes',
        ],
      })
    }

    // Creative fatigue detection
    const recentCreativeNodes = nodes.filter(
      (n) => n.node_type === 'creative' && n.status === 'in_progress'
    )
    if (recentCreativeNodes.length > 4) {
      insights.push({
        type: 'creative_fatigue',
        severity: 'warning',
        title: 'Creative fatigue risk',
        description: `${recentCreativeNodes.length} creative nodes active simultaneously. Consider taking breaks.`,
        affected_node_ids: recentCreativeNodes.map((n) => n.id),
        recommended_actions: [
          'Complete one creative task before starting another',
          'Add some promotional tasks to balance the workload',
        ],
      })
    }

    // Balance insights
    const creative = nodes.filter((n) => n.node_type === 'creative').length
    const promotional = nodes.filter((n) => n.node_type === 'promotional').length

    if (promotional > creative * 2) {
      insights.push({
        type: 'balance',
        severity: 'warning',
        title: 'Creative vs promotional imbalance',
        description: 'You have significantly more promotional tasks than creative work.',
        recommended_actions: ['Add more creative nodes to maintain artistic balance'],
      })
    }

    // Missing feedback loops
    const unconnectedNodes = sequenceMap.warnings.filter((w) => w.type === 'unconnected')
    if (unconnectedNodes.length > 0) {
      insights.push({
        type: 'missing_feedback',
        severity: 'info',
        title: 'Unconnected nodes detected',
        description: `${unconnectedNodes[0].node_ids.length} nodes have no dependencies or dependents.`,
        affected_node_ids: unconnectedNodes[0].node_ids,
        recommended_actions: ['Consider linking these nodes to create workflow sequences'],
      })
    }

    // Momentum insights
    if (momentum) {
      if (momentum.current_momentum < momentum.max_momentum * 0.2) {
        insights.push({
          type: 'momentum',
          severity: 'critical',
          title: 'Momentum critically low',
          description: `Your momentum is at ${momentum.current_momentum}/${momentum.max_momentum}. Complete tasks to rebuild.`,
          recommended_actions: [
            'Complete quick wins to rebuild momentum',
            'Focus on high-momentum-value tasks',
          ],
        })
      }

      if (momentum.current_streak > 7) {
        insights.push({
          type: 'momentum',
          severity: 'success',
          title: 'Strong momentum streak',
          description: `${momentum.current_streak} day streak! Keep the momentum going.`,
          recommended_actions: ['Maintain daily progress to extend your streak'],
        })
      }
    }

    return insights
  }

  /**
   * Generate warnings array from insights
   */
  private static generateWarnings(
    sequenceMap: ReturnType<typeof SequenceEngine.analyseSequence>,
    insights: LoopInsight[]
  ): string[] {
    const warnings: string[] = []

    // Add critical and warning insights as warnings
    for (const insight of insights) {
      if (insight.severity === 'critical' || insight.severity === 'warning') {
        warnings.push(insight.title)
      }
    }

    return warnings
  }

  /**
   * Generate recommended next actions
   */
  private static generateRecommendations(
    nodes: LoopOSNode[],
    sequenceMap: ReturnType<typeof SequenceEngine.analyseSequence>,
    momentum: LoopOSMomentum | null,
    insights: LoopInsight[]
  ): string[] {
    const recommendations: string[] = []

    // Critical issues first
    const criticalInsights = insights.filter((i) => i.severity === 'critical')
    for (const insight of criticalInsights) {
      if (insight.recommended_actions) {
        recommendations.push(...insight.recommended_actions)
      }
    }

    // Suggested next nodes
    const readyNodes = SequenceEngine.getReadyNodes(nodes)
    if (readyNodes.length > 0) {
      const next = readyNodes[0]
      recommendations.push(`Start "${next.title}" (dependencies met)`)
    }

    // Auto-start suggestions
    const autoStartNode = SequenceEngine.getNextAutoStartNode(nodes)
    if (autoStartNode) {
      recommendations.push(`Auto-start enabled for "${autoStartNode.title}"`)
    }

    // General recommendations
    const inProgress = nodes.filter((n) => n.status === 'in_progress').length

    if (inProgress === 0 && readyNodes.length > 0) {
      recommendations.push('Start working on available tasks to build momentum')
    }

    if (momentum && momentum.current_streak === 0) {
      recommendations.push('Complete a task today to start a new streak')
    }

    return recommendations.slice(0, 5) // Limit to top 5
  }

  /**
   * Calculate momentum trend
   */
  private static calculateMomentumTrend(
    momentum: LoopOSMomentum | null
  ): 'rising' | 'stable' | 'declining' | 'critical' {
    if (!momentum) return 'stable'

    const currentPercentage = (momentum.current_momentum / momentum.max_momentum) * 100

    if (currentPercentage >= 80) return 'rising'
    if (currentPercentage >= 40) return 'stable'
    if (currentPercentage >= 20) return 'declining'

    return 'critical'
  }

  /**
   * Calculate workload status
   */
  private static calculateWorkloadStatus(
    nodes: LoopOSNode[]
  ): 'underutilised' | 'optimal' | 'high' | 'overheating' {
    const inProgress = nodes.filter((n) => n.status === 'in_progress').length

    if (inProgress === 0) return 'underutilised'
    if (inProgress >= 1 && inProgress <= 4) return 'optimal'
    if (inProgress >= 5 && inProgress <= 6) return 'high'

    return 'overheating'
  }
}
