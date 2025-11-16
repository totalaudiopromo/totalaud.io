/**
 * LoopOS Phase 8: Realtime Node Synchronisation
 * Real-time updates for Timeline Canvas nodes
 */

import { supabase } from '../client'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Node } from '../nodes'

export interface NodeChange {
  event: 'INSERT' | 'UPDATE' | 'DELETE'
  node: Node | null
  old_node: Node | null
  user_id: string
  timestamp: number
}

export interface NodeCallbacks {
  onCreate?: (node: Node) => void
  onUpdate?: (node: Node, oldNode: Node) => void
  onDelete?: (nodeId: string) => void
}

export const realtimeNodesDb = {
  /**
   * Subscribe to node changes in a workspace
   */
  subscribeToNodes(
    workspaceId: string,
    callbacks: NodeCallbacks
  ): RealtimeChannel {
    const channel = supabase
      .channel(`workspace:${workspaceId}:nodes`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'loopos_nodes',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          if (callbacks.onCreate) {
            callbacks.onCreate(payload.new as Node)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'loopos_nodes',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          if (callbacks.onUpdate) {
            callbacks.onUpdate(payload.new as Node, payload.old as Node)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'loopos_nodes',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          if (callbacks.onDelete) {
            callbacks.onDelete(payload.old.id)
          }
        }
      )
      .subscribe()

    return channel
  },

  /**
   * Broadcast node selection (for collaboration awareness)
   */
  async broadcastSelection(
    channel: RealtimeChannel,
    userId: string,
    displayName: string,
    colour: string,
    nodeId: string | null
  ): Promise<void> {
    await channel.send({
      type: 'broadcast',
      event: 'node_select',
      payload: {
        user_id: userId,
        display_name: displayName,
        colour,
        node_id: nodeId,
        timestamp: Date.now(),
      },
    })
  },

  /**
   * Broadcast node editing lock (prevents conflicts)
   */
  async broadcastLock(
    channel: RealtimeChannel,
    userId: string,
    displayName: string,
    nodeId: string,
    locked: boolean
  ): Promise<void> {
    await channel.send({
      type: 'broadcast',
      event: locked ? 'node_lock' : 'node_unlock',
      payload: {
        user_id: userId,
        display_name: displayName,
        node_id: nodeId,
        timestamp: Date.now(),
      },
    })
  },

  /**
   * Subscribe to node selection events
   */
  onNodeSelection(
    channel: RealtimeChannel,
    callback: (payload: {
      user_id: string
      display_name: string
      colour: string
      node_id: string | null
    }) => void
  ): void {
    channel.on('broadcast', { event: 'node_select' }, ({ payload }) => {
      callback(payload)
    })
  },

  /**
   * Subscribe to node lock events
   */
  onNodeLock(
    channel: RealtimeChannel,
    onLock: (payload: {
      user_id: string
      display_name: string
      node_id: string
    }) => void,
    onUnlock: (payload: {
      user_id: string
      display_name: string
      node_id: string
    }) => void
  ): void {
    channel.on('broadcast', { event: 'node_lock' }, ({ payload }) => {
      onLock(payload)
    })
    channel.on('broadcast', { event: 'node_unlock' }, ({ payload }) => {
      onUnlock(payload)
    })
  },

  /**
   * Unsubscribe from nodes
   */
  async unsubscribe(channel: RealtimeChannel): Promise<void> {
    await channel.unsubscribe()
  },
}
