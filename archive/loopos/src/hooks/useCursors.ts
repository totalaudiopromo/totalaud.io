'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { useAuth } from './useAuth'
import {
  createCursorChannel,
  broadcastCursor,
  broadcastCursorLeave,
  isCursorStale,
  createCursorThrottle,
  getRelativeCursorPosition,
  type CursorPosition,
  type CursorContext,
} from '@/lib/realtime/cursors'

interface UseCursorsOptions {
  workspaceId: string
  context: CursorContext
  containerRef: React.RefObject<HTMLElement>
  displayName?: string
  colour?: string
  throttleDelay?: number
}

interface UseCursorsReturn {
  cursors: Map<string, CursorPosition>
  isConnected: boolean
  updateLabel: (label?: string) => void
}

/**
 * Hook for managing live cursors
 * Automatically broadcasts cursor position and tracks other users' cursors
 */
export function useCursors(options: UseCursorsOptions): UseCursorsReturn {
  const { user } = useAuth()
  const [cursors, setCursors] = useState<Map<string, CursorPosition>>(new Map())
  const [isConnected, setIsConnected] = useState(false)
  const [currentLabel, setCurrentLabel] = useState<string | undefined>()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const throttleRef = useRef(createCursorThrottle(options.throttleDelay || 60))
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const {
    workspaceId,
    context,
    containerRef,
    displayName = user?.email?.split('@')[0] || 'Anonymous',
    colour = '#3AA9BE',
  } = options

  // Cleanup stale cursors periodically
  useEffect(() => {
    cleanupIntervalRef.current = setInterval(() => {
      setCursors((prev) => {
        const updated = new Map(prev)
        let changed = false

        for (const [userId, cursor] of updated.entries()) {
          if (isCursorStale(cursor)) {
            updated.delete(userId)
            changed = true
          }
        }

        return changed ? updated : prev
      })
    }, 5000) // Check every 5 seconds

    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current)
      }
    }
  }, [])

  // Initialize cursor channel
  useEffect(() => {
    if (!user || !workspaceId || !containerRef.current) return

    const channel = createCursorChannel(workspaceId, context)
    channelRef.current = channel

    // Subscribe to cursor broadcasts
    channel
      .on('broadcast', { event: 'cursor_move' }, ({ payload }) => {
        const cursorPos = payload as CursorPosition

        // Ignore own cursor
        if (cursorPos.userId === user.id) return

        setCursors((prev) => {
          const updated = new Map(prev)
          updated.set(cursorPos.userId, cursorPos)
          return updated
        })
      })
      .on('broadcast', { event: 'cursor_leave' }, ({ payload }) => {
        const { userId } = payload as { userId: string }

        // Remove cursor
        setCursors((prev) => {
          const updated = new Map(prev)
          updated.delete(userId)
          return updated
        })
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
        }
      })

    // Track mouse movement
    const container = containerRef.current

    const handleMouseMove = (event: MouseEvent) => {
      if (!container || !user) return

      const { x, y } = getRelativeCursorPosition(event, container)

      const position: CursorPosition = {
        userId: user.id,
        displayName,
        colour,
        x,
        y,
        label: currentLabel,
        lastMovedAt: new Date().toISOString(),
      }

      // Throttled broadcast
      throttleRef.current(async () => {
        if (channelRef.current) {
          await broadcastCursor(channelRef.current, position)
        }
      })
    }

    const handleMouseLeave = async () => {
      if (!user || !channelRef.current) return
      await broadcastCursorLeave(channelRef.current, user.id)
    }

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseleave', handleMouseLeave)

    // Cleanup on unmount
    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMouseLeave)

      if (channelRef.current && user) {
        broadcastCursorLeave(channelRef.current, user.id)
        channelRef.current.unsubscribe()
      }

      setIsConnected(false)
    }
  }, [user, workspaceId, context, containerRef, displayName, colour, currentLabel])

  // Update label function
  const updateLabel = useCallback((label?: string) => {
    setCurrentLabel(label)
  }, [])

  return {
    cursors,
    isConnected,
    updateLabel,
  }
}
