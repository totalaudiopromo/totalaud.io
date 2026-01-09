/**
 * useTrackContext Hook
 *
 * Track Memory Read-Side Integration
 *
 * Provides read-only access to Track Memory for a given track.
 * Returns null/undefined for all fields if no track context exists.
 * Silent failure - never throws, never blocks user action.
 *
 * Precedence Rules:
 * 1. In-session state (fresh edits) — caller must prefer this
 * 2. Track Memory (persisted) — this hook provides this
 * 3. Empty fallback (current behaviour) — caller falls back to this
 *
 * Usage:
 *   const { intent, perspectives, storyFragments } = useTrackContext()
 *
 *   // Combine with local state (caller's responsibility)
 *   const displayIntent = localIntent || intent || 'No intent yet'
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useCurrentTrackId } from './useCurrentTrackId'
import { logger } from '@/lib/logger'

const log = logger.scope('TrackContext')

// ============================================================================
// Types
// ============================================================================

export interface TrackContextIntent {
  content: string
  updatedAt: string
}

export interface TrackContextPerspective {
  id: string
  content: string
  category?: string
  createdAt: string
}

export interface TrackContextStoryFragment {
  id: string
  content: string
  section?: string
  pitchDraftId?: string
  createdAt: string
}

export interface TrackContextSequenceDecision {
  id: string
  eventId: string
  eventTitle: string
  lane: string
  eventDate: string
  createdAt: string
}

export interface TrackContext {
  /** Whether track context exists */
  hasTrack: boolean
  /** Current track ID (null if no context) */
  trackId: string | null
  /** Loading state */
  isLoading: boolean
  /** Canonical intent for this track */
  intent: TrackContextIntent | null
  /** Latest perspectives for this track */
  perspectives: TrackContextPerspective[]
  /** Recent story fragments for this track */
  storyFragments: TrackContextStoryFragment[]
  /** Last sequence decision for this track */
  lastSequenceDecision: TrackContextSequenceDecision | null
  /** Refresh the context (call after writing) */
  refresh: () => void
}

// API Response types
interface MemoryApiResponse {
  success: boolean
  data?: {
    canonicalIntent?: string | null
    canonicalIntentUpdatedAt?: string | null
    entries?: Array<{
      id: string
      entryType: string
      payload: Record<string, unknown>
      createdAt: string
    }>
  }
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Read-only access to Track Memory.
 *
 * @param overrideTrackId - Optional track ID override (uses URL param if not provided)
 */
export function useTrackContext(overrideTrackId?: string): TrackContext {
  const urlTrackId = useCurrentTrackId()
  const trackId = overrideTrackId ?? urlTrackId

  const [isLoading, setIsLoading] = useState(false)
  const [intent, setIntent] = useState<TrackContextIntent | null>(null)
  const [perspectives, setPerspectives] = useState<TrackContextPerspective[]>([])
  const [storyFragments, setStoryFragments] = useState<TrackContextStoryFragment[]>([])
  const [lastSequenceDecision, setLastSequenceDecision] =
    useState<TrackContextSequenceDecision | null>(null)

  /**
   * Fetch track context from API.
   * Silent failure - sets empty values on error.
   */
  const fetchContext = useCallback(async () => {
    if (!trackId) {
      // No track context - clear all
      setIntent(null)
      setPerspectives([])
      setStoryFragments([])
      setLastSequenceDecision(null)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/track-memory/context?track=${trackId}`)

      if (!response.ok) {
        log.debug('Context fetch failed: HTTP error', { status: response.status })
        // Silent failure - use empty values
        setIntent(null)
        setPerspectives([])
        setStoryFragments([])
        setLastSequenceDecision(null)
        return
      }

      const result = (await response.json()) as MemoryApiResponse

      if (!result.success || !result.data) {
        // No data - use empty values
        setIntent(null)
        setPerspectives([])
        setStoryFragments([])
        setLastSequenceDecision(null)
        return
      }

      // Parse canonical intent
      if (result.data.canonicalIntent) {
        setIntent({
          content: result.data.canonicalIntent,
          updatedAt: result.data.canonicalIntentUpdatedAt || new Date().toISOString(),
        })
      } else {
        setIntent(null)
      }

      // Parse entries by type
      const entries = result.data.entries || []

      // Perspectives
      const perspectiveEntries = entries
        .filter((e) => e.entryType === 'perspective')
        .map((e) => ({
          id: e.id,
          content: String(e.payload?.content || ''),
          category: e.payload?.category as string | undefined,
          createdAt: e.createdAt,
        }))
      setPerspectives(perspectiveEntries)

      // Story fragments
      const fragmentEntries = entries
        .filter((e) => e.entryType === 'story_fragment')
        .map((e) => ({
          id: e.id,
          content: String(e.payload?.content || ''),
          section: e.payload?.section as string | undefined,
          pitchDraftId: e.payload?.pitchDraftId as string | undefined,
          createdAt: e.createdAt,
        }))
      setStoryFragments(fragmentEntries)

      // Last sequence decision
      const sequenceEntries = entries.filter((e) => e.entryType === 'sequence_decision')
      if (sequenceEntries.length > 0) {
        const latest = sequenceEntries[0]
        setLastSequenceDecision({
          id: latest.id,
          eventId: String(latest.payload?.eventId || ''),
          eventTitle: String(latest.payload?.eventTitle || ''),
          lane: String(latest.payload?.lane || ''),
          eventDate: String(latest.payload?.eventDate || ''),
          createdAt: latest.createdAt,
        })
      } else {
        setLastSequenceDecision(null)
      }
    } catch (error) {
      // Silent failure
      log.debug('Context fetch error', { error })
      setIntent(null)
      setPerspectives([])
      setStoryFragments([])
      setLastSequenceDecision(null)
    } finally {
      setIsLoading(false)
    }
  }, [trackId])

  // Fetch on mount and when trackId changes
  useEffect(() => {
    fetchContext()
  }, [fetchContext])

  return {
    hasTrack: !!trackId,
    trackId,
    isLoading,
    intent,
    perspectives,
    storyFragments,
    lastSequenceDecision,
    refresh: fetchContext,
  }
}

/**
 * Convenience hook for just checking if track context exists.
 */
export function useHasTrackContext(): boolean {
  const trackId = useCurrentTrackId()
  return !!trackId
}
