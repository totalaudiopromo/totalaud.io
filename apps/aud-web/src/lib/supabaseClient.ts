/**
 * Supabase Client - Singleton Instance
 *
 * Typed client for Console realtime data integration.
 * Stage 6: Realtime Data Integration
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Database types
export interface Campaign {
  id: string
  user_id: string
  title: string
  release_date: string | null
  goal_total: number
  created_at: string
  updated_at: string
}

export interface CampaignEvent {
  id: string
  campaign_id: string
  type: 'pitch_sent' | 'pitch_opened' | 'pitch_replied' | 'workflow_started' | 'release_planned'
  target: string
  status: 'sent' | 'opened' | 'replied' | 'queued'
  message: string
  created_at: string
}

export interface CampaignMetrics {
  id: string
  campaign_id: string
  pitches_sent: number
  pitches_total: number
  opens: number
  replies: number
  open_rate: number
  reply_rate: number
  updated_at: string
}

export interface CampaignInsight {
  id: string
  campaign_id: string
  key: string
  value: string
  trend: 'up' | 'down' | 'neutral'
  metric: string
  created_at: string
}

export interface UserPrefs {
  user_id: string
  theme: 'operator' | 'guide' | 'map' | 'timeline' | 'tape'
  comfort_mode: boolean
  calm_mode: boolean
  sound_muted: boolean
  mute_sounds: boolean
  reduced_motion: boolean
  show_onboarding_overlay: boolean
  preferred_view: 'console' | 'flow' | 'workspace'
  tone: 'minimal' | 'balanced' | 'verbose'
  created_at: string
  updated_at: string
}

export interface CampaignCollaborator {
  id: string
  campaign_id: string
  user_id: string
  role: 'owner' | 'editor' | 'viewer'
  invited_by: string
  created_at: string
}

export interface CollaborationInvite {
  id: string
  campaign_id: string
  invited_email: string
  role: 'editor' | 'viewer'
  invite_token: string
  invited_by: string
  expires_at: string
  accepted_at: string | null
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      campaigns: {
        Row: Campaign
        Insert: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Campaign, 'id' | 'created_at'>>
      }
      campaign_events: {
        Row: CampaignEvent
        Insert: Omit<CampaignEvent, 'id' | 'created_at'>
        Update: Partial<Omit<CampaignEvent, 'id' | 'created_at'>>
      }
      campaign_metrics: {
        Row: CampaignMetrics
        Insert: Omit<CampaignMetrics, 'id' | 'updated_at'>
        Update: Partial<Omit<CampaignMetrics, 'id'>>
      }
      campaign_insights: {
        Row: CampaignInsight
        Insert: Omit<CampaignInsight, 'id' | 'created_at'>
        Update: Partial<Omit<CampaignInsight, 'id' | 'created_at'>>
      }
      user_prefs: {
        Row: UserPrefs
        Insert: Omit<UserPrefs, 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserPrefs, 'user_id' | 'created_at'>>
      }
      campaign_collaborators: {
        Row: CampaignCollaborator
        Insert: Omit<CampaignCollaborator, 'id' | 'created_at'>
        Update: Partial<Omit<CampaignCollaborator, 'id' | 'created_at'>>
      }
      collaboration_invites: {
        Row: CollaborationInvite
        Insert: Omit<CollaborationInvite, 'id' | 'created_at'>
        Update: Partial<Omit<CollaborationInvite, 'id' | 'created_at'>>
      }
    }
  }
}

// Singleton client instance
let supabaseClient: SupabaseClient<Database> | null = null

export function getSupabaseClient(): SupabaseClient<Database> {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }

    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10, // Throttle for smooth performance
        },
      },
    })
  }

  return supabaseClient
}

// Export singleton for convenience
export const supabase = getSupabaseClient()
