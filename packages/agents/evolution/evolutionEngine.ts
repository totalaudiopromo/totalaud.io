/**
 * Evolution Engine - Applies personality drift and persists changes
 * Phase 13A: OS Evolution System
 */

import { createClient } from '@supabase/supabase-js'
import {
  getApplicableRules,
  mergeDeltas,
  type EvolutionEvent,
  type EvolutionDelta,
  type OSProfile,
} from './evolutionRules'

const SMOOTHING_FACTOR = 0.7 // Smooth deltas to 70% of original value
const MAX_DRIFT_PER_EVENT = 0.1 // Maximum total drift per event

/**
 * Clamp value to [min, max]
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Normalize emotional bias weights to sum to 1.0
 */
function normalizeEmotionalBias(bias: Record<string, number>): Record<string, number> {
  const sum = Object.values(bias).reduce((acc, val) => acc + val, 0)
  if (sum === 0) return bias

  const normalized: Record<string, number> = {}
  for (const [emotion, weight] of Object.entries(bias)) {
    normalized[emotion] = weight / sum
  }
  return normalized
}

/**
 * Apply evolution delta to profile
 */
export function applyDelta(profile: OSProfile, delta: EvolutionDelta): OSProfile {
  const updated = { ...profile }

  // Apply smoothing to deltas
  const smoothedDelta: EvolutionDelta = {
    confidence: delta.confidence ? delta.confidence * SMOOTHING_FACTOR : undefined,
    verbosity: delta.verbosity ? delta.verbosity * SMOOTHING_FACTOR : undefined,
    riskTolerance: delta.riskTolerance ? delta.riskTolerance * SMOOTHING_FACTOR : undefined,
    empathy: delta.empathy ? delta.empathy * SMOOTHING_FACTOR : undefined,
    tempoPreference: delta.tempoPreference
      ? delta.tempoPreference * SMOOTHING_FACTOR
      : undefined,
    emotionalBias: delta.emotionalBias
      ? Object.fromEntries(
          Object.entries(delta.emotionalBias).map(([emotion, value]) => [
            emotion,
            value! * SMOOTHING_FACTOR,
          ])
        )
      : undefined,
  }

  // Apply confidence
  if (smoothedDelta.confidence !== undefined) {
    updated.confidenceLevel = clamp(
      updated.confidenceLevel + smoothedDelta.confidence,
      0,
      1
    )
  }

  // Apply verbosity
  if (smoothedDelta.verbosity !== undefined) {
    updated.verbosity = clamp(updated.verbosity + smoothedDelta.verbosity, 0, 1)
  }

  // Apply risk tolerance
  if (smoothedDelta.riskTolerance !== undefined) {
    updated.riskTolerance = clamp(
      updated.riskTolerance + smoothedDelta.riskTolerance,
      0,
      1
    )
  }

  // Apply empathy
  if (smoothedDelta.empathy !== undefined) {
    updated.empathyLevel = clamp(updated.empathyLevel + smoothedDelta.empathy, 0, 1)
  }

  // Apply tempo preference (DAW only)
  if (smoothedDelta.tempoPreference !== undefined && updated.tempoPreference !== undefined) {
    updated.tempoPreference = clamp(
      updated.tempoPreference + smoothedDelta.tempoPreference,
      60,
      180
    )
  }

  // Apply emotional bias
  if (smoothedDelta.emotionalBias) {
    const newBias = { ...updated.emotionalBias }
    for (const [emotion, delta] of Object.entries(smoothedDelta.emotionalBias)) {
      if (delta !== undefined) {
        newBias[emotion as keyof typeof newBias] = clamp(
          (newBias[emotion as keyof typeof newBias] || 0) + delta,
          0,
          1
        )
      }
    }
    updated.emotionalBias = normalizeEmotionalBias(newBias)
  }

  return updated
}

/**
 * Calculate total drift magnitude
 */
function calculateDriftMagnitude(delta: EvolutionDelta): number {
  let magnitude = 0

  magnitude += Math.abs(delta.confidence || 0)
  magnitude += Math.abs(delta.verbosity || 0)
  magnitude += Math.abs(delta.riskTolerance || 0)
  magnitude += Math.abs(delta.empathy || 0)

  if (delta.emotionalBias) {
    for (const value of Object.values(delta.emotionalBias)) {
      magnitude += Math.abs(value || 0)
    }
  }

  return magnitude
}

/**
 * Scale delta if it exceeds maximum drift
 */
function limitDelta(delta: EvolutionDelta): EvolutionDelta {
  const magnitude = calculateDriftMagnitude(delta)
  if (magnitude <= MAX_DRIFT_PER_EVENT) return delta

  const scaleFactor = MAX_DRIFT_PER_EVENT / magnitude
  const limited: EvolutionDelta = {
    confidence: delta.confidence ? delta.confidence * scaleFactor : undefined,
    verbosity: delta.verbosity ? delta.verbosity * scaleFactor : undefined,
    riskTolerance: delta.riskTolerance ? delta.riskTolerance * scaleFactor : undefined,
    empathy: delta.empathy ? delta.empathy * scaleFactor : undefined,
    tempoPreference: delta.tempoPreference ? delta.tempoPreference * scaleFactor : undefined,
    emotionalBias: delta.emotionalBias
      ? Object.fromEntries(
          Object.entries(delta.emotionalBias).map(([emotion, value]) => [
            emotion,
            value! * scaleFactor,
          ])
        )
      : undefined,
  }

  return limited
}

