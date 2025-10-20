/**
 * Integrations Sync Endpoint
 *
 * POST /api/integrations/sync
 * Body: { sessionId?: string, providers?: string[] }
 *
 * Runs TrackerAgent.execute() to fetch metrics from connected integrations.
 * Returns normalized metrics summary and writes to campaign_results.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createTrackerAgent } from '@total-audio/core-agent-executor/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, providers } = body as {
      sessionId?: string
      providers?: string[]
    }

    // Get current user
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    // Return normalized response
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
    console.error('[Integrations Sync] Error:', error)
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    return NextResponse.json({
      connections: connections || [],
      lastSyncs: syncLogs || [],
    })
  } catch (error) {
    console.error('[Integrations Status] Error:', error)
    return NextResponse.json({ error: 'Failed to get integration status' }, { status: 500 })
  }
}
