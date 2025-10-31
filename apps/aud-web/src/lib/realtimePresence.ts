/**
 * Realtime Presence System
 *
 * Stage 8: Studio Personalisation & Collaboration
 * Manages multi-user presence broadcasting and synchronization
 * via Supabase Realtime channels.
 *
 * Features:
 * - User presence tracking (join/leave/active)
 * - Theme synchronization across collaborators
 * - Active mode broadcasting (Plan/Track/Learn)
 * - Calm Mode shared state
 * - < 250ms latency target
 */

import { RealtimeChannel } from '@supabase/supabase-js'
import { getSupabaseClient } from './supabaseClient'

// Presence state for each user
export interface PresenceState {
  user_id: string
  user_email?: string
  user_name?: string
  theme: 'operator' | 'guide' | 'map' | 'timeline' | 'tape'
  mode: 'plan' | 'track' | 'learn'
  calm_mode: boolean
  joined_at: string
  last_active: string
}

// Collaborator status
export interface Collaborator {
  user_id: string
  user_email?: string
  user_name?: string
  theme: 'operator' | 'guide' | 'map' | 'timeline' | 'tape'
  mode: 'plan' | 'track' | 'learn'
  calm_mode: boolean
  is_active: boolean
  joined_at: Date
  last_active: Date
}

// Presence manager class
export class PresenceManager {
  private channel: RealtimeChannel | null = null
  private campaignId: string
  private userId: string
  private callbacks: {
    onSync?: (collaborators: Collaborator[]) => void
    onJoin?: (collaborator: Collaborator) => void
    onLeave?: (userId: string) => void
  } = {}

  constructor(campaignId: string, userId: string) {
    this.campaignId = campaignId
    this.userId = userId
  }

  /**
   * Initialize presence channel and start tracking
   */
  async connect(
    initialState: Omit<PresenceState, 'user_id' | 'joined_at' | 'last_active'>
  ): Promise<void> {
    const supabase = getSupabaseClient()
    const channelName = `presence:campaign:${this.campaignId}`

    // Create presence channel
    this.channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: this.userId, // Use user_id as unique key
        },
      },
    })

    // Subscribe to presence events
    this.channel
      .on('presence', { event: 'sync' }, () => {
        const state = this.channel?.presenceState()
        if (state && this.callbacks.onSync) {
          const collaborators = this.parsePresenceState(state)
          this.callbacks.onSync(collaborators)
        }
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        if (this.callbacks.onJoin && newPresences.length > 0) {
          const collaborator = this.parsePresenceEntry(key, newPresences[0])
          if (collaborator) {
            this.callbacks.onJoin(collaborator)
          }
        }
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        if (this.callbacks.onLeave) {
          this.callbacks.onLeave(key)
        }
      })

    // Subscribe and track presence
    await this.channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Track current user's presence
        await this.updatePresence(initialState)
      }
    })
  }

  /**
   * Update current user's presence state
   */
  async updatePresence(
    state: Partial<Omit<PresenceState, 'user_id' | 'joined_at' | 'last_active'>>
  ): Promise<void> {
    if (!this.channel) {
      console.warn('Presence channel not initialized')
      return
    }

    const presenceState: PresenceState = {
      user_id: this.userId,
      theme: state.theme || 'operator',
      mode: state.mode || 'plan',
      calm_mode: state.calm_mode || false,
      user_email: state.user_email,
      user_name: state.user_name,
      joined_at: new Date().toISOString(),
      last_active: new Date().toISOString(),
    }

    await this.channel.track(presenceState)
  }

  /**
   * Register callbacks for presence events
   */
  on(event: 'sync', callback: (collaborators: Collaborator[]) => void): void
  on(event: 'join', callback: (collaborator: Collaborator) => void): void
  on(event: 'leave', callback: (userId: string) => void): void
  on(event: string, callback: any): void {
    if (event === 'sync') {
      this.callbacks.onSync = callback
    } else if (event === 'join') {
      this.callbacks.onJoin = callback
    } else if (event === 'leave') {
      this.callbacks.onLeave = callback
    }
  }

  /**
   * Disconnect from presence channel
   */
  async disconnect(): Promise<void> {
    if (this.channel) {
      await this.channel.untrack()
      await this.channel.unsubscribe()
      this.channel = null
    }
  }

  /**
   * Parse presence state into Collaborator array
   */
  private parsePresenceState(state: Record<string, any>): Collaborator[] {
    const collaborators: Collaborator[] = []

    for (const [key, presences] of Object.entries(state)) {
      if (Array.isArray(presences) && presences.length > 0) {
        const collaborator = this.parsePresenceEntry(key, presences[0])
        if (collaborator) {
          collaborators.push(collaborator)
        }
      }
    }

    return collaborators
  }

  /**
   * Parse single presence entry
   */
  private parsePresenceEntry(key: string, presence: any): Collaborator | null {
    if (!presence) return null

    return {
      user_id: key,
      user_email: presence.user_email,
      user_name: presence.user_name,
      theme: presence.theme || 'operator',
      mode: presence.mode || 'plan',
      calm_mode: presence.calm_mode || false,
      is_active: true,
      joined_at: new Date(presence.joined_at || Date.now()),
      last_active: new Date(presence.last_active || Date.now()),
    }
  }

  /**
   * Get current collaborators
   */
  getCollaborators(): Collaborator[] {
    if (!this.channel) return []

    const state = this.channel.presenceState()
    return this.parsePresenceState(state)
  }

  /**
   * Check if global Calm Mode is active (any collaborator has it enabled)
   */
  isGlobalCalmModeActive(): boolean {
    const collaborators = this.getCollaborators()
    return collaborators.some((c) => c.calm_mode)
  }
}

/**
 * Hook-friendly presence manager factory
 */
export function createPresenceManager(campaignId: string, userId: string): PresenceManager {
  return new PresenceManager(campaignId, userId)
}
