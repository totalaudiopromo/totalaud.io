/**
 * Tracker Agent
 *
 * Monitors campaign progress by syncing with external integrations:
 * - Gmail: Email tracking (sent, replies, open rate)
 * - Google Sheets: Contact list sync (total, new contacts)
 * - Writes metrics to campaign_results for the Mixdown Dashboard
 *
 * Design Principle: "Every number should represent something the user actually achieved."
 */

import { GmailClient, SheetsClient, type GmailMetrics, type SheetsMetrics } from '@total-audio/core-integrations'

// Type for Supabase client (simplified)
interface SupabaseClient {
  from(table: string): any
}

interface IntegrationConnection {
  id: string
  user_id: string
  provider: string
  access_token: string
  refresh_token?: string
  expires_at?: string
  status: string
  auto_sync_enabled?: boolean
  metadata?: Record<string, any>
  connected_at: string
}

export interface TrackerAgentOptions {
  supabaseClient: SupabaseClient
  sessionId: string
  userId: string
}

export interface TrackerMetrics {
  gmail?: GmailMetrics
  sheets?: SheetsMetrics
  syncedAt: string
}

export interface TrackerAgentResult {
  success: boolean
  metrics: TrackerMetrics
  message: string
  errors?: string[]
}

/**
 * Tracker Agent Implementation
 */
export class TrackerAgent {
  private supabase: SupabaseClient
  private sessionId: string
  private userId: string

  constructor(options: TrackerAgentOptions) {
    this.supabase = options.supabaseClient
    this.sessionId = options.sessionId
    this.userId = options.userId
  }

