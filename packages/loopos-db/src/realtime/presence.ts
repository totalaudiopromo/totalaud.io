/**
 * LoopOS Phase 8: Realtime Presence Tracking
 * Tracks user online/offline status and workspace participation
 */

import { supabase } from '../client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  display_name: string
  avatar_url: string | null
  colour: string
  status: 'online' | 'offline' | 'away'
  last_seen_at: string
  created_at: string
  updated_at: string
}

export interface PresenceState {
  user_id: string
  workspace_id: string
  display_name: string
  colour: string
  cursor_x?: number
  cursor_y?: number
  current_page?: string
}

export interface PresenceCallbacks {
  onJoin?: (state: PresenceState) => void
  onLeave?: (state: PresenceState) => void
  onUpdate?: (state: PresenceState) => void
}

export const presenceDb = {
  /**
   * Get or create user profile
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('loopos_user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return data
  },

  /**
   * Create user profile
   */
  async createProfile(
    userId: string,
    displayName: string,
    colour?: string
  ): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('loopos_user_profiles')
      .insert({
        id: userId,
        display_name: displayName,
        colour: colour || '#3AA9BE',
        status: 'online',
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: Partial<Pick<UserProfile, 'display_name' | 'avatar_url' | 'colour'>>
  ): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('loopos_user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Update user status
   */
  async updateStatus(status: 'online' | 'offline' | 'away'): Promise<void> {
    const { error } = await supabase.rpc('update_user_status', {
      new_status: status,
    })

    if (error) throw error
  },

  /**
   * Get all users in a workspace
   */
  async getWorkspaceUsers(workspaceId: string): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('loopos_workspace_members')
      .select(
        `
        user_id,
        loopos_user_profiles(*)
      `
      )
      .eq('workspace_id', workspaceId)

    if (error) throw error

    return (
      data
        ?.map((m: any) => m.loopos_user_profiles)
        .filter((p: any) => p !== null) || []
    )
  },

  /**
   * Subscribe to workspace presence
   */
  subscribeToWorkspace(
    workspaceId: string,
    userId: string,
    profile: Pick<UserProfile, 'display_name' | 'colour'>,
    callbacks: PresenceCallbacks
  ): RealtimeChannel {
    const channel = supabase.channel(`workspace:${workspaceId}:presence`, {
      config: {
        presence: {
          key: userId,
        },
      },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        // Process all presence states
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            if (callbacks.onUpdate) {
              callbacks.onUpdate(presence as PresenceState)
            }
          })
        })
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        newPresences.forEach((presence: any) => {
          if (callbacks.onJoin) {
            callbacks.onJoin(presence as PresenceState)
          }
        })
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        leftPresences.forEach((presence: any) => {
          if (callbacks.onLeave) {
            callbacks.onLeave(presence as PresenceState)
          }
        })
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            workspace_id: workspaceId,
            display_name: profile.display_name,
            colour: profile.colour,
            current_page: window.location.pathname,
          } as PresenceState)
        }
      })

    return channel
  },

  /**
   * Update presence cursor position
   */
  async updateCursor(
    channel: RealtimeChannel,
    x: number,
    y: number
  ): Promise<void> {
    await channel.track({
      cursor_x: x,
      cursor_y: y,
    })
  },

  /**
   * Update current page in presence
   */
  async updatePage(channel: RealtimeChannel, page: string): Promise<void> {
    await channel.track({
      current_page: page,
    })
  },

  /**
   * Unsubscribe from workspace presence
   */
  async unsubscribe(channel: RealtimeChannel): Promise<void> {
    await channel.unsubscribe()
  },
}
