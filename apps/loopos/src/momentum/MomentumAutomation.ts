/**
 * Momentum Automation Engine
 * Handles decay, anti-drop suggestions, streaks, and momentum mechanics
 */

import type { LoopOSMomentum, LoopOSNode } from '@total-audio/loopos-db'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface MomentumDecayResult {
  previous_momentum: number
  new_momentum: number
  decay_amount: number
  decay_applied: boolean
}

export interface MomentumSuggestion {
  type: 'anti_drop' | 'streak_repair' | 'boost' | 'milestone'
  urgency: 'critical' | 'high' | 'medium' | 'low'
  message: string
  suggested_actions: string[]
  suggested_node_ids?: string[]
}

export interface MomentumUpdate {
  momentum_gained: number
  new_momentum: number
  streak_updated: boolean
  new_streak: number
  milestone_reached?: string
}

export class MomentumAutomation {
  /**
   * Apply momentum decay based on time since last action
   */
  static calculateDecay(
    momentum: LoopOSMomentum,
    hoursSinceLastDecay: number
  ): MomentumDecayResult {
    // Decay every 6 hours
    const decayInterval = 6
    const decayPeriods = Math.floor(hoursSinceLastDecay / decayInterval)

    if (decayPeriods === 0) {
      return {
        previous_momentum: momentum.current_momentum,
        new_momentum: momentum.current_momentum,
        decay_amount: 0,
        decay_applied: false,
      }
    }

    // Calculate decay amount (decay_rate per period, min 1 per period)
    const decayPerPeriod = Math.max(momentum.decay_rate, 1)
    const totalDecay = decayPerPeriod * decayPeriods

    const newMomentum = Math.max(0, momentum.current_momentum - totalDecay)

    return {
      previous_momentum: momentum.current_momentum,
      new_momentum: Math.round(newMomentum),
      decay_amount: Math.round(totalDecay),
      decay_applied: true,
    }
  }

  /**
   * Apply decay and update momentum in database
   */
  static async applyDecay(
    supabase: SupabaseClient,
    userId: string
  ): Promise<MomentumDecayResult> {
    const { data: momentum, error } = await supabase
      .from('loopos_momentum')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !momentum) {
      throw new Error('Momentum record not found')
    }

    const lastDecay = new Date(momentum.last_decay_at)
    const now = new Date()
    const hoursSinceLastDecay = (now.getTime() - lastDecay.getTime()) / (1000 * 60 * 60)

    const decayResult = this.calculateDecay(momentum, hoursSinceLastDecay)

    if (decayResult.decay_applied) {
      await supabase
        .from('loopos_momentum')
        .update({
          current_momentum: decayResult.new_momentum,
          last_decay_at: now.toISOString(),
        })
        .eq('user_id', userId)
    }

