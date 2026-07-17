/**
 * useTrackContext Hook
 *
 * Track context for the current track.
 *
 * The console-era track-memory store (track_memory / track_memory_entries
 * tables) was removed -- it never existed in production. This hook now
 * returns an empty, session-scoped context so callers keep working from
 * their own in-session state without any persistence layer.
 *
 * Precedence Rules:
 * 1. In-session state (fresh edits) — caller must prefer this
 * 2. Empty fallback — this hook provides this
 */

'use client'

import { useCallback } from 'react'
import { useCurrentTrackId } from './useCurrentTrackId'

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

// ============================================================================
// Hook Implementation
// ============================================================================

const EMPTY_PERSPECTIVES: TrackContextPerspective[] = []
const EMPTY_STORY_FRAGMENTS: TrackContextStoryFragment[] = []

/**
 * Track context for the current track.
 *
 * Persistence was removed with the console-era track-memory store, so this
 * always returns an empty context -- callers fall back to in-session state.
 *
 * @param overrideTrackId - Optional track ID override (uses URL param if not provided)
 */
export function useTrackContext(overrideTrackId?: string): TrackContext {
  const urlTrackId = useCurrentTrackId()
  const trackId = overrideTrackId ?? urlTrackId

  // No persisted store to refresh -- kept for interface compatibility.
  const refresh = useCallback(() => {}, [])

  return {
    hasTrack: !!trackId,
    trackId,
    isLoading: false,
    intent: null,
    perspectives: EMPTY_PERSPECTIVES,
    storyFragments: EMPTY_STORY_FRAGMENTS,
    lastSequenceDecision: null,
    refresh,
  }
}

/**
 * Convenience hook for just checking if track context exists.
 */
export function useHasTrackContext(): boolean {
  const trackId = useCurrentTrackId()
  return !!trackId
}
