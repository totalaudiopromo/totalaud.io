import { supabase } from './client'
import type {
  ActivityEvent,
  ActivityType,
  DailySummary,
  EnergyWindow,
  EnergyWindowType,
  ReturnPattern,
} from './types'

/**
 * Phase 31: Creative Rhythm System
 *
 * Wellness-inspired awareness layer that tracks creative patterns:
 * - When users write, add nodes, use coach
 * - Energy windows (when they're most active)
 * - Return patterns (how often they come back)
 *
 * Philosophy: Not productivity tracking. Just awareness.
 * Tone: Calm, non-judgmental, helpful.
 */

// ============================================================================
// ACTIVITY EVENTS
// ============================================================================

export const activityDb = {
  /**
   * Track a creative activity event (fire-and-forget)
   * @param workspaceId - Current workspace
   * @param userId - Current user
   * @param type - Type of activity (note, coach, node, designer, pack, login)
   * @param metadata - Optional additional context
   */
  async track(
    workspaceId: string,
    userId: string,
    type: ActivityType,
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    try {
      const { error } = await supabase.from('loopos_activity_events').insert({
        workspace_id: workspaceId,
        user_id: userId,
        type,
        timestamp: new Date().toISOString(),
        metadata,
      })

      if (error) {
        console.warn('[Rhythm] Failed to track activity:', error)
        // Don't throw - fire-and-forget
      }
    } catch (err) {
      console.warn('[Rhythm] Activity tracking error:', err)
      // Silent failure - never block UI
    }
  },

  /**
   * Get recent activity events for a workspace
   * @param workspaceId - Workspace ID
   * @param limit - Number of events to fetch (default: 100)
   */
  async list(workspaceId: string, limit = 100): Promise<ActivityEvent[]> {
    const { data, error } = await supabase
      .from('loopos_activity_events')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  },

  /**
   * Get activity events within a date range
   * @param workspaceId - Workspace ID
   * @param startDate - Start of range (ISO string)
   * @param endDate - End of range (ISO string)
   */
  async getRange(
    workspaceId: string,
    startDate: string,
    endDate: string
  ): Promise<ActivityEvent[]> {
    const { data, error } = await supabase
      .from('loopos_activity_events')
      .select('*')
      .eq('workspace_id', workspaceId)
      .gte('timestamp', startDate)
      .lte('timestamp', endDate)
      .order('timestamp', { ascending: false })

    if (error) throw error
    return data || []
  },

  /**
   * Get activity count by type for a workspace
   * @param workspaceId - Workspace ID
   * @param startDate - Start of range (ISO string)
   * @param endDate - End of range (ISO string)
   */
  async getCountByType(
    workspaceId: string,
    startDate: string,
    endDate: string
  ): Promise<Record<ActivityType, number>> {
    const events = await activityDb.getRange(workspaceId, startDate, endDate)

    const counts: Record<string, number> = {
      note: 0,
      coach: 0,
      node: 0,
      designer: 0,
      pack: 0,
      login: 0,
    }

    events.forEach((event) => {
      counts[event.type] = (counts[event.type] || 0) + 1
    })

    return counts as Record<ActivityType, number>
  },
}

// ============================================================================
// DAILY SUMMARIES
// ============================================================================

