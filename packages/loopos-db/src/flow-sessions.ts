import { getSupabaseClient, getSupabaseAdmin } from './client'
import { FlowSessionSchema, type DbFlowSession } from './types'

/**
 * Get all flow sessions for a user
 */
export async function getFlowSessions(userId: string, limit = 50): Promise<DbFlowSession[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('flow_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data.map((session) => FlowSessionSchema.parse(session))
}

/**
 * Get a single flow session by ID
 */
export async function getFlowSession(id: string): Promise<DbFlowSession | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from('flow_sessions').select('*').eq('id', id).single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return FlowSessionSchema.parse(data)
}

/**
 * Get active flow session (not ended)
 */
export async function getActiveFlowSession(userId: string): Promise<DbFlowSession | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('flow_sessions')
    .select('*')
    .eq('user_id', userId)
    .is('ended_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return FlowSessionSchema.parse(data)
}

/**
 * Get flow sessions for a specific date range
 */
export async function getFlowSessionsByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<DbFlowSession[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('flow_sessions')
    .select('*')
    .eq('user_id', userId)
    .gte('started_at', startDate.toISOString())
    .lte('started_at', endDate.toISOString())
    .order('started_at', { ascending: false })

  if (error) throw error
  return data.map((session) => FlowSessionSchema.parse(session))
}

/**
 * Start a new flow session
 */
export async function startFlowSession(userId: string, metadata?: Record<string, unknown>): Promise<DbFlowSession> {
  const supabase = getSupabaseAdmin()

  // End any active sessions first
  const activeSession = await getActiveFlowSession(userId)
  if (activeSession) {
    await endFlowSession(activeSession.id)
  }

  const session: Omit<DbFlowSession, 'id' | 'created_at'> = {
    user_id: userId,
    started_at: new Date().toISOString(),
    ended_at: undefined,
    duration_seconds: undefined,
    engagement_score: undefined,
    deep_work_detected: false,
    interruptions: 0,
    nodes_worked_on: [],
    peak_flow_time: undefined,
    metadata: metadata || {},
  }

  const { data, error } = await supabase.from('flow_sessions').insert(session).select().single()

  if (error) throw error
  return FlowSessionSchema.parse(data)
}

/**
 * End a flow session
 */
export async function endFlowSession(id: string): Promise<DbFlowSession> {
  const session = await getFlowSession(id)
  if (!session) throw new Error('Flow session not found')

  const endTime = new Date()
  const startTime = new Date(session.started_at)
  const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)

  return updateFlowSession(id, {
    ended_at: endTime.toISOString(),
    duration_seconds: durationSeconds,
  })
}

/**
 * Update a flow session
 */
export async function updateFlowSession(
  id: string,
  updates: Partial<Omit<DbFlowSession, 'id' | 'user_id' | 'created_at'>>
): Promise<DbFlowSession> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from('flow_sessions').update(updates).eq('id', id).select().single()

  if (error) throw error
  return FlowSessionSchema.parse(data)
}

/**
 * Add a node to the current flow session
 */
export async function addNodeToFlowSession(sessionId: string, nodeId: string): Promise<DbFlowSession> {
  const session = await getFlowSession(sessionId)
  if (!session) throw new Error('Flow session not found')

  const updatedNodes = [...session.nodes_worked_on, nodeId]
  return updateFlowSession(sessionId, { nodes_worked_on: updatedNodes })
}

/**
 * Increment interruption count
 */
export async function recordInterruption(sessionId: string): Promise<DbFlowSession> {
  const session = await getFlowSession(sessionId)
  if (!session) throw new Error('Flow session not found')

  return updateFlowSession(sessionId, {
    interruptions: session.interruptions + 1,
  })
}

/**
 * Delete a flow session
 */
export async function deleteFlowSession(id: string): Promise<void> {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('flow_sessions').delete().eq('id', id)

  if (error) throw error
}

/**
 * Get flow statistics for a user
 */
export async function getFlowStats(userId: string, days = 30): Promise<{
  totalSessions: number
  totalDuration: number
  averageDuration: number
  averageEngagement: number
  deepWorkSessions: number
  totalInterruptions: number
}> {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const sessions = await getFlowSessionsByDateRange(userId, startDate, endDate)

  const totalSessions = sessions.length
  const totalDuration = sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0)
  const averageDuration = totalSessions > 0 ? totalDuration / totalSessions : 0
  const totalEngagement = sessions.reduce((sum, s) => sum + (s.engagement_score || 0), 0)
  const averageEngagement = totalSessions > 0 ? totalEngagement / totalSessions : 0
  const deepWorkSessions = sessions.filter((s) => s.deep_work_detected).length
  const totalInterruptions = sessions.reduce((sum, s) => sum + s.interruptions, 0)

  return {
    totalSessions,
    totalDuration,
    averageDuration,
    averageEngagement,
    deepWorkSessions,
    totalInterruptions,
  }
}
