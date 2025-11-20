export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type GenericTable = {
  Row: Record<string, any>
  Insert: Record<string, any>
  Update: Record<string, any>
  Relationships: unknown[]
}

export interface Database {
  public: {
    Tables: {
      loopos_loops: {
        Row: {
          id: string
          user_id: string
          name: string
          bpm: number
          zoom: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string
          bpm?: number
          zoom?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          bpm?: number
          zoom?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'loopos_loops_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      loopos_clips: {
        Row: {
          id: string
          loop_id: string
          lane: string
          start: number
          length: number
          name: string
          notes: string
          loopos_ready: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          loop_id: string
          lane: string
          start: number
          length: number
          name: string
          notes: string
          loopos_ready?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          loop_id?: string
          lane?: string
          start?: number
          length?: number
          name?: string
          notes?: string
          loopos_ready?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'loopos_clips_loop_id_fkey'
            columns: ['loop_id']
            referencedRelation: 'loopos_loops'
            referencedColumns: ['id']
          },
        ]
      }
      loopos_insights: {
        Row: {
          id: string
          loop_id: string
          generated_at: string
          insights_json: Json
        }
        Insert: {
          id?: string
          loop_id: string
          generated_at?: string
          insights_json: Json
        }
        Update: {
          id?: string
          loop_id?: string
          generated_at?: string
          insights_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: 'loopos_insights_loop_id_fkey'
            columns: ['loop_id']
            referencedRelation: 'loopos_loops'
            referencedColumns: ['id']
          },
        ]
      }
      [table: string]: GenericTable
    }
    Views: {
      [view: string]: {
        Row: Record<string, any>
      }
    }
    Functions: Record<string, unknown>
    Enums: Record<string, unknown>
  }
}