  /**
   * Execute tracker sync - fetches metrics from all connected integrations
   */
  async execute(): Promise<TrackerAgentResult> {
    const errors: string[] = []
    const metrics: TrackerMetrics = {
      syncedAt: new Date().toISOString(),
    }

    try {
      // Get user's integration connections
      const { data: connections, error: connectionsError } = await this.supabase
        .from('integration_connections')
        .select('*')
        .eq('user_id', this.userId)
        .eq('status', 'active')

      if (connectionsError) {
        throw new Error(`Failed to fetch integrations: ${connectionsError.message}`)
      }

      const typedConnections = connections as IntegrationConnection[] | null

      if (!typedConnections || typedConnections.length === 0) {
        return {
          success: true,
          metrics,
          message: 'No integrations connected. Connect Gmail or Google Sheets to track campaign metrics.',
          errors: ['no_integrations_connected'],
        }
      }

      // Sync Gmail metrics
      const gmailConnection = typedConnections.find((c) => c.provider === 'gmail')
      if (gmailConnection) {
        try {
          const gmailMetrics = await this.syncGmailMetrics(gmailConnection.access_token)
          metrics.gmail = gmailMetrics
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown Gmail sync error'
          errors.push(`Gmail sync failed: ${errorMessage}`)
          console.error('[TrackerAgent] Gmail sync error:', error)
        }
      }

      // Sync Google Sheets metrics
      const sheetsConnection = typedConnections.find((c) => c.provider === 'google_sheets')
      if (sheetsConnection) {
        try {
          // Get spreadsheet ID from connection metadata
          const spreadsheetId = sheetsConnection.metadata?.spreadsheet_id as string | undefined
          if (!spreadsheetId) {
            errors.push('Google Sheets connected but no spreadsheet selected')
          } else {
            const sheetsMetrics = await this.syncSheetsMetrics(
              sheetsConnection.access_token,
              spreadsheetId
            )
            metrics.sheets = sheetsMetrics
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown Sheets sync error'
          errors.push(`Sheets sync failed: ${errorMessage}`)
          console.error('[TrackerAgent] Sheets sync error:', error)
        }
      }

      // Write metrics to campaign_results
      if (metrics.gmail || metrics.sheets) {
        await this.writeToCampaignResults(metrics)
      }

      return {
        success: errors.length === 0,
        metrics,
        message: this.generateSummaryMessage(metrics, errors),
        errors: errors.length > 0 ? errors : undefined,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return {
        success: false,
        metrics,
        message: `Tracker sync failed: ${errorMessage}`,
        errors: [errorMessage],
      }
    }
  }

  /**
   * Sync Gmail metrics
   */
  private async syncGmailMetrics(accessToken: string): Promise<GmailMetrics> {
    // Default campaign tag - can be customized per session
    const campaignTag = 'campaign'

    const gmailClient = new GmailClient({
      accessToken,
      campaignTag,
      daysBack: 30, // Track last 30 days of emails
    })

    const metrics = await gmailClient.fetchMetrics()

    // Log sync to integration_sync_logs
    await this.supabase.from('integration_sync_logs').insert({
      user_id: this.userId,
      integration_type: 'gmail',
      status: 'success',
      records_synced: metrics.sent,
      sync_duration_ms: 0, // Would need to track timing
    } as any)

    return metrics
  }

  /**
   * Sync Google Sheets metrics
   */
  private async syncSheetsMetrics(
    accessToken: string,
    spreadsheetId: string
  ): Promise<SheetsMetrics> {
    const sheetsClient = new SheetsClient({
      accessToken,
      spreadsheetId,
      sheetName: 'Contacts', // Default sheet name
      newContactMarker: 'NEW', // Default marker for new contacts
    })

    const metrics = await sheetsClient.fetchMetrics()

    // Log sync to integration_sync_logs
    await this.supabase.from('integration_sync_logs').insert({
      user_id: this.userId,
      integration_type: 'google_sheets',
      status: 'success',
      records_synced: metrics.totalContacts,
      sync_duration_ms: 0, // Would need to track timing
    } as any)

    return metrics
  }

  /**
   * Write metrics to campaign_results table
   */
  private async writeToCampaignResults(metrics: TrackerMetrics): Promise<void> {
    const results: Array<{
      session_id: string
      agent_name: string
      metric_key: string
      metric_value: number
      metric_label: string
      metric_unit?: string
      metadata?: Record<string, any>
    }> = []

    // Gmail metrics
    if (metrics.gmail) {
      results.push(
        {
          session_id: this.sessionId,
          agent_name: 'tracker',
          metric_key: 'emails_sent',
          metric_value: metrics.gmail.sent,
          metric_label: 'Emails Sent',
          metric_unit: 'emails',
          metadata: { source: 'gmail' },
        },
        {
          session_id: this.sessionId,
          agent_name: 'tracker',
          metric_key: 'email_replies',
          metric_value: metrics.gmail.replies,
          metric_label: 'Replies Received',
          metric_unit: 'replies',
          metadata: { source: 'gmail' },
        },
        {
          session_id: this.sessionId,
          agent_name: 'tracker',
          metric_key: 'open_rate',
          metric_value: metrics.gmail.openRate,
          metric_label: 'Open Rate',
          metric_unit: '%',
          metadata: { source: 'gmail' },
        },
        {
          session_id: this.sessionId,
          agent_name: 'tracker',
          metric_key: 'follow_ups_due',
          metric_value: metrics.gmail.followUpsDue,
          metric_label: 'Follow-Ups Due',
          metric_unit: 'contacts',
          metadata: { source: 'gmail' },
        }
      )
    }

    // Google Sheets metrics
    if (metrics.sheets) {
      results.push(
        {
          session_id: this.sessionId,
          agent_name: 'tracker',
          metric_key: 'total_contacts',
          metric_value: metrics.sheets.totalContacts,
          metric_label: 'Total Contacts',
          metric_unit: 'contacts',
          metadata: { source: 'google_sheets', sync_health: metrics.sheets.syncHealth },
        },
        {
          session_id: this.sessionId,
          agent_name: 'tracker',
          metric_key: 'new_contacts',
          metric_value: metrics.sheets.newContacts,
          metric_label: 'New Contacts',
          metric_unit: 'contacts',
          metadata: { source: 'google_sheets' },
        }
      )
    }

    // Insert all metrics
    const { error } = await this.supabase.from('campaign_results').insert(results as any)

    if (error) {
      throw new Error(`Failed to write metrics to database: ${error.message}`)
    }

    console.log(`[TrackerAgent] Wrote ${results.length} metrics to campaign_results`)
  }

  /**
   * Generate summary message for Broker narration
   */
  private generateSummaryMessage(metrics: TrackerMetrics, errors: string[]): string {
    const parts: string[] = []

    if (metrics.gmail) {
      parts.push(
        `📧 Email Tracking: ${metrics.gmail.sent} sent, ${metrics.gmail.replies} replies (${metrics.gmail.openRate}% open rate)`
      )
      if (metrics.gmail.followUpsDue > 0) {
        parts.push(`⏰ ${metrics.gmail.followUpsDue} follow-ups due`)
      }
    }

    if (metrics.sheets) {
      parts.push(
        `🧾 Contact Sync: ${metrics.sheets.totalContacts} total contacts, ${metrics.sheets.newContacts} new`
      )
      if (metrics.sheets.syncHealth !== 'healthy') {
        parts.push(`⚠️ Sync health: ${metrics.sheets.syncHealth}`)
      }
    }

    if (errors.length > 0) {
      parts.push(`⚠️ ${errors.length} error(s) occurred during sync`)
    }

    if (parts.length === 0) {
      return 'No metrics to report. Connect Gmail or Google Sheets to track campaign progress.'
    }

    return parts.join(' | ')
  }

  /**
   * Get campaign results for display
   */
  async getCampaignResults(): Promise<Array<{
    metric_key: string
    metric_value: number
    metric_label: string
    metric_unit?: string
    updated_at: string
  }>> {
    const { data, error } = await this.supabase
      .from('campaign_results')
      .select('metric_key, metric_value, metric_label, metric_unit, updated_at')
      .eq('session_id', this.sessionId)
      .eq('agent_name', 'tracker')
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('[TrackerAgent] Error fetching results:', error)
      return []
    }

    return data || []
  }
}

/**
 * Helper function to create Tracker agent
 */
export function createTrackerAgent(options: TrackerAgentOptions): TrackerAgent {
  return new TrackerAgent(options)
}

/**
 * Execute Tracker sync (convenience function)
 */
export async function executeTrackerSync(
  options: TrackerAgentOptions
): Promise<TrackerAgentResult> {
  const tracker = new TrackerAgent(options)
  return tracker.execute()
}
