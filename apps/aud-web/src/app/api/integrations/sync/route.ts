/**
 * Integrations Sync Endpoint
 *
 * POST /api/integrations/sync
 * Body: { sessionId?: string, providers?: string[] }
 *
 * Runs TrackerAgent.execute() to fetch metrics from connected integrations.
 * Returns normalised metrics summary and writes to campaign_results.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@aud-web/lib/supabase/server'
import { createTrackerAgent } from '@total-audio/core-agent-executor/server'
import { logger } from '@total-audio/core-logger'
import { validateRequestBody, ValidationError, validationErrorResponse } from '@aud-web/lib/api-validation'

const log = logger.scope('IntegrationsSyncAPI')

const integrationsSyncSchema = z.object({
  sessionId: z.string().uuid().optional(),
  providers: z.array(z.enum(['gmail', 'google_sheets', 'spotify'])).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const { sessionId, providers } = await validateRequestBody(request, integrationsSyncSchema)

    // Get current user
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      log.warn('Unauthorised access attempt to integrations sync')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    log.info('Starting integrations sync', { sessionId, providers, userId: user.id })

    // Get or create session
    let activeSessionId = sessionId

    if (!activeSessionId) {
      // Get most recent active session for user
      const { data: sessions } = await supabase
        .from('agent_sessions')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (sessions && sessions.length > 0) {
        activeSessionId = sessions[0].id
      } else {
        // Create a new session if none exists
        const { data: newSession } = await supabase
          .from('agent_sessions')
          .insert({
            user_id: user.id,
            goal: 'general',
            status: 'active',
          })
          .select('id')
          .single()

        if (newSession) {
          activeSessionId = newSession.id
        }
      }
    }

    if (!activeSessionId) {
      return NextResponse.json(
        { error: 'No active session found. Please start a campaign first.' },
        { status: 400 }
      )
    }

    // Create Tracker agent
    const tracker = createTrackerAgent({
      supabaseClient: supabase as any,
      sessionId: activeSessionId,
      userId: user.id,
    })

    // Execute sync
    const startTime = Date.now()
    const result = await tracker.execute()
    const syncDuration = Date.now() - startTime

    // Log sync attempt
    const integrationTypes = []
    if (result.metrics.gmail) integrationTypes.push('gmail')
    if (result.metrics.sheets) integrationTypes.push('google_sheets')

    for (const integrationType of integrationTypes) {
      await supabase.from('integration_sync_logs').insert({
        user_id: user.id,
        integration_type: integrationType,
        status: result.success ? 'success' : 'error',
        records_synced:
          integrationType === 'gmail'
            ? result.metrics.gmail?.sent || 0
            : result.metrics.sheets?.totalContacts || 0,
        sync_duration_ms: syncDuration,
        error_message: result.errors?.join(', '),
      })
    }

    log.info('Integrations sync completed', {
      sessionId: activeSessionId,
      success: result.success,
      integrationTypes,
      syncDurationMs: syncDuration
    })

    // Return normalised response
    return NextResponse.json({
      success: result.success,
      message: result.message,
      metrics: {
        gmail: result.metrics.gmail
          ? {
              emailsSent: result.metrics.gmail.sent,
              replies: result.metrics.gmail.replies,
              openRate: result.metrics.gmail.openRate,
              followUpsDue: result.metrics.gmail.followUpsDue,
              lastSyncAt: result.metrics.gmail.lastSyncAt,
            }
          : null,
        sheets: result.metrics.sheets
          ? {
              totalContacts: result.metrics.sheets.totalContacts,
              newContacts: result.metrics.sheets.newContacts,
              syncHealth: result.metrics.sheets.syncHealth,
              lastModified: result.metrics.sheets.lastModified,
              lastSyncAt: result.metrics.sheets.lastSyncAt,
            }
          : null,
        syncedAt: result.metrics.syncedAt,
      },
      errors: result.errors,
      sessionId: activeSessionId,
      syncDurationMs: syncDuration,
    })
  } catch (error) {
    if (error instanceof ValidationError) {
      return validationErrorResponse(error)
    }

    log.error('Integrations sync failed', error)
    const message = error instanceof Error ? error.message : 'Failed to sync integrations'

    return NextResponse.json(
      {
        success: false,
        error: message,
        message: `Sync failed: ${message}`,
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/integrations/sync
 *
 * Returns current integration connection status
 */
export async function GET() {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      log.warn('Unauthorised access to integration status')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    log.debug('Fetching integration status', { userId: user.id })

    // Get active connections
    const { data: connections } = await supabase
      .from('integration_connections')
      .select('provider, status, connected_at, metadata')
      .eq('user_id', user.id)
      .eq('status', 'active')

    // Get last sync logs
    const { data: syncLogs } = await supabase
      .from('integration_sync_logs')
      .select('integration_type, status, synced_at, records_synced')
      .eq('user_id', user.id)
      .order('synced_at', { ascending: false })
      .limit(10)

    log.info('Integration status fetched', {
      connectionCount: connections?.length || 0,
      syncLogsCount: syncLogs?.length || 0
    })

    return NextResponse.json({
      connections: connections || [],
      lastSyncs: syncLogs || [],
    })
  } catch (error) {
    log.error('Failed to fetch integration status', error)
    return NextResponse.json({ error: 'Failed to get integration status' }, { status: 500 })
  }
}
