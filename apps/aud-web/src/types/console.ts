/**
 * Console Types
 * Phase 15.3: Connected Console & Orchestration
 *
 * Purpose:
 * - Type definitions for console tabs, orchestration, and node registry
 */

import type { AssetAttachment } from './asset-attachment'

/**
 * Console tabs (Plan / Do / Track / Learn)
 */
export type ConsoleTab = 'plan' | 'do' | 'track' | 'learn'

/**
 * Node kinds for agent registry
 */
export type NodeKind = 'intel' | 'pitch' | 'tracker'

/**
 * Intel agent completion payload
 * Used to seed Pitch agent with findings
 */
export interface OrchestrationIntelPayload {
  summary: string
  keyContacts: Array<{
    id?: string
    name: string
    email?: string
  }>
  keywords: string[]
  campaignId?: string
  timestamp: string
}

/**
 * Pitch agent seed data from Intel
 */
export interface OrchestrationPitchSeed {
  prefill: string
  recipients: Array<{
    id?: string
    name: string
    email?: string
  }>
  keywords: string[]
  sourceIntelId?: string
}

/**
 * Outreach log entry for Tracker
 */
export interface OutreachLog {
  id: string
  contact_id?: string
  contact_name?: string
  asset_ids: string[]
  message_preview: string
  timestamp: string
  status: 'sent' | 'replied' | 'bounced' | 'pending'
  campaign_id?: string
}

/**
 * Telemetry events for Phase 15.3
 */
export type Phase15TelemetryEvent =
  | 'node_spawned'
  | 'palette_opened'
  | 'console_tab_change'
  | 'intel_to_pitch_seed'
  | 'pitch_sent_with_assets'
  | 'tracker_log_created'
  | 'asset_quick_attach'

/**
 * Node spawn position
 */
export interface NodeSpawnPosition {
  x: number
  y: number
}
