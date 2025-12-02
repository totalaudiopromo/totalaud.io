'use client'

export type ExportArtifactType =
  | 'pitch_draft'
  | 'creative_brief'
  | 'loop_summary'
  | 'campaign_snapshot'
  | 'story_fragment'

export interface ExportArtifact {
  kind: ExportArtifactType
  title: string
  body: string
  tags: string[]
  lane?: string
}
