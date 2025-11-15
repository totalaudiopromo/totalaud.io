import type { SupabaseClient } from '@supabase/supabase-js'
import {
  type AgentExecution,
  type CreateAgentExecutionInput,
  CreateAgentExecutionSchema,
  AgentExecutionSchema,
} from './types'

/**
 * Agent Execution database operations for LoopOS
 */

export async function createAgentExecution(
  supabase: SupabaseClient,
  userId: string,
  input: CreateAgentExecutionInput
): Promise<AgentExecution> {
  const validated = CreateAgentExecutionSchema.parse(input)

  const { data, error } = await supabase
    .from('loopos_agent_executions')
    .insert({
      user_id: userId,
      ...validated,
    })
    .select()
    .single()

  if (error) throw error
  return AgentExecutionSchema.parse(data)
}

export async function getAgentExecutions(
  supabase: SupabaseClient,
  userId: string,
  options?: {
    limit?: number
    offset?: number
    skillId?: string
    successOnly?: boolean
  }
): Promise<AgentExecution[]> {
  let query = supabase
    .from('loopos_agent_executions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (options?.skillId) {
    query = query.eq('skill_id', options.skillId)
  }

  if (options?.successOnly) {
    query = query.eq('success', true)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) throw error
  return data.map((execution) => AgentExecutionSchema.parse(execution))
}

export async function getAgentExecutionById(
  supabase: SupabaseClient,
  userId: string,
  executionId: string
): Promise<AgentExecution | null> {
  const { data, error } = await supabase
    .from('loopos_agent_executions')
    .select('*')
    .eq('id', executionId)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return AgentExecutionSchema.parse(data)
}

export async function getAgentExecutionStats(
  supabase: SupabaseClient,
  userId: string
): Promise<{
  total: number
  successful: number
  failed: number
  avgDurationMs: number
}> {
  const { data, error } = await supabase
    .from('loopos_agent_executions')
    .select('success, duration_ms')
    .eq('user_id', userId)

  if (error) throw error

  const total = data.length
  const successful = data.filter((e) => e.success).length
  const failed = total - successful
  const durations = data.filter((e) => e.duration_ms !== null).map((e) => e.duration_ms!)
  const avgDurationMs = durations.length > 0
    ? durations.reduce((sum, d) => sum + d, 0) / durations.length
    : 0

  return {
    total,
    successful,
    failed,
    avgDurationMs,
  }
}
