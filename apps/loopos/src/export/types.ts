/**
 * Export System Types
 *
 * Defines types for serializers, templates, and exporters.
 */

export type ExportFormat = 'pdf' | 'html' | 'json' | 'csv'

export type ExportType =
  | 'campaign-pack'
  | 'epk'
  | 'pr-brief'
  | 'radio-brief'
  | 'social-brief'

export interface ExportOptions {
  includeNodes?: boolean
  includeJournal?: boolean
  includeMoodboard?: boolean
  includeInsights?: boolean
  format: ExportFormat
}

export interface CampaignData {
  id: string
  name: string
  createdAt: string
  nodes: {
    id: string
    title: string
    description?: string
    status: string
  }[]
  journalEntries?: {
    id: string
    content: string
    mood?: string
    created_at: string
  }[]
  insights?: {
    flowScore: number
    momentum: string
    completedNodes: number
  }
  moodboardItems?: {
    id: string
    type: string
    content: string
    title?: string
  }[]
}

export interface EPKData {
  artistName: string
  projectName: string
  bio: string
  releaseDate?: string
  tracks: string[]
  links: {
    spotify?: string
    apple?: string
    bandcamp?: string
    instagram?: string
    website?: string
  }
  images: string[]
  quotes?: string[]
  forFansOf?: string[]
}

export interface BriefData {
  briefType: 'pr' | 'radio' | 'social'
  artistName: string
  projectName: string
  genre: string
  releaseDate?: string
  keyAngles: string[]
  targetAudience: string
  objectives: string[]
  timeline: string
}
