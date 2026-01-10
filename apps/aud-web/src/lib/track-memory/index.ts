/**
 * Track Memory Library
 *
 * Passive Track Memory v0
 *
 * Internal persistence layer for Track Memory.
 * No UI, no automation, no agents.
 *
 * Safety boundaries:
 * - Stores: intent, perspectives, story fragments, sequence decisions
 * - Never stores: keystrokes, hesitation, rejected content, performance metrics
 * - Deletion: when track is deleted, memory is deleted (no ghosts)
 *
 * NOTE: This library uses tables (track_memory, track_memory_entries) that are
 * defined in migration 20260108000001_track_memory_v0.sql. Until that migration
 * is applied and types are regenerated, TypeScript will not recognize these tables.
 * We use type assertions to work around this.
 */

import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

const log = logger.scope('TrackMemory')
import type { Json } from '@total-audio/schemas-database'

// No longer need AnySupabaseClient as types are regenerated

// ============================================================================
// Types
// ============================================================================

export type MemoryEntryType =
  | 'intent'
  | 'perspective'
  | 'story_fragment'
  | 'sequence_decision'
  | 'scout_consideration'
  | 'version_note'
  | 'note'

export type SourceMode = 'ideas' | 'finish' | 'story' | 'scout' | 'timeline' | 'content' | 'manual'

export type MemoryEntry =
  | (BaseMemoryEntry & { entryType: 'intent'; payload: IntentPayload })
  | (BaseMemoryEntry & { entryType: 'perspective'; payload: PerspectivePayload })
  | (BaseMemoryEntry & { entryType: 'story_fragment'; payload: StoryFragmentPayload })
  | (BaseMemoryEntry & { entryType: 'sequence_decision'; payload: SequenceDecisionPayload })
  | (BaseMemoryEntry & { entryType: 'scout_consideration'; payload: ScoutConsiderationPayload })
  | (BaseMemoryEntry & { entryType: 'version_note'; payload: VersionNotePayload })
  | (BaseMemoryEntry & { entryType: 'note'; payload: Record<string, unknown> })

interface BaseMemoryEntry {
  id: string
  trackMemoryId: string
  sourceMode: SourceMode | null
  createdAt: string
}

export interface TrackMemory {
  id: string
  userId: string
  trackId: string
  canonicalIntent: string | null
  canonicalIntentUpdatedAt: string | null
  createdAt: string
  updatedAt: string
  entries?: MemoryEntry[]
}

// Payload type definitions for type safety
export interface IntentPayload {
  content: string
  ideaId?: string
  emotionalCore?: string
}

export interface PerspectivePayload {
  content: string
  category?: string
  confidence?: number
}

export interface StoryFragmentPayload {
  content: string
  pitchDraftId?: string
  section?: string
}

export interface SequenceDecisionPayload {
  eventId: string
  eventTitle: string
  lane: string
  eventDate: string
}

export interface ScoutConsiderationPayload {
  opportunityId: string
  opportunityName: string
  opportunityType: string
}

export interface VersionNotePayload {
  content: string
  assetId: string
  versionNumber?: number
}

// Zod schemas for payload validation
export const IntentPayloadSchema = z.object({
  content: z.string(),
  ideaId: z.string().optional(),
  emotionalCore: z.string().optional(),
})

export const PerspectivePayloadSchema = z.object({
  content: z.string(),
  category: z.string().optional(),
  confidence: z.number().optional(),
})

export const StoryFragmentPayloadSchema = z.object({
  content: z.string(),
  pitchDraftId: z.string().optional(),
  section: z.string().optional(),
})

export const SequenceDecisionPayloadSchema = z.object({
  eventId: z.string(),
  eventTitle: z.string(),
  lane: z.string(),
  eventDate: z.string(),
})

export const ScoutConsiderationPayloadSchema = z.object({
  opportunityId: z.string(),
  opportunityName: z.string(),
  opportunityType: z.string(),
})

export const VersionNotePayloadSchema = z.object({
  content: z.string(),
  assetId: z.string(),
  versionNumber: z.number().optional(),
})

export const NotePayloadSchema = z.record(z.unknown())

/**
 * Type guard for payload validation
 */