/**
 * Process evolution event and update profile
 */
export async function processEvolutionEvent(
  event: EvolutionEvent,
  userId: string,
  campaignId?: string
): Promise<OSProfile | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('[EvolutionEngine] Missing Supabase credentials')
    return null
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Get current profile (or create with defaults)
  const { data: profileData, error: profileError } = await supabase.rpc(
    'get_os_evolution_profile',
    {
      p_user_id: userId,
      p_os: event.os,
      p_campaign_id: campaignId || null,
    }
  )

  if (profileError || !profileData) {
    console.error('[EvolutionEngine] Failed to get profile:', profileError)
    return null
  }

  const currentProfile: OSProfile = {
    os: profileData.os,
    confidenceLevel: profileData.confidence_level,
    verbosity: profileData.verbosity,
    riskTolerance: profileData.risk_tolerance,
    empathyLevel: profileData.empathy_level,
    emotionalBias: profileData.emotional_bias,
    tempoPreference: profileData.tempo_preference,
  }

  // Get applicable rules
  const rules = getApplicableRules(event, currentProfile)
  if (rules.length === 0) {
    console.log('[EvolutionEngine] No applicable rules for event:', event.type)
    return currentProfile
  }

  // Merge deltas
  const combinedDelta = mergeDeltas(rules.map((rule) => rule.delta))

  // Limit delta magnitude
  const limitedDelta = limitDelta(combinedDelta)

  // Apply delta
  const updatedProfile = applyDelta(currentProfile, limitedDelta)

  // Persist updated profile
  const { error: updateError } = await supabase
    .from('os_evolution_profiles')
    .update({
      confidence_level: updatedProfile.confidenceLevel,
      verbosity: updatedProfile.verbosity,
      risk_tolerance: updatedProfile.riskTolerance,
      empathy_level: updatedProfile.empathyLevel,
      emotional_bias: updatedProfile.emotionalBias,
      tempo_preference: updatedProfile.tempoPreference,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('os', event.os)
    .eq('campaign_id', campaignId || null)

  if (updateError) {
    console.error('[EvolutionEngine] Failed to update profile:', updateError)
    return null
  }

  // Log evolution event
  const reasoning = rules.map((rule) => rule.reasoning).join('; ')
  const { error: eventError } = await supabase.from('os_evolution_events').insert({
    user_id: userId,
    campaign_id: campaignId || null,
    os: event.os,
    event_type: event.type,
    delta: limitedDelta,
    reasoning,
    source_entity_type: event.sourceEntityType,
    source_entity_id: event.sourceEntityId,
    created_at: event.timestamp,
  })

  if (eventError) {
    console.error('[EvolutionEngine] Failed to log event:', eventError)
  }

  console.log(
    `[EvolutionEngine] ${event.os} evolved from ${event.type}: ${reasoning.slice(0, 100)}...`
  )

  return updatedProfile
}

/**
 * Get evolution profile for OS
 */
export async function getEvolutionProfile(
  userId: string,
  os: string,
  campaignId?: string
): Promise<OSProfile | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('[EvolutionEngine] Missing Supabase credentials')
    return null
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: profileData, error } = await supabase.rpc('get_os_evolution_profile', {
    p_user_id: userId,
    p_os: os,
    p_campaign_id: campaignId || null,
  })

  if (error || !profileData) {
    console.error('[EvolutionEngine] Failed to get profile:', error)
    return null
  }

  return {
    os: profileData.os,
    confidenceLevel: profileData.confidence_level,
    verbosity: profileData.verbosity,
    riskTolerance: profileData.risk_tolerance,
    empathyLevel: profileData.empathy_level,
    emotionalBias: profileData.emotional_bias,
    tempoPreference: profileData.tempo_preference,
  }
}

/**
 * Get recent evolution events for OS
 */
export async function getRecentEvolutionEvents(
  userId: string,
  os?: string,
  limit: number = 50
): Promise<any[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('[EvolutionEngine] Missing Supabase credentials')
    return []
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data, error } = await supabase.rpc('get_recent_evolution_events', {
    p_user_id: userId,
    p_os: os || null,
    p_limit: limit,
  })

  if (error) {
    console.error('[EvolutionEngine] Failed to get events:', error)
    return []
  }

  return data || []
}

/**
 * Reset evolution profile to defaults
 */
export async function resetEvolutionProfile(
  userId: string,
  os: string,
  campaignId?: string
): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('[EvolutionEngine] Missing Supabase credentials')
    return false
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { error } = await supabase
    .from('os_evolution_profiles')
    .update({
      confidence_level: 0.5,
      verbosity: 0.5,
      risk_tolerance: 0.5,
      empathy_level: 0.5,
      emotional_bias: {
        hope: 0.2,
        doubt: 0.2,
        clarity: 0.2,
        pride: 0.2,
        fear: 0.2,
      },
      tempo_preference: 120,
      drift_history: [],
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('os', os)
    .eq('campaign_id', campaignId || null)

  if (error) {
    console.error('[EvolutionEngine] Failed to reset profile:', error)
    return false
  }

  console.log(`[EvolutionEngine] Reset ${os} profile to defaults`)
  return true
}
