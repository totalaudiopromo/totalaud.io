/**
 * Asset Attachment Types
 * Phase 15.2-C: Agent Integration Layer
 *
 * Purpose:
 * - Shared interface for asset attachments across all agents
 * - Type-safe attachment handling
 * - Privacy-aware asset filtering
 *
 * Used by: PitchAgent, IntelAgent, TrackerAgent
 */

export type AssetKind = 'audio' | 'image' | 'document' | 'archive' | 'link' | 'other'

/**
 * AssetAttachment Interface
 * Represents an asset that can be attached to agent operations
 */
export interface AssetAttachment {
  id: string
  title: string
  kind: AssetKind
  url: string
  is_public: boolean
  size_bytes?: number
  mime_type?: string
  created_at?: string
}

/**
 * Agent Attachment Payload
 * Used when sending attachments to agent API routes
 */
export interface AgentAttachmentPayload {
  attachments: AssetAttachment[]
}

/**
 * Filter options for asset attachments
 */
export interface AssetAttachmentFilters {
  kind?: AssetKind
  publicOnly?: boolean
  maxSize?: number
}

/**
 * Result type for attachment operations
 */
export interface AttachmentOperationResult {
  success: boolean
  message: string
  attachedCount?: number
  warnings?: string[]
}
