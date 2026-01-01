import type { Database } from '@total-audio/schemas-database'

export type FlowTelemetryRow = {
  id: string
  user_id: string
  campaign_id: string | null
  event_type: string
  duration_ms: number | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export type FlowTelemetryInsert = {
  id?: string
  user_id: string
  campaign_id?: string | null
  event_type: string
  duration_ms?: number | null
  metadata?: Record<string, unknown> | null
  created_at?: string
}

export type FlowTelemetryUpdate = Partial<FlowTelemetryRow>

export type FlowHubSummaryCacheRow = {
  id: string
  user_id: string
  metrics: Record<string, unknown> | null
  generated_at: string | null
  expires_at: string | null
  created_at?: string | null
  updated_at?: string | null
}

export type FlowHubSummaryCacheInsert = {
  id?: string
  user_id: string
  metrics?: Record<string, unknown> | null
  generated_at?: string | null
  expires_at?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export type FlowHubSummaryCacheUpdate = Partial<FlowHubSummaryCacheRow>

export type EpkCommentRow = {
  id: string
  epk_id: string
  user_id: string
  body: string
  parent_id: string | null
  created_at: string
  updated_at: string | null
}

export type EpkCommentInsert = {
  id?: string
  epk_id: string
  user_id: string
  body: string
  parent_id?: string | null
  created_at?: string
  updated_at?: string | null
}

export type EpkCommentUpdate = Partial<EpkCommentRow>

export type UserCreditsRow = {
  user_id: string
  balance_pence: number
  total_purchased_pence: number
  total_spent_pence: number
  created_at?: string | null
  updated_at?: string | null
}

export type UserCreditsInsert = {
  user_id: string
  balance_pence?: number
  total_purchased_pence?: number
  total_spent_pence?: number
  created_at?: string | null
  updated_at?: string | null
}

export type UserCreditsUpdate = Partial<UserCreditsRow>

export type AddCreditsResult = {
  success: boolean
  new_balance?: number | null
  error?: string | null
}

export type DeductCreditsResult = {
  success: boolean
  transaction_id?: string | null
  previous_balance?: number | null
  new_balance?: number | null
  amount_deducted?: number | null
  error?: string | null
  message?: string | null
  current_balance?: number | null
  required?: number | null
}

export type SupabaseDatabase = Database & {
  public: {
    Tables: Database['public']['Tables'] & {
      flow_telemetry: {
        Row: FlowTelemetryRow
        Insert: FlowTelemetryInsert
        Update: FlowTelemetryUpdate
        Relationships: []
      }
      flow_hub_summary_cache: {
        Row: FlowHubSummaryCacheRow
        Insert: FlowHubSummaryCacheInsert
        Update: FlowHubSummaryCacheUpdate
        Relationships: []
      }
      epk_comments: {
        Row: EpkCommentRow
        Insert: EpkCommentInsert
        Update: EpkCommentUpdate
        Relationships: []
      }
      user_credits: {
        Row: UserCreditsRow
        Insert: UserCreditsInsert
        Update: UserCreditsUpdate
        Relationships: []
      }
    }
    Functions: Database['public']['Functions'] & {
      add_credits: {
        Args: {
          p_user_id: string
          p_amount_pence: number
          p_transaction_type: string
          p_description?: string | null
          p_metadata?: Record<string, unknown> | null
        }
        Returns: AddCreditsResult
      }
      deduct_credits: {
        Args: {
          p_user_id: string
          p_amount_pence: number
          p_description?: string | null
          p_metadata?: Record<string, unknown> | null
        }
        Returns: DeductCreditsResult
      }
      update_thread_events: {
        Args: {
          p_thread_id: string
          p_user_id: string
          p_event_ids: string[]
        }
        Returns: unknown
      }
      refresh_flow_hub_summary: {
        Args: {
          uid: string
        }
        Returns: unknown
      }
    }
  }
}
