/**
 * Presence System - Real-time workspace presence tracking
 * Manages who's online, where they are, and what they're focused on
 */

import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@total-audio/loopos-db'

export type PresenceLocation =
  | 'dashboard'
  | 'timeline'
  | 'designer'
  | 'coach'
  | 'journal'
  | 'packs'
  | 'playbook'
  | 'export'

export interface PresenceState {
  userId: string
  displayName: string
  colour: string
  location: PresenceLocation
  focusNodeId?: string | null
  focusSceneId?: string | null
  lastActiveAt: string
}

export interface PresenceUpdate extends Partial<PresenceState> {
  location?: PresenceLocation
  focusNodeId?: string | null
  focusSceneId?: string | null
}

export type PresenceParticipant = PresenceState

/**
 * Create a presence channel for a workspace
 */
export function createPresenceChannel(workspaceId: string): RealtimeChannel {
  const channelName = `loopos:presence:workspace:${workspaceId}`

  return supabase.channel(channelName, {
    config: {
      presence: {
        key: '', // Will be set when tracking presence
      },
    },
  })
}

/**
 * Join presence channel and track user presence
 */
export async function trackPresence(
  channel: RealtimeChannel,
  state: PresenceState
): Promise<void> {
  await channel.track(state)
}

/**
 * Update presence state
 */
export async function updatePresence(
  channel: RealtimeChannel,
  updates: PresenceUpdate
): Promise<void> {
  // Get current state
  const currentState = channel.presenceState()
  const myKey = Object.keys(currentState)[0]

  if (!myKey) {
    console.warn('No presence state found, cannot update')
    return
  }

  const current = currentState[myKey]?.[0] as PresenceState | undefined

  if (!current) {
    console.warn('Current presence state not found')
    return
  }

  // Merge updates with current state
  const newState: PresenceState = {
    ...current,
    ...updates,
    lastActiveAt: new Date().toISOString(),
  }

  await channel.track(newState)
}

/**
 * Leave presence channel
 */
export async function leavePresence(channel: RealtimeChannel): Promise<void> {
  await channel.untrack()
  await channel.unsubscribe()
}

/**
 * Get all participants in a presence channel
 */
export function getPresenceParticipants(
  channel: RealtimeChannel
): PresenceParticipant[] {
  const state = channel.presenceState()
  const participants: PresenceParticipant[] = []

  Object.values(state).forEach((presences) => {
    presences.forEach((presence) => {
      participants.push(presence as PresenceParticipant)
    })
  })

  return participants
}

/**
 * Filter participants by location
 */
export function getParticipantsByLocation(
  participants: PresenceParticipant[],
  location: PresenceLocation
): PresenceParticipant[] {
  return participants.filter((p) => p.location === location)
}

/**
 * Check if a user is currently editing a specific node
 */
export function isUserEditingNode(
  participants: PresenceParticipant[],
  nodeId: string
): PresenceParticipant[] {
  return participants.filter((p) => p.focusNodeId === nodeId)
}

/**
 * Check if a user is currently editing a specific scene
 */
export function isUserEditingScene(
  participants: PresenceParticipant[],
  sceneId: string
): PresenceParticipant[] {
  return participants.filter((p) => p.focusSceneId === sceneId)
}

/**
 * Get display-friendly participant count by location
 */
export function getLocationCounts(
  participants: PresenceParticipant[]
): Record<PresenceLocation, number> {
  const counts: Record<string, number> = {}

  participants.forEach((p) => {
    counts[p.location] = (counts[p.location] || 0) + 1
  })

  return counts as Record<PresenceLocation, number>
}

/**
 * Check if a participant is idle (no activity for > 2 minutes)
 */
export function isParticipantIdle(participant: PresenceParticipant): boolean {
  const lastActive = new Date(participant.lastActiveAt).getTime()
  const now = Date.now()
  const idleThreshold = 2 * 60 * 1000 // 2 minutes

  return now - lastActive > idleThreshold
}