export const dailySummaryDb = {
  /**
   * Get or create daily summary for a workspace and date
   * @param workspaceId - Workspace ID
   * @param date - Date (YYYY-MM-DD)
   */
  async getOrCreate(workspaceId: string, date: string): Promise<DailySummary> {
    // Try to get existing summary
    const { data: existing } = await supabase
      .from('loopos_daily_summaries')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('date', date)
      .single()

    if (existing) return existing

    // Create new summary
    const { data, error } = await supabase
      .from('loopos_daily_summaries')
      .insert({
        workspace_id: workspaceId,
        date,
        entries: 0,
        nodes_added: 0,
        coach_messages: 0,
        scenes_generated: 0,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Increment a counter in daily summary
   * @param workspaceId - Workspace ID
   * @param date - Date (YYYY-MM-DD)
   * @param field - Field to increment (entries, nodes_added, coach_messages, scenes_generated)
   */
  async increment(
    workspaceId: string,
    date: string,
    field: 'entries' | 'nodes_added' | 'coach_messages' | 'scenes_generated'
  ): Promise<void> {
    const summary = await dailySummaryDb.getOrCreate(workspaceId, date)

    const { error } = await supabase
      .from('loopos_daily_summaries')
      .update({
        [field]: (summary[field] || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', summary.id)

    if (error) {
      console.warn('[Rhythm] Failed to increment daily summary:', error)
    }
  },

  /**
   * Get daily summaries for a date range
   * @param workspaceId - Workspace ID
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   */
  async getRange(
    workspaceId: string,
    startDate: string,
    endDate: string
  ): Promise<DailySummary[]> {
    const { data, error } = await supabase
      .from('loopos_daily_summaries')
      .select('*')
      .eq('workspace_id', workspaceId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })

    if (error) throw error
    return data || []
  },

  /**
   * Get last N days of summaries
   * @param workspaceId - Workspace ID
   * @param days - Number of days (default: 7)
   */
  async getLastNDays(workspaceId: string, days = 7): Promise<DailySummary[]> {
    const today = new Date()
    const startDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000)

    return dailySummaryDb.getRange(
      workspaceId,
      startDate.toISOString().split('T')[0],
      today.toISOString().split('T')[0]
    )
  },
}

// ============================================================================
// ENERGY WINDOWS
// ============================================================================

export const energyWindowDb = {
  /**
   * Get all energy windows for a workspace
   * @param workspaceId - Workspace ID
   */
  async list(workspaceId: string): Promise<EnergyWindow[]> {
    const { data, error } = await supabase
      .from('loopos_energy_windows')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('score', { ascending: false })

    if (error) throw error
    return data || []
  },

  /**
   * Update energy window score
   * @param workspaceId - Workspace ID
   * @param window - Window type (early_morning, morning, afternoon, evening, late)
   * @param score - Score (0-100)
   * @param confidence - Confidence (0.0-1.0)
   */
  async update(
    workspaceId: string,
    window: EnergyWindowType,
    score: number,
    confidence: number
  ): Promise<void> {
    const { error } = await supabase.from('loopos_energy_windows').upsert(
      {
        workspace_id: workspaceId,
        window,
        score: Math.max(0, Math.min(100, score)),
        confidence: Math.max(0, Math.min(1, confidence)),
        last_updated: new Date().toISOString(),
      },
      {
        onConflict: 'workspace_id,window',
      }
    )

    if (error) {
      console.warn('[Rhythm] Failed to update energy window:', error)
    }
  },

  /**
   * Get highest-scoring energy window
   * @param workspaceId - Workspace ID
   */
  async getHighest(workspaceId: string): Promise<EnergyWindow | null> {
    const { data, error } = await supabase
      .from('loopos_energy_windows')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('score', { ascending: false })
      .limit(1)
      .single()

    if (error) return null
    return data
  },
}

// ============================================================================
// RETURN PATTERNS
// ============================================================================

export const returnPatternDb = {
  /**
   * Get return pattern for a workspace
   * @param workspaceId - Workspace ID
   */
  async get(workspaceId: string): Promise<ReturnPattern | null> {
    const { data, error } = await supabase
      .from('loopos_return_patterns')
      .select('*')
      .eq('workspace_id', workspaceId)
      .single()

    if (error) return null
    return data
  },

  /**
   * Update return pattern
   * @param workspaceId - Workspace ID
   * @param updates - Partial updates
   */
  async update(
    workspaceId: string,
    updates: Partial<
      Omit<ReturnPattern, 'id' | 'workspace_id' | 'created_at' | 'updated_at'>
    >
  ): Promise<void> {
    const { error } = await supabase.from('loopos_return_patterns').upsert(
      {
        workspace_id: workspaceId,
        ...updates,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'workspace_id',
      }
    )

    if (error) {
      console.warn('[Rhythm] Failed to update return pattern:', error)
    }
  },

  /**
   * Record user activity and update streak
   * @param workspaceId - Workspace ID
   */
  async recordActivity(workspaceId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0]
    const pattern = await returnPatternDb.get(workspaceId)

    if (!pattern) {
      // First activity ever
      await returnPatternDb.update(workspaceId, {
        streak_days: 1,
        last_active_date: today,
        typical_gap_days: null,
        confidence: 0.0,
      })
      return
    }

    const lastActive = pattern.last_active_date
    if (lastActive === today) {
      // Already recorded today
      return
    }

    const daysSinceLastActive = lastActive
      ? Math.floor(
          (new Date(today).getTime() - new Date(lastActive).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 999

    const isConsecutive = daysSinceLastActive === 1
    const newStreak = isConsecutive ? pattern.streak_days + 1 : 1

    await returnPatternDb.update(workspaceId, {
      streak_days: newStreak,
      last_active_date: today,
      // typical_gap_days and confidence would be calculated by rhythm engine
    })
  },
}

export const rhythmDb = {
  activity: activityDb,
  dailySummary: dailySummaryDb,
  energyWindow: energyWindowDb,
  returnPattern: returnPatternDb,
}
