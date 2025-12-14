export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      agent_activity_log: {
        Row: {
          agent_name: string
          completed_at: string | null
          created_at: string | null
          id: string
          message: string | null
          metadata: Json | null
          node_id: string
          result: Json | null
          session_id: string | null
          started_at: string | null
          status: string
        }
        Insert: {
          agent_name: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          node_id: string
          result?: Json | null
          session_id?: string | null
          started_at?: string | null
          status: string
        }
        Update: {
          agent_name?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          node_id?: string
          result?: Json | null
          session_id?: string | null
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: 'agent_activity_log_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'agent_sessions'
            referencedColumns: ['id']
          },
        ]
      }
      agent_manifests: {
        Row: {
          colour: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          personality: string | null
          role: string
          sound_profile: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          colour?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          personality?: string | null
          role: string
          sound_profile?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          colour?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          personality?: string | null
          role?: string
          sound_profile?: Json | null
          updated_at?: string
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
          agent_name: string | null
          completed_at: string | null
          cost_usd: number | null
          created_at: string | null
          current_step: number | null
          description: string | null
          duration_ms: number | null
          final_output: Json | null
          flow_template_id: string | null
          id: string
          initial_input: Json | null
          metadata: Json | null
          name: string | null
          session_name: string | null
          started_at: string | null
          status: string
          tokens_used: number | null
          total_steps: number | null
          trace: Json[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          agent_name?: string | null
          completed_at?: string | null
          cost_usd?: number | null
          created_at?: string | null
          current_step?: number | null
          description?: string | null
          duration_ms?: number | null
          final_output?: Json | null
          flow_template_id?: string | null
          id?: string
          initial_input?: Json | null
          metadata?: Json | null
          name?: string | null
          session_name?: string | null
          started_at?: string | null
          status?: string
          tokens_used?: number | null
          total_steps?: number | null
          trace?: Json[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          agent_name?: string | null
          completed_at?: string | null
          cost_usd?: number | null
          created_at?: string | null
          current_step?: number | null
          description?: string | null
          duration_ms?: number | null
          final_output?: Json | null
          flow_template_id?: string | null
          id?: string
          initial_input?: Json | null
          metadata?: Json | null
          name?: string | null
          session_name?: string | null
          started_at?: string | null
          status?: string
          tokens_used?: number | null
          total_steps?: number | null
          trace?: Json[] | null
          updated_at?: string | null
          user_id?: string | null
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
          last_saved_at: string | null
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
          last_saved_at?: string | null
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
          last_saved_at?: string | null
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
          campaign_id: string
          created_at: string
          id: string
          key: string
          metric: string
          trend: string
          value: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          id?: string
          key: string
          metric: string
          trend: string
          value: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          id?: string
          key?: string
          metric?: string
          trend?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: 'campaign_insights_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          },
        ]
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
      campaign_results: {
        Row: {
          agent_name: string
          created_at: string | null
          id: string
          metadata: Json | null
          metric_key: string
          metric_label: string
          metric_unit: string | null
          metric_value: number
          session_id: string
          updated_at: string | null
        }
        Insert: {
          agent_name: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_key: string
          metric_label: string
          metric_unit?: string | null
          metric_value?: number
          session_id: string
          updated_at?: string | null
        }
        Update: {
          agent_name?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_key?: string
          metric_label?: string
          metric_unit?: string | null
          metric_value?: number
          session_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'campaign_results_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'agent_sessions'
            referencedColumns: ['id']
          },
        ]
      }
      campaign_workflows: {
        Row: {
          campaign_id: string | null
          created_at: string
          description: string | null
          edges: Json
          id: string
          name: string | null
          nodes: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          description?: string | null
          edges?: Json
          id?: string
          name?: string | null
          nodes?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          description?: string | null
          edges?: Json
          id?: string
          name?: string | null
          nodes?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'campaign_workflows_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: true
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          },
        ]
      }
      campaigns: {
        Row: {
          created_at: string
          goal_total: number | null
          id: string
          release_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          goal_total?: number | null
          id?: string
          release_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          goal_total?: number | null
          id?: string
          release_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      canvas_scenes: {
        Row: {
          campaign_id: string | null
          created_at: string
          id: string
          is_public: boolean | null
          last_viewed_at: string | null
          public_share_id: string | null
          scene_state: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          id?: string
          is_public?: boolean | null
          last_viewed_at?: string | null
          public_share_id?: string | null
          scene_state: Json
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          id?: string
          is_public?: boolean | null
          last_viewed_at?: string | null
          public_share_id?: string | null
          scene_state?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      coach_drafts: {
        Row: {
          body: string
          contact_email: string
          contact_name: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          sent_at: string | null
          session_id: string | null
          status: string
          subject: string
          theme: string
          thread_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          body: string
          contact_email: string
          contact_name?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          sent_at?: string | null
          session_id?: string | null
          status?: string
          subject: string
          theme: string
          thread_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          body?: string
          contact_email?: string
          contact_name?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          sent_at?: string | null
          session_id?: string | null
          status?: string
          subject?: string
          theme?: string
          thread_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'coach_drafts_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'agent_sessions'
            referencedColumns: ['id']
          },
        ]
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
      console_activity: {
        Row: {
          agent_runs_by_type: Json | null
          created_at: string
          current_tab: string | null
          id: string
          idle_started_at: string | null
          last_agent_run_at: string | null
          last_save_at: string | null
          last_tab_change: string | null
          session_started_at: string
          total_agent_runs: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_runs_by_type?: Json | null
          created_at?: string
          current_tab?: string | null
          id?: string
          idle_started_at?: string | null
          last_agent_run_at?: string | null
          last_save_at?: string | null
          last_tab_change?: string | null
          session_started_at?: string
          total_agent_runs?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_runs_by_type?: Json | null
          created_at?: string
          current_tab?: string | null
          id?: string
          idle_started_at?: string | null
          last_agent_run_at?: string | null
          last_save_at?: string | null
          last_tab_change?: string | null
          session_started_at?: string
          total_agent_runs?: number | null
          updated_at?: string
          user_id?: string
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
      epk_comments: {
        Row: {
          body: string
          created_at: string
          epk_id: string
          id: string
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          epk_id: string
          id?: string
          parent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          epk_id?: string
          id?: string
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'epk_comments_epk_id_fkey'
            columns: ['epk_id']
            isOneToOne: false
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'epk_comments_parent_id_fkey'
            columns: ['parent_id']
            isOneToOne: false
            referencedRelation: 'epk_comments'
            referencedColumns: ['id']
          },
        ]
      }
      flow_hub_summary_cache: {
        Row: {
          campaign_id: string | null
          expires_at: string
          generated_at: string
          id: string
          metrics: Json
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          expires_at?: string
          generated_at?: string
          id?: string
          metrics?: Json
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          expires_at?: string
          generated_at?: string
          id?: string
          metrics?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'flow_hub_summary_cache_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          },
        ]
      }
      flow_telemetry: {
        Row: {
          campaign_id: string | null
          created_at: string
          duration_ms: number | null
          event_type: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          duration_ms?: number | null
          event_type: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          duration_ms?: number | null
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      gmail_tracked_emails: {
        Row: {
          connection_id: string
          created_at: string | null
          gmail_message_id: string
          gmail_thread_id: string
          has_reply: boolean | null
          id: string
          recipient_email: string | null
          replied_at: string | null
          reply_snippet: string | null
          sent_at: string
          session_id: string | null
          subject: string | null
          updated_at: string | null
        }
        Insert: {
          connection_id: string
          created_at?: string | null
          gmail_message_id: string
          gmail_thread_id: string
          has_reply?: boolean | null
          id?: string
          recipient_email?: string | null
          replied_at?: string | null
          reply_snippet?: string | null
          sent_at: string
          session_id?: string | null
          subject?: string | null
          updated_at?: string | null
        }
        Update: {
          connection_id?: string
          created_at?: string | null
          gmail_message_id?: string
          gmail_thread_id?: string
          has_reply?: boolean | null
          id?: string
          recipient_email?: string | null
          replied_at?: string | null
          reply_snippet?: string | null
          sent_at?: string
          session_id?: string | null
          subject?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'gmail_tracked_emails_connection_id_fkey'
            columns: ['connection_id']
            isOneToOne: false
            referencedRelation: 'integration_connections'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'gmail_tracked_emails_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'agent_sessions'
            referencedColumns: ['id']
          },
        ]
      }
      integration_connections: {
        Row: {
          access_token: string
          auto_sync_enabled: boolean | null
          connected_at: string | null
          expires_at: string | null
          id: string
          last_error: string | null
          last_sync_at: string | null
          metadata: Json | null
          provider: string
          provider_user_id: string | null
          refresh_token: string | null
          scopes: string[] | null
          status: string | null
          sync_frequency_minutes: number | null
          token_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          auto_sync_enabled?: boolean | null
          connected_at?: string | null
          expires_at?: string | null
          id?: string
          last_error?: string | null
          last_sync_at?: string | null
          metadata?: Json | null
          provider: string
          provider_user_id?: string | null
          refresh_token?: string | null
          scopes?: string[] | null
          status?: string | null
          sync_frequency_minutes?: number | null
          token_type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          auto_sync_enabled?: boolean | null
          connected_at?: string | null
          expires_at?: string | null
          id?: string
          last_error?: string | null
          last_sync_at?: string | null
          metadata?: Json | null
          provider?: string
          provider_user_id?: string | null
          refresh_token?: string | null
          scopes?: string[] | null
          status?: string | null
          sync_frequency_minutes?: number | null
          token_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      integration_metrics: {
        Row: {
          created_at: string | null
          id: string
          integration_type: string
          metric_key: string
          metric_label: string
          metric_value: number
          raw_data: Json | null
          session_id: string
          synced_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          integration_type: string
          metric_key: string
          metric_label: string
          metric_value?: number
          raw_data?: Json | null
          session_id: string
          synced_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          integration_type?: string
          metric_key?: string
          metric_label?: string
          metric_value?: number
          raw_data?: Json | null
          session_id?: string
          synced_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'integration_metrics_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'agent_sessions'
            referencedColumns: ['id']
          },
        ]
      }
      integration_sync_logs: {
        Row: {
          completed_at: string | null
          connection_id: string
          direction: string | null
          duration_ms: number | null
          error_details: Json | null
          error_message: string | null
          id: string
          items_failed: number | null
          items_synced: number | null
          metadata: Json | null
          started_at: string
          status: string
          sync_type: string
        }
        Insert: {
          completed_at?: string | null
          connection_id: string
          direction?: string | null
          duration_ms?: number | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          items_failed?: number | null
          items_synced?: number | null
          metadata?: Json | null
          started_at?: string
          status: string
          sync_type: string
        }
        Update: {
          completed_at?: string | null
          connection_id?: string
          direction?: string | null
          duration_ms?: number | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          items_failed?: number | null
          items_synced?: number | null
          metadata?: Json | null
          started_at?: string
          status?: string
          sync_type?: string
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
      loopos_agent_executions: {
        Row: {
          agent_type: string
          created_at: string
          ended_at: string | null
          error: string | null
          id: string
          input: Json
          output: Json | null
          started_at: string
          status: string
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          agent_type: string
          created_at?: string
          ended_at?: string | null
          error?: string | null
          id?: string
          input?: Json
          output?: Json | null
          started_at?: string
          status: string
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          agent_type?: string
          created_at?: string
          ended_at?: string | null
          error?: string | null
          id?: string
          input?: Json
          output?: Json | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'loopos_agent_executions_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'loopos_workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      loopos_auto_chains: {
        Row: {
          actions: Json
          created_at: string
          id: string
          is_active: boolean
          name: string
          trigger: Json
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          actions?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          trigger?: Json
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          actions?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          trigger?: Json
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'loopos_auto_chains_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'loopos_workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      loopos_clips: {
        Row: {
          created_at: string
          id: string
          lane: string
          length: number
          loop_id: string
          loopos_ready: boolean
          name: string
          notes: string
          start: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          lane: string
          length: number
          loop_id: string
          loopos_ready?: boolean
          name: string
          notes: string
          start: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          lane?: string
          length?: number
          loop_id?: string
          loopos_ready?: boolean
          name?: string
          notes?: string
          start?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'loopos_clips_loop_id_fkey'
            columns: ['loop_id']
            isOneToOne: false
            referencedRelation: 'loopos_loops'
            referencedColumns: ['id']
          },
        ]
      }
      loopos_creative_packs: {
        Row: {
          category: string
          content: Json
          created_at: string
          description: string
          id: string
          is_public: boolean
          name: string
          updated_at: string
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          category: string
          content?: Json
          created_at?: string
          description: string
          id?: string
          is_public?: boolean
          name: string
          updated_at?: string
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          category?: string
          content?: Json
          created_at?: string
          description?: string
          id?: string
          is_public?: boolean
          name?: string
          updated_at?: string
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'loopos_creative_packs_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'loopos_workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      loopos_designer_scenes: {
        Row: {
          created_at: string
          data: Json
          id: string
          is_active: boolean
          name: string
          prompt: string | null
          type: string
          updated_at: string
          user_id: string
          version: number
          workspace_id: string
        }
        Insert: {
          created_at?: string
          data: Json
          id?: string
          is_active?: boolean
          name: string
          prompt?: string | null
          type?: string
          updated_at?: string
          user_id: string
          version?: number
          workspace_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          is_active?: boolean
          name?: string
          prompt?: string | null
          type?: string
          updated_at?: string
          user_id?: string
          version?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'loopos_designer_scenes_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'loopos_workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      loopos_exports: {
        Row: {
          created_at: string
          file_url: string | null
          id: string
          metadata: Json
          name: string
          status: string
          type: string
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          file_url?: string | null
          id?: string
          metadata?: Json
          name: string
          status: string
          type: string
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          file_url?: string | null
          id?: string
          metadata?: Json
          name?: string
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'loopos_exports_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'loopos_workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      loopos_flow_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          metadata: Json
          name: string
          started_at: string
          status: string
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          metadata?: Json
          name: string
          started_at?: string
          status: string
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          metadata?: Json
          name?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'loopos_flow_sessions_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'loopos_workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      loopos_insights: {
        Row: {
          generated_at: string
          id: string
          insights_json: Json
          loop_id: string
        }
        Insert: {
          generated_at?: string
          id?: string
          insights_json: Json
          loop_id: string
        }
        Update: {
          generated_at?: string
          id?: string
          insights_json?: Json
          loop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'loopos_insights_loop_id_fkey'
            columns: ['loop_id']
            isOneToOne: false
            referencedRelation: 'loopos_loops'
            referencedColumns: ['id']
          },
        ]
      }
      loopos_journal_entries: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json
          title: string
          type: string
          updated_at: string
          user_id: string
          voice_url: string | null
          workspace_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json
          title: string
          type: string
          updated_at?: string
          user_id: string
          voice_url?: string | null
          workspace_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
          voice_url?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'loopos_journal_entries_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'loopos_workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      loopos_loops: {
        Row: {
          bpm: number
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
          zoom: number
        }
        Insert: {
          bpm?: number
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id: string
          zoom?: number
        }
        Update: {
          bpm?: number
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
          zoom?: number
        }
        Relationships: []
      }
      loopos_moodboard_items: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          metadata: Json
          position_x: number
          position_y: number
          type: string
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          metadata?: Json
          position_x?: number
          position_y?: number
          type: string
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          metadata?: Json
          position_x?: number
          position_y?: number
          type?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'loopos_moodboard_items_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'loopos_workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      loopos_nodes: {
        Row: {
          colour: string
          content: string
          created_at: string
          id: string
          last_edited_by: string | null
          metadata: Json
          position_x: number
          position_y: number
          title: string
          type: string
          updated_at: string
          user_id: string
          version: number
          workspace_id: string
        }
        Insert: {
          colour?: string
          content?: string
          created_at?: string
          id?: string
          last_edited_by?: string | null
          metadata?: Json
          position_x?: number
          position_y?: number
          title: string
          type: string
          updated_at?: string
          user_id: string
          version?: number
          workspace_id: string
        }
        Update: {
          colour?: string
          content?: string
          created_at?: string
          id?: string
          last_edited_by?: string | null
          metadata?: Json
          position_x?: number
          position_y?: number
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
          version?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'loopos_nodes_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'loopos_workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      loopos_notes: {
        Row: {
          content: string
          created_at: string
          id: string
          node_id: string | null
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          node_id?: string | null
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          node_id?: string | null
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'loopos_notes_node_id_fkey'
            columns: ['node_id']
            isOneToOne: false
            referencedRelation: 'loopos_nodes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'loopos_notes_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'loopos_workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      loopos_playbook_chapters: {
        Row: {
          content: Json
          created_at: string
          description: string
          id: string
          is_public: boolean
          order_index: number
          title: string
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          content?: Json
          created_at?: string
          description: string
          id?: string
          is_public?: boolean
          order_index?: number
          title: string
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          content?: Json
          created_at?: string
          description?: string
          id?: string
          is_public?: boolean
          order_index?: number
          title?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'loopos_playbook_chapters_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'loopos_workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      loopos_user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          cursor_colour: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          cursor_colour?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          cursor_colour?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      loopos_workspace_members: {
        Row: {
          created_at: string
          id: string
          role: string
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'loopos_workspace_members_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'loopos_workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      loopos_workspaces: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      oauth_state_tokens: {
        Row: {
          code_verifier: string | null
          created_at: string | null
          expires_at: string
          id: string
          provider: string
          state: string
          user_id: string | null
        }
        Insert: {
          code_verifier?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          provider: string
          state: string
          user_id?: string | null
        }
        Update: {
          code_verifier?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          provider?: string
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
      report_shares: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          session_id: string
          token: string
          updated_at: string
          user_id: string
          views_count: number
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          session_id: string
          token: string
          updated_at?: string
          user_id: string
          views_count?: number
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          session_id?: string
          token?: string
          updated_at?: string
          user_id?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: 'report_shares_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'agent_sessions'
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
      user_preferences: {
        Row: {
          audio_volume: number | null
          auto_sync_enabled: boolean
          created_at: string
          demo_mode: boolean
          id: string
          mute_sounds: boolean
          onboarding_completed_at: string | null
          preferred_theme: string | null
          preferred_view: string
          reduced_motion: boolean
          show_onboarding_overlay: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          audio_volume?: number | null
          auto_sync_enabled?: boolean
          created_at?: string
          demo_mode?: boolean
          id?: string
          mute_sounds?: boolean
          onboarding_completed_at?: string | null
          preferred_theme?: string | null
          preferred_view?: string
          reduced_motion?: boolean
          show_onboarding_overlay?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          audio_volume?: number | null
          auto_sync_enabled?: boolean
          created_at?: string
          demo_mode?: boolean
          id?: string
          mute_sounds?: boolean
          onboarding_completed_at?: string | null
          preferred_theme?: string | null
          preferred_view?: string
          reduced_motion?: boolean
          show_onboarding_overlay?: boolean
          updated_at?: string
          user_id?: string
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
          artist_name: string | null
          broker_completed_at: string | null
          broker_session_id: string | null
          created_at: string | null
          custom_colors: Json | null
          custom_fonts: Json | null
          experience: string | null
          genre: string | null
          goal: string | null
          id: string
          last_accessed: string | null
          last_flow_template: Json | null
          last_goal: string | null
          last_session_id: string | null
          onboarding_completed: boolean | null
          onboarding_step: string | null
          sound_enabled: boolean | null
          sound_volume: number | null
          ui_mode: string | null
          updated_at: string | null
        }
        Insert: {
          artist_name?: string | null
          broker_completed_at?: string | null
          broker_session_id?: string | null
          created_at?: string | null
          custom_colors?: Json | null
          custom_fonts?: Json | null
          experience?: string | null
          genre?: string | null
          goal?: string | null
          id: string
          last_accessed?: string | null
          last_flow_template?: Json | null
          last_goal?: string | null
          last_session_id?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: string | null
          sound_enabled?: boolean | null
          sound_volume?: number | null
          ui_mode?: string | null
          updated_at?: string | null
        }
        Update: {
          artist_name?: string | null
          broker_completed_at?: string | null
          broker_session_id?: string | null
          created_at?: string | null
          custom_colors?: Json | null
          custom_fonts?: Json | null
          experience?: string | null
          genre?: string | null
          goal?: string | null
          id?: string
          last_accessed?: string | null
          last_flow_template?: Json | null
          last_goal?: string | null
          last_session_id?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: string | null
          sound_enabled?: boolean | null
          sound_volume?: number | null
          ui_mode?: string | null
          updated_at?: string | null
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
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      campaign_summaries: {
        Row: {
          agent_name: string | null
          metrics: Json | null
          session_id: string | null
          total_metrics: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'campaign_results_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'agent_sessions'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Functions: {
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
      calculate_engagement_score: {
        Args: { p_downloads: number; p_shares: number; p_views: number }
        Returns: number
      }
      cleanup_expired_invites: { Args: never; Returns: undefined }
      cleanup_expired_oauth_tokens: { Args: never; Returns: undefined }
      cleanup_expired_report_shares: { Args: never; Returns: undefined }
      get_or_create_user_preferences: {
        Args: { p_user_id: string }
        Returns: {
          audio_volume: number | null
          auto_sync_enabled: boolean
          created_at: string
          demo_mode: boolean
          id: string
          mute_sounds: boolean
          onboarding_completed_at: string | null
          preferred_theme: string | null
          preferred_view: string
          reduced_motion: boolean
          show_onboarding_overlay: boolean
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: '*'
          to: 'user_preferences'
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_or_create_user_profile: {
        Args: { user_uuid: string }
        Returns: {
          avatar_url: string | null
          created_at: string
          cursor_colour: string
          display_name: string | null
          id: string
          updated_at: string
        }
        SetofOptions: {
          from: '*'
          to: 'loopos_user_profiles'
          isOneToOne: true
          isSetofReturn: false
        }
      }
      increment_report_view_count: {
        Args: { share_token: string }
        Returns: undefined
      }
      refresh_flow_hub_summary: { Args: { uid: string }; Returns: undefined }
      upsert_workspace_preferences: {
        Args: {
          p_ideas_has_seen_starters?: boolean
          p_ideas_sort_mode?: string
          p_ideas_view_mode?: string
          p_last_active_mode?: string
          p_user_id: string
        }
        Returns: {
          created_at: string
          id: string
          ideas_has_seen_starters: boolean | null
          ideas_sort_mode: string | null
          ideas_view_mode: string | null
          last_active_mode: string | null
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: '*'
          to: 'user_workspace_preferences'
          isOneToOne: true
          isSetofReturn: false
        }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
