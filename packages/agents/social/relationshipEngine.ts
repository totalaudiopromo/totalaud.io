/**
 * Relationship Engine
 * Phase 14: OS Social Graph - Updates os_relationships based on events
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { ThemeId } from '@totalaud/os-state/campaign'

export type SocialEventType =
  | 'fusion_agreement'
  | 'fusion_tension'
  | 'live_message_support'
  | 'live_message_conflict'
  | 'co_execution'
  | 'emotion_alignment'
  | 'emotion_clash'

export interface SocialEvent {
  userId: string
  campaignId?: string
  osA: ThemeId
  osB: ThemeId
  type: SocialEventType
  sentiment?: 'positive' | 'neutral' | 'cautious' | 'critical'
  weight?: number
  meta?: Record<string, unknown>
}

// Delta magnitudes for each event type (small, cumulative changes)
const EVENT_DELTAS: Record<
  SocialEventType,
  {
    trust: number
    synergy: number
    tension: number
    influenceBias: number
  }
> = {
  fusion_agreement: {
    trust: 0.015,
    synergy: 0.02,
    tension: -0.01,
    influenceBias: 0, // Neutral, both agree
  },
  fusion_tension: {
    trust: -0.01,
    synergy: -0.01,
    tension: 0.025,
    influenceBias: 0, // Depends on who "won" (future enhancement)
  },
  live_message_support: {
    trust: 0.02,
    synergy: 0.015,
    tension: -0.005,
    influenceBias: 0.01, // Supporting OS slightly defers
  },
  live_message_conflict: {
    trust: -0.015,
    synergy: -0.01,
    tension: 0.02,
    influenceBias: 0, // Neutral conflict
  },
  co_execution: {
    trust: 0.01,
    synergy: 0.015,
    tension: -0.005,
    influenceBias: 0, // Working together neutrally
  },
  emotion_alignment: {
    trust: 0.01,
    synergy: 0.01,
    tension: -0.005,
    influenceBias: 0, // Similar feelings
  },
  emotion_clash: {
    trust: -0.005,
    synergy: -0.005,
    tension: 0.015,
    influenceBias: 0, // Opposite emotions
  },
}

// Tension decay rate (slow natural decay over time)
const TENSION_DECAY_RATE = 0.95 // 5% decay per event (very gradual)

/**
 * Clamp value to range
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Ensure OSs are in alphabetical order (consistent storage)
 */
function orderOSPair(osA: ThemeId, osB: ThemeId): [ThemeId, ThemeId] {
  return osA < osB ? [osA, osB] : [osB, osA]
}

/**
 * Apply a social event to update OS relationships
 */
export async function applySocialEvent(
  supabase: SupabaseClient,
  event: SocialEvent
): Promise<void> {
  const { userId, campaignId, osA, osB, type, weight = 1 } = event

  // Ensure alphabetical ordering
  const [orderedA, orderedB] = orderOSPair(osA, osB)

  try {
    // Get or create relationship
    const { data: relationship, error: fetchError } = await supabase.rpc(
      'get_or_create_os_relationship',
      {
        p_user_id: userId,
        p_os_a: orderedA,
        p_os_b: orderedB,
        p_campaign_id: campaignId || null,
      }
    )

    if (fetchError || !relationship) {
      console.error('[RelationshipEngine] Failed to get relationship:', fetchError)
      return
    }

    // Get deltas for this event type
    const baseDelta = EVENT_DELTAS[type]

    // Apply weight multiplier
    const delta = {
      trust: baseDelta.trust * weight,
      synergy: baseDelta.synergy * weight,
      tension: baseDelta.tension * weight,
      influenceBias: baseDelta.influenceBias * weight,
    }

    // Calculate new values with bounds
    const newTrust = clamp(relationship.trust + delta.trust, -1, 1)
    const newSynergy = clamp(relationship.synergy + delta.synergy, 0, 1)
    const newTension = clamp(
      relationship.tension * TENSION_DECAY_RATE + delta.tension,
      0,
      1
    )
    const newInfluenceBias = clamp(
      relationship.influence_bias + delta.influenceBias,
      -1,
      1
    )

    // Update relationship
    const { error: updateError } = await supabase
      .from('os_relationships')
      .update({
        trust: newTrust,
        synergy: newSynergy,
        tension: newTension,
        influence_bias: newInfluenceBias,
        data_points: relationship.data_points + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', relationship.id)

    if (updateError) {
      console.error('[RelationshipEngine] Failed to update relationship:', updateError)
      return
    }

    console.log(
      `[RelationshipEngine] Updated ${orderedA} ↔ ${orderedB}: ` +
        `trust=${newTrust.toFixed(2)}, synergy=${newSynergy.toFixed(2)}, ` +
        `tension=${newTension.toFixed(2)} (${type})`
    )
  } catch (error) {
    console.error('[RelationshipEngine] Error applying social event:', error)
  }
}

/**
 * Batch apply multiple social events (more efficient for fusion sessions)
 */
export async function applyBatchSocialEvents(
  supabase: SupabaseClient,
  events: SocialEvent[]
): Promise<void> {
  for (const event of events) {
    await applySocialEvent(supabase, event)
  }
}

/**
 * Get all relationships for a user
 */
export async function getUserRelationships(
  supabase: SupabaseClient,
  userId: string,
  campaignId?: string
): Promise<any[]> {
  try {
    const { data, error } = await supabase.rpc('get_user_os_relationships', {
      p_user_id: userId,
      p_campaign_id: campaignId || null,
    })

    if (error) {
      console.error('[RelationshipEngine] Failed to get relationships:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('[RelationshipEngine] Error getting relationships:', error)
    return []
  }
}
