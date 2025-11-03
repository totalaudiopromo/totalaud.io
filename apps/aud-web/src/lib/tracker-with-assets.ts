/**
 * Tracker Agent with Asset Support
 * Phase 15.2-C: Agent Integration Layer
 *
 * Purpose:
 * - Extend TrackerAgent with asset attachment capabilities
 * - Link assets to campaign logs and outreach records
 * - Provide "view asset" functionality in Tracker UI
 *
 * Usage:
 * const tracker = createTrackerWithAssets({ supabaseClient, sessionId, userId })
 * await tracker.logOutreach({ contactId, assetId, message })
 */

import type { AssetAttachment } from '@/types/asset-attachment'
import { logger } from '@/lib/logger'

const log = logger.scope('TrackerWithAssets')

// Type for Supabase client (simplified)
interface SupabaseClient {
  from(table: string): any
}

export interface TrackerWithAssetsOptions {
  supabaseClient: SupabaseClient
  sessionId: string
  userId: string
}

export interface OutreachLog {
  id: string
  session_id: string
  user_id: string
  contact_id: string
  contact_name: string
  message: string
  asset_id?: string
  asset_title?: string
  asset_kind?: string
  sent_at: string
  status: 'sent' | 'replied' | 'bounced' | 'pending'
  created_at: string
}

export interface OutreachLogInput {
  contactId: string
  contactName: string
  message: string
  assetId?: string
  status?: 'sent' | 'replied' | 'bounced' | 'pending'
}

export interface TrackerAssetLinkResult {
  success: boolean
  message: string
  outreachLog?: OutreachLog
}

/**
 * Tracker Agent with Asset Attachment Support
 */
export class TrackerWithAssets {
  private supabase: SupabaseClient
  private sessionId: string
  private userId: string

  constructor(options: TrackerWithAssetsOptions) {
    this.supabase = options.supabaseClient
    this.sessionId = options.sessionId
    this.userId = options.userId
  }

  /**
   * Log outreach with optional asset attachment
   */
  async logOutreach(input: OutreachLogInput): Promise<TrackerAssetLinkResult> {
    try {
      const { contactId, contactName, message, assetId, status = 'sent' } = input

      log.info('Logging outreach', {
        contactId,
        hasAsset: !!assetId,
        status,
      })

      // Fetch asset details if assetId provided
      let assetDetails: Partial<AssetAttachment> | null = null
      if (assetId) {
        assetDetails = await this.fetchAssetDetails(assetId)

        if (!assetDetails) {
          log.warn('Asset not found', { assetId })
          return {
            success: false,
            message: 'Asset not found',
          }
        }

        // Log telemetry for asset usage
        log.info('Telemetry event: asset_used_in_tracker', {
          sessionId: this.sessionId,
          assetId,
          contactId,
        })
      }

      // Create outreach log entry
      const outreachLog: Partial<OutreachLog> = {
        session_id: this.sessionId,
        user_id: this.userId,
        contact_id: contactId,
        contact_name: contactName,
        message,
        asset_id: assetId || undefined,
        asset_title: assetDetails?.title || undefined,
        asset_kind: assetDetails?.kind || undefined,
        sent_at: new Date().toISOString(),
        status,
        created_at: new Date().toISOString(),
      }

      // Insert into campaign_outreach_logs table (would be real Supabase in production)
      // For demo, we'll simulate the insert
      const insertedLog = await this.insertOutreachLog(outreachLog)

      log.info('Outreach logged successfully', {
        outreachId: insertedLog.id,
        hasAsset: !!assetId,
      })

      return {
        success: true,
        message: `Outreach logged${assetId ? ' with asset attachment' : ''}`,
        outreachLog: insertedLog,
      }
    } catch (error) {
      log.error('Failed to log outreach', error)

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to log outreach',
      }
    }
  }

  /**
   * Get outreach logs with asset details
   */
  async getOutreachLogs(): Promise<OutreachLog[]> {
    try {
      log.debug('Fetching outreach logs', { sessionId: this.sessionId })

      // In real implementation, query campaign_outreach_logs table
      // For demo, return mock data
      const mockLogs: OutreachLog[] = []

      return mockLogs
    } catch (error) {
      log.error('Failed to fetch outreach logs', error)
      return []
    }
  }

  /**
   * Get asset details for viewing from tracker
   * Emits telemetry event: asset_view_from_tracker
   */
  async getAssetForView(assetId: string): Promise<AssetAttachment | null> {
    try {
      log.info('Viewing asset from tracker', { assetId })

      const asset = await this.fetchAssetDetails(assetId)

      if (asset) {
        // Log telemetry event
        log.info('Telemetry event: asset_view_from_tracker', {
          sessionId: this.sessionId,
          assetId,
        })
      }

      return asset
    } catch (error) {
      log.error('Failed to fetch asset for view', error)
      return null
    }
  }

  /**
   * Fetch asset details from database
   */
  private async fetchAssetDetails(assetId: string): Promise<AssetAttachment | null> {
    try {
      // In real implementation, query asset_uploads table
      // For demo, return null (no assets in mock database)
      log.debug('Fetching asset details', { assetId })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 100))

      return null
    } catch (error) {
      log.warn('Failed to fetch asset details', error)
      return null
    }
  }

  /**
   * Insert outreach log into database
   */
  private async insertOutreachLog(log: Partial<OutreachLog>): Promise<OutreachLog> {
    // In real implementation, use Supabase to insert
    // For demo, create mock inserted record
    const inserted: OutreachLog = {
      id: `outreach-${Date.now()}`,
      session_id: log.session_id!,
      user_id: log.user_id!,
      contact_id: log.contact_id!,
      contact_name: log.contact_name!,
      message: log.message!,
      asset_id: log.asset_id,
      asset_title: log.asset_title,
      asset_kind: log.asset_kind,
      sent_at: log.sent_at!,
      status: log.status!,
      created_at: log.created_at!,
    }

    return inserted
  }
}

/**
 * Helper function to create TrackerWithAssets instance
 */
export function createTrackerWithAssets(
  options: TrackerWithAssetsOptions
): TrackerWithAssets {
  return new TrackerWithAssets(options)
}
