/**
 * Signal Thread Types
 *
 * Types for the signal_threads table and related operations.
 * Used in Timeline Mode for story arc management.
 */

export type ThreadType = 'narrative' | 'campaign' | 'creative' | 'scene' | 'performance'

/**
 * Database row shape (snake_case)
 */
export interface SignalThreadRow {
  id: string
  user_id: string
  title: string
  thread_type: ThreadType
  colour: string
  event_ids: string[]
  narrative_summary: string | null
  insights: string[]
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
}

/**
 * Frontend shape (camelCase)
 */
export interface SignalThread {
  id: string
  userId: string
  title: string
  threadType: ThreadType
  colour: string
  eventIds: string[]
  narrativeSummary: string | null
  insights: string[]
  startDate: string | null
  endDate: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Transform database row to frontend shape
 */
export function transformThreadRow(row: SignalThreadRow): SignalThread {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    threadType: row.thread_type,
    colour: row.colour,
    eventIds: row.event_ids || [],
    narrativeSummary: row.narrative_summary,
    insights: row.insights || [],
    startDate: row.start_date,
    endDate: row.end_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
