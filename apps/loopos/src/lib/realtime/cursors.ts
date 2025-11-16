/**
 * Cursor System - Real-time cursor position broadcasting
 * Manages live cursors for Timeline Canvas and Designer Mode
 */

import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@total-audio/loopos-db'

export interface CursorPosition {
  userId: string
  displayName: string
  colour: string
  x: number
  y: number
  label?: string // Optional context (e.g., node title under cursor)
  lastMovedAt: string
}

export type CursorContext = 'timeline' | 'designer'

/**
 * Create a cursor broadcast channel
 */
export function createCursorChannel(
  workspaceId: string,
  context: CursorContext
): RealtimeChannel {
  const channelName = `loopos:cursor:${context}:${workspaceId}`

  return supabase.channel(channelName)
}

/**
 * Broadcast cursor position
 * Uses throttling to avoid excessive network traffic
 */
export async function broadcastCursor(
  channel: RealtimeChannel,
  position: CursorPosition
): Promise<void> {
  await channel.send({
    type: 'broadcast',
    event: 'cursor_move',
    payload: position,
  })
}

/**
 * Broadcast cursor leave event (user left the canvas)
 */
export async function broadcastCursorLeave(
  channel: RealtimeChannel,
  userId: string
): Promise<void> {
  await channel.send({
    type: 'broadcast',
    event: 'cursor_leave',
    payload: { userId },
  })
}

/**
 * Check if cursor position is stale (no movement for > 10 seconds)
 */
export function isCursorStale(cursor: CursorPosition): boolean {
  const lastMoved = new Date(cursor.lastMovedAt).getTime()
  const now = Date.now()
  const staleThreshold = 10 * 1000 // 10 seconds

  return now - lastMoved > staleThreshold
}

/**
 * Throttle function for cursor broadcasts
 * Limits updates to a maximum frequency (e.g., 60ms = ~16fps)
 */
export function createCursorThrottle(delay: number = 60) {
  let lastCall = 0
  let timeoutId: NodeJS.Timeout | null = null

  return function throttle<T extends (...args: any[]) => void>(
    fn: T,
    ...args: Parameters<T>
  ): void {
    const now = Date.now()

    if (now - lastCall >= delay) {
      lastCall = now
      fn(...args)
    } else {
      // Schedule for later if not called recently
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        lastCall = Date.now()
        fn(...args)
      }, delay - (now - lastCall))
    }
  }
}

/**
 * Calculate relative cursor position within a container
 */
export function getRelativeCursorPosition(
  event: MouseEvent | PointerEvent,
  container: HTMLElement
): { x: number; y: number } {
  const rect = container.getBoundingClientRect()

  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  }
}

/**
 * Transform cursor position for React Flow canvas
 * Accounts for zoom and pan transformations
 */
export function transformCursorForReactFlow(
  x: number,
  y: number,
  viewport: { zoom: number; x: number; y: number }
): { x: number; y: number } {
  return {
    x: (x - viewport.x) / viewport.zoom,
    y: (y - viewport.y) / viewport.zoom,
  }
}