export function isValidPayload(entryType: MemoryEntryType, payload: unknown): boolean {
  if (typeof payload !== 'object' || payload === null) return false

  switch (entryType) {
    case 'intent':
      return IntentPayloadSchema.safeParse(payload).success
    case 'perspective':
      return PerspectivePayloadSchema.safeParse(payload).success
    case 'story_fragment':
      return StoryFragmentPayloadSchema.safeParse(payload).success
    case 'sequence_decision':
      return SequenceDecisionPayloadSchema.safeParse(payload).success
    case 'scout_consideration':
      return ScoutConsiderationPayloadSchema.safeParse(payload).success
    case 'version_note':
      return VersionNotePayloadSchema.safeParse(payload).success
    case 'note':
      return NotePayloadSchema.safeParse(payload).success
    default:
      return false
  }
}

// ============================================================================
// Database Row Types
// ============================================================================

interface TrackMemoryRow {
  id: string
  user_id: string
  track_id: string
  canonical_intent: string | null
  canonical_intent_updated_at: string | null
  created_at: string
  updated_at: string
}

interface TrackMemoryEntryRow {
  id: string
  track_memory_id: string
  user_id: string
  entry_type: string
  payload: Json | null // Match Supabase Json type
  source_mode: string | null
  created_at: string
}

// ============================================================================
// Conversion Functions
// ============================================================================

function fromRow(row: TrackMemoryRow): TrackMemory {
  return {
    id: row.id,
    userId: row.user_id,
    trackId: row.track_id,
    canonicalIntent: row.canonical_intent,
    canonicalIntentUpdatedAt: row.canonical_intent_updated_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function entryFromRow(row: TrackMemoryEntryRow): MemoryEntry {
  const entryType = row.entry_type as MemoryEntryType
  const base = {
    id: row.id,
    trackMemoryId: row.track_memory_id,
    sourceMode: row.source_mode as SourceMode | null,
    createdAt: row.created_at,
  }

  // Ensure payload is treated as object for conversion
  const payload = row.payload && typeof row.payload === 'object' ? row.payload : {}

  switch (entryType) {
    case 'intent':
      return { ...base, entryType: 'intent', payload: payload as unknown as IntentPayload }
    case 'perspective':
      return {
        ...base,
        entryType: 'perspective',
        payload: payload as unknown as PerspectivePayload,
      }
    case 'story_fragment':
      return {
        ...base,
        entryType: 'story_fragment',
        payload: payload as unknown as StoryFragmentPayload,
      }
    case 'sequence_decision':
      return {
        ...base,
        entryType: 'sequence_decision',
        payload: payload as unknown as SequenceDecisionPayload,
      }
    case 'scout_consideration':
      return {
        ...base,
        entryType: 'scout_consideration',
        payload: payload as unknown as ScoutConsiderationPayload,
      }
    case 'version_note':
      return {
        ...base,
        entryType: 'version_note',
        payload: payload as unknown as VersionNotePayload,
      }
    case 'note':
    default:
      return { ...base, entryType: 'note', payload: payload as Record<string, unknown> }
  }
}

// ============================================================================
// Core API Functions
// ============================================================================

/**
 * Ensure a track memory record exists for a track.
 * Creates one if it doesn't exist.
 */
export async function ensureTrackMemory(
  userId: string,
  trackId: string
): Promise<TrackMemory | null> {
  try {
    const supabase = await createServerSupabaseClient()

    // Try to get existing
    const { data: existing, error: selectError } = await supabase
      .from('track_memory')
      .select('*')
      .eq('user_id', userId)
      .eq('track_id', trackId)
      .single()

    if (existing && !selectError) {
      return fromRow(existing)
    }

    // Create new if not exists
    const { data: created, error: insertError } = await supabase
      .from('track_memory')
      .insert({
        user_id: userId,
        track_id: trackId,
      })
      .select('*')
      .single()

    if (insertError) {
      // Handle race condition (another request created it)
      if (insertError.code === '23505') {
        const { data: retry } = await supabase
          .from('track_memory')
          .select('*')
          .eq('user_id', userId)
          .eq('track_id', trackId)
          .single()
        return retry ? fromRow(retry as TrackMemoryRow) : null
      }
      log.error('Failed to create track memory', insertError)
      return null
    }

    log.info('Created track memory', { userId, trackId })
    return fromRow(created)
  } catch (error) {
    log.error('Error ensuring track memory', error)
    return null
  }
}

/**
 * Get track memory for a track, optionally including entries.
 */
export async function getTrackMemory(
  userId: string,
  trackId: string,
  options?: { includeEntries?: boolean; entryTypes?: MemoryEntryType[] }
): Promise<TrackMemory | null> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('track_memory')
      .select('*')
      .eq('user_id', userId)
      .eq('track_id', trackId)
      .single()

    if (error || !data) {
      return null
    }

    const memory = fromRow(data)

    if (options?.includeEntries) {
      let query = supabase
        .from('track_memory_entries')
        .select('*')
        .eq('track_memory_id', memory.id)
        .order('created_at', { ascending: false })

      if (options.entryTypes && options.entryTypes.length > 0) {
        query = query.in('entry_type', options.entryTypes)
      }

      const { data: entries } = await query
      memory.entries = entries ? (entries as TrackMemoryEntryRow[]).map(entryFromRow) : []
    }

    return memory
  } catch (error) {
    log.error('Error getting track memory', error)
    return null
  }
}

