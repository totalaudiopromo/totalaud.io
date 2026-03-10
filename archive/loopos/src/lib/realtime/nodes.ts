/**
 * Node Collaboration - Real-time node synchronisation
 * Manages collaborative editing of timeline nodes
 */

import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@total-audio/loopos-db'
import type { Node } from '@total-audio/loopos-db'

export type NodeEventType = 'node_moved' | 'node_updated' | 'node_created' | 'node_deleted'

export interface NodeEvent {
  type: NodeEventType
  nodeId: string
  userId: string
  workspaceId: string
  version?: number
  timestamp: string
  data?: Partial<Node>
}

export interface NodeMoveEvent extends NodeEvent {
  type: 'node_moved'
  data: {
    position_x: number
    position_y: number
  }
}

export interface NodeUpdateEvent extends NodeEvent {
  type: 'node_updated'
  data: Partial<Node>
}

export interface NodeCreateEvent extends NodeEvent {
  type: 'node_created'
  data: Node
}

export interface NodeDeleteEvent extends NodeEvent {
  type: 'node_deleted'
}

/**
 * Create a node collaboration channel
 */
export function createNodesChannel(workspaceId: string): RealtimeChannel {
  const channelName = `loopos:nodes:workspace:${workspaceId}`

  return supabase.channel(channelName)
}

/**
 * Broadcast node moved event
 */
export async function broadcastNodeMoved(
  channel: RealtimeChannel,
  event: Omit<NodeMoveEvent, 'type' | 'timestamp'>
): Promise<void> {
  await channel.send({
    type: 'broadcast',
    event: 'node_moved',
    payload: {
      ...event,
      type: 'node_moved',
      timestamp: new Date().toISOString(),
    },
  })
}

/**
 * Broadcast node updated event
 */
export async function broadcastNodeUpdated(
  channel: RealtimeChannel,
  event: Omit<NodeUpdateEvent, 'type' | 'timestamp'>
): Promise<void> {
  await channel.send({
    type: 'broadcast',
    event: 'node_updated',
    payload: {
      ...event,
      type: 'node_updated',
      timestamp: new Date().toISOString(),
    },
  })
}

/**
 * Broadcast node created event
 */
export async function broadcastNodeCreated(
  channel: RealtimeChannel,
  event: Omit<NodeCreateEvent, 'type' | 'timestamp'>
): Promise<void> {
  await channel.send({
    type: 'broadcast',
    event: 'node_created',
    payload: {
      ...event,
      type: 'node_created',
      timestamp: new Date().toISOString(),
    },
  })
}

/**
 * Broadcast node deleted event
 */
export async function broadcastNodeDeleted(
  channel: RealtimeChannel,
  event: Omit<NodeDeleteEvent, 'type' | 'timestamp'>
): Promise<void> {
  await channel.send({
    type: 'broadcast',
    event: 'node_deleted',
    payload: {
      ...event,
      type: 'node_deleted',
      timestamp: new Date().toISOString(),
    },
  })
}

/**
 * Check if an incoming event should be applied
 * Implements simple last-write-wins strategy with version checking
 */
export function shouldApplyNodeEvent(
  event: NodeEvent,
  currentVersion: number,
  currentUserId: string
): boolean {
  // Ignore events from self
  if (event.userId === currentUserId) {
    return false
  }

  // If no version in event, apply it (backwards compatibility)
  if (!event.version) {
    return true
  }

  // Apply if event version is newer or equal (last-write-wins)
  return event.version >= currentVersion
}

/**
 * Merge node updates with conflict resolution
 * Returns merged data or null if update should be rejected
 */
export function mergeNodeUpdate(
  current: Partial<Node>,
  incoming: Partial<Node>,
  incomingVersion?: number,
  currentVersion?: number
): Partial<Node> | null {
  // If versions match, last write wins
  if (
    incomingVersion !== undefined &&
    currentVersion !== undefined &&
    incomingVersion < currentVersion
  ) {
    return null
  }

  // Merge updates (incoming overwrites current)
  return {
    ...current,
    ...incoming,
    updated_at: new Date().toISOString(),
  }
}

/**
 * Debounce function for node updates
 * Reduces broadcast frequency for rapid changes (e.g., dragging)
 */
export function createNodeUpdateDebounce(delay: number = 120) {
  const timeouts = new Map<string, NodeJS.Timeout>()

  return function debounce(nodeId: string, fn: () => void | Promise<void>): void {
    const existing = timeouts.get(nodeId)
    if (existing) {
      clearTimeout(existing)
    }

    const timeout = setTimeout(async () => {
      await fn()
      timeouts.delete(nodeId)
    }, delay)

    timeouts.set(nodeId, timeout)
  }
}

/**
 * Subscribe to database changes for nodes
 * Complements broadcast channel with authoritative DB updates
 */
export function subscribeToNodeChanges(
  workspaceId: string,
  onInsert?: (node: Node) => void,
  onUpdate?: (node: Node) => void,
  onDelete?: (nodeId: string) => void
): RealtimeChannel {
  return supabase
    .channel(`db:loopos_nodes:workspace:${workspaceId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'loopos_nodes',
        filter: `workspace_id=eq.${workspaceId}`,
      },
      (payload) => {
        if (onInsert && payload.new) {
          onInsert(payload.new as Node)
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
        if (onUpdate && payload.new) {
          onUpdate(payload.new as Node)
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
        if (onDelete && payload.old) {
          onDelete((payload.old as Node).id)
        }
      }
    )
    .subscribe()
}
