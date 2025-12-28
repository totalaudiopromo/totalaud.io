export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.5'
  }
  public: {
    Tables: {
      agent_events: {
        Row: {
          agent_id: string
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          timestamp: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          timestamp?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      agent_messages: {
        Row: {
          content: string
          created_at: string | null
          from_agent: string
          id: string
          message_type: string | null
          metadata: Json | null
          session_id: string | null
          to_agent: string
        }
        Insert: {
          content: string
          created_at?: string | null
          from_agent: string
          id?: string
          message_type?: string | null
          metadata?: Json | null
          session_id?: string | null
          to_agent: string
        }
        Update: {
          content?: string
          created_at?: string | null
          from_agent?: string
          id?: string
          message_type?: string | null
          metadata?: Json | null
          session_id?: string | null
          to_agent?: string
        }
        Relationships: [
          {
            foreignKeyName: 'agent_messages_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'agent_sessions'
            referencedColumns: ['id']
          },
        ]
      }
      agent_results: {
        Row: {
          agent_type: string
          created_at: string
          error_message: string | null
          id: string
          result_data: Json
          session_id: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_type: string
          created_at?: string
          error_message?: string | null
          id?: string
          result_data: Json
          session_id?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_type?: string
          created_at?: string
          error_message?: string | null
          id?: string
          result_data?: Json
          session_id?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'agent_results_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'agent_sessions'
            referencedColumns: ['id']
          },
        ]
      }
      agent_session_steps: {
        Row: {
          completed_at: string | null
          description: string | null
          error_message: string | null
          id: string
          input: Json | null
          output: Json | null
          session_id: string
          skill_name: string | null
          started_at: string | null
          status: string | null
          step_number: number
        }
        Insert: {
          completed_at?: string | null
          description?: string | null
          error_message?: string | null
          id?: string
          input?: Json | null
          output?: Json | null
          session_id: string
          skill_name?: string | null
          started_at?: string | null
          status?: string | null
          step_number: number
        }
        Update: {
          completed_at?: string | null
          description?: string | null
          error_message?: string | null
          id?: string
          input?: Json | null
          output?: Json | null
          session_id?: string
          skill_name?: string | null
          started_at?: string | null
          status?: string | null
          step_number?: number
        }
        Relationships: [
          {
            foreignKeyName: 'agent_session_steps_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'agent_sessions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'agent_session_steps_skill_name_fkey'
            columns: ['skill_name']
            isOneToOne: false
            referencedRelation: 'skills'
            referencedColumns: ['name']
          },
        ]
      }
      agent_sessions: {
        Row: {
          agent_name: string
          completed_at: string | null
          cost_usd: number | null
          created_at: string | null
          current_step: number | null
          description: string | null
          duration_ms: number | null
          final_output: Json | null
          id: string
          initial_input: Json
          name: string | null
          started_at: string | null
          status: string
          tokens_used: number | null
          total_steps: number | null
          trace: Json[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agent_name: string
          completed_at?: string | null
          cost_usd?: number | null
          created_at?: string | null
          current_step?: number | null
          description?: string | null
          duration_ms?: number | null
          final_output?: Json | null
          id?: string
          initial_input: Json
          name?: string | null
          started_at?: string | null
          status?: string
          tokens_used?: number | null
          total_steps?: number | null
          trace?: Json[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agent_name?: string
          completed_at?: string | null
          cost_usd?: number | null
          created_at?: string | null
          current_step?: number | null
          description?: string | null
          duration_ms?: number | null
          final_output?: Json | null
          id?: string
          initial_input?: Json
          name?: string | null
          started_at?: string | null
          status?: string
          tokens_used?: number | null
          total_steps?: number | null
          trace?: Json[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'agent_sessions_agent_name_fkey'
            columns: ['agent_name']
            isOneToOne: false
            referencedRelation: 'agents'
            referencedColumns: ['name']
          },
        ]
      }
      agents: {
        Row: {
          available_skills: string[]
          avatar_emoji: string | null
          color: string | null
          config: Json | null
          created_at: string | null
          description: string | null
          description_short: string | null
          enabled: boolean | null
          flow_shape: string | null
          name: string
          system_prompt: string
          updated_at: string | null
          version: string
        }
        Insert: {
          available_skills: string[]
          avatar_emoji?: string | null
          color?: string | null
          config?: Json | null
          created_at?: string | null
          description?: string | null
          description_short?: string | null
          enabled?: boolean | null
          flow_shape?: string | null
          name: string
          system_prompt: string
          updated_at?: string | null
          version: string
        }
        Update: {
          available_skills?: string[]
          avatar_emoji?: string | null
          color?: string | null
          config?: Json | null
          created_at?: string | null
          description?: string | null
          description_short?: string | null
          enabled?: boolean | null
          flow_shape?: string | null
          name?: string
          system_prompt?: string
          updated_at?: string | null
          version?: string
        }
        Relationships: []
      }
      api_key_usage: {
        Row: {
          api_key_id: string
          created_at: string | null
          endpoint: string
          id: string
          ip_address: unknown
          method: string
          response_time_ms: number | null
          status_code: number
          user_agent: string | null
        }
        Insert: {
          api_key_id: string
          created_at?: string | null
          endpoint: string
          id?: string
          ip_address?: unknown
          method: string
          response_time_ms?: number | null
          status_code: number
          user_agent?: string | null
        }
        Update: {
          api_key_id?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          ip_address?: unknown
          method?: string
          response_time_ms?: number | null
          status_code?: number
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'api_key_usage_api_key_id_fkey'
            columns: ['api_key_id']
            isOneToOne: false
            referencedRelation: 'api_keys'
            referencedColumns: ['id']
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          rate_limit_rpm: number | null
          revoked_at: string | null
          scopes: string[] | null
          updated_at: string | null
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          rate_limit_rpm?: number | null
          revoked_at?: string | null
          scopes?: string[] | null
          updated_at?: string | null
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          rate_limit_rpm?: number | null
          revoked_at?: string | null
          scopes?: string[] | null
          updated_at?: string | null
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'api_keys_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      app_permissions: {
        Row: {
          app_name: string
          granted_at: string
          has_access: boolean
          id: string
          user_id: string
        }
        Insert: {
          app_name: string
          granted_at?: string
          has_access?: boolean
          id?: string
          user_id: string
        }
        Update: {
          app_name?: string
          granted_at?: string
          has_access?: boolean
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      artist_assets: {
        Row: {
          byte_size: number | null
          campaign_id: string | null
          checksum: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          kind: string
          mime_type: string | null
          path: string | null
          public_share_id: string | null
          tags: string[] | null
          title: string | null
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          byte_size?: number | null
          campaign_id?: string | null
          checksum?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          kind?: string
          mime_type?: string | null
          path?: string | null
          public_share_id?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          byte_size?: number | null
          campaign_id?: string | null
          checksum?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          kind?: string
          mime_type?: string | null
          path?: string | null
          public_share_id?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      artists: {
        Row: {
          apple_music_artist_id: string | null
          apple_music_url: string | null
          bio: string | null
          created_at: string | null
          genre: string | null
          id: string
          instagram: string | null
          is_primary: boolean | null
          name: string
          photo_url: string | null
          spotify_artist_id: string | null
          spotify_url: string | null
          twitter: string | null
          updated_at: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          apple_music_artist_id?: string | null
          apple_music_url?: string | null
          bio?: string | null
          created_at?: string | null
          genre?: string | null
          id?: string
          instagram?: string | null
          is_primary?: boolean | null
          name: string
          photo_url?: string | null
          spotify_artist_id?: string | null
          spotify_url?: string | null
          twitter?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          apple_music_artist_id?: string | null
          apple_music_url?: string | null
          bio?: string | null
          created_at?: string | null
          genre?: string | null
          id?: string
          instagram?: string | null
          is_primary?: boolean | null
          name?: string
          photo_url?: string | null
          spotify_artist_id?: string | null
          spotify_url?: string | null
          twitter?: string | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      b2c_consent: {
        Row: {
          collection_method: string
          collection_url: string | null
          consent_expires_at: string | null
          consent_text: string
          consent_type: string
          consent_version: string
          created_at: string | null
          discovered_contact_id: string
          granted: boolean
          granted_at: string | null
          id: string
          ip_hash: string | null
          is_reconsent: boolean | null
          previous_consent_id: string | null
          updated_at: string | null
          user_agent: string | null
          withdrawn_at: string | null
          workspace_id: string
        }
        Insert: {
          collection_method: string
          collection_url?: string | null
          consent_expires_at?: string | null
          consent_text: string
          consent_type: string
          consent_version: string
          created_at?: string | null
          discovered_contact_id: string
          granted?: boolean
          granted_at?: string | null
          id?: string
          ip_hash?: string | null
          is_reconsent?: boolean | null
          previous_consent_id?: string | null
          updated_at?: string | null
          user_agent?: string | null
          withdrawn_at?: string | null
          workspace_id: string
        }
        Update: {
          collection_method?: string
          collection_url?: string | null
          consent_expires_at?: string | null
          consent_text?: string
          consent_type?: string
          consent_version?: string
          created_at?: string | null
          discovered_contact_id?: string
          granted?: boolean
          granted_at?: string | null
          id?: string
          ip_hash?: string | null
          is_reconsent?: boolean | null
          previous_consent_id?: string | null
          updated_at?: string | null
          user_agent?: string | null
          withdrawn_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'b2c_consent_discovered_contact_id_fkey'
            columns: ['discovered_contact_id']
            isOneToOne: false
            referencedRelation: 'discovered_contacts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'b2c_consent_previous_consent_id_fkey'
            columns: ['previous_consent_id']
            isOneToOne: false
            referencedRelation: 'b2c_consent'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'b2c_consent_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      benchmarks: {
        Row: {
          avg_cost_per_result: number
          avg_response_time: number | null
          avg_success_rate: number
          best_day: string | null
          best_month: string | null
          genre: string
          id: string
          last_updated: string | null
          optimal_budget_max: number | null
          optimal_budget_min: number | null
          platform: string
          sample_size: number | null
        }
        Insert: {
          avg_cost_per_result: number
          avg_response_time?: number | null
          avg_success_rate: number
          best_day?: string | null
          best_month?: string | null
          genre: string
          id?: string
          last_updated?: string | null
          optimal_budget_max?: number | null
          optimal_budget_min?: number | null
          platform: string
          sample_size?: number | null
        }
        Update: {
          avg_cost_per_result?: number
          avg_response_time?: number | null
          avg_success_rate?: number
          best_day?: string | null
          best_month?: string | null
          genre?: string
          id?: string
          last_updated?: string | null
          optimal_budget_max?: number | null
          optimal_budget_min?: number | null
          platform?: string
          sample_size?: number | null
        }
        Relationships: []
      }
      campaign_actions: {
        Row: {
          action_text: string
          campaign_id: string | null
          category: string | null
          created_at: string | null
          due_date: string | null
          id: string
          metadata: Json | null
          priority: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          action_text: string
          campaign_id?: string | null
          category?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          action_text?: string
          campaign_id?: string | null
          category?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'campaign_actions_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          },
        ]
      }
      campaign_activities: {
        Row: {
          activity_type: string
          campaign_id: string
          contact_name: string | null
          contact_org: string | null
          created_at: string | null
          description: string
          id: string
          importance: string | null
          metadata: Json | null
          metric: string | null
          platform: string | null
          timestamp: string | null
          value: number | null
        }
        Insert: {
          activity_type: string
          campaign_id: string
          contact_name?: string | null
          contact_org?: string | null
          created_at?: string | null
          description: string
          id?: string
          importance?: string | null
          metadata?: Json | null
          metric?: string | null
          platform?: string | null
          timestamp?: string | null
          value?: number | null
        }
        Update: {
          activity_type?: string
          campaign_id?: string
          contact_name?: string | null
          contact_org?: string | null
          created_at?: string | null
          description?: string
          id?: string
          importance?: string | null
          metadata?: Json | null
          metric?: string | null
          platform?: string | null
          timestamp?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'campaign_activities_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          },
        ]
      }
      campaign_collaborators: {
        Row: {
          campaign_id: string
          created_at: string
          id: string
          invited_by: string
          role: string
          user_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          id?: string
          invited_by: string
          role: string
          user_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          id?: string
          invited_by?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'campaign_collaborators_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          },
        ]
      }
      campaign_contacts: {
        Row: {
          campaign_id: string | null
          contact_email: string | null
          contact_name: string
          contact_type: string | null
          created_at: string | null
          enrichment_data: Json | null
          genre_fit: number | null
          id: string
          organisation: string | null
          status: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          contact_email?: string | null
          contact_name: string
          contact_type?: string | null
          created_at?: string | null
          enrichment_data?: Json | null
          genre_fit?: number | null
          id?: string
          organisation?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          contact_email?: string | null
          contact_name?: string
          contact_type?: string | null
          created_at?: string | null
          enrichment_data?: Json | null
          genre_fit?: number | null
          id?: string
          organisation?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'campaign_contacts_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          },
        ]
      }
      campaign_context: {
        Row: {
          artist: string | null
          created_at: string
          followers: number | null
          genre: string | null
          goal: string
          horizon_days: number
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          artist?: string | null
          created_at?: string
          followers?: number | null
          genre?: string | null
          goal: string
          horizon_days: number
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          artist?: string | null
          created_at?: string
          followers?: number | null
          genre?: string | null
          goal?: string
          horizon_days?: number
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      campaign_dashboard_metrics: {
        Row: {
          campaign_id: string
          created_at: string
          downloads: number
          engagement_score: number
          id: string
          period_end: string
          period_start: string
          shares: number
          updated_at: string
          user_id: string
          views: number
        }
        Insert: {
          campaign_id: string
          created_at?: string
          downloads?: number
          engagement_score?: number
          id?: string
          period_end: string
          period_start: string
          shares?: number
          updated_at?: string
          user_id: string
          views?: number
        }
        Update: {
          campaign_id?: string
          created_at?: string
          downloads?: number
          engagement_score?: number
          id?: string
          period_end?: string
          period_start?: string
          shares?: number
          updated_at?: string
          user_id?: string
          views?: number
        }
        Relationships: []
      }
      campaign_events: {
        Row: {
          campaign_id: string
          created_at: string
          id: string
          message: string
          status: string
          target: string
          type: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          id?: string
          message: string
          status: string
          target: string
          type: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          id?: string
          message?: string
          status?: string
          target?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: 'campaign_events_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          },
        ]
      }
      campaign_insights: {
        Row: {
          confidence: number | null
          expires_at: string | null
          generated_at: string | null
          id: string
          insight_type: string
          message: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          confidence?: number | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          insight_type: string
          message: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          confidence?: number | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          insight_type?: string
          message?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      campaign_intelligence: {
        Row: {
          autopsy_text: string | null
          brutal_honesty: string | null
          campaign_id: string
          full_response: string | null
          generated_at: string | null
          id: string
          model_used: string | null
          next_move: string | null
          quick_wins: string | null
          user_id: string
        }
        Insert: {
          autopsy_text?: string | null
          brutal_honesty?: string | null
          campaign_id: string
          full_response?: string | null
          generated_at?: string | null
          id?: string
          model_used?: string | null
          next_move?: string | null
          quick_wins?: string | null
          user_id: string
        }
        Update: {
          autopsy_text?: string | null
          brutal_honesty?: string | null
          campaign_id?: string
          full_response?: string | null
          generated_at?: string | null
          id?: string
          model_used?: string | null
          next_move?: string | null
          quick_wins?: string | null
          user_id?: string
        }
        Relationships: []
      }
      campaign_metrics: {
        Row: {
          campaign_id: string
          id: string
          open_rate: number | null
          opens: number | null
          pitches_sent: number | null
          pitches_total: number | null
          replies: number | null
          reply_rate: number | null
          updated_at: string
        }
        Insert: {
          campaign_id: string
          id?: string
          open_rate?: number | null
          opens?: number | null
          pitches_sent?: number | null
          pitches_total?: number | null
          replies?: number | null
          reply_rate?: number | null
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          id?: string
          open_rate?: number | null
          opens?: number | null
          pitches_sent?: number | null
          pitches_total?: number | null
          replies?: number | null
          reply_rate?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'campaign_metrics_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: true
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          },
        ]
      }
      campaign_outreach_logs: {
        Row: {
          asset_ids: string[] | null
          campaign_id: string
          contact_id: string | null
          contact_name: string
          created_at: string
          id: string
          message_preview: string
          sent_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          asset_ids?: string[] | null
          campaign_id: string
          contact_id?: string | null
          contact_name: string
          created_at?: string
          id?: string
          message_preview: string
          sent_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          asset_ids?: string[] | null
          campaign_id?: string
          contact_id?: string | null
          contact_name?: string
          created_at?: string
          id?: string
          message_preview?: string
          sent_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      campaign_patterns: {
        Row: {
          campaign_id: string | null
          confidence: number | null
          detected_at: string | null
          id: string
          impact_score: string | null
          metadata: Json | null
          pattern_text: string
          pattern_type: string | null
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          confidence?: number | null
          detected_at?: string | null
          id?: string
          impact_score?: string | null
          metadata?: Json | null
          pattern_text: string
          pattern_type?: string | null
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          confidence?: number | null
          detected_at?: string | null
          id?: string
          impact_score?: string | null
          metadata?: Json | null
          pattern_text?: string
          pattern_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'campaign_patterns_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          },
        ]
      }
      campaign_postmortems: {
        Row: {
          campaign_id: string
          campaign_name: string
          created_at: string | null
          executive_summary: string | null
          generated_by: string | null
          generation_model: string | null
          generation_time_ms: number | null
          id: string
          improvement_recommendations: string[] | null
          key_learnings: string[] | null
          key_wins: string[] | null
          tokens_used: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          campaign_id: string
          campaign_name: string
          created_at?: string | null
          executive_summary?: string | null
          generated_by?: string | null
          generation_model?: string | null
          generation_time_ms?: number | null
          id?: string
          improvement_recommendations?: string[] | null
          key_learnings?: string[] | null
          key_wins?: string[] | null
          tokens_used?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          campaign_id?: string
          campaign_name?: string
          created_at?: string | null
          executive_summary?: string | null
          generated_by?: string | null
          generation_model?: string | null
          generation_time_ms?: number | null
          id?: string
          improvement_recommendations?: string[] | null
          key_learnings?: string[] | null
          key_wins?: string[] | null
          tokens_used?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      campaign_reports: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          end_date: string | null
          executive_summary: string | null
          id: string
          integration_syncs: Json | null
          metadata: Json | null
          pdf_filename: string | null
          pdf_url: string | null
          report_type: string
          sent_to: string[] | null
          start_date: string | null
          template_id: string | null
          user_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          end_date?: string | null
          executive_summary?: string | null
          id?: string
          integration_syncs?: Json | null
          metadata?: Json | null
          pdf_filename?: string | null
          pdf_url?: string | null
          report_type: string
          sent_to?: string[] | null
          start_date?: string | null
          template_id?: string | null
          user_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          end_date?: string | null
          executive_summary?: string | null
          id?: string
          integration_syncs?: Json | null
          metadata?: Json | null
          pdf_filename?: string | null
          pdf_url?: string | null
          report_type?: string
          sent_to?: string[] | null
          start_date?: string | null
          template_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'campaign_reports_template_id_fkey'
            columns: ['template_id']
            isOneToOne: false
            referencedRelation: 'report_templates'
            referencedColumns: ['id']
          },
        ]
      }
      campaigns: {
        Row: {
          actual_reach: number | null
          artist_name: string | null
          budget: number | null
          contact_email: string | null
          contact_website: string | null
          cost_per_result: number | null
          created_at: string
          description: string | null
          end_date: string | null
          genre: string | null
          goal_total: number | null
          id: string
          name: string | null
          notes: string | null
          percentile_rank: number | null
          performance_score: number | null
          platform: string | null
          release_date: string | null
          saves: number | null
          social_engagement: number | null
          spent: number | null
          start_date: string | null
          status: string | null
          streams: number | null
          success_rate: number | null
          tagline: string | null
          target_reach: number | null
          title: string
          updated_at: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          actual_reach?: number | null
          artist_name?: string | null
          budget?: number | null
          contact_email?: string | null
          contact_website?: string | null
          cost_per_result?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          genre?: string | null
          goal_total?: number | null
          id?: string
          name?: string | null
          notes?: string | null
          percentile_rank?: number | null
          performance_score?: number | null
          platform?: string | null
          release_date?: string | null
          saves?: number | null
          social_engagement?: number | null
          spent?: number | null
          start_date?: string | null
          status?: string | null
          streams?: number | null
          success_rate?: number | null
          tagline?: string | null
          target_reach?: number | null
          title: string
          updated_at?: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          actual_reach?: number | null
          artist_name?: string | null
          budget?: number | null
          contact_email?: string | null
          contact_website?: string | null
          cost_per_result?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          genre?: string | null
          goal_total?: number | null
          id?: string
          name?: string | null
          notes?: string | null
          percentile_rank?: number | null
          performance_score?: number | null
          platform?: string | null
          release_date?: string | null
          saves?: number | null
          social_engagement?: number | null
          spent?: number | null
          start_date?: string | null
          status?: string | null
          streams?: number | null
          success_rate?: number | null
          tagline?: string | null
          target_reach?: number | null
          title?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'campaigns_team_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      canvas_scenes: {
        Row: {
          created_at: string
          id: string
          scene_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          scene_data: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          scene_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      collaboration_invites: {
        Row: {
          accepted_at: string | null
          campaign_id: string
          created_at: string
          expires_at: string
          id: string
          invite_token: string
          invited_by: string
          invited_email: string
          role: string
        }
        Insert: {
          accepted_at?: string | null
          campaign_id: string
          created_at?: string
          expires_at: string
          id?: string
          invite_token: string
          invited_by: string
          invited_email: string
          role: string
        }
        Update: {
          accepted_at?: string | null
          campaign_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          invite_token?: string
          invited_by?: string
          invited_email?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: 'collaboration_invites_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          },
        ]
      }
      contact_confidence: {
        Row: {
          confidence_level: string
          contact_email: string
          contact_id: string
          created_at: string | null
          data_freshness_score: number
          email_validity_score: number
          enrichment_depth_score: number
          high_risk_contact: boolean | null
          id: string
          last_verified_at: string | null
          overall_score: number
          requires_reverification: boolean | null
          source_quality_score: number
          updated_at: string | null
          user_id: string
          verification_status_score: number
        }
        Insert: {
          confidence_level: string
          contact_email: string
          contact_id: string
          created_at?: string | null
          data_freshness_score?: number
          email_validity_score?: number
          enrichment_depth_score?: number
          high_risk_contact?: boolean | null
          id?: string
          last_verified_at?: string | null
          overall_score: number
          requires_reverification?: boolean | null
          source_quality_score?: number
          updated_at?: string | null
          user_id: string
          verification_status_score?: number
        }
        Update: {
          confidence_level?: string
          contact_email?: string
          contact_id?: string
          created_at?: string | null
          data_freshness_score?: number
          email_validity_score?: number
          enrichment_depth_score?: number
          high_risk_contact?: boolean | null
          id?: string
          last_verified_at?: string | null
          overall_score?: number
          requires_reverification?: boolean | null
          source_quality_score?: number
          updated_at?: string | null
          user_id?: string
          verification_status_score?: number
        }
        Relationships: []
      }
      contact_similarity: {
        Row: {
          audience_similarity: number | null
          created_at: string | null
          genre_similarity: number | null
          id: string
          location_similarity: number | null
          overall_similarity_score: number
          platform_similarity: number | null
          role_similarity: number | null
          similar_contact_id: string
          similarity_reason: string | null
          source_contact_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          audience_similarity?: number | null
          created_at?: string | null
          genre_similarity?: number | null
          id?: string
          location_similarity?: number | null
          overall_similarity_score: number
          platform_similarity?: number | null
          role_similarity?: number | null
          similar_contact_id: string
          similarity_reason?: string | null
          source_contact_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          audience_similarity?: number | null
          created_at?: string | null
          genre_similarity?: number | null
          id?: string
          location_similarity?: number | null
          overall_similarity_score?: number
          platform_similarity?: number | null
          role_similarity?: number | null
          similar_contact_id?: string
          similarity_reason?: string | null
          source_contact_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      contact_suppressions: {
        Row: {
          added_by: string | null
          created_at: string | null
          domain_encrypted: string | null
          domain_hash: string | null
          email_encrypted: string | null
          email_hash: string | null
          id: string
          notes: string | null
          reason: string
          retention_justification: string | null
          scope: string
          source: string
          source_reference: string | null
          workspace_id: string | null
        }
        Insert: {
          added_by?: string | null
          created_at?: string | null
          domain_encrypted?: string | null
          domain_hash?: string | null
          email_encrypted?: string | null
          email_hash?: string | null
          id?: string
          notes?: string | null
          reason: string
          retention_justification?: string | null
          scope: string
          source: string
          source_reference?: string | null
          workspace_id?: string | null
        }
        Update: {
          added_by?: string | null
          created_at?: string | null
          domain_encrypted?: string | null
          domain_hash?: string | null
          email_encrypted?: string | null
          email_hash?: string | null
          id?: string
          notes?: string | null
          reason?: string
          retention_justification?: string | null
          scope?: string
          source?: string
          source_reference?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'contact_suppressions_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string | null
          genre_tags: string[] | null
          id: string
          last_contact: string | null
          name: string
          notes: string | null
          outlet: string | null
          preferred_tone: string | null
          response_rate: number | null
          role: string | null
          total_interactions: number | null
          updated_at: string | null
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          genre_tags?: string[] | null
          id?: string
          last_contact?: string | null
          name: string
          notes?: string | null
          outlet?: string | null
          preferred_tone?: string | null
          response_rate?: number | null
          role?: string | null
          total_interactions?: number | null
          updated_at?: string | null
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          genre_tags?: string[] | null
          id?: string
          last_contact?: string | null
          name?: string
          notes?: string | null
          outlet?: string | null
          preferred_tone?: string | null
          response_rate?: number | null
          role?: string | null
          total_interactions?: number | null
          updated_at?: string | null
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'contacts_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      conversion_events: {
        Row: {
          app: string
          created_at: string | null
          event_name: string
          id: number
          metadata: Json | null
          revenue_impact: number | null
          user_id: string | null
        }
        Insert: {
          app: string
          created_at?: string | null
          event_name: string
          id?: never
          metadata?: Json | null
          revenue_impact?: number | null
          user_id?: string | null
        }
        Update: {
          app?: string
          created_at?: string | null
          event_name?: string
          id?: never
          metadata?: Json | null
          revenue_impact?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      coverage_events: {
        Row: {
          campaign_id: string | null
          city: string | null
          confidence: number | null
          country: string | null
          coverage_score: number | null
          created_at: string | null
          event_date: string | null
          event_type: string
          id: string
          metadata: Json | null
          outlet_name: string | null
          outlet_type: string | null
          region: string | null
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          city?: string | null
          confidence?: number | null
          country?: string | null
          coverage_score?: number | null
          created_at?: string | null
          event_date?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          outlet_name?: string | null
          outlet_type?: string | null
          region?: string | null
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          city?: string | null
          confidence?: number | null
          country?: string | null
          coverage_score?: number | null
          created_at?: string | null
          event_date?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          outlet_name?: string | null
          outlet_type?: string | null
          region?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'coverage_events_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          },
        ]
      }
      credit_transactions: {
        Row: {
          amount_pence: number
          balance_after_pence: number
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount_pence: number
          balance_after_pence: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount_pence?: number
          balance_after_pence?: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      discovered_contacts: {
        Row: {
          classification_confidence: number | null
          classification_signals: Json | null
          confidence_score: number | null
          contact_type: string
          created_at: string | null
          discovered_by: string
          discovery_metadata: Json | null
          email: string | null
          email_verification_date: string | null
          email_verification_method: string | null
          email_verified: boolean | null
          id: string
          imported_contact_id: string | null
          name: string
          outlet_name: string | null
          outlet_type: string | null
          retention_expires_at: string
          role: string | null
          search_provider: string
          search_query: string
          search_response_id: string | null
          source_domain: string
          source_url: string
          status: string | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          classification_confidence?: number | null
          classification_signals?: Json | null
          confidence_score?: number | null
          contact_type: string
          created_at?: string | null
          discovered_by: string
          discovery_metadata?: Json | null
          email?: string | null
          email_verification_date?: string | null
          email_verification_method?: string | null
          email_verified?: boolean | null
          id?: string
          imported_contact_id?: string | null
          name: string
          outlet_name?: string | null
          outlet_type?: string | null
          retention_expires_at: string
          role?: string | null
          search_provider: string
          search_query: string
          search_response_id?: string | null
          source_domain: string
          source_url: string
          status?: string | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          classification_confidence?: number | null
          classification_signals?: Json | null
          confidence_score?: number | null
          contact_type?: string
          created_at?: string | null
          discovered_by?: string
          discovery_metadata?: Json | null
          email?: string | null
          email_verification_date?: string | null
          email_verification_method?: string | null
          email_verified?: boolean | null
          id?: string
          imported_contact_id?: string | null
          name?: string
          outlet_name?: string | null
          outlet_type?: string | null
          retention_expires_at?: string
          role?: string | null
          search_provider?: string
          search_query?: string
          search_response_id?: string | null
          source_domain?: string
          source_url?: string
          status?: string | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'discovered_contacts_imported_contact_id_fkey'
            columns: ['imported_contact_id']
            isOneToOne: false
            referencedRelation: 'intel_contacts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'discovered_contacts_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      discovery_logs: {
        Row: {
          api_cost_cents: number | null
          b2b_count: number | null
          b2c_count: number | null
          contacts_deduplicated: number | null
          contacts_found: number | null
          contacts_suppressed: number | null
          created_at: string | null
          error_message: string | null
          id: string
          ip_hash: string
          processing_time_ms: number | null
          search_params: Json | null
          search_provider: string
          search_query: string
          status: string
          tokens_used: number | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          api_cost_cents?: number | null
          b2b_count?: number | null
          b2c_count?: number | null
          contacts_deduplicated?: number | null
          contacts_found?: number | null
          contacts_suppressed?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_hash: string
          processing_time_ms?: number | null
          search_params?: Json | null
          search_provider: string
          search_query: string
          status: string
          tokens_used?: number | null
          user_id: string
          workspace_id: string
        }
        Update: {
          api_cost_cents?: number | null
          b2b_count?: number | null
          b2c_count?: number | null
          contacts_deduplicated?: number | null
          contacts_found?: number | null
          contacts_suppressed?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_hash?: string
          processing_time_ms?: number | null
          search_params?: Json | null
          search_provider?: string
          search_query?: string
          status?: string
          tokens_used?: number | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'discovery_logs_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      enriched_contacts: {
        Row: {
          batch_id: string
          company: string | null
          confidence: string | null
          created_at: string
          email: string
          id: string
          intelligence: string | null
          last_researched: string | null
          metadata: Json | null
          name: string | null
          platform: string | null
          role: string | null
        }
        Insert: {
          batch_id: string
          company?: string | null
          confidence?: string | null
          created_at?: string
          email: string
          id?: string
          intelligence?: string | null
          last_researched?: string | null
          metadata?: Json | null
          name?: string | null
          platform?: string | null
          role?: string | null
        }
        Update: {
          batch_id?: string
          company?: string | null
          confidence?: string | null
          created_at?: string
          email?: string
          id?: string
          intelligence?: string | null
          last_researched?: string | null
          metadata?: Json | null
          name?: string | null
          platform?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'enriched_contacts_batch_id_fkey'
            columns: ['batch_id']
            isOneToOne: false
            referencedRelation: 'enrichment_batches'
            referencedColumns: ['id']
          },
        ]
      }
      enrichment_audit: {
        Row: {
          api_cost_cents: number | null
          api_tokens_used: number | null
          contact_email: string
          contact_id: string | null
          contact_name: string | null
          created_at: string | null
          enrichment_data: Json | null
          enrichment_source: string
          enrichment_status: string
          error_code: string | null
          error_message: string | null
          fields_enriched: string[] | null
          id: string
          response_time_ms: number | null
          user_id: string
        }
        Insert: {
          api_cost_cents?: number | null
          api_tokens_used?: number | null
          contact_email: string
          contact_id?: string | null
          contact_name?: string | null
          created_at?: string | null
          enrichment_data?: Json | null
          enrichment_source: string
          enrichment_status: string
          error_code?: string | null
          error_message?: string | null
          fields_enriched?: string[] | null
          id?: string
          response_time_ms?: number | null
          user_id: string
        }
        Update: {
          api_cost_cents?: number | null
          api_tokens_used?: number | null
          contact_email?: string
          contact_id?: string | null
          contact_name?: string | null
          created_at?: string | null
          enrichment_data?: Json | null
          enrichment_source?: string
          enrichment_status?: string
          error_code?: string | null
          error_message?: string | null
          fields_enriched?: string[] | null
          id?: string
          response_time_ms?: number | null
          user_id?: string
        }
        Relationships: []
      }
      enrichment_batches: {
        Row: {
          contact_count: number
          created_at: string
          filename: string
          high_confidence: number
          id: string
          low_confidence: number
          medium_confidence: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_count?: number
          created_at?: string
          filename: string
          high_confidence?: number
          id?: string
          low_confidence?: number
          medium_confidence?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_count?: number
          created_at?: string
          filename?: string
          high_confidence?: number
          id?: string
          low_confidence?: number
          medium_confidence?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      enrichment_logs: {
        Row: {
          api_cost_cents: number | null
          api_tokens_used: number | null
          contacts_count: number
          created_at: string | null
          error_message: string | null
          id: string
          status: string
          user_id: string
        }
        Insert: {
          api_cost_cents?: number | null
          api_tokens_used?: number | null
          contacts_count: number
          created_at?: string | null
          error_message?: string | null
          id?: string
          status: string
          user_id: string
        }
        Update: {
          api_cost_cents?: number | null
          api_tokens_used?: number | null
          contacts_count?: number
          created_at?: string | null
          error_message?: string | null
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'enrichment_logs_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      epk_analytics: {
        Row: {
          asset_id: string | null
          created_at: string
          device: string | null
          downloads: number
          epk_id: string
          event_type: string
          id: string
          metadata: Json | null
          region: string | null
          timestamp: string
          user_id: string
          views: number
        }
        Insert: {
          asset_id?: string | null
          created_at?: string
          device?: string | null
          downloads?: number
          epk_id: string
          event_type: string
          id?: string
          metadata?: Json | null
          region?: string | null
          timestamp?: string
          user_id: string
          views?: number
        }
        Update: {
          asset_id?: string | null
          created_at?: string
          device?: string | null
          downloads?: number
          epk_id?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          region?: string | null
          timestamp?: string
          user_id?: string
          views?: number
        }
        Relationships: []
      }
      export_history: {
        Row: {
          created_at: string | null
          data_snapshot: Json | null
          expires_at: string | null
          export_type: string
          file_name: string
          file_size_bytes: number | null
          file_url: string | null
          generation_time_ms: number | null
          id: string
          ip_address: unknown
          records_exported: number | null
          template_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data_snapshot?: Json | null
          expires_at?: string | null
          export_type: string
          file_name: string
          file_size_bytes?: number | null
          file_url?: string | null
          generation_time_ms?: number | null
          id?: string
          ip_address?: unknown
          records_exported?: number | null
          template_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data_snapshot?: Json | null
          expires_at?: string | null
          export_type?: string
          file_name?: string
          file_size_bytes?: number | null
          file_url?: string | null
          generation_time_ms?: number | null
          id?: string
          ip_address?: unknown
          records_exported?: number | null
          template_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      export_templates: {
        Row: {
          created_at: string | null
          default_branding: Json | null
          id: string
          is_active: boolean | null
          is_system_template: boolean | null
          output_format: string[] | null
          supports_branding: boolean | null
          template_description: string | null
          template_name: string
          template_schema: Json
          template_type: string
          times_used: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          default_branding?: Json | null
          id?: string
          is_active?: boolean | null
          is_system_template?: boolean | null
          output_format?: string[] | null
          supports_branding?: boolean | null
          template_description?: string | null
          template_name: string
          template_schema: Json
          template_type: string
          times_used?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          default_branding?: Json | null
          id?: string
          is_active?: boolean | null
          is_system_template?: boolean | null
          output_format?: string[] | null
          supports_branding?: boolean | null
          template_description?: string | null
          template_name?: string
          template_schema?: Json
          template_type?: string
          times_used?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      feedback_events: {
        Row: {
          agent_id: string | null
          app: string
          comment: string | null
          created_at: string | null
          id: number
          rating: number | null
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          app: string
          comment?: string | null
          created_at?: string | null
          id?: never
          rating?: number | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          app?: string
          comment?: string | null
          created_at?: string | null
          id?: never
          rating?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      follow_up_reminders: {
        Row: {
          campaign_id: string | null
          completed_at: string | null
          contact_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          priority: string | null
          reminder_date: string
          reminder_time: string | null
          snoozed_until: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          reminder_date: string
          reminder_time?: string | null
          snoozed_until?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          reminder_date?: string
          reminder_time?: string | null
          snoozed_until?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'follow_up_reminders_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'follow_up_reminders_contact_id_fkey'
            columns: ['contact_id']
            isOneToOne: false
            referencedRelation: 'tracker_contacts'
            referencedColumns: ['id']
          },
        ]
      }
      gmail_tracked_emails: {
        Row: {
          campaign_id: string | null
          connection_id: string | null
          contact_email: string
          created_at: string | null
          gmail_message_id: string
          gmail_thread_id: string
          has_reply: boolean | null
          id: string
          last_checked_at: string | null
          reply_message_id: string | null
          reply_received_at: string | null
          reply_snippet: string | null
          sent_at: string
          subject: string
        }
        Insert: {
          campaign_id?: string | null
          connection_id?: string | null
          contact_email: string
          created_at?: string | null
          gmail_message_id: string
          gmail_thread_id: string
          has_reply?: boolean | null
          id?: string
          last_checked_at?: string | null
          reply_message_id?: string | null
          reply_received_at?: string | null
          reply_snippet?: string | null
          sent_at: string
          subject: string
        }
        Update: {
          campaign_id?: string | null
          connection_id?: string | null
          contact_email?: string
          created_at?: string | null
          gmail_message_id?: string
          gmail_thread_id?: string
          has_reply?: boolean | null
          id?: string
          last_checked_at?: string | null
          reply_message_id?: string | null
          reply_received_at?: string | null
          reply_snippet?: string | null
          sent_at?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: 'gmail_tracked_emails_connection_id_fkey'
            columns: ['connection_id']
            isOneToOne: false
            referencedRelation: 'integration_connections'
            referencedColumns: ['id']
          },
        ]
      }
      golden_history: {
        Row: {
          app: string
          avg_response_time_ms: number | null
          created_at: string | null
          deployed_at: string | null
          deployment_id: string | null
          environment: string
          health_checks: Json | null
          health_status: string
          id: string
          lighthouse_accessibility: number | null
          lighthouse_best_practices: number | null
          lighthouse_performance: number | null
          lighthouse_seo: number | null
          metadata: Json | null
          p95_response_time_ms: number | null
          tests_failed: number
          tests_passed: number
          uptime_percent: number | null
        }
        Insert: {
          app: string
          avg_response_time_ms?: number | null
          created_at?: string | null
          deployed_at?: string | null
          deployment_id?: string | null
          environment?: string
          health_checks?: Json | null
          health_status: string
          id?: string
          lighthouse_accessibility?: number | null
          lighthouse_best_practices?: number | null
          lighthouse_performance?: number | null
          lighthouse_seo?: number | null
          metadata?: Json | null
          p95_response_time_ms?: number | null
          tests_failed?: number
          tests_passed?: number
          uptime_percent?: number | null
        }
        Update: {
          app?: string
          avg_response_time_ms?: number | null
          created_at?: string | null
          deployed_at?: string | null
          deployment_id?: string | null
          environment?: string
          health_checks?: Json | null
          health_status?: string
          id?: string
          lighthouse_accessibility?: number | null
          lighthouse_best_practices?: number | null
          lighthouse_performance?: number | null
          lighthouse_seo?: number | null
          metadata?: Json | null
          p95_response_time_ms?: number | null
          tests_failed?: number
          tests_passed?: number
          uptime_percent?: number | null
        }
        Relationships: []
      }
      integration_activity_log: {
        Row: {
          activity_type: string
          connection_id: string | null
          created_at: string | null
          id: string
          integration_type: string
          message: string | null
          metadata: Json | null
          status: string
          user_id: string | null
        }
        Insert: {
          activity_type: string
          connection_id?: string | null
          created_at?: string | null
          id?: string
          integration_type: string
          message?: string | null
          metadata?: Json | null
          status: string
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          connection_id?: string | null
          created_at?: string | null
          id?: string
          integration_type?: string
          message?: string | null
          metadata?: Json | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'integration_activity_log_connection_id_fkey'
            columns: ['connection_id']
            isOneToOne: false
            referencedRelation: 'integration_connections'
            referencedColumns: ['id']
          },
        ]
      }
      integration_connections: {
        Row: {
          created_at: string | null
          credentials: Json
          error_count: number | null
          error_message: string | null
          id: string
          integration_type: string
          last_sync_at: string | null
          settings: Json
          status: string | null
          sync_enabled: boolean | null
          sync_frequency_minutes: number | null
          updated_at: string | null
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          credentials?: Json
          error_count?: number | null
          error_message?: string | null
          id?: string
          integration_type: string
          last_sync_at?: string | null
          settings?: Json
          status?: string | null
          sync_enabled?: boolean | null
          sync_frequency_minutes?: number | null
          updated_at?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          credentials?: Json
          error_count?: number | null
          error_message?: string | null
          id?: string
          integration_type?: string
          last_sync_at?: string | null
          settings?: Json
          status?: string | null
          sync_enabled?: boolean | null
          sync_frequency_minutes?: number | null
          updated_at?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'integration_connections_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      integration_field_mappings: {
        Row: {
          connection_id: string | null
          created_at: string | null
          enabled: boolean | null
          external_field: string
          id: string
          sync_direction: string | null
          tracker_field: string
          transform_rules: Json | null
        }
        Insert: {
          connection_id?: string | null
          created_at?: string | null
          enabled?: boolean | null
          external_field: string
          id?: string
          sync_direction?: string | null
          tracker_field: string
          transform_rules?: Json | null
        }
        Update: {
          connection_id?: string | null
          created_at?: string | null
          enabled?: boolean | null
          external_field?: string
          id?: string
          sync_direction?: string | null
          tracker_field?: string
          transform_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'integration_field_mappings_connection_id_fkey'
            columns: ['connection_id']
            isOneToOne: false
            referencedRelation: 'integration_connections'
            referencedColumns: ['id']
          },
        ]
      }
      integration_sync_logs: {
        Row: {
          completed_at: string | null
          connection_id: string | null
          created_at: string | null
          direction: string
          duration_ms: number | null
          errors: Json | null
          id: string
          records_created: number | null
          records_failed: number | null
          records_updated: number | null
          started_at: string | null
        }
        Insert: {
          completed_at?: string | null
          connection_id?: string | null
          created_at?: string | null
          direction: string
          duration_ms?: number | null
          errors?: Json | null
          id?: string
          records_created?: number | null
          records_failed?: number | null
          records_updated?: number | null
          started_at?: string | null
        }
        Update: {
          completed_at?: string | null
          connection_id?: string | null
          created_at?: string | null
          direction?: string
          duration_ms?: number | null
          errors?: Json | null
          id?: string
          records_created?: number | null
          records_failed?: number | null
          records_updated?: number | null
          started_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'integration_sync_logs_connection_id_fkey'
            columns: ['connection_id']
            isOneToOne: false
            referencedRelation: 'integration_connections'
            referencedColumns: ['id']
          },
        ]
      }
      intel_contacts: {
        Row: {
          created_at: string | null
          created_by: string
          discovery_source_id: string | null
          email: string | null
          enrichment_confidence: number | null
          enrichment_date: string | null
          enrichment_source: string | null
          genre_tags: string[] | null
          id: string
          instagram: string | null
          is_discovered: boolean | null
          last_contacted: string | null
          last_response: string | null
          last_verified: string | null
          location_city: string | null
          location_country: string | null
          merge_log: Json | null
          merge_source: string | null
          merge_timestamp: string | null
          name: string
          notes: string | null
          outlet: string | null
          outlet_reach: string | null
          outlet_type: string | null
          phone: string | null
          response_rate: number | null
          role: string | null
          status: string | null
          tags: string[] | null
          twitter: string | null
          updated_at: string | null
          website: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          discovery_source_id?: string | null
          email?: string | null
          enrichment_confidence?: number | null
          enrichment_date?: string | null
          enrichment_source?: string | null
          genre_tags?: string[] | null
          id?: string
          instagram?: string | null
          is_discovered?: boolean | null
          last_contacted?: string | null
          last_response?: string | null
          last_verified?: string | null
          location_city?: string | null
          location_country?: string | null
          merge_log?: Json | null
          merge_source?: string | null
          merge_timestamp?: string | null
          name: string
          notes?: string | null
          outlet?: string | null
          outlet_reach?: string | null
          outlet_type?: string | null
          phone?: string | null
          response_rate?: number | null
          role?: string | null
          status?: string | null
          tags?: string[] | null
          twitter?: string | null
          updated_at?: string | null
          website?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          discovery_source_id?: string | null
          email?: string | null
          enrichment_confidence?: number | null
          enrichment_date?: string | null
          enrichment_source?: string | null
          genre_tags?: string[] | null
          id?: string
          instagram?: string | null
          is_discovered?: boolean | null
          last_contacted?: string | null
          last_response?: string | null
          last_verified?: string | null
          location_city?: string | null
          location_country?: string | null
          merge_log?: Json | null
          merge_source?: string | null
          merge_timestamp?: string | null
          name?: string
          notes?: string | null
          outlet?: string | null
          outlet_reach?: string | null
          outlet_type?: string | null
          phone?: string | null
          response_rate?: number | null
          role?: string | null
          status?: string | null
          tags?: string[] | null
          twitter?: string | null
          updated_at?: string | null
          website?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'intel_contacts_discovery_source_id_fkey'
            columns: ['discovery_source_id']
            isOneToOne: false
            referencedRelation: 'discovered_contacts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'intel_contacts_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      intel_logs: {
        Row: {
          avg_time_ms: number
          batch_id: string
          cost: number
          created_at: string | null
          enriched: number
          failed: number
          id: string
          input_tokens: number | null
          ip_address: string | null
          metadata: Json | null
          model_used: string | null
          output_tokens: number | null
          retried: number
          success_rate: number | null
          timed_out: number
          total: number
        }
        Insert: {
          avg_time_ms: number
          batch_id: string
          cost: number
          created_at?: string | null
          enriched: number
          failed: number
          id?: string
          input_tokens?: number | null
          ip_address?: string | null
          metadata?: Json | null
          model_used?: string | null
          output_tokens?: number | null
          retried?: number
          success_rate?: number | null
          timed_out?: number
          total: number
        }
        Update: {
          avg_time_ms?: number
          batch_id?: string
          cost?: number
          created_at?: string | null
          enriched?: number
          failed?: number
          id?: string
          input_tokens?: number | null
          ip_address?: string | null
          metadata?: Json | null
          model_used?: string | null
          output_tokens?: number | null
          retried?: number
          success_rate?: number | null
          timed_out?: number
          total?: number
        }
        Relationships: []
      }
      oauth_states: {
        Row: {
          code_verifier: string | null
          created_at: string | null
          expires_at: string
          id: string
          integration_type: string
          state: string
          user_id: string | null
        }
        Insert: {
          code_verifier?: string | null
          created_at?: string | null
          expires_at: string
          id?: string
          integration_type: string
          state: string
          user_id?: string | null
        }
        Update: {
          code_verifier?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          integration_type?: string
          state?: string
          user_id?: string | null
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          audience_size: string | null
          contact_email: string | null
          contact_name: string | null
          created_at: string | null
          description: string | null
          genres: string[] | null
          id: string
          importance: number | null
          is_active: boolean | null
          last_verified_at: string | null
          name: string
          source: string | null
          source_url: string | null
          type: string
          updated_at: string | null
          url: string | null
          vibes: string[] | null
        }
        Insert: {
          audience_size?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string | null
          description?: string | null
          genres?: string[] | null
          id?: string
          importance?: number | null
          is_active?: boolean | null
          last_verified_at?: string | null
          name: string
          source?: string | null
          source_url?: string | null
          type: string
          updated_at?: string | null
          url?: string | null
          vibes?: string[] | null
        }
        Update: {
          audience_size?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string | null
          description?: string | null
          genres?: string[] | null
          id?: string
          importance?: number | null
          is_active?: boolean | null
          last_verified_at?: string | null
          name?: string
          source?: string | null
          source_url?: string | null
          type?: string
          updated_at?: string | null
          url?: string | null
          vibes?: string[] | null
        }
        Relationships: []
      }
      pitch_email_tracking: {
        Row: {
          contact_id: string
          created_at: string | null
          gmail_message_id: string
          gmail_thread_id: string
          has_reply: boolean | null
          id: string
          integration_connection_id: string | null
          last_checked_at: string | null
          pitch_id: string
          recipient_email: string
          replied_at: string | null
          reply_message_id: string | null
          reply_snippet: string | null
          sent_at: string
          status: string | null
          subject: string
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string | null
          gmail_message_id: string
          gmail_thread_id: string
          has_reply?: boolean | null
          id?: string
          integration_connection_id?: string | null
          last_checked_at?: string | null
          pitch_id: string
          recipient_email: string
          replied_at?: string | null
          reply_message_id?: string | null
          reply_snippet?: string | null
          sent_at?: string
          status?: string | null
          subject: string
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string | null
          gmail_message_id?: string
          gmail_thread_id?: string
          has_reply?: boolean | null
          id?: string
          integration_connection_id?: string | null
          last_checked_at?: string | null
          pitch_id?: string
          recipient_email?: string
          replied_at?: string | null
          reply_message_id?: string | null
          reply_snippet?: string | null
          sent_at?: string
          status?: string | null
          subject?: string
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'pitch_email_tracking_contact_id_fkey'
            columns: ['contact_id']
            isOneToOne: false
            referencedRelation: 'contacts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'pitch_email_tracking_integration_connection_id_fkey'
            columns: ['integration_connection_id']
            isOneToOne: false
            referencedRelation: 'integration_connections'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'pitch_email_tracking_pitch_id_fkey'
            columns: ['pitch_id']
            isOneToOne: false
            referencedRelation: 'pitches'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'pitch_email_tracking_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      pitch_performance: {
        Row: {
          clicked: boolean | null
          contact_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          opened: boolean | null
          outcome: string | null
          pitch_id: string | null
          replied: boolean | null
          reply_time_hours: number | null
        }
        Insert: {
          clicked?: boolean | null
          contact_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          opened?: boolean | null
          outcome?: string | null
          pitch_id?: string | null
          replied?: boolean | null
          reply_time_hours?: number | null
        }
        Update: {
          clicked?: boolean | null
          contact_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          opened?: boolean | null
          outcome?: string | null
          pitch_id?: string | null
          replied?: boolean | null
          reply_time_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'pitch_performance_contact_id_fkey'
            columns: ['contact_id']
            isOneToOne: false
            referencedRelation: 'contacts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'pitch_performance_pitch_id_fkey'
            columns: ['pitch_id']
            isOneToOne: false
            referencedRelation: 'pitches'
            referencedColumns: ['id']
          },
        ]
      }
      pitch_templates: {
        Row: {
          closing_ctas: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          genre: string
          hook_structure: string | null
          id: string
          is_system: boolean | null
          name: string
          opening_lines: Json | null
          success_rate: number | null
          template_body: string
          times_used: number | null
          updated_at: string | null
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          closing_ctas?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          genre: string
          hook_structure?: string | null
          id?: string
          is_system?: boolean | null
          name: string
          opening_lines?: Json | null
          success_rate?: number | null
          template_body: string
          times_used?: number | null
          updated_at?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          closing_ctas?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          genre?: string
          hook_structure?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
          opening_lines?: Json | null
          success_rate?: number | null
          template_body?: string
          times_used?: number | null
          updated_at?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'pitch_templates_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      pitch_variations: {
        Row: {
          artist_name: string | null
          body: string
          created_at: string | null
          effectiveness_score: number | null
          generated_by: string | null
          generation_model: string | null
          genre: string | null
          id: string
          subject_line: string
          target_contact_type: string | null
          times_opened: number | null
          times_replied: number | null
          times_used: number | null
          track_title: string | null
          updated_at: string | null
          user_id: string
          user_rating: number | null
          variation_type: string
        }
        Insert: {
          artist_name?: string | null
          body: string
          created_at?: string | null
          effectiveness_score?: number | null
          generated_by?: string | null
          generation_model?: string | null
          genre?: string | null
          id?: string
          subject_line: string
          target_contact_type?: string | null
          times_opened?: number | null
          times_replied?: number | null
          times_used?: number | null
          track_title?: string | null
          updated_at?: string | null
          user_id: string
          user_rating?: number | null
          variation_type: string
        }
        Update: {
          artist_name?: string | null
          body?: string
          created_at?: string | null
          effectiveness_score?: number | null
          generated_by?: string | null
          generation_model?: string | null
          genre?: string | null
          id?: string
          subject_line?: string
          target_contact_type?: string | null
          times_opened?: number | null
          times_replied?: number | null
          times_used?: number | null
          track_title?: string | null
          updated_at?: string | null
          user_id?: string
          user_rating?: number | null
          variation_type?: string
        }
        Relationships: []
      }
      pitches: {
        Row: {
          artist_name: string
          contact_id: string | null
          contact_name: string
          contact_outlet: string | null
          created_at: string | null
          created_by: string | null
          genre: string
          id: string
          key_hook: string
          pitch_body: string
          release_date: string | null
          replied_at: string | null
          response_received: boolean | null
          sent_at: string | null
          status: string | null
          subject_line: string
          subject_line_options: Json | null
          suggested_send_time: string | null
          tone: string
          track_link: string | null
          track_title: string
          updated_at: string | null
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          artist_name: string
          contact_id?: string | null
          contact_name: string
          contact_outlet?: string | null
          created_at?: string | null
          created_by?: string | null
          genre: string
          id?: string
          key_hook: string
          pitch_body: string
          release_date?: string | null
          replied_at?: string | null
          response_received?: boolean | null
          sent_at?: string | null
          status?: string | null
          subject_line: string
          subject_line_options?: Json | null
          suggested_send_time?: string | null
          tone?: string
          track_link?: string | null
          track_title: string
          updated_at?: string | null
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          artist_name?: string
          contact_id?: string | null
          contact_name?: string
          contact_outlet?: string | null
          created_at?: string | null
          created_by?: string | null
          genre?: string
          id?: string
          key_hook?: string
          pitch_body?: string
          release_date?: string | null
          replied_at?: string | null
          response_received?: boolean | null
          sent_at?: string | null
          status?: string | null
          subject_line?: string
          subject_line_options?: Json | null
          suggested_send_time?: string | null
          tone?: string
          track_link?: string | null
          track_title?: string
          updated_at?: string | null
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'pitches_contact_id_fkey'
            columns: ['contact_id']
            isOneToOne: false
            referencedRelation: 'contacts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'pitches_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      report_sends: {
        Row: {
          clicked_at: string | null
          id: string
          metadata: Json | null
          opened_at: string | null
          recipient_email: string
          report_id: string | null
          sent_at: string | null
          sent_via: string
          user_id: string | null
        }
        Insert: {
          clicked_at?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          recipient_email: string
          report_id?: string | null
          sent_at?: string | null
          sent_via: string
          user_id?: string | null
        }
        Update: {
          clicked_at?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          recipient_email?: string
          report_id?: string | null
          sent_at?: string | null
          sent_via?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'report_sends_report_id_fkey'
            columns: ['report_id']
            isOneToOne: false
            referencedRelation: 'campaign_reports'
            referencedColumns: ['id']
          },
        ]
      }
      report_templates: {
        Row: {
          brand_color: string | null
          company_name: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          logo_url: string | null
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          brand_color?: string | null
          company_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          logo_url?: string | null
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          brand_color?: string | null
          company_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          logo_url?: string | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      retention_audit_log: {
        Row: {
          audit_date: string
          b2b_deleted: number | null
          b2b_retention_days: number | null
          b2c_deleted: number | null
          b2c_retention_days: number | null
          created_at: string | null
          discovered_contacts_deleted: number | null
          id: string
          notes: string | null
          reason: string | null
          workspace_id: string | null
        }
        Insert: {
          audit_date: string
          b2b_deleted?: number | null
          b2b_retention_days?: number | null
          b2c_deleted?: number | null
          b2c_retention_days?: number | null
          created_at?: string | null
          discovered_contacts_deleted?: number | null
          id?: string
          notes?: string | null
          reason?: string | null
          workspace_id?: string | null
        }
        Update: {
          audit_date?: string
          b2b_deleted?: number | null
          b2b_retention_days?: number | null
          b2c_deleted?: number | null
          b2c_retention_days?: number | null
          created_at?: string | null
          discovered_contacts_deleted?: number | null
          id?: string
          notes?: string | null
          reason?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'retention_audit_log_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      retention_metrics: {
        Row: {
          calculated_at: string | null
          cohort_date: string
          id: string
          period_offset: number
          period_type: string
          retained_users: number
          retention_rate: number
          revenue_cents: number | null
          total_users: number
        }
        Insert: {
          calculated_at?: string | null
          cohort_date: string
          id?: string
          period_offset: number
          period_type: string
          retained_users: number
          retention_rate: number
          revenue_cents?: number | null
          total_users: number
        }
        Update: {
          calculated_at?: string | null
          cohort_date?: string
          id?: string
          period_offset?: number
          period_type?: string
          retained_users?: number
          retention_rate?: number
          revenue_cents?: number | null
          total_users?: number
        }
        Relationships: []
      }
      skill: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          key: string
          name: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          key: string
          name: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          key?: string
          name?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      skill_binding: {
        Row: {
          config: Json | null
          created_at: string
          enabled: boolean
          id: string
          org_id: string
          skill_id: string | null
          updated_at: string
          user_id: string | null
          version: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          enabled?: boolean
          id?: string
          org_id: string
          skill_id?: string | null
          updated_at?: string
          user_id?: string | null
          version: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          enabled?: boolean
          id?: string
          org_id?: string
          skill_id?: string | null
          updated_at?: string
          user_id?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: 'skill_binding_skill_id_fkey'
            columns: ['skill_id']
            isOneToOne: false
            referencedRelation: 'skill'
            referencedColumns: ['id']
          },
        ]
      }
      skill_executions: {
        Row: {
          agent_session_id: string | null
          completed_at: string | null
          cost_usd: number | null
          duration_ms: number | null
          error_message: string | null
          id: string
          input: Json
          output: Json | null
          skill_name: string
          started_at: string | null
          status: string | null
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          agent_session_id?: string | null
          completed_at?: string | null
          cost_usd?: number | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          input: Json
          output?: Json | null
          skill_name: string
          started_at?: string | null
          status?: string | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          agent_session_id?: string | null
          completed_at?: string | null
          cost_usd?: number | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          input?: Json
          output?: Json | null
          skill_name?: string
          started_at?: string | null
          status?: string | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'skill_executions_agent_session_id_fkey'
            columns: ['agent_session_id']
            isOneToOne: false
            referencedRelation: 'agent_sessions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'skill_executions_skill_name_fkey'
            columns: ['skill_name']
            isOneToOne: false
            referencedRelation: 'skills'
            referencedColumns: ['name']
          },
        ]
      }
      skill_invocation: {
        Row: {
          confidence: number | null
          created_at: string
          duration_ms: number | null
          error: string | null
          id: string
          inputs: Json
          org_id: string
          outputs: Json | null
          skill_key: string
          tokens_used: number | null
          user_id: string | null
          version: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          id?: string
          inputs: Json
          org_id: string
          outputs?: Json | null
          skill_key: string
          tokens_used?: number | null
          user_id?: string | null
          version: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          id?: string
          inputs?: Json
          org_id?: string
          outputs?: Json | null
          skill_key?: string
          tokens_used?: number | null
          user_id?: string | null
          version?: string
        }
        Relationships: []
      }
      skill_version: {
        Row: {
          created_at: string
          deprecated_at: string | null
          id: string
          manifest: Json
          skill_id: string | null
          status: string
          version: string
        }
        Insert: {
          created_at?: string
          deprecated_at?: string | null
          id?: string
          manifest: Json
          skill_id?: string | null
          status?: string
          version: string
        }
        Update: {
          created_at?: string
          deprecated_at?: string | null
          id?: string
          manifest?: Json
          skill_id?: string | null
          status?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: 'skill_version_skill_id_fkey'
            columns: ['skill_id']
            isOneToOne: false
            referencedRelation: 'skill'
            referencedColumns: ['id']
          },
        ]
      }
      skills: {
        Row: {
          category: string
          config: Json | null
          created_at: string | null
          description: string | null
          enabled: boolean | null
          input_schema: Json
          is_beta: boolean | null
          model: string | null
          name: string
          output_schema: Json
          provider: string
          updated_at: string | null
          version: string
        }
        Insert: {
          category: string
          config?: Json | null
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          input_schema: Json
          is_beta?: boolean | null
          model?: string | null
          name: string
          output_schema: Json
          provider: string
          updated_at?: string | null
          version: string
        }
        Update: {
          category?: string
          config?: Json | null
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          input_schema?: Json
          is_beta?: boolean | null
          model?: string | null
          name?: string
          output_schema?: Json
          provider?: string
          updated_at?: string | null
          version?: string
        }
        Relationships: []
      }
      stripe_webhook_events: {
        Row: {
          created_at: string
          event_id: string
          event_type: string
          id: string
          processed_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          event_type: string
          id?: string
          processed_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          event_type?: string
          id?: string
          processed_at?: string
        }
        Relationships: []
      }
      testing_results: {
        Row: {
          app: string
          browser: string | null
          component: string | null
          created_at: string | null
          duration_ms: number | null
          error_message: string | null
          executed_at: string | null
          file_path: string | null
          id: string
          issues_data: Json | null
          issues_fixed: number
          issues_found: number
          passed: boolean
          playwright_config: Json | null
          stack_trace: string | null
          test_output: Json | null
          test_suite: string
          test_type: string
          viewport: string | null
        }
        Insert: {
          app: string
          browser?: string | null
          component?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          executed_at?: string | null
          file_path?: string | null
          id?: string
          issues_data?: Json | null
          issues_fixed?: number
          issues_found?: number
          passed: boolean
          playwright_config?: Json | null
          stack_trace?: string | null
          test_output?: Json | null
          test_suite: string
          test_type: string
          viewport?: string | null
        }
        Update: {
          app?: string
          browser?: string | null
          component?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          executed_at?: string | null
          file_path?: string | null
          id?: string
          issues_data?: Json | null
          issues_fixed?: number
          issues_found?: number
          passed?: boolean
          playwright_config?: Json | null
          stack_trace?: string | null
          test_output?: Json | null
          test_suite?: string
          test_type?: string
          viewport?: string | null
        }
        Relationships: []
      }
      track_assets: {
        Row: {
          created_at: string | null
          filename: string
          id: string
          mime_type: string | null
          size: number | null
          storage_key: string | null
          track_id: string
          type: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          filename: string
          id?: string
          mime_type?: string | null
          size?: number | null
          storage_key?: string | null
          track_id: string
          type: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          filename?: string
          id?: string
          mime_type?: string | null
          size?: number | null
          storage_key?: string | null
          track_id?: string
          type?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'track_assets_track_id_fkey'
            columns: ['track_id']
            isOneToOne: false
            referencedRelation: 'tracks'
            referencedColumns: ['id']
          },
        ]
      }
      tracker_contacts: {
        Row: {
          contact_count: number | null
          created_at: string | null
          email: string | null
          id: string
          last_contacted_at: string | null
          name: string
          notes: string | null
          organisation: string | null
          phone: string | null
          platform: string | null
          response_count: number | null
          role: string | null
          source: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          contact_count?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_contacted_at?: string | null
          name: string
          notes?: string | null
          organisation?: string | null
          phone?: string | null
          platform?: string | null
          response_count?: number | null
          role?: string | null
          source?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          contact_count?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_contacted_at?: string | null
          name?: string
          notes?: string | null
          organisation?: string | null
          phone?: string | null
          platform?: string | null
          response_count?: number | null
          role?: string | null
          source?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tracks: {
        Row: {
          analysis: Json | null
          analysis_completed_at: string | null
          analysis_error: string | null
          analysis_started_at: string | null
          analysis_status: string | null
          apple_music_track_id: string | null
          apple_music_url: string | null
          artist_id: string | null
          artist_name: string
          artwork_key: string | null
          artwork_url: string | null
          audio_format: string | null
          audio_key: string | null
          audio_size: number | null
          audio_url: string | null
          created_at: string | null
          duration: number | null
          genre: string | null
          id: string
          isrc: string | null
          release_date: string | null
          release_type: string | null
          spotify_track_id: string | null
          spotify_url: string | null
          title: string
          upc: string | null
          updated_at: string | null
          user_id: string
          waveform_data: Json | null
        }
        Insert: {
          analysis?: Json | null
          analysis_completed_at?: string | null
          analysis_error?: string | null
          analysis_started_at?: string | null
          analysis_status?: string | null
          apple_music_track_id?: string | null
          apple_music_url?: string | null
          artist_id?: string | null
          artist_name: string
          artwork_key?: string | null
          artwork_url?: string | null
          audio_format?: string | null
          audio_key?: string | null
          audio_size?: number | null
          audio_url?: string | null
          created_at?: string | null
          duration?: number | null
          genre?: string | null
          id?: string
          isrc?: string | null
          release_date?: string | null
          release_type?: string | null
          spotify_track_id?: string | null
          spotify_url?: string | null
          title: string
          upc?: string | null
          updated_at?: string | null
          user_id: string
          waveform_data?: Json | null
        }
        Update: {
          analysis?: Json | null
          analysis_completed_at?: string | null
          analysis_error?: string | null
          analysis_started_at?: string | null
          analysis_status?: string | null
          apple_music_track_id?: string | null
          apple_music_url?: string | null
          artist_id?: string | null
          artist_name?: string
          artwork_key?: string | null
          artwork_url?: string | null
          audio_format?: string | null
          audio_key?: string | null
          audio_size?: number | null
          audio_url?: string | null
          created_at?: string | null
          duration?: number | null
          genre?: string | null
          id?: string
          isrc?: string | null
          release_date?: string | null
          release_type?: string | null
          spotify_track_id?: string | null
          spotify_url?: string | null
          title?: string
          upc?: string | null
          updated_at?: string | null
          user_id?: string
          waveform_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'tracks_artist_id_fkey'
            columns: ['artist_id']
            isOneToOne: false
            referencedRelation: 'artists'
            referencedColumns: ['id']
          },
        ]
      }
      user_cohorts: {
        Row: {
          cohort_date: string
          cohort_month: number
          cohort_week: number
          cohort_year: number
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          cohort_date: string
          cohort_month: number
          cohort_week: number
          cohort_year: number
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          cohort_date?: string
          cohort_month?: number
          cohort_week?: number
          cohort_year?: number
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_consent: {
        Row: {
          anonymous_id: string | null
          consent_type: string
          created_at: string | null
          granted: boolean
          granted_at: string | null
          id: string
          ip_hash: string | null
          source: string
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
          withdrawn_at: string | null
        }
        Insert: {
          anonymous_id?: string | null
          consent_type: string
          created_at?: string | null
          granted?: boolean
          granted_at?: string | null
          id?: string
          ip_hash?: string | null
          source: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
          withdrawn_at?: string | null
        }
        Update: {
          anonymous_id?: string | null
          consent_type?: string
          created_at?: string | null
          granted?: boolean
          granted_at?: string | null
          id?: string
          ip_hash?: string | null
          source?: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
          withdrawn_at?: string | null
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          balance_pence: number
          created_at: string
          total_purchased_pence: number
          total_spent_pence: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance_pence?: number
          created_at?: string
          total_purchased_pence?: number
          total_spent_pence?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance_pence?: number
          created_at?: string
          total_purchased_pence?: number
          total_spent_pence?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_ideas: {
        Row: {
          content: string
          created_at: string
          id: string
          is_starter: boolean | null
          position_x: number | null
          position_y: number | null
          tag: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_starter?: boolean | null
          position_x?: number | null
          position_y?: number | null
          tag: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_starter?: boolean | null
          position_x?: number | null
          position_y?: number | null
          tag?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_pitch_drafts: {
        Row: {
          created_at: string
          id: string
          name: string
          pitch_type: string
          sections: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          pitch_type: string
          sections?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          pitch_type?: string
          sections?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_pitch_settings: {
        Row: {
          batch_limit: number | null
          created_at: string | null
          default_artist_name: string | null
          default_tone: string | null
          id: string
          signature: string | null
          updated_at: string | null
          user_id: string
          voice_achievements: string | null
          voice_approach: string | null
          voice_background: string | null
          voice_context_notes: string | null
          voice_differentiator: string | null
          voice_profile_completed: boolean | null
          voice_style: string | null
          voice_typical_opener: string | null
        }
        Insert: {
          batch_limit?: number | null
          created_at?: string | null
          default_artist_name?: string | null
          default_tone?: string | null
          id?: string
          signature?: string | null
          updated_at?: string | null
          user_id: string
          voice_achievements?: string | null
          voice_approach?: string | null
          voice_background?: string | null
          voice_context_notes?: string | null
          voice_differentiator?: string | null
          voice_profile_completed?: boolean | null
          voice_style?: string | null
          voice_typical_opener?: string | null
        }
        Update: {
          batch_limit?: number | null
          created_at?: string | null
          default_artist_name?: string | null
          default_tone?: string | null
          id?: string
          signature?: string | null
          updated_at?: string | null
          user_id?: string
          voice_achievements?: string | null
          voice_approach?: string | null
          voice_background?: string | null
          voice_context_notes?: string | null
          voice_differentiator?: string | null
          voice_profile_completed?: boolean | null
          voice_style?: string | null
          voice_typical_opener?: string | null
        }
        Relationships: []
      }
      user_prefs: {
        Row: {
          calm_mode: boolean | null
          comfort_mode: boolean | null
          created_at: string
          sound_muted: boolean | null
          theme: string
          tone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          calm_mode?: boolean | null
          comfort_mode?: boolean | null
          created_at?: string
          sound_muted?: boolean | null
          theme?: string
          tone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          calm_mode?: boolean | null
          comfort_mode?: boolean | null
          created_at?: string
          sound_muted?: boolean | null
          theme?: string
          tone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          campaigns_limit: number | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_beta_user: boolean | null
          latest_analysis: Json | null
          onboarding_completed: boolean | null
          onboarding_skipped_at: string | null
          stripe_customer_id: string | null
          subscription_status: string | null
          subscription_tier: string
          updated_at: string
        }
        Insert: {
          campaigns_limit?: number | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_beta_user?: boolean | null
          latest_analysis?: Json | null
          onboarding_completed?: boolean | null
          onboarding_skipped_at?: string | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string
          updated_at?: string
        }
        Update: {
          campaigns_limit?: number | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_beta_user?: boolean | null
          latest_analysis?: Json | null
          onboarding_completed?: boolean | null
          onboarding_skipped_at?: string | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_timeline_events: {
        Row: {
          colour: string | null
          created_at: string
          description: string | null
          event_date: string
          id: string
          lane: string
          opportunity_id: string | null
          source: string
          tags: string[] | null
          title: string
          tracker_campaign_id: string | null
          tracker_synced_at: string | null
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          colour?: string | null
          created_at?: string
          description?: string | null
          event_date: string
          id?: string
          lane: string
          opportunity_id?: string | null
          source?: string
          tags?: string[] | null
          title: string
          tracker_campaign_id?: string | null
          tracker_synced_at?: string | null
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          colour?: string | null
          created_at?: string
          description?: string | null
          event_date?: string
          id?: string
          lane?: string
          opportunity_id?: string | null
          source?: string
          tags?: string[] | null
          title?: string
          tracker_campaign_id?: string | null
          tracker_synced_at?: string | null
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_workspace_preferences: {
        Row: {
          created_at: string
          id: string
          ideas_has_seen_starters: boolean | null
          ideas_sort_mode: string | null
          ideas_view_mode: string | null
          last_active_mode: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ideas_has_seen_starters?: boolean | null
          ideas_sort_mode?: string | null
          ideas_view_mode?: string | null
          last_active_mode?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ideas_has_seen_starters?: boolean | null
          ideas_sort_mode?: string | null
          ideas_view_mode?: string | null
          last_active_mode?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          beta_access: boolean | null
          company: string | null
          created_at: string | null
          deleted_at: string | null
          deletion_requested_at: string | null
          email: string
          enrichments_limit: number | null
          enrichments_used: number | null
          first_name: string | null
          id: string
          last_name: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          beta_access?: boolean | null
          company?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deletion_requested_at?: string | null
          email: string
          enrichments_limit?: number | null
          enrichments_used?: number | null
          first_name?: string | null
          id: string
          last_name?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          beta_access?: boolean | null
          company?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deletion_requested_at?: string | null
          email?: string
          enrichments_limit?: number | null
          enrichments_used?: number | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      widget_usage: {
        Row: {
          converted_user_id: string | null
          created_at: string | null
          domain: string | null
          enrichments_limit: number | null
          enrichments_used: number | null
          expires_at: string | null
          first_enrichment_at: string | null
          id: string
          last_enrichment_at: string | null
          referrer: string | null
          upgraded_at: string | null
          upgraded_to_paid: boolean | null
          user_agent: string | null
          widget_session_id: string
        }
        Insert: {
          converted_user_id?: string | null
          created_at?: string | null
          domain?: string | null
          enrichments_limit?: number | null
          enrichments_used?: number | null
          expires_at?: string | null
          first_enrichment_at?: string | null
          id?: string
          last_enrichment_at?: string | null
          referrer?: string | null
          upgraded_at?: string | null
          upgraded_to_paid?: boolean | null
          user_agent?: string | null
          widget_session_id: string
        }
        Update: {
          converted_user_id?: string | null
          created_at?: string | null
          domain?: string | null
          enrichments_limit?: number | null
          enrichments_used?: number | null
          expires_at?: string | null
          first_enrichment_at?: string | null
          id?: string
          last_enrichment_at?: string | null
          referrer?: string | null
          upgraded_at?: string | null
          upgraded_to_paid?: boolean | null
          user_agent?: string | null
          widget_session_id?: string
        }
        Relationships: []
      }
      workspace_activity_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          user_id: string | null
          workspace_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string | null
          workspace_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'team_activity_log_team_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      workspace_contacts_registry: {
        Row: {
          canonical_name: string | null
          created_at: string | null
          email: string
          id: string
          intel_contact_id: string | null
          last_contacted: string | null
          last_enriched: string | null
          last_synced: string | null
          pitch_contact_id: string | null
          sync_status: string | null
          total_campaigns: number | null
          total_pitches_sent: number | null
          tracker_contact_id: string | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          canonical_name?: string | null
          created_at?: string | null
          email: string
          id?: string
          intel_contact_id?: string | null
          last_contacted?: string | null
          last_enriched?: string | null
          last_synced?: string | null
          pitch_contact_id?: string | null
          sync_status?: string | null
          total_campaigns?: number | null
          total_pitches_sent?: number | null
          tracker_contact_id?: string | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          canonical_name?: string | null
          created_at?: string | null
          email?: string
          id?: string
          intel_contact_id?: string | null
          last_contacted?: string | null
          last_enriched?: string | null
          last_synced?: string | null
          pitch_contact_id?: string | null
          sync_status?: string | null
          total_campaigns?: number | null
          total_pitches_sent?: number | null
          tracker_contact_id?: string | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'workspace_contacts_registry_intel_contact_id_fkey'
            columns: ['intel_contact_id']
            isOneToOne: false
            referencedRelation: 'intel_contacts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'workspace_contacts_registry_pitch_contact_id_fkey'
            columns: ['pitch_contact_id']
            isOneToOne: false
            referencedRelation: 'contacts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'workspace_contacts_registry_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      workspace_discovery_settings: {
        Row: {
          auto_import_b2b: boolean | null
          b2b_retention_days: number | null
          b2c_discovery_enabled: boolean | null
          b2c_retention_days: number | null
          budget_exhausted_at: string | null
          contacts_per_request: number | null
          created_at: string | null
          daily_budget_cents: number | null
          monthly_budget_cents: number | null
          requests_per_day: number | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          auto_import_b2b?: boolean | null
          b2b_retention_days?: number | null
          b2c_discovery_enabled?: boolean | null
          b2c_retention_days?: number | null
          budget_exhausted_at?: string | null
          contacts_per_request?: number | null
          created_at?: string | null
          daily_budget_cents?: number | null
          monthly_budget_cents?: number | null
          requests_per_day?: number | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          auto_import_b2b?: boolean | null
          b2b_retention_days?: number | null
          b2c_discovery_enabled?: boolean | null
          b2c_retention_days?: number | null
          budget_exhausted_at?: string | null
          contacts_per_request?: number | null
          created_at?: string | null
          daily_budget_cents?: number | null
          monthly_budget_cents?: number | null
          requests_per_day?: number | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'workspace_discovery_settings_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: true
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      workspace_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: string
          token: string
          workspace_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          invited_by: string
          role?: string
          token: string
          workspace_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: string
          token?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'team_invitations_team_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      workspace_members: {
        Row: {
          id: string
          invited_by: string | null
          joined_at: string | null
          permissions: Json | null
          role: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          permissions?: Json | null
          role?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          permissions?: Json | null
          role?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'team_members_team_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      workspaces: {
        Row: {
          app_permissions: Json | null
          apps_enabled: string[] | null
          created_at: string | null
          custom_branding: Json | null
          id: string
          name: string
          owner_id: string
          plan_tier: string | null
          settings: Json | null
          slug: string
          updated_at: string | null
          workspace_type: string | null
        }
        Insert: {
          app_permissions?: Json | null
          apps_enabled?: string[] | null
          created_at?: string | null
          custom_branding?: Json | null
          id?: string
          name: string
          owner_id: string
          plan_tier?: string | null
          settings?: Json | null
          slug: string
          updated_at?: string | null
          workspace_type?: string | null
        }
        Update: {
          app_permissions?: Json | null
          apps_enabled?: string[] | null
          created_at?: string | null
          custom_branding?: Json | null
          id?: string
          name?: string
          owner_id?: string
          plan_tier?: string | null
          settings?: Json | null
          slug?: string
          updated_at?: string | null
          workspace_type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      cohort_overview: {
        Row: {
          cohort_date: string | null
          cohort_month: number | null
          cohort_week: number | null
          cohort_year: number | null
          first_user_at: string | null
          last_user_at: string | null
          total_users: number | null
        }
        Relationships: []
      }
      conversion_summary: {
        Row: {
          app: string | null
          avg_revenue_impact: number | null
          event_count: number | null
          event_name: string | null
          total_revenue_impact: number | null
        }
        Relationships: []
      }
      feedback_summary: {
        Row: {
          app: string | null
          avg_rating: number | null
          negative_feedback: number | null
          positive_feedback: number | null
          total_feedback: number | null
        }
        Relationships: []
      }
      golden_summary: {
        Row: {
          app: string | null
          avg_accessibility_score: number | null
          avg_performance_score: number | null
          avg_tests_failed: number | null
          avg_tests_passed: number | null
          degraded_deployments: number | null
          environment: string | null
          failed_deployments: number | null
          healthy_deployments: number | null
          last_deployment: string | null
          total_deployments: number | null
        }
        Relationships: []
      }
      testing_summary: {
        Row: {
          app: string | null
          avg_duration_ms: number | null
          last_execution: string | null
          pass_rate: number | null
          test_suite: string | null
          test_type: string | null
          tests_failed: number | null
          tests_passed: number | null
          total_issues_fixed: number | null
          total_issues_found: number | null
          total_tests: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_credits: {
        Args: {
          p_amount_pence: number
          p_description?: string
          p_metadata?: Json
          p_transaction_type?: string
          p_user_id: string
        }
        Returns: Json
      }
      add_to_suppression_list: {
        Args: {
          p_added_by?: string
          p_email: string
          p_encryption_key?: string
          p_reason: string
          p_source: string
          p_source_reference?: string
          p_workspace_id?: string
        }
        Returns: string
      }
      aggregate_epk_metrics: {
        Args: { p_epk_id: string; p_period_end: string; p_period_start: string }
        Returns: {
          total_downloads: number
          total_shares: number
          total_views: number
          unique_devices: number
          unique_regions: number
        }[]
      }
      assign_user_to_cohort: {
        Args: { p_signup_date: string; p_user_id: string }
        Returns: undefined
      }
      calculate_contact_confidence_score: {
        Args: {
          p_data_freshness: number
          p_email_validity: number
          p_enrichment_depth: number
          p_source_quality: number
          p_verification_status: number
        }
        Returns: number
      }
      calculate_engagement_score: {
        Args: { p_downloads: number; p_shares: number; p_views: number }
        Returns: number
      }
      calculate_retention_rate: {
        Args: {
          p_cohort_date: string
          p_period_offset: number
          p_period_type: string
        }
        Returns: number
      }
      calculate_similarity_score: {
        Args: {
          p_audience: number
          p_genre: number
          p_location: number
          p_platform: number
          p_role: number
        }
        Returns: number
      }
      can_create_campaign: { Args: { user_id_param: string }; Returns: boolean }
      cleanup_expired_invites: { Args: never; Returns: undefined }
      deduct_credits: {
        Args: {
          p_amount_pence: number
          p_description?: string
          p_metadata?: Json
          p_user_id: string
        }
        Returns: Json
      }
      delete_expired_oauth_states: { Args: never; Returns: undefined }
      get_cohort_size: { Args: { p_cohort_date: string }; Returns: number }
      get_confidence_level: { Args: { p_score: number }; Returns: string }
      get_discovery_budget_status: {
        Args: { p_workspace_id: string }
        Returns: {
          daily_budget_cents: number
          daily_remaining_cents: number
          daily_spent_cents: number
          is_exhausted: boolean
          monthly_budget_cents: number
          monthly_remaining_cents: number
          monthly_spent_cents: number
        }[]
      }
      get_intel_contact_stats: {
        Args: { p_workspace_id: string }
        Returns: {
          active_contacts: number
          avg_response_rate: number
          contacts_this_month: number
          enriched_contacts: number
          total_contacts: number
        }[]
      }
      get_latest_golden_status: {
        Args: never
        Returns: {
          app: string
          deployed_at: string
          health_status: string
          lighthouse_performance: number
          tests_failed: number
          tests_passed: number
        }[]
      }
      get_latest_scene: {
        Args: { p_user_id: string }
        Returns: {
          created_at: string
          id: string
          scene_data: Json
          updated_at: string
        }[]
      }
      get_testing_pass_rate: {
        Args: { p_app?: string; p_days?: number }
        Returns: {
          app: string
          pass_rate: number
          tests_failed: number
          tests_passed: number
          total_tests: number
        }[]
      }
      get_unified_contacts: {
        Args: { p_workspace_id: string }
        Returns: {
          email: string
          has_intel_data: boolean
          has_pitch_data: boolean
          has_tracker_data: boolean
          last_activity: string
          name: string
          registry_id: string
          total_campaigns: number
          total_pitches: number
        }[]
      }
      get_user_workspace_ids: { Args: { p_user_id: string }; Returns: string[] }
      get_workspace_integration: {
        Args: { p_integration_type: string; p_workspace_id: string }
        Returns: string
      }
      has_b2c_consent: {
        Args: { p_consent_types: string[]; p_contact_id: string }
        Returns: boolean
      }
      has_workspace_permission: {
        Args: {
          p_required_role?: string
          p_user_id: string
          p_workspace_id: string
        }
        Returns: boolean
      }
      is_email_suppressed: {
        Args: { p_email: string; p_workspace_id?: string }
        Returns: boolean
      }
      log_workspace_activity: {
        Args: {
          p_action: string
          p_metadata?: Json
          p_resource_id?: string
          p_resource_type?: string
          p_user_id: string
          p_workspace_id: string
        }
        Returns: string
      }
      mark_pitch_email_replied: {
        Args: {
          p_gmail_message_id: string
          p_reply_message_id: string
          p_reply_snippet: string
        }
        Returns: undefined
      }
      migrate_pitch_to_workspaces: {
        Args: never
        Returns: {
          auth_user_id: string
          contacts_migrated: number
          new_workspace_id: string
          pitches_migrated: number
          templates_migrated: number
          user_email: string
        }[]
      }
      update_thread_events: {
        Args: { p_event_ids: string[]; p_thread_id: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
