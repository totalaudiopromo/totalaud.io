/**
 * Agent Memory Writer
 * Helpers for agents to write long-term memories
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { ThemeId, OSMemory, MemoryType } from '@totalaud/os-state/campaign'
import type { AgentName } from '@totalaud/os-state/campaign'
import { processEvolutionEvent } from '../evolution/evolutionEngine'

export interface WriteAgentMemoryInput {
  supabase: SupabaseClient
  userId: string
  campaignId?: string | null
  os: ThemeId
  agent?: AgentName
  memoryType: MemoryType
  title: string
  content: Record<string, unknown>
  importance?: number // 1-5, defaults to 3
  links?: Array<{
    entityType: 'clip' | 'card' | 'loop' | 'campaign' | 'fusion_session'
    entityId: string
  }>
}

/**
 * Write a new memory to the database
 */
export async function writeAgentMemory(input: WriteAgentMemoryInput): Promise<OSMemory | null> {
  const {
    supabase,
    userId,
    campaignId = null,
    os,
    agent = null,
    memoryType,
    title,
    content,
    importance = 3,
    links = [],
  } = input

  // Validate importance
  const validImportance = Math.max(1, Math.min(5, importance))

  // Insert memory
  const { data: memory, error: memoryError } = await supabase
    .from('os_memories')
    .insert({
      user_id: userId,
      campaign_id: campaignId,
      os,
      agent,
      memory_type: memoryType,
      title,
      content,
      importance: validImportance,
    })
    .select()
    .single()

  if (memoryError || !memory) {
    console.error('Failed to write memory:', memoryError)
    return null
  }

  // Create links if provided
  if (links.length > 0) {
    const linkRecords = links.map((link) => ({
      memory_id: memory.id,
      entity_type: link.entityType,
      entity_id: link.entityId,
    }))

    const { error: linkError } = await supabase.from('memory_links').insert(linkRecords)

    if (linkError) {
      console.error('Failed to create memory links:', linkError)
      // Continue anyway - memory was created successfully
    }
  }

  // Trigger OS Evolution for high-importance memories (≥3)
  if (validImportance >= 3) {
    try {
      await processEvolutionEvent(
        {
          type: 'memory',
          os,
          meta: {
            importance: validImportance,
            memoryType,
            title,
            agent,
          },
          timestamp: new Date().toISOString(),
        },
        userId,
        campaignId || undefined
      )
    } catch (error) {
      console.error('[MemoryWriter] Failed to trigger evolution event:', error)
      // Continue anyway - memory was created successfully
    }
  }

  // Convert to OSMemory format
  return {
    id: memory.id,
    userId: memory.user_id,
    campaignId: memory.campaign_id,
    os: memory.os as ThemeId,
    agent: memory.agent as AgentName | null,
    memoryType: memory.memory_type as MemoryType,
    title: memory.title,
    content: memory.content,
    importance: memory.importance,
    createdAt: memory.created_at,
  }
}

/**
 * Helper: Scout saves research pattern memory
 */
export async function writeScoutResearchPattern({
  supabase,
  userId,
  campaignId,
  os,
  successfulSources,
  genres,
  importance = 4,
}: {
  supabase: SupabaseClient
  userId: string
  campaignId?: string
  os: ThemeId
  successfulSources: string[]
  genres: string[]
  importance?: number
}): Promise<OSMemory | null> {
  return writeAgentMemory({
    supabase,
    userId,
    campaignId,
    os,
    agent: 'scout',
    memoryType: 'pattern',
    title: 'Successful research sources',
    content: {
      sources: successfulSources,
      genres,
      timestamp: new Date().toISOString(),
    },
    importance,
  })
}

/**
 * Helper: Coach saves campaign structure memory
 */
export async function writeCoachStructurePattern({
  supabase,
  userId,
  campaignId,
  os,
  structureType,
  outcome,
  importance = 4,
}: {
  supabase: SupabaseClient
  userId: string
  campaignId?: string
  os: ThemeId
  structureType: string
  outcome: 'success' | 'mixed' | 'failure'
  importance?: number
}): Promise<OSMemory | null> {
  return writeAgentMemory({
    supabase,
    userId,
    campaignId,
    os,
    agent: 'coach',
    memoryType: 'pattern',
    title: `Campaign structure: ${structureType}`,
    content: {
      structureType,
      outcome,
      timestamp: new Date().toISOString(),
    },
    importance,
  })
}

/**
 * Helper: Tracker saves follow-up timing memory
 */
export async function writeTrackerTimingFact({
  supabase,
  userId,
  campaignId,
  os,
  optimalDelayHours,
  responseRate,
  importance = 3,
}: {
  supabase: SupabaseClient
  userId: string
  campaignId?: string
  os: ThemeId
  optimalDelayHours: number
  responseRate: number
  importance?: number
}): Promise<OSMemory | null> {
  return writeAgentMemory({
    supabase,
    userId,
    campaignId,
    os,
    agent: 'tracker',
    memoryType: 'fact',
    title: 'Optimal follow-up timing',
    content: {
      delayHours: optimalDelayHours,
      responseRate,
      timestamp: new Date().toISOString(),
    },
    importance,
  })
}

/**
 * Helper: Insight saves emotional pattern memory
 */
export async function writeInsightEmotionPattern({
  supabase,
  userId,
  campaignId,
  os,
  emotionType,
  pattern,
  importance = 4,
}: {
  supabase: SupabaseClient
  userId: string
  campaignId?: string
  os: ThemeId
  emotionType: string
  pattern: string
  importance?: number
}): Promise<OSMemory | null> {
  return writeAgentMemory({
    supabase,
    userId,
    campaignId,
    os,
    agent: 'insight',
    memoryType: 'emotion',
    title: `Emotional pattern: ${emotionType}`,
    content: {
      emotionType,
      pattern,
      timestamp: new Date().toISOString(),
    },
    importance,
  })
}

/**
 * Helper: Write fusion session summary as memory
 */
export async function writeFusionSummaryMemory({
  supabase,
  userId,
  campaignId,
  os,
  unifiedSummary,
  agreements,
  tensions,
  sessionId,
  importance = 5,
}: {
  supabase: SupabaseClient
  userId: string
  campaignId?: string
  os: ThemeId
  unifiedSummary: string
  agreements: string[]
  tensions: string[]
  sessionId: string
  importance?: number
}): Promise<OSMemory | null> {
  return writeAgentMemory({
    supabase,
    userId,
    campaignId,
    os,
    agent: 'insight', // Fusion insights are typically assigned to Insight agent
    memoryType: 'reflection',
    title: 'Multi-OS fusion synthesis',
    content: {
      unifiedSummary,
      agreements,
      tensions,
      sessionId,
      timestamp: new Date().toISOString(),
    },
    importance,
    links: [
      {
        entityType: 'fusion_session',
        entityId: sessionId,
      },
    ],
  })
}
