/**
 * useTrackMemoryDeposit Hook
 *
 * Client-side helper that used to deposit entries to the console-era
 * track-memory store (track_memory / track_memory_entries tables). That
 * store was removed -- it never existed in production -- so deposits are
 * now silent no-ops. The hook keeps its shape so callers need no changes.
 */

'use client'

import { useCallback } from 'react'
import { useCurrentTrackId } from './useCurrentTrackId'

type MemoryEntryType =
  | 'intent'
  | 'perspective'
  | 'story_fragment'
  | 'sequence_decision'
  | 'scout_consideration'
  | 'version_note'
  | 'note'

type SourceMode = 'ideas' | 'finish' | 'story' | 'scout' | 'timeline' | 'content' | 'manual'

interface DepositOptions {
  /** If true, skips deposit if no track context exists (default: true) */
  requireTrack?: boolean
}

/**
 * Hook for depositing memories to Track Memory.
 * Deposits are silent and failure-safe.
 */
export function useTrackMemoryDeposit() {
  const trackId = useCurrentTrackId()

  /**
   * Deposit a memory entry.
   * The persistence layer was removed, so this is a silent no-op.
   * Silent: never throws, always returns boolean.
   */
  const deposit = useCallback(
    async (
      _entryType: MemoryEntryType,
      _payload: Record<string, unknown>,
      _sourceMode?: SourceMode,
      _options?: DepositOptions
    ): Promise<boolean> => {
      return false
    },
    []
  )

  /**
   * Deposit intent from Ideas mode.
   */
  const depositIntent = useCallback(
    async (content: string, ideaId?: string) => {
      return deposit('intent', { content, ideaId }, 'ideas')
    },
    [deposit]
  )

  /**
   * Deposit a perspective from Finish mode.
   */
  const depositPerspective = useCallback(
    async (content: string, category?: string) => {
      return deposit('perspective', { content, category }, 'finish')
    },
    [deposit]
  )

  /**
   * Deposit a story fragment from Story/Pitch mode.
   */
  const depositStoryFragment = useCallback(
    async (content: string, section?: string, pitchDraftId?: string) => {
      return deposit('story_fragment', { content, section, pitchDraftId }, 'story')
    },
    [deposit]
  )

  /**
   * Deposit a sequence decision from Timeline mode.
   */
  const depositSequenceDecision = useCallback(
    async (eventId: string, eventTitle: string, lane: string, eventDate: string) => {
      return deposit('sequence_decision', { eventId, eventTitle, lane, eventDate }, 'timeline')
    },
    [deposit]
  )

  return {
    /** Whether track context exists */
    hasTrack: !!trackId,
    /** Current track ID */
    trackId,
    /** Generic deposit function */
    deposit,
    /** Deposit intent (from Ideas) */
    depositIntent,
    /** Deposit perspective (from Finish) */
    depositPerspective,
    /** Deposit story fragment (from Pitch) */
    depositStoryFragment,
    /** Deposit sequence decision (from Timeline) */
    depositSequenceDecision,
  }
}
