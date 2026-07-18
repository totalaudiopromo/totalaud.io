export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.4'
  }
  public: {
    Tables: {
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
      approvals: {
        Row: {
          approver_id: string | null
          comment: string | null
          created_at: string
          decided_at: string | null
          id: string
          requested_by: string | null
          status: string
          target_id: string
          target_table: string
          updated_at: string
        }
        Insert: {
          approver_id?: string | null
          comment?: string | null
          created_at?: string
          decided_at?: string | null
          id?: string
          requested_by?: string | null
          status?: string
          target_id: string
          target_table: string
          updated_at?: string
        }
        Update: {
          approver_id?: string | null
          comment?: string | null
          created_at?: string
          decided_at?: string | null
          id?: string
          requested_by?: string | null
          status?: string
          target_id?: string
          target_table?: string
          updated_at?: string
        }
        Relationships: []
      }
      artist_identities: {
        Row: {
          bio_long: string | null
          bio_short: string | null
          brand_style: string | null
          brand_themes: string[] | null
          brand_tone: string | null
          comparisons: string[] | null
          created_at: string | null
          emotional_range: string | null
          id: string
          key_phrases: string[] | null
          last_generated_at: string | null
          one_liner: string | null
          pitch_hook: string | null
          press_angle: string | null
          primary_motifs: string[] | null
          unique_elements: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bio_long?: string | null
          bio_short?: string | null
          brand_style?: string | null
          brand_themes?: string[] | null
          brand_tone?: string | null
          comparisons?: string[] | null
          created_at?: string | null
          emotional_range?: string | null
          id?: string
          key_phrases?: string[] | null
          last_generated_at?: string | null
          one_liner?: string | null
          pitch_hook?: string | null
          press_angle?: string | null
          primary_motifs?: string[] | null
          unique_elements?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bio_long?: string | null
          bio_short?: string | null
          brand_style?: string | null
          brand_themes?: string[] | null
          brand_tone?: string | null
          comparisons?: string[] | null
          created_at?: string | null
          emotional_range?: string | null
          id?: string
          key_phrases?: string[] | null
          last_generated_at?: string | null
          one_liner?: string | null
          pitch_hook?: string | null
          press_angle?: string | null
          primary_motifs?: string[] | null
          unique_elements?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      asset_packs: {
        Row: {
          created_at: string
          drive_folder_url: string | null
          id: string
          name: string
          release_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          drive_folder_url?: string | null
          id?: string
          name: string
          release_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          drive_folder_url?: string | null
          id?: string
          name?: string
          release_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'asset_packs_release_id_fkey'
            columns: ['release_id']
            isOneToOne: false
            referencedRelation: 'releases'
            referencedColumns: ['id']
          },
        ]
      }
      assets: {
        Row: {
          asset_pack_id: string
          created_at: string
          file_url: string | null
          id: string
          kind: string
          label: string
          mime: string | null
          size_bytes: number | null
          updated_at: string
          watermark: boolean
        }
        Insert: {
          asset_pack_id: string
          created_at?: string
          file_url?: string | null
          id?: string
          kind?: string
          label: string
          mime?: string | null
          size_bytes?: number | null
          updated_at?: string
          watermark?: boolean
        }
        Update: {
          asset_pack_id?: string
          created_at?: string
          file_url?: string | null
          id?: string
          kind?: string
          label?: string
          mime?: string | null
          size_bytes?: number | null
          updated_at?: string
          watermark?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'assets_asset_pack_id_fkey'
            columns: ['asset_pack_id']
            isOneToOne: false
            referencedRelation: 'asset_packs'
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
      finish_notes: {
        Row: {
          analysis: Json
          created_at: string
          id: string
          notes: Json
          track_name: string | null
          user_id: string
        }
        Insert: {
          analysis: Json
          created_at?: string
          id?: string
          notes: Json
          track_name?: string | null
          user_id: string
        }
        Update: {
          analysis?: Json
          created_at?: string
          id?: string
          notes?: Json
          track_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      flow_hub_summary_cache: {
        Row: {
          cached_data: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cached_data: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cached_data?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      flow_telemetry: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: string | null
          session_id: string | null
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          session_id?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          session_id?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      gmail_connections: {
        Row: {
          access_token: string
          created_at: string
          email: string
          expires_at: string | null
          id: string
          refresh_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          email: string
          expires_at?: string | null
          id?: string
          refresh_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          email?: string
          expires_at?: string | null
          id?: string
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      label_artists: {
        Row: {
          bio: string | null
          created_at: string
          genres: string[] | null
          id: string
          image_url: string | null
          label_id: string
          name: string
          social_links: Json | null
          spotify_url: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          genres?: string[] | null
          id?: string
          image_url?: string | null
          label_id: string
          name: string
          social_links?: Json | null
          spotify_url?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          genres?: string[] | null
          id?: string
          image_url?: string | null
          label_id?: string
          name?: string
          social_links?: Json | null
          spotify_url?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'label_artists_label_id_fkey'
            columns: ['label_id']
            isOneToOne: false
            referencedRelation: 'labels'
            referencedColumns: ['id']
          },
        ]
      }
      label_contacts: {
        Row: {
          created_at: string
          email: string | null
          id: string
          label_id: string
          last_contacted: string | null
          name: string
          notes: string | null
          outlet: string | null
          tags: string[] | null
          type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          label_id: string
          last_contacted?: string | null
          name: string
          notes?: string | null
          outlet?: string | null
          tags?: string[] | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          label_id?: string
          last_contacted?: string | null
          name?: string
          notes?: string | null
          outlet?: string | null
          tags?: string[] | null
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'label_contacts_label_id_fkey'
            columns: ['label_id']
            isOneToOne: false
            referencedRelation: 'labels'
            referencedColumns: ['id']
          },
        ]
      }
      label_members: {
        Row: {
          created_at: string
          id: string
          label_id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label_id: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label_id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'label_members_label_id_fkey'
            columns: ['label_id']
            isOneToOne: false
            referencedRelation: 'labels'
            referencedColumns: ['id']
          },
        ]
      }
      label_release_tasks: {
        Row: {
          assigned_to: string | null
          completed: boolean
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          label_id: string
          release_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          label_id: string
          release_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          label_id?: string
          release_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'label_release_tasks_label_id_fkey'
            columns: ['label_id']
            isOneToOne: false
            referencedRelation: 'labels'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'label_release_tasks_release_id_fkey'
            columns: ['release_id']
            isOneToOne: false
            referencedRelation: 'label_releases'
            referencedColumns: ['id']
          },
        ]
      }
      label_releases: {
        Row: {
          artist_id: string
          artwork_url: string | null
          created_at: string
          id: string
          label_id: string
          notes: string | null
          release_date: string | null
          status: string
          title: string
          type: string
          upc: string | null
          updated_at: string
        }
        Insert: {
          artist_id: string
          artwork_url?: string | null
          created_at?: string
          id?: string
          label_id: string
          notes?: string | null
          release_date?: string | null
          status?: string
          title: string
          type: string
          upc?: string | null
          updated_at?: string
        }
        Update: {
          artist_id?: string
          artwork_url?: string | null
          created_at?: string
          id?: string
          label_id?: string
          notes?: string | null
          release_date?: string | null
          status?: string
          title?: string
          type?: string
          upc?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'label_releases_artist_id_fkey'
            columns: ['artist_id']
            isOneToOne: false
            referencedRelation: 'label_artists'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'label_releases_label_id_fkey'
            columns: ['label_id']
            isOneToOne: false
            referencedRelation: 'labels'
            referencedColumns: ['id']
          },
        ]
      }
      label_tracks: {
        Row: {
          created_at: string
          duration_seconds: number | null
          id: string
          isrc: string | null
          label_id: string
          release_id: string
          status: string | null
          title: string
          track_number: number | null
          updated_at: string
          version: string | null
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          isrc?: string | null
          label_id: string
          release_id: string
          status?: string | null
          title: string
          track_number?: number | null
          updated_at?: string
          version?: string | null
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          isrc?: string | null
          label_id?: string
          release_id?: string
          status?: string | null
          title?: string
          track_number?: number | null
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'label_tracks_label_id_fkey'
            columns: ['label_id']
            isOneToOne: false
            referencedRelation: 'labels'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'label_tracks_release_id_fkey'
            columns: ['release_id']
            isOneToOne: false
            referencedRelation: 'label_releases'
            referencedColumns: ['id']
          },
        ]
      }
      labels: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          owner_user_id: string
          plan_tier: string
          slug: string
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          owner_user_id: string
          plan_tier?: string
          slug: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          owner_user_id?: string
          plan_tier?: string
          slug?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      lead_captures: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          source: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          source: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          source?: string
        }
        Relationships: []
      }
      milestones: {
        Row: {
          completed_at: string | null
          created_at: string
          due_at: string | null
          id: string
          kind: string
          label: string
          release_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          due_at?: string | null
          id?: string
          kind: string
          label: string
          release_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          due_at?: string | null
          id?: string
          kind?: string
          label?: string
          release_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'milestones_release_id_fkey'
            columns: ['release_id']
            isOneToOne: false
            referencedRelation: 'releases'
            referencedColumns: ['id']
          },
        ]
      }
      opportunities: {
        Row: {
          acceptance_rate: number | null
          audience_size: string | null
          avg_response_time: number | null
          contact_email: string | null
          contact_info: Json | null
          contact_name: string | null
          created_at: string
          description: string | null
          follower_count: number | null
          genres: string[]
          id: string
          importance: number | null
          is_active: boolean | null
          last_verified_at: string | null
          name: string
          source: string | null
          source_url: string | null
          submission_notes: string | null
          submission_open: boolean | null
          type: string
          updated_at: string
          url: string | null
          vibes: string[] | null
        }
        Insert: {
          acceptance_rate?: number | null
          audience_size?: string | null
          avg_response_time?: number | null
          contact_email?: string | null
          contact_info?: Json | null
          contact_name?: string | null
          created_at?: string
          description?: string | null
          follower_count?: number | null
          genres?: string[]
          id?: string
          importance?: number | null
          is_active?: boolean | null
          last_verified_at?: string | null
          name: string
          source?: string | null
          source_url?: string | null
          submission_notes?: string | null
          submission_open?: boolean | null
          type: string
          updated_at?: string
          url?: string | null
          vibes?: string[] | null
        }
        Update: {
          acceptance_rate?: number | null
          audience_size?: string | null
          avg_response_time?: number | null
          contact_email?: string | null
          contact_info?: Json | null
          contact_name?: string | null
          created_at?: string
          description?: string | null
          follower_count?: number | null
          genres?: string[]
          id?: string
          importance?: number | null
          is_active?: boolean | null
          last_verified_at?: string | null
          name?: string
          source?: string | null
          source_url?: string | null
          submission_notes?: string | null
          submission_open?: boolean | null
          type?: string
          updated_at?: string
          url?: string | null
          vibes?: string[] | null
        }
        Relationships: []
      }
      partner_handoffs: {
        Row: {
          accepted_at: string | null
          brief_id: string
          channel: string
          created_at: string
          id: string
          notes: string | null
          partner_id: string
          sent_at: string | null
          status: string
          tap_campaign_id: string | null
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          brief_id: string
          channel: string
          created_at?: string
          id?: string
          notes?: string | null
          partner_id: string
          sent_at?: string | null
          status?: string
          tap_campaign_id?: string | null
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          brief_id?: string
          channel?: string
          created_at?: string
          id?: string
          notes?: string | null
          partner_id?: string
          sent_at?: string | null
          status?: string
          tap_campaign_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'partner_handoffs_brief_id_fkey'
            columns: ['brief_id']
            isOneToOne: false
            referencedRelation: 'release_briefs'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'partner_handoffs_partner_id_fkey'
            columns: ['partner_id']
            isOneToOne: false
            referencedRelation: 'partners'
            referencedColumns: ['id']
          },
        ]
      }
      partners: {
        Row: {
          created_at: string
          email: string | null
          id: string
          kind: string
          label_id: string
          name: string
          tap_workspace_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          kind?: string
          label_id: string
          name: string
          tap_workspace_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          kind?: string
          label_id?: string
          name?: string
          tap_workspace_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'partners_label_id_fkey'
            columns: ['label_id']
            isOneToOne: false
            referencedRelation: 'labels'
            referencedColumns: ['id']
          },
        ]
      }
      pitch_sends: {
        Row: {
          gmail_message_id: string | null
          gmail_thread_id: string | null
          id: string
          idempotency_key: string | null
          sent_at: string
          subject: string
          to_email: string
          user_id: string
        }
        Insert: {
          gmail_message_id?: string | null
          gmail_thread_id?: string | null
          id?: string
          idempotency_key?: string | null
          sent_at?: string
          subject: string
          to_email: string
          user_id: string
        }
        Update: {
          gmail_message_id?: string | null
          gmail_thread_id?: string | null
          id?: string
          idempotency_key?: string | null
          sent_at?: string
          subject?: string
          to_email?: string
          user_id?: string
        }
        Relationships: []
      }
      release_briefs: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          body_jsonb: Json
          created_at: string
          created_by: string | null
          id: string
          pdf_url: string | null
          release_id: string
          sent_at: string | null
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          body_jsonb?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          pdf_url?: string | null
          release_id: string
          sent_at?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          body_jsonb?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          pdf_url?: string | null
          release_id?: string
          sent_at?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: 'release_briefs_release_id_fkey'
            columns: ['release_id']
            isOneToOne: false
            referencedRelation: 'releases'
            referencedColumns: ['id']
          },
        ]
      }
      release_tracks: {
        Row: {
          created_at: string
          duration_seconds: number | null
          id: string
          isrc: string | null
          position: number
          release_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          isrc?: string | null
          position: number
          release_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          isrc?: string | null
          position?: number
          release_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'release_tracks_release_id_fkey'
            columns: ['release_id']
            isOneToOne: false
            referencedRelation: 'releases'
            referencedColumns: ['id']
          },
        ]
      }
      releases: {
        Row: {
          created_at: string
          genre_tags: string[]
          id: string
          label_id: string
          primary_artist_id: string | null
          status: string
          target_announce_at: string | null
          target_release_at: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          genre_tags?: string[]
          id?: string
          label_id: string
          primary_artist_id?: string | null
          status?: string
          target_announce_at?: string | null
          target_release_at?: string | null
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          genre_tags?: string[]
          id?: string
          label_id?: string
          primary_artist_id?: string | null
          status?: string
          target_announce_at?: string | null
          target_release_at?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'releases_label_id_fkey'
            columns: ['label_id']
            isOneToOne: false
            referencedRelation: 'labels'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'releases_primary_artist_id_fkey'
            columns: ['primary_artist_id']
            isOneToOne: false
            referencedRelation: 'roster_artists'
            referencedColumns: ['id']
          },
        ]
      }
      roster_artists: {
        Row: {
          created_at: string
          id: string
          label_id: string
          name: string
          notes: string | null
          primary_image_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          label_id: string
          name: string
          notes?: string | null
          primary_image_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          label_id?: string
          name?: string
          notes?: string | null
          primary_image_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'roster_artists_label_id_fkey'
            columns: ['label_id']
            isOneToOne: false
            referencedRelation: 'labels'
            referencedColumns: ['id']
          },
        ]
      }
      signal_threads: {
        Row: {
          colour: string | null
          created_at: string
          end_date: string | null
          event_ids: string[] | null
          id: string
          insights: string[] | null
          narrative_summary: string | null
          start_date: string | null
          thread_type: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          colour?: string | null
          created_at?: string
          end_date?: string | null
          event_ids?: string[] | null
          id?: string
          insights?: string[] | null
          narrative_summary?: string | null
          start_date?: string | null
          thread_type: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          colour?: string | null
          created_at?: string
          end_date?: string | null
          event_ids?: string[] | null
          id?: string
          insights?: string[] | null
          narrative_summary?: string | null
          start_date?: string | null
          thread_type?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      streaming_stats: {
        Row: {
          created_at: string
          followers: number | null
          id: string
          listeners: number | null
          saves: number | null
          source: string
          stat_date: string
          streams: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          followers?: number | null
          id?: string
          listeners?: number | null
          saves?: number | null
          source?: string
          stat_date: string
          streams?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          followers?: number | null
          id?: string
          listeners?: number | null
          saves?: number | null
          source?: string
          stat_date?: string
          streams?: number | null
          user_id?: string
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
      totalaud_io_waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string | null
          utm_campaign: string | null
          utm_medium: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
        }
        Relationships: []
      }
      user_api_tokens: {
        Row: {
          created_at: string
          id: string
          label: string
          last_used_at: string | null
          revoked_at: string | null
          token_hash: string
          token_last4: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          last_used_at?: string | null
          revoked_at?: string | null
          token_hash: string
          token_last4: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          last_used_at?: string | null
          revoked_at?: string | null
          token_hash?: string
          token_last4?: string
          user_id?: string
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
          id: string
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
          id: string
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
      user_profiles: {
        Row: {
          artist_name: string | null
          created_at: string | null
          custom_colors: Json | null
          custom_fonts: Json | null
          genre: string | null
          goals: string[] | null
          id: string
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          onboarding_step: string | null
          primary_goal: string | null
          project_title: string | null
          project_type: string | null
          release_date: string | null
          sound_enabled: boolean | null
          sound_volume: number | null
          stripe_customer_id: string | null
          subscription_status: string | null
          subscription_tier: string | null
          ui_mode: string | null
          updated_at: string | null
          vibe: string | null
        }
        Insert: {
          artist_name?: string | null
          created_at?: string | null
          custom_colors?: Json | null
          custom_fonts?: Json | null
          genre?: string | null
          goals?: string[] | null
          id: string
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          onboarding_step?: string | null
          primary_goal?: string | null
          project_title?: string | null
          project_type?: string | null
          release_date?: string | null
          sound_enabled?: boolean | null
          sound_volume?: number | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          ui_mode?: string | null
          updated_at?: string | null
          vibe?: string | null
        }
        Update: {
          artist_name?: string | null
          created_at?: string | null
          custom_colors?: Json | null
          custom_fonts?: Json | null
          genre?: string | null
          goals?: string[] | null
          id?: string
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          onboarding_step?: string | null
          primary_goal?: string | null
          project_title?: string | null
          project_type?: string | null
          release_date?: string | null
          sound_enabled?: boolean | null
          sound_volume?: number | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          ui_mode?: string | null
          updated_at?: string | null
          vibe?: string | null
        }
        Relationships: []
      }
      user_timeline_events: {
        Row: {
          colour: string | null
          contact_id: string | null
          created_at: string
          description: string | null
          event_date: string
          id: string
          lane: string
          opportunity_id: string | null
          source: string
          tags: string[] | null
          thread_id: string | null
          title: string
          tracker_campaign_id: string | null
          tracker_synced_at: string | null
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          colour?: string | null
          contact_id?: string | null
          created_at?: string
          description?: string | null
          event_date: string
          id: string
          lane: string
          opportunity_id?: string | null
          source?: string
          tags?: string[] | null
          thread_id?: string | null
          title: string
          tracker_campaign_id?: string | null
          tracker_synced_at?: string | null
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          colour?: string | null
          contact_id?: string | null
          created_at?: string
          description?: string | null
          event_date?: string
          id?: string
          lane?: string
          opportunity_id?: string | null
          source?: string
          tags?: string[] | null
          thread_id?: string | null
          title?: string
          tracker_campaign_id?: string | null
          tracker_synced_at?: string | null
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'fk_timeline_thread'
            columns: ['thread_id']
            isOneToOne: false
            referencedRelation: 'signal_threads'
            referencedColumns: ['id']
          },
        ]
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
      [_ in never]: never
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
      create_label: {
        Args: { p_description?: string; p_name: string; p_slug: string }
        Returns: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          owner_user_id: string
          plan_tier: string
          slug: string
          updated_at: string
          website: string | null
        }
        SetofOptions: {
          from: '*'
          to: 'labels'
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_label_with_owner: {
        Args: { p_name: string; p_plan_tier?: string; p_slug: string }
        Returns: Json
      }
      deduct_credits: {
        Args: {
          p_amount_pence: number
          p_description?: string
          p_metadata?: Json
          p_user_id: string
        }
        Returns: Json
      }
      is_label_manager: { Args: { p_label_id: string }; Returns: boolean }
      is_label_member:
        | { Args: { p_label_id: string }; Returns: boolean }
        | { Args: { p_label_id: string; p_user_id: string }; Returns: boolean }
      label_member_role: {
        Args: { p_label_id: string; p_user_id: string }
        Returns: string
      }
      recalculate_thread_dates: {
        Args: { p_thread_id: string }
        Returns: undefined
      }
      update_thread_events: {
        Args: { p_event_ids: string[]; p_thread_id: string; p_user_id: string }
        Returns: undefined
      }
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
  public: {
    Enums: {},
  },
} as const
