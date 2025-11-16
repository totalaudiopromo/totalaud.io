/**
 * Agent Memory Reader
 * Helpers for agents to retrieve long-term memories with context
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { ThemeId, OSMemory, MemoryType } from '@totalaud/os-state/campaign'
import type { AgentName } from '@totalaud/os-state/campaign'

export interface GetRelevantMemoriesInput {
  supabase: SupabaseClient
  userId: string
  campaignId?: string | null
  os?: ThemeId
  agent?: AgentName
  memoryType?: MemoryType
  minImportance?: number // Filter by minimum importance (1-5)
  limit?: number // Max results, defaults to 20
}

/**
 * Retrieve relevant memories for an agent or OS
 * Sorted by importance (DESC) then recency (DESC)
 */
export async function getRelevantMemories(
  input: GetRelevantMemoriesInput
): Promise<OSMemory[]> {
  const {
    supabase,
    userId,
    campaignId = null,
    os,
    agent,
    memoryType,
    minImportance = 1,
    limit = 20,
  } = input

  // Build query
  let query = supabase
    .from('os_memories')
    .select('*')
    .eq('user_id', userId)
    .gte('importance', minImportance)
    .order('importance', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  // Optional filters
  if (campaignId) {
    query = query.eq('campaign_id', campaignId)
  }

  if (os) {
    query = query.eq('os', os)
  }

  if (agent) {
    query = query.eq('agent', agent)
  }

  if (memoryType) {
    query = query.eq('memory_type', memoryType)
  }

  const { data, error } = await query

  if (error || !data) {
    console.error('Failed to retrieve memories:', error)
    return []
  }

  // Convert to OSMemory format
  return data.map((row) => ({
    id: row.id,
    userId: row.user_id,
    campaignId: row.campaign_id,
    os: row.os as ThemeId,
    agent: row.agent as AgentName | null,
    memoryType: row.memory_type as MemoryType,
    title: row.title,
    content: row.content,
    importance: row.importance,
    createdAt: row.created_at,
  }))
}

/**
 * Get memories linked to a specific entity (clip, card, loop, campaign, fusion_session)
 */
export async function getMemoriesForEntity({
  supabase,
  userId,
  entityType,
  entityId,
  limit = 10,
}: {
  supabase: SupabaseClient
  userId: string
  entityType: 'clip' | 'card' | 'loop' | 'campaign' | 'fusion_session'
  entityId: string
  limit?: number
}): Promise<OSMemory[]> {
  // Get memory IDs linked to this entity
  const { data: links, error: linkError } = await supabase
    .from('memory_links')
    .select('memory_id')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)

  if (linkError || !links || links.length === 0) {
    return []
  }

  const memoryIds = links.map((link) => link.memory_id)

  // Fetch the actual memories
  const { data: memories, error: memoryError } = await supabase
    .from('os_memories')
    .select('*')
    .eq('user_id', userId)
    .in('id', memoryIds)
    .order('importance', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (memoryError || !memories) {
    console.error('Failed to retrieve entity memories:', memoryError)
    return []
  }

  // Convert to OSMemory format
  return memories.map((row) => ({
    id: row.id,
    userId: row.user_id,
    campaignId: row.campaign_id,
    os: row.os as ThemeId,
    agent: row.agent as AgentName | null,
    memoryType: row.memory_type as MemoryType,
    title: row.title,
    content: row.content,
    importance: row.importance,
    createdAt: row.created_at,
  }))
}

/**
 * Helper: Get agent behaviour context
 * Retrieves past memories to inform agent decision-making
 */
export async function getAgentBehaviourContext({
  supabase,
  userId,
  campaignId,
  os,
  agent,
  limit = 10,
}: {
  supabase: SupabaseClient
  userId: string
  campaignId?: string
  os: ThemeId
  agent: AgentName
  limit?: number
}): Promise<OSMemory[]> {
  return getRelevantMemories({
    supabase,
    userId,
    campaignId,
    os,
    agent,
    minImportance: 3, // Only fetch important memories for behaviour context
    limit,
  })
}

/**
 * Helper: Get loop context memories
 * Retrieves memories relevant to autonomous loop execution
 */
export async function getLoopContextMemories({
  supabase,
  userId,
  campaignId,
  os,
  agent,
  limit = 5,
}: {
  supabase: SupabaseClient
  userId: string
  campaignId?: string
  os: ThemeId
  agent: AgentName
  limit?: number
}): Promise<OSMemory[]> {
  // For loops, focus on patterns and facts
  const patterns = await getRelevantMemories({
    supabase,
    userId,
    campaignId,
    os,
    agent,
    memoryType: 'pattern',
    minImportance: 3,
    limit: Math.ceil(limit / 2),
  })

  const facts = await getRelevantMemories({
    supabase,
    userId,
    campaignId,
    os,
    agent,
    memoryType: 'fact',
    minImportance: 3,
    limit: Math.floor(limit / 2),
  })

  // Combine and sort by importance + recency
  const combined = [...patterns, ...facts]
  return combined
    .sort((a, b) => {
      if (a.importance !== b.importance) {
        return b.importance - a.importance // Higher importance first
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() // More recent first
    })
    .slice(0, limit)
}

/**
 * Helper: Get fusion reasoning context
 * Retrieves memories from all OSs for cross-OS synthesis
 */
export async function getFusionReasoningContext({
  supabase,
  userId,
  campaignId,
  limit = 15,
}: {
  supabase: SupabaseClient
  userId: string
  campaignId?: string
  limit?: number
}): Promise<OSMemory[]> {
  // Get high-importance memories from all OSs
  return getRelevantMemories({
    supabase,
    userId,
    campaignId,
    minImportance: 4, // Only high-importance for fusion
    limit,
  })
}

/**
 * Helper: Get recent warnings
 * Retrieves recent warning-type memories to alert agents
 */
export async function getRecentWarnings({
  supabase,
  userId,
  campaignId,
  os,
  limit = 5,
}: {
  supabase: SupabaseClient
  userId: string
  campaignId?: string
  os?: ThemeId
  limit?: number
}): Promise<OSMemory[]> {
  return getRelevantMemories({
    supabase,
    userId,
    campaignId,
    os,
    memoryType: 'warning',
    minImportance: 1, // All warnings are relevant
    limit,
  })
}

/**
 * Helper: Get OS-specific emotional context
 * Useful for Analogue OS and Insight agent
 */
export async function getEmotionalContext({
  supabase,
  userId,
  campaignId,
  os,
  limit = 10,
}: {
  supabase: SupabaseClient
  userId: string
  campaignId?: string
  os?: ThemeId
  limit?: number
}): Promise<OSMemory[]> {
  return getRelevantMemories({
    supabase,
    userId,
    campaignId,
    os,
    memoryType: 'emotion',
    minImportance: 2,
    limit,
  })
}

/**
 * Helper: Get memory summary for UI hints
 * Returns top 3 most recent and important memories as "Last time..." hints
 */
export async function getMemoryHints({
  supabase,
  userId,
  campaignId,
  os,
  agent,
}: {
  supabase: SupabaseClient
  userId: string
  campaignId?: string
  os?: ThemeId
  agent?: AgentName
}): Promise<{ title: string; createdAt: string }[]> {
  const memories = await getRelevantMemories({
    supabase,
    userId,
    campaignId,
    os,
    agent,
    minImportance: 3,
    limit: 3,
  })

  return memories.map((mem) => ({
    title: mem.title,
    createdAt: mem.createdAt,
  }))
}
