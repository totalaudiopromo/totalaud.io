/**
 * TAP (Total Audio Platform) API resource types.
 *
 * Mirrors docs/TAP_API_REFERENCE.md — the canonical reference for
 * api.totalaudiopromo.com/v1. Conventions:
 * - Prefixed string IDs (ctc_, cmp_, pch_, out_, enj_, act_)
 * - `object` type discriminator on every resource
 * - Unix integer seconds for datetimes; `created` (not created_at)
 * - Cursor-based pagination via `starting_after` / `ending_before`
 */

export interface TapList<T> {
  object: 'list'
  data: T[]
  has_more: boolean
  next_cursor: string | null
  url: string
}

export interface TapContactEnrichment {
  role_detail?: string
  genres?: string[]
  submission_guidelines?: string
  best_timing?: string
  bbc_station?: string
  enriched_at?: number
  [key: string]: unknown
}

export interface TapContact {
  id: string
  object: 'contact'
  name: string
  email?: string
  outlet?: string
  role?: string
  genres?: string[]
  last_contacted_at?: number | null
  imported_at?: number | null
  enriched_at?: number | null
  enrichment?: TapContactEnrichment
  created: number
}

export interface TapCampaign {
  id: string
  object: 'campaign'
  name: string
  artist_name?: string
  status: string
  platform?: string
  start_date?: string
  end_date?: string
  created: number
}

export interface TapPitch {
  id: string
  object: 'pitch'
  contact: string
  campaign?: string
  subject?: string
  body?: string
  pitched_at?: number | null
  created: number
}

/** Closed enum — treat unknown values as 'pending' for forward compatibility. */
export type TapOutcomeStatus = 'pending' | 'replied' | 'added' | 'declined' | 'no_response'

export interface TapOutcome {
  id: string
  object: 'outcome'
  contact: string
  campaign?: string
  pitch?: string
  status: TapOutcomeStatus
  logged_at?: number
  created: number
}

export interface TapEnrichmentJob {
  id: string
  object: 'enrichment_job'
  status: 'running' | 'complete' | 'failed'
  contact_count: number
  created: number
}

export type TapActionQueueItemType = 'follow_up' | 'stale_contact' | 'pending_pitch'

export interface TapActionQueueItem {
  id: string
  object: 'action_queue_item'
  type: TapActionQueueItemType
  priority: number
  follow_up?: { contact: string; pitch: string; due_at: number }
  stale_contact?: { contact: string; last_contacted_at: number }
  pending_pitch?: { pitch: string; contact: string }
  // Forward compatibility: every type has a corresponding subdocument key,
  // possibly {} — unknown types carry unknown keys.
  [key: string]: unknown
}

export interface TapErrorBody {
  error: {
    message: string
    type:
      | 'invalid_request_error'
      | 'authentication_error'
      | 'permission_error'
      | 'rate_limit_error'
      | 'api_error'
      | string
    code?: string
    param?: string
  }
}
