'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { useAuth } from './useAuth'
import { nodesDb, type Node } from '@total-audio/loopos-db'
import {
  createNodesChannel,
  broadcastNodeMoved,
  broadcastNodeUpdated,
  broadcastNodeCreated,
  broadcastNodeDeleted,
  shouldApplyNodeEvent,
  mergeNodeUpdate,
  createNodeUpdateDebounce,
  subscribeToNodeChanges,
  type NodeEvent,
  type NodeMoveEvent,
  type NodeUpdateEvent,
  type NodeCreateEvent,
  type NodeDeleteEvent,
} from '@/lib/realtime/nodes'

interface UseRealtimeNodesOptions {
  workspaceId: string
  onNodeUpdate?: (node: Partial<Node> & { id: string }) => void
  onNodeCreate?: (node: Node) => void
  onNodeDelete?: (nodeId: string) => void
}

interface UseRealtimeNodesReturn {
  isConnected: boolean
  broadcastMove: (nodeId: string, x: number, y: number, version?: number) => Promise<void>
  broadcastUpdate: (nodeId: string, updates: Partial<Node>, version?: number) => Promise<void>
  broadcastCreate: (node: Node) => Promise<void>
  broadcastDelete: (nodeId: string) => Promise<void>
}

/**
 * Hook for real-time node collaboration
 * Manages broadcasting and receiving node updates across users
 */
export function useRealtimeNodes(options: UseRealtimeNodesOptions): UseRealtimeNodesReturn {
  const { user } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const broadcastChannelRef = useRef<RealtimeChannel | null>(null)
  const dbChannelRef = useRef<RealtimeChannel | null>(null)
  const debounceRef = useRef(createNodeUpdateDebounce(120))
  const nodeVersionsRef = useRef<Map<string, number>>(new Map())

  const { workspaceId, onNodeUpdate, onNodeCreate, onNodeDelete } = options

  // Initialize broadcast channel
  useEffect(() => {
    if (!user || !workspaceId) return

    const channel = createNodesChannel(workspaceId)
    broadcastChannelRef.current = channel

    // Subscribe to broadcasts
    channel
      .on('broadcast', { event: 'node_moved' }, ({ payload }) => {
        const event = payload as NodeMoveEvent

        // Check if should apply
        const currentVersion = nodeVersionsRef.current.get(event.nodeId) || 0
        if (!shouldApplyNodeEvent(event, currentVersion, user.id)) {
          return
        }

        // Update version
        if (event.version) {
          nodeVersionsRef.current.set(event.nodeId, event.version)
        }

        // Apply update
        if (onNodeUpdate && event.data) {
          onNodeUpdate({
            id: event.nodeId,
            ...event.data,
          })
        }
      })
      .on('broadcast', { event: 'node_updated' }, ({ payload }) => {
        const event = payload as NodeUpdateEvent

        const currentVersion = nodeVersionsRef.current.get(event.nodeId) || 0
        if (!shouldApplyNodeEvent(event, currentVersion, user.id)) {
          return
        }

        if (event.version) {
          nodeVersionsRef.current.set(event.nodeId, event.version)
        }

        if (onNodeUpdate && event.data) {
          onNodeUpdate({
            id: event.nodeId,
            ...event.data,
          })
        }
      })
      .on('broadcast', { event: 'node_created' }, ({ payload }) => {
        const event = payload as NodeCreateEvent

        // Ignore own creates (already in local state)
        if (event.userId === user.id) return

        if (onNodeCreate && event.data) {
          onNodeCreate(event.data as Node)
          if (event.version) {
            nodeVersionsRef.current.set(event.nodeId, event.version)
          }
        }
      })
      .on('broadcast', { event: 'node_deleted' }, ({ payload }) => {
        const event = payload as NodeDeleteEvent

        // Ignore own deletes
        if (event.userId === user.id) return

        if (onNodeDelete) {
          onNodeDelete(event.nodeId)
          nodeVersionsRef.current.delete(event.nodeId)
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
        }
      })

    // Subscribe to database changes (authoritative source)
    const dbChannel = subscribeToNodeChanges(
      workspaceId,
      (node) => {
        // Handle DB insert
        if (onNodeCreate) {
          onNodeCreate(node)
        }
        nodeVersionsRef.current.set(node.id, node.version || 1)
      },
      (node) => {
        // Handle DB update
        if (onNodeUpdate) {
          onNodeUpdate(node)
        }
        nodeVersionsRef.current.set(node.id, node.version || 1)
      },
      (nodeId) => {
        // Handle DB delete
        if (onNodeDelete) {
          onNodeDelete(nodeId)
        }
        nodeVersionsRef.current.delete(nodeId)
      }
    )
    dbChannelRef.current = dbChannel

    // Cleanup
    return () => {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.unsubscribe()
      }
      if (dbChannelRef.current) {
        dbChannelRef.current.unsubscribe()
      }
      setIsConnected(false)
    }
  }, [user, workspaceId, onNodeUpdate, onNodeCreate, onNodeDelete])

  // Broadcast move
  const handleBroadcastMove = useCallback(
    async (nodeId: string, x: number, y: number, version?: number) => {
      if (!user || !broadcastChannelRef.current) return

      debounceRef.current(nodeId, async () => {
        await broadcastNodeMoved(broadcastChannelRef.current!, {
          nodeId,
          userId: user.id,
          workspaceId,
          version,
          data: {
            position_x: x,
            position_y: y,
          },
        })
      })
    },
    [user, workspaceId]
  )

  // Broadcast update
  const handleBroadcastUpdate = useCallback(
    async (nodeId: string, updates: Partial<Node>, version?: number) => {
      if (!user || !broadcastChannelRef.current) return

      await broadcastNodeUpdated(broadcastChannelRef.current, {
        nodeId,
        userId: user.id,
        workspaceId,
        version,
        data: updates,
      })
    },
    [user, workspaceId]
  )

  // Broadcast create
  const handleBroadcastCreate = useCallback(
    async (node: Node) => {
      if (!user || !broadcastChannelRef.current) return

      await broadcastNodeCreated(broadcastChannelRef.current, {
        nodeId: node.id,
        userId: user.id,
        workspaceId,
        version: node.version || 1,
        data: node,
      })
    },
    [user, workspaceId]
  )

  // Broadcast delete
  const handleBroadcastDelete = useCallback(
    async (nodeId: string) => {
      if (!user || !broadcastChannelRef.current) return

      await broadcastNodeDeleted(broadcastChannelRef.current, {
        nodeId,
        userId: user.id,
        workspaceId,
      })
    },
    [user, workspaceId]
  )

  return {
    isConnected,
    broadcastMove: handleBroadcastMove,
    broadcastUpdate: handleBroadcastUpdate,
    broadcastCreate: handleBroadcastCreate,
    broadcastDelete: handleBroadcastDelete,
  }
}
