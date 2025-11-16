/**
 * LoopOS Phase 8: Realtime Cursor Tracking
 * Broadcasts cursor positions for collaborative editing
 */

import { supabase } from '../client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface CursorPosition {
  user_id: string
  display_name: string
  colour: string
  x: number
  y: number
  timestamp: number
}

export interface CursorCallbacks {
  onCursorMove?: (cursor: CursorPosition) => void
  onCursorLeave?: (userId: string) => void
}

export const cursorsDb = {
  /**
   * Subscribe to cursor movements in a workspace
   */
  subscribeToCursors(
    workspaceId: string,
    userId: string,
    displayName: string,
    colour: string,
    callbacks: CursorCallbacks
  ): RealtimeChannel {
    const channel = supabase.channel(`workspace:${workspaceId}:cursors`)

    channel
      .on('broadcast', { event: 'cursor_move' }, ({ payload }) => {
        if (payload.user_id !== userId && callbacks.onCursorMove) {
          callbacks.onCursorMove(payload as CursorPosition)
        }
      })
      .on('broadcast', { event: 'cursor_leave' }, ({ payload }) => {
        if (payload.user_id !== userId && callbacks.onCursorLeave) {
          callbacks.onCursorLeave(payload.user_id)
        }
      })
      .subscribe()

    return channel
  },

  /**
   * Broadcast cursor position
   */
  async broadcastPosition(
    channel: RealtimeChannel,
    userId: string,
    displayName: string,
    colour: string,
    x: number,
    y: number
  ): Promise<void> {
    await channel.send({
      type: 'broadcast',
      event: 'cursor_move',
      payload: {
        user_id: userId,
        display_name: displayName,
        colour,
        x,
        y,
        timestamp: Date.now(),
      } as CursorPosition,
    })
  },

  /**
   * Broadcast cursor leave
   */
  async broadcastLeave(
    channel: RealtimeChannel,
    userId: string
  ): Promise<void> {
    await channel.send({
      type: 'broadcast',
      event: 'cursor_leave',
      payload: { user_id: userId },
    })
  },

  /**
   * Unsubscribe from cursors
   */
  async unsubscribe(channel: RealtimeChannel): Promise<void> {
    await channel.unsubscribe()
  },
}
