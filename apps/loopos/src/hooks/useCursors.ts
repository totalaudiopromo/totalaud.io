'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { cursorsDb, type CursorPosition } from '@total-audio/loopos-db'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { usePresence } from './usePresence'

const CURSOR_THROTTLE_MS = 50 // Throttle cursor updates to 20fps

export function useCursors(workspaceId: string | null, userId: string | null) {
  const [cursors, setCursors] = useState<Map<string, CursorPosition>>(new Map())
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const lastBroadcast = useRef<number>(0)
  const { profile } = usePresence(workspaceId, userId)

  // Subscribe to cursor channel
  useEffect(() => {
    if (!workspaceId || !userId || !profile) return

    const cursorChannel = cursorsDb.subscribeToCursors(
      workspaceId,
      userId,
      profile.display_name,
      profile.colour,
      {
        onCursorMove: (cursor) => {
          setCursors((prev) => {
            const next = new Map(prev)
            next.set(cursor.user_id, cursor)
            return next
          })

          // Remove stale cursors after 5 seconds
          setTimeout(() => {
            setCursors((prev) => {
              const next = new Map(prev)
              const existingCursor = next.get(cursor.user_id)
              if (existingCursor && existingCursor.timestamp === cursor.timestamp) {
                next.delete(cursor.user_id)
              }
              return next
            })
          }, 5000)
        },
        onCursorLeave: (cursorUserId) => {
          setCursors((prev) => {
            const next = new Map(prev)
            next.delete(cursorUserId)
            return next
          })
        },
      }
    )

    setChannel(cursorChannel)

    return () => {
      cursorsDb.unsubscribe(cursorChannel)
    }
  }, [workspaceId, userId, profile])

  // Broadcast cursor position (throttled)
  const broadcastCursor = useCallback(
    async (x: number, y: number) => {
      if (!channel || !userId || !profile) return

      const now = Date.now()
      if (now - lastBroadcast.current < CURSOR_THROTTLE_MS) return

      lastBroadcast.current = now

      await cursorsDb.broadcastPosition(
        channel,
        userId,
        profile.display_name,
        profile.colour,
        x,
        y
      )
    },
    [channel, userId, profile]
  )

  // Broadcast cursor leave
  const broadcastLeave = useCallback(async () => {
    if (!channel || !userId) return
    await cursorsDb.broadcastLeave(channel, userId)
  }, [channel, userId])

  return {
    cursors: Array.from(cursors.values()),
    broadcastCursor,
    broadcastLeave,
  }
}
