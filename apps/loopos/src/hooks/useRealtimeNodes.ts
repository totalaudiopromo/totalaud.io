'use client'

import { useEffect, useState, useCallback } from 'react'
import { realtimeNodesDb, type Node } from '@total-audio/loopos-db'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { usePresence } from './usePresence'
import { toast } from 'sonner'

export interface NodeLock {
  node_id: string
  user_id: string
  display_name: string
}

export interface NodeSelection {
  node_id: string | null
  user_id: string
  display_name: string
  colour: string
}

export function useRealtimeNodes(
  workspaceId: string | null,
  userId: string | null,
  onNodeChange?: {
    onCreate?: (node: Node) => void
    onUpdate?: (node: Node, oldNode: Node) => void
    onDelete?: (nodeId: string) => void
  }
) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const [locks, setLocks] = useState<Map<string, NodeLock>>(new Map())
  const [selections, setSelections] = useState<Map<string, NodeSelection>>(
    new Map()
  )
  const { profile } = usePresence(workspaceId, userId)

  // Subscribe to node changes
  useEffect(() => {
    if (!workspaceId) return

    const nodeChannel = realtimeNodesDb.subscribeToNodes(workspaceId, {
      onCreate: (node) => {
        if (onNodeChange?.onCreate) {
          onNodeChange.onCreate(node)
        }
        if (node.user_id !== userId) {
          toast.info('New node created', {
            description: node.title,
          })
        }
      },
      onUpdate: (node, oldNode) => {
        if (onNodeChange?.onUpdate) {
          onNodeChange.onUpdate(node, oldNode)
        }
      },
      onDelete: (nodeId) => {
        if (onNodeChange?.onDelete) {
          onNodeChange.onDelete(nodeId)
        }
        // Clear locks and selections for deleted node
        setLocks((prev) => {
          const next = new Map(prev)
          next.delete(nodeId)
          return next
        })
        setSelections((prev) => {
          const next = new Map(prev)
          Array.from(next.entries()).forEach(([key, value]) => {
            if (value.node_id === nodeId) {
              next.delete(key)
            }
          })
          return next
        })
      },
    })

    // Subscribe to node selection events
    realtimeNodesDb.onNodeSelection(nodeChannel, (payload) => {
      if (payload.user_id === userId) return
      setSelections((prev) => {
        const next = new Map(prev)
        if (payload.node_id === null) {
          next.delete(payload.user_id)
        } else {
          next.set(payload.user_id, {
            node_id: payload.node_id,
            user_id: payload.user_id,
            display_name: payload.display_name,
            colour: payload.colour,
          })
        }
        return next
      })
    })

    // Subscribe to node lock events
    realtimeNodesDb.onNodeLock(
      nodeChannel,
      (payload) => {
        if (payload.user_id === userId) return
        setLocks((prev) => {
          const next = new Map(prev)
          next.set(payload.node_id, {
            node_id: payload.node_id,
            user_id: payload.user_id,
            display_name: payload.display_name,
          })
          return next
        })
        toast.warning(`${payload.display_name} is editing this node`)
      },
      (payload) => {
        if (payload.user_id === userId) return
        setLocks((prev) => {
          const next = new Map(prev)
          next.delete(payload.node_id)
          return next
        })
      }
    )

    setChannel(nodeChannel)

    return () => {
      realtimeNodesDb.unsubscribe(nodeChannel)
    }
  }, [workspaceId, userId, onNodeChange])

  // Broadcast node selection
  const broadcastSelection = useCallback(
    async (nodeId: string | null) => {
      if (!channel || !userId || !profile) return
      await realtimeNodesDb.broadcastSelection(
        channel,
        userId,
        profile.display_name,
        profile.colour,
        nodeId
      )
    },
    [channel, userId, profile]
  )

  // Broadcast node lock
  const broadcastLock = useCallback(
    async (nodeId: string, locked: boolean) => {
      if (!channel || !userId || !profile) return
      await realtimeNodesDb.broadcastLock(
        channel,
        userId,
        profile.display_name,
        nodeId,
        locked
      )
    },
    [channel, userId, profile]
  )

  // Check if a node is locked by another user
  const isLocked = useCallback(
    (nodeId: string): boolean => {
      const lock = locks.get(nodeId)
      return lock !== undefined && lock.user_id !== userId
    },
    [locks, userId]
  )

  // Get lock info for a node
  const getLock = useCallback(
    (nodeId: string): NodeLock | null => {
      return locks.get(nodeId) || null
    },
    [locks]
  )

  // Get selections for a node
  const getSelectionsForNode = useCallback(
    (nodeId: string): NodeSelection[] => {
      return Array.from(selections.values()).filter(
        (s) => s.node_id === nodeId
      )
    },
    [selections]
  )

  return {
    broadcastSelection,
    broadcastLock,
    isLocked,
    getLock,
    getSelectionsForNode,
    allSelections: Array.from(selections.values()),
  }
}
