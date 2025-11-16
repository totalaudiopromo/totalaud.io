/**
 * Social Graph Analyzer
 * Phase 14: Computes social summaries from OS relationships
 */

import type { OSRelationship, ThemeId, SocialSummary } from '@totalaud/os-state/campaign'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Compute social summary from relationships
 */
export function computeSocialSummary(relationships: OSRelationship[]): SocialSummary {
  const allOSs: ThemeId[] = ['ascii', 'xp', 'aqua', 'daw', 'analogue']

  if (relationships.length === 0) {
    return {
      leaderOS: undefined,
      supportOS: [],
      rebelOS: [],
      cohesionScore: 1,
    }
  }

  // Calculate scores for each OS
  const osScores: Record<
    ThemeId,
    {
      leadership: number
      tension: number
      trust: number
      synergy: number
    }
  > = {} as any

  allOSs.forEach((os) => {
    const relatedToOS = relationships.filter((r) => r.osA === os || r.osB === os)

    if (relatedToOS.length === 0) {
      osScores[os] = { leadership: 0, tension: 0, trust: 0, synergy: 0 }
      return
    }

    const avgTrust =
      relatedToOS.reduce((sum, r) => sum + r.trust, 0) / relatedToOS.length
    const avgSynergy =
      relatedToOS.reduce((sum, r) => sum + r.synergy, 0) / relatedToOS.length
    const avgTension =
      relatedToOS.reduce((sum, r) => sum + r.tension, 0) / relatedToOS.length

    // Leadership score = high trust + synergy, low tension
    const leadership = avgTrust + avgSynergy - avgTension

    osScores[os] = { leadership, tension: avgTension, trust: avgTrust, synergy: avgSynergy }
  })

  // Find leader (highest leadership score)
  let leaderOS: ThemeId | undefined
  let maxLeadership = -Infinity

  allOSs.forEach((os) => {
    if (osScores[os].leadership > maxLeadership) {
      maxLeadership = osScores[os].leadership
      leaderOS = os
    }
  })

  // Support OSs: moderate leadership, low tension, not the leader
  const supportOS = allOSs.filter(
    (os) =>
      os !== leaderOS &&
      osScores[os].leadership > 0.2 &&
      osScores[os].tension < 0.5 &&
      osScores[os].trust > 0.1
  )

  // Rebel OSs: high average tension with others
  const rebelOS = allOSs.filter(
    (os) => os !== leaderOS && osScores[os].tension > 0.5
  )

  // Cohesion score = 1 - average tension across all pairs
  const avgTension =
    relationships.reduce((sum, rel) => sum + rel.tension, 0) / relationships.length
  const cohesionScore = Math.max(0, Math.min(1, 1 - avgTension))

  return {
    leaderOS,
    supportOS,
    rebelOS,
    cohesionScore,
  }
}

/**
 * Create and save an identity snapshot
 */
export async function createIdentitySnapshot(
  supabase: SupabaseClient,
  userId: string,
  campaignId?: string
): Promise<any> {
  try {
    const { data, error } = await supabase.rpc('create_identity_snapshot', {
      p_user_id: userId,
      p_campaign_id: campaignId || null,
    })

    if (error) {
      console.error('[SocialGraphAnalyzer] Failed to create snapshot:', error)
      return null
    }

    console.log('[SocialGraphAnalyzer] Created identity snapshot:', data?.id)
    return data
  } catch (error) {
    console.error('[SocialGraphAnalyzer] Error creating snapshot:', error)
    return null
  }
}

/**
 * Get trust matrix (all pairwise trust values)
 */
export function getTrustMatrix(
  relationships: OSRelationship[]
): Record<ThemeId, Record<ThemeId, number>> {
  const allOSs: ThemeId[] = ['ascii', 'xp', 'aqua', 'daw', 'analogue']
  const matrix: Record<ThemeId, Record<ThemeId, number>> = {} as any

  // Initialize matrix
  allOSs.forEach((osA) => {
    matrix[osA] = {} as any
    allOSs.forEach((osB) => {
      if (osA === osB) {
        matrix[osA][osB] = 1 // Self-trust is 1
      } else {
        matrix[osA][osB] = 0 // Default to 0
      }
    })
  })

  // Fill from relationships
  relationships.forEach((rel) => {
    matrix[rel.osA][rel.osB] = rel.trust
    matrix[rel.osB][rel.osA] = rel.trust // Symmetric
  })

  return matrix
}

/**
 * Get synergy matrix (all pairwise synergy values)
 */
export function getSynergyMatrix(
  relationships: OSRelationship[]
): Record<ThemeId, Record<ThemeId, number>> {
  const allOSs: ThemeId[] = ['ascii', 'xp', 'aqua', 'daw', 'analogue']
  const matrix: Record<ThemeId, Record<ThemeId, number>> = {} as any

  // Initialize matrix
  allOSs.forEach((osA) => {
    matrix[osA] = {} as any
    allOSs.forEach((osB) => {
      if (osA === osB) {
        matrix[osA][osB] = 1 // Self-synergy is 1
      } else {
        matrix[osA][osB] = 0 // Default to 0
      }
    })
  })

  // Fill from relationships
  relationships.forEach((rel) => {
    matrix[rel.osA][rel.osB] = rel.synergy
    matrix[rel.osB][rel.osA] = rel.synergy // Symmetric
  })

  return matrix
}

/**
 * Get recommended OS pairs for collaboration (high synergy, low tension)
 */
export function getRecommendedPairs(
  relationships: OSRelationship[],
  threshold: number = 0.6
): Array<{ osA: ThemeId; osB: ThemeId; score: number }> {
  return relationships
    .map((rel) => ({
      osA: rel.osA,
      osB: rel.osB,
      score: (rel.synergy + rel.trust) / 2 - rel.tension,
    }))
    .filter((pair) => pair.score >= threshold)
    .sort((a, b) => b.score - a.score)
}

/**
 * Get problematic OS pairs (high tension, low synergy)
 */
export function getProblematicPairs(
  relationships: OSRelationship[],
  threshold: number = 0.5
): Array<{ osA: ThemeId; osB: ThemeId; tensionScore: number }> {
  return relationships
    .map((rel) => ({
      osA: rel.osA,
      osB: rel.osB,
      tensionScore: rel.tension - (rel.synergy + rel.trust) / 2,
    }))
    .filter((pair) => pair.tensionScore >= threshold)
    .sort((a, b) => b.tensionScore - a.tensionScore)
}
