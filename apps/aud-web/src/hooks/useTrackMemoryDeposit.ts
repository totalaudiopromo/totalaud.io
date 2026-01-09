/**
 * useTrackMemoryDeposit Hook
 *
 * Client-side helper for depositing to Track Memory.
 * Silent, failure-safe, and only deposits when track context exists.
 *
 * Usage:
 *   const { deposit } = useTrackMemoryDeposit()
 *
 *   // Deposit story fragment when pitch is saved
 *   deposit('story_fragment', { content: 'My hook is...' }, 'story')
 */

'use client'

import { useCallback } from 'react'
import { useCurrentTrackId } from './useCurrentTrackId'
import { logger } from '@/lib/logger'

const log = logger.scope('TrackMemoryDeposit')

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
   * Silent: never throws, always returns boolean.
   */
  const deposit = useCallback(
    async (
      entryType: MemoryEntryType,
      payload: Record<string, unknown>,
      sourceMode?: SourceMode,
      options?: DepositOptions
    ): Promise<boolean> => {
      const requireTrack = options?.requireTrack ?? true

      // Skip if no track context
      if (!trackId) {
        log.debug('Deposit skipped: no track context')
        return false
      }

      try {
        const response = await fetch('/api/track-memory/deposit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trackId,
            entryType,
            payload,
            sourceMode,
          }),
        })

        if (!response.ok) {
          log.debug('Deposit failed: HTTP error', { status: response.status })
          return false
        }

        const result = await response.json()
        return result.deposited === true
      } catch (error) {
        // Silent failure
        log.debug('Deposit failed: network error', { error })
        return false
      }
    },
    [trackId]
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
