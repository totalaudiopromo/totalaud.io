/**
 * Phase 31: Creative Rhythm System - Activity Tracker Hook
 *
 * Simple hook for tracking creative activity events.
 * Fire-and-forget. Never blocks UI. Silent failures.
 */

import { useCallback } from 'react'
import type { ActivityType } from '@loopos/db'

interface UseActivityTrackerOptions {
  workspaceId: string
  userId: string
}

export function useActivityTracker({ workspaceId, userId }: UseActivityTrackerOptions) {
  const track = useCallback(
    async (type: ActivityType, metadata: Record<string, unknown> = {}) => {
      try {
        // Fire-and-forget POST request
        fetch('/api/rhythm/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workspaceId,
            userId,
            type,
            metadata,
          }),
          // Don't wait for response
        }).catch(() => {
          // Silent failure - never interrupt user
        })
      } catch (err) {
        // Silent failure - just awareness, not critical
      }
    },
    [workspaceId, userId]
  )

  return { track }
}

/**
 * Usage example:
 *
 * const { track } = useActivityTracker({ workspaceId, userId })
 *
 * // When user creates a note:
 * track('note', { length: noteContent.length })
 *
 * // When user sends coach message:
 * track('coach', { topic: 'release-planning' })
 *
 * // When user adds timeline node:
 * track('node', { nodeType: 'milestone' })
 *
 * // When user generates designer scene:
 * track('designer', { prompt: scenesPrompt })
 *
 * // When user creates pack:
 * track('pack', { packType: 'radio' })
 *
 * // On login/session start:
 * track('login')
 */