/**
 * Append a memory entry to a track's memory.
 * This is the primary deposit function.
 */
export async function appendTrackMemoryEntry(
  userId: string,
  trackId: string,
  entryType: MemoryEntryType,
  payload: unknown,
  sourceMode?: SourceMode
): Promise<MemoryEntry | null> {
  try {
    // Validate payload
    if (!isValidPayload(entryType, payload)) {
      log.error('Invalid payload for entry type', { entryType, payload })
      return null
    }

    // Ensure memory record exists
    const memory = await ensureTrackMemory(userId, trackId)
    if (!memory) {
      log.error('Failed to ensure track memory', { userId, trackId })
      return null
    }

    const supabase = await createServerSupabaseClient()

    // Insert entry
    const { data, error } = await supabase
      .from('track_memory_entries')
      .insert({
        track_memory_id: memory.id,
        user_id: userId,
        entry_type: entryType,
        payload: payload as Json,
        source_mode: sourceMode ?? null,
      })
      .select('*')
      .single()

    if (error) {
      log.error('Failed to append track memory entry', error)
      return null
    }

    log.debug('Appended track memory entry', {
      trackId,
      entryType,
      sourceMode,
    })

    // If this is an intent, update canonical intent
    if (entryType === 'intent') {
      const intentPayload = payload as IntentPayload
      if (typeof intentPayload.content === 'string') {
        await supabase
          .from('track_memory')
          .update({
            canonical_intent: intentPayload.content,
            canonical_intent_updated_at: new Date().toISOString(),
          })
          .eq('id', memory.id)
      }
    }

    return entryFromRow(data)
  } catch (error) {
    log.error('Error appending track memory entry', error)
    return null
  }
}

/**
 * Delete all track memory for a track.
 * Called when a track/asset is deleted.
 */
export async function deleteTrackMemory(userId: string, trackId: string): Promise<boolean> {
  try {
    const supabase = await createServerSupabaseClient()

    // Entries are cascade-deleted via FK constraint
    const { error } = await supabase
      .from('track_memory')
      .delete()
      .eq('user_id', userId)
      .eq('track_id', trackId)

    if (error) {
      log.error('Failed to delete track memory', error)
      return false
    }

    log.info('Deleted track memory', { userId, trackId })
    return true
  } catch (error) {
    log.error('Error deleting track memory', error)
    return false
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Get the canonical intent for a track.
 */
export async function getCanonicalIntent(userId: string, trackId: string): Promise<string | null> {
  const memory = await getTrackMemory(userId, trackId)
  return memory?.canonicalIntent ?? null
}

/**
 * Get all perspectives for a track.
 */
export async function getPerspectives(userId: string, trackId: string): Promise<MemoryEntry[]> {
  const memory = await getTrackMemory(userId, trackId, {
    includeEntries: true,
    entryTypes: ['perspective'],
  })
  return memory?.entries ?? []
}

/**
 * Get all story fragments for a track.
 */
export async function getStoryFragments(userId: string, trackId: string): Promise<MemoryEntry[]> {
  const memory = await getTrackMemory(userId, trackId, {
    includeEntries: true,
    entryTypes: ['story_fragment'],
  })
  return memory?.entries ?? []
}

/**
 * Get recent entries for a track (any type).
 */
export async function getRecentEntries(
  userId: string,
  trackId: string,
  limit: number = 10
): Promise<MemoryEntry[]> {
  try {
    const memory = await getTrackMemory(userId, trackId)
    if (!memory) return []

    const supabase = await createServerSupabaseClient()

    const { data } = await supabase
      .from('track_memory_entries')
      .select('*')
      .eq('track_memory_id', memory.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    return data ? (data as TrackMemoryEntryRow[]).map(entryFromRow) : []
  } catch (error) {
    log.error('Error getting recent entries', error)
    return []
  }
}
