/**
 * Loop Insights v3 - Advanced Behavioral Analytics
 * Detects patterns, predicts burnout, and provides actionable intelligence
 */

import type { DbNode, DbJournalEntry, DbFlowSession } from '@loopos/db'

export interface InsightV3 {
  id: string
  type:
    | 'task-avoidance'
    | 'peak-hours'
    | 'momentum-correlation'
    | 'burnout-prediction'
    | 'time-to-release'
    | 'bottleneck'
    | 'velocity'
  severity: 'low' | 'medium' | 'high'
  title: string
  description: string
  actionable_steps: string[]
  confidence: number // 0-100
  metadata: Record<string, unknown>
  created_at: Date
}

export interface BehaviouralSignals {
  taskAvoidanceScore: number // 0-100 (higher = more avoidance)
  peakCreativeHours: number[] // Array of hours (0-23)
  momentumTrend: 'increasing' | 'stable' | 'decreasing'
  burnoutRisk: number // 0-100
  estimatedTimeToRelease: number | null // days
  progressVelocity: number // nodes/day
  bottlenecks: string[] // Node IDs causing delays
}

export class LoopInsightsV3 {
  /**
   * Analyse behavioral signals from user activity
   */
  async analyseBehaviouralSignals(
    nodes: DbNode[],
    journals: DbJournalEntry[],
    flowSessions: DbFlowSession[]
  ): Promise<BehaviouralSignals> {
    return {
      taskAvoidanceScore: this.calculateTaskAvoidance(nodes),
      peakCreativeHours: this.findPeakHours(flowSessions),
      momentumTrend: this.calculateMomentumTrend(journals),
      burnoutRisk: this.predictBurnout(journals, flowSessions),
      estimatedTimeToRelease: this.estimateTimeToRelease(nodes),
      progressVelocity: this.calculateVelocity(nodes),
      bottlenecks: this.identifyBottlenecks(nodes),
    }
  }