    return decayResult
  }

  /**
   * Generate anti-drop suggestions when momentum is low
   */
  static generateAntiDropSuggestions(
    momentum: LoopOSMomentum,
    nodes: LoopOSNode[]
  ): MomentumSuggestion[] {
    const suggestions: MomentumSuggestion[] = []

    const momentumPercentage = (momentum.current_momentum / momentum.max_momentum) * 100

    // Critical momentum drop
    if (momentumPercentage < 20) {
      const quickWins = nodes.filter(
        (n) =>
          n.status === 'pending' &&
          n.momentum_value >= 3 &&
          n.depends_on.length === 0
      )

      suggestions.push({
        type: 'anti_drop',
        urgency: 'critical',
        message: `Momentum critically low (${momentum.current_momentum}/${momentum.max_momentum})`,
        suggested_actions: [
          'Complete a quick win task immediately',
          'Focus on high-momentum-value tasks',
          'Avoid starting new complex tasks',
        ],
        suggested_node_ids: quickWins.slice(0, 3).map((n) => n.id),
      })
    }

    // Momentum declining
    else if (momentumPercentage < 40) {
      const readyTasks = nodes.filter(
        (n) => n.status === 'pending' && n.momentum_value >= 2
      )

      suggestions.push({
        type: 'anti_drop',
        urgency: 'high',
        message: 'Momentum declining - act now to prevent further drop',
        suggested_actions: [
          'Complete 2-3 tasks to rebuild momentum',
          'Choose medium-difficulty tasks for best results',
        ],
        suggested_node_ids: readyTasks.slice(0, 3).map((n) => n.id),
      })
    }

    return suggestions
  }

  /**
   * Check and update daily streak
   */
  static async updateStreak(
    supabase: SupabaseClient,
    userId: string
  ): Promise<{
    streak_updated: boolean
    new_streak: number
    streak_broken: boolean
  }> {
    const { data: momentum, error } = await supabase
      .from('loopos_momentum')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !momentum) {
      throw new Error('Momentum record not found')
    }

    const today = new Date().toISOString().split('T')[0]
    const lastActionDate = momentum.last_action_date

    // No previous action
    if (!lastActionDate) {
      await supabase
        .from('loopos_momentum')
        .update({
          last_action_date: today,
          current_streak: 1,
        })
        .eq('user_id', userId)

      return {
        streak_updated: true,
        new_streak: 1,
        streak_broken: false,
      }
    }

    // Already acted today
    if (lastActionDate === today) {
      return {
        streak_updated: false,
        new_streak: momentum.current_streak,
        streak_broken: false,
      }
    }

    // Check if streak continues (yesterday's date)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    let newStreak = 1
    let streakBroken = false

    if (lastActionDate === yesterdayStr) {
      // Streak continues
      newStreak = momentum.current_streak + 1
    } else {
      // Streak broken
      streakBroken = true
      newStreak = 1
    }

    const longestStreak = Math.max(momentum.longest_streak, newStreak)

    await supabase
      .from('loopos_momentum')
      .update({
        last_action_date: today,
        current_streak: newStreak,
        longest_streak: longestStreak,
      })
      .eq('user_id', userId)

    return {
      streak_updated: true,
      new_streak: newStreak,
      streak_broken: streakBroken,
    }
  }

  /**
   * Add momentum for completing a node
   */
  static async addMomentum(
    supabase: SupabaseClient,
    userId: string,
    momentumGain: number
  ): Promise<MomentumUpdate> {
    const { data: momentum, error } = await supabase
      .from('loopos_momentum')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !momentum) {
      throw new Error('Momentum record not found')
    }

    // Update streak
    const streakUpdate = await this.updateStreak(supabase, userId)

    // Add momentum (capped at max)
    const newMomentum = Math.min(
      momentum.current_momentum + momentumGain,
      momentum.max_momentum
    )

    // Increment total nodes completed
    const newTotal = momentum.total_nodes_completed + 1

    // Check for milestones
    let milestoneReached: string | undefined

    if (newTotal % 10 === 0) {
      milestoneReached = `${newTotal} tasks completed!`
    }

    if (streakUpdate.new_streak === 7) {
      milestoneReached = '7-day streak achieved!'
    } else if (streakUpdate.new_streak === 30) {
      milestoneReached = '30-day streak achieved!'
    }

    await supabase
      .from('loopos_momentum')
      .update({
        current_momentum: newMomentum,
        total_nodes_completed: newTotal,
      })
      .eq('user_id', userId)

    return {
      momentum_gained: momentumGain,
      new_momentum: newMomentum,
      streak_updated: streakUpdate.streak_updated,
      new_streak: streakUpdate.new_streak,
      milestone_reached: milestoneReached,
    }
  }

  /**
   * Increase momentum cap (RPG-style progression)
   */
  static calculateMomentumCapIncrease(totalNodesCompleted: number): number {
    const baseMax = 100
    const bonusPerMilestone = 10
    const milestones = Math.floor(totalNodesCompleted / 20) // Every 20 tasks

    return baseMax + bonusPerMilestone * milestones
  }

  /**
   * Generate streak repair suggestion if streak breaks
   */
  static generateStreakRepairSuggestion(
    momentum: LoopOSMomentum
  ): MomentumSuggestion | null {
    // Only suggest if streak was significant and recently broken
    if (momentum.current_streak === 0 && momentum.longest_streak >= 5) {
      return {
        type: 'streak_repair',
        urgency: 'medium',
        message: `You had a ${momentum.longest_streak}-day streak. Start a new one today!`,
        suggested_actions: [
          'Complete any task today to start rebuilding your streak',
          'Set a daily reminder to maintain consistency',
        ],
      }
    }

    return null
  }

  /**
   * Get momentum boost suggestion for sequences
   */
  static generateSequenceBoostSuggestion(completedNodes: LoopOSNode[]): MomentumSuggestion | null {
    // Check if user completed a sequence (3+ related nodes in sequence)
    const sequenceNodes = completedNodes.filter((n) => n.sequence_order !== null)

    if (sequenceNodes.length >= 3) {
      return {
        type: 'boost',
        urgency: 'low',
        message: `Sequence completed! ${sequenceNodes.length} nodes done in order.`,
        suggested_actions: ['Start the next sequence for continued momentum'],
      }
    }

    return null
  }
}