  /**
   * Generate actionable insights
   */
  async generateInsights(
    nodes: DbNode[],
    journals: DbJournalEntry[],
    flowSessions: DbFlowSession[]
  ): Promise<InsightV3[]> {
    const signals = await this.analyseBehaviouralSignals(nodes, journals, flowSessions)
    const insights: InsightV3[] = []

    // Task Avoidance Detection
    if (signals.taskAvoidanceScore > 60) {
      insights.push({
        id: `task-avoidance-${Date.now()}`,
        type: 'task-avoidance',
        severity: signals.taskAvoidanceScore > 80 ? 'high' : 'medium',
        title: 'Task Avoidance Pattern Detected',
        description: `You've been postponing high-friction tasks. ${signals.taskAvoidanceScore}% avoidance score indicates procrastination on difficult work.`,
        actionable_steps: [
          'Break down high-friction tasks into smaller micro-actions',
          'Schedule difficult tasks during your peak hours',
          'Use the Pomodoro technique for intimidating tasks',
          'Remove distractions before starting avoided tasks',
        ],
        confidence: 85,
        metadata: {
          avoidanceScore: signals.taskAvoidanceScore,
          highFrictionNodes: nodes.filter((n) => n.friction > 70).length,
        },
        created_at: new Date(),
      })
    }

    // Peak Hours Insight
    if (signals.peakCreativeHours.length > 0) {
      insights.push({
        id: `peak-hours-${Date.now()}`,
        type: 'peak-hours',
        severity: 'low',
        title: 'Your Peak Creative Hours',
        description: `Analysis shows you're most productive at ${this.formatHours(signals.peakCreativeHours)}. Schedule complex work during these windows.`,
        actionable_steps: [
          `Block ${this.formatHours(signals.peakCreativeHours)} for deep work`,
          'Protect peak hours from meetings and interruptions',
          'Save admin tasks for your low-energy periods',
        ],
        confidence: 75,
        metadata: {
          peakHours: signals.peakCreativeHours,
        },
        created_at: new Date(),
      })
    }

    // Burnout Prediction
    if (signals.burnoutRisk > 70) {
      insights.push({
        id: `burnout-${Date.now()}`,
        type: 'burnout-prediction',
        severity: 'high',
        title: 'High Burnout Risk Detected',
        description: `${signals.burnoutRisk}% burnout probability based on work patterns and journal sentiment. Take preventive action now.`,
        actionable_steps: [
          'Schedule a full day off this week',
          'Reduce daily workload by 30%',
          'Delegate or postpone non-critical tasks',
          'Increase breaks between focused sessions',
          'Consider talking to someone about stress',
        ],
        confidence: 80,
        metadata: {
          burnoutRisk: signals.burnoutRisk,
        },
        created_at: new Date(),
      })
    }

    // Time to Release Estimation
    if (signals.estimatedTimeToRelease !== null) {
      insights.push({
        id: `time-to-release-${Date.now()}`,
        type: 'time-to-release',
        severity: signals.estimatedTimeToRelease > 60 ? 'medium' : 'low',
        title: 'Projected Release Timeline',
        description: `Based on current velocity (${signals.progressVelocity.toFixed(1)} tasks/day), you'll complete this project in approximately ${signals.estimatedTimeToRelease} days.`,
        actionable_steps: [
          signals.estimatedTimeToRelease > 60
            ? 'Consider increasing daily task completion rate'
            : 'Timeline looks achievable',
          'Review bottleneck tasks to accelerate progress',
          'Delegate tasks where possible',
        ],
        confidence: 65,
        metadata: {
          estimatedDays: signals.estimatedTimeToRelease,
          velocity: signals.progressVelocity,
        },
        created_at: new Date(),
      })
    }

    // Bottleneck Detection
    if (signals.bottlenecks.length > 0) {
      insights.push({
        id: `bottleneck-${Date.now()}`,
        type: 'bottleneck',
        severity: 'high',
        title: `${signals.bottlenecks.length} Bottleneck Tasks Blocking Progress`,
        description: 'These tasks are holding up multiple dependencies. Prioritise them immediately.',
        actionable_steps: [
          'Focus exclusively on bottleneck tasks this week',
          'Break bottlenecks into smaller subtasks',
          'Consider getting external help for blocked tasks',
          'Remove unnecessary dependencies where possible',
        ],
        confidence: 90,
        metadata: {
          bottleneckNodeIds: signals.bottlenecks,
        },
        created_at: new Date(),
      })
    }

    // Velocity Insight
    if (signals.progressVelocity < 0.5) {
      insights.push({
        id: `velocity-${Date.now()}`,
        type: 'velocity',
        severity: 'medium',
        title: 'Low Progress Velocity',
        description: `You're completing ${signals.progressVelocity.toFixed(1)} tasks per day. This is below optimal creative output.`,
        actionable_steps: [
          'Review if tasks are too large (break them down)',
          'Reduce context switching between projects',
          'Eliminate non-essential meetings',
          'Use time-blocking for focused work',
        ],
        confidence: 70,
        metadata: {
          velocity: signals.progressVelocity,
        },
        created_at: new Date(),
      })
    }

    return insights.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 }
      return severityOrder[b.severity] - severityOrder[a.severity]
    })
  }

  // Helper methods

  private calculateTaskAvoidance(nodes: DbNode[]): number {
    const highFrictionNodes = nodes.filter((n) => n.friction > 60)
    if (highFrictionNodes.length === 0) return 0

    // Check how long high-friction tasks have been sitting
    const now = Date.now()
    let totalDelay = 0

    highFrictionNodes.forEach((node) => {
      const created = new Date(node.created_at).getTime()
      const daysSinceCreated = (now - created) / (1000 * 60 * 60 * 24)
      if (daysSinceCreated > 2) {
        totalDelay += daysSinceCreated
      }
    })

    const avgDelay = totalDelay / highFrictionNodes.length
    return Math.min(100, avgDelay * 10) // Scale to 0-100
  }

  private findPeakHours(flowSessions: DbFlowSession[]): number[] {
    const hourlyEngagement: Record<number, number[]> = {}

    flowSessions.forEach((session) => {
      const hour = new Date(session.started_at).getHours()
      if (!hourlyEngagement[hour]) hourlyEngagement[hour] = []
      if (session.engagement_score) {
        hourlyEngagement[hour].push(session.engagement_score)
      }
    })

    // Calculate average engagement per hour
    const avgByHour = Object.entries(hourlyEngagement).map(([hour, scores]) => ({
      hour: parseInt(hour),
      avg: scores.reduce((sum, s) => sum + s, 0) / scores.length,
    }))

    // Return top 3 hours
    return avgByHour
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 3)
      .map((h) => h.hour)
  }

  private calculateMomentumTrend(journals: DbJournalEntry[]): 'increasing' | 'stable' | 'decreasing' {
    if (journals.length < 3) return 'stable'

    const recentJournals = journals.slice(0, 7) // Last 7 entries
    const momentum = recentJournals.map((j) => j.momentum || 50)

    const firstHalf = momentum.slice(0, Math.floor(momentum.length / 2))
    const secondHalf = momentum.slice(Math.floor(momentum.length / 2))

    const firstAvg = firstHalf.reduce((sum, m) => sum + m, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, m) => sum + m, 0) / secondHalf.length

    const diff = secondAvg - firstAvg

    if (diff > 10) return 'increasing'
    if (diff < -10) return 'decreasing'
    return 'stable'
  }

  private predictBurnout(journals: DbJournalEntry[], flowSessions: DbFlowSession[]): number {
    let burnoutScore = 0

    // Check blockers in journals
    const recentJournals = journals.slice(0, 7)
    const avgBlockers =
      recentJournals.reduce((sum, j) => sum + (j.blockers?.length || 0), 0) / recentJournals.length
    burnoutScore += avgBlockers * 10

    // Check interruptions in flow sessions
    const recentSessions = flowSessions.slice(0, 10)
    const avgInterruptions =
      recentSessions.reduce((sum, s) => sum + s.interruptions, 0) / recentSessions.length
    burnoutScore += avgInterruptions * 8

    // Check deep work decline
    const deepWorkCount = recentSessions.filter((s) => s.deep_work_detected).length
    const deepWorkRatio = deepWorkCount / recentSessions.length
    if (deepWorkRatio < 0.3) burnoutScore += 20

    return Math.min(100, burnoutScore)
  }

  private estimateTimeToRelease(nodes: DbNode[]): number | null {
    const totalNodes = nodes.length
    if (totalNodes === 0) return null

    // Rough estimation based on friction and priority
    const avgFriction = nodes.reduce((sum, n) => sum + n.friction, 0) / nodes.length
    const avgPriority = nodes.reduce((sum, n) => sum + n.priority, 0) / nodes.length

    // Higher friction = more time needed
    const daysPerNode = 1 + avgFriction / 50 // 1-3 days per node

    return Math.ceil(totalNodes * daysPerNode)
  }

  private calculateVelocity(nodes: DbNode[]): number {
    // Calculate based on created_at dates
    if (nodes.length < 2) return 0

    const sortedNodes = [...nodes].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

    const firstNode = new Date(sortedNodes[0].created_at).getTime()
    const lastNode = new Date(sortedNodes[sortedNodes.length - 1].created_at).getTime()

    const daysDiff = (lastNode - firstNode) / (1000 * 60 * 60 * 24)

    if (daysDiff === 0) return 0

    return nodes.length / daysDiff
  }

  private identifyBottlenecks(nodes: DbNode[]): string[] {
    const bottlenecks: string[] = []

    nodes.forEach((node) => {
      // Count how many nodes depend on this one
      const dependentCount = nodes.filter((n) => n.dependencies.includes(node.id)).length

      // If 3+ nodes depend on it and it has high friction, it's a bottleneck
      if (dependentCount >= 3 && node.friction > 50) {
        bottlenecks.push(node.id)
      }
    })

    return bottlenecks
  }

  private formatHours(hours: number[]): string {
    return hours
      .map((h) => {
        const period = h >= 12 ? 'PM' : 'AM'
        const hour12 = h % 12 || 12
        return `${hour12}${period}`
      })
      .join(', ')
  }
}
