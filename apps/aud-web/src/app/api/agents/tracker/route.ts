/**
 * Tracker Agent API Route
 * Phase 15.2-D: Full Agent UI Integration
 *
 * Purpose:
 * - Fetch outreach logs with asset attachments
 * - Returns logs from tracker-with-assets system
 *
 * POST /api/agents/tracker
 * Body: {
 *   sessionId: string
 *   userId?: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import type { OutreachLog } from '@/lib/tracker-with-assets'
import { createRouteSupabaseClient } from '@aud-web/lib/supabase/server'

const log = logger.scope('TrackerAgentAPI')

const trackerRequestSchema = z.object({
  sessionId: z.string(),
  userId: z.string().optional(),
  campaignId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json()
    const { sessionId, userId, campaignId } = trackerRequestSchema.parse(body)

    log.info('Tracker request received', { sessionId, userId, campaignId })

    const supabase = await createRouteSupabaseClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      log.error('Failed to verify session', sessionError)
      return NextResponse.json({ error: 'Failed to verify authentication' }, { status: 500 })
    }

    if (!session) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    if (userId && userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!campaignId) {
      return NextResponse.json({ error: 'campaignId is required' }, { status: 400 })
    }

    const logs = await fetchOutreachLogs(supabase, {
      sessionId,
      userId: session.user.id,
      campaignId,
    })

    return NextResponse.json(
      {
        success: true,
        logs,
        metadata: {
          sessionId,
          logCount: logs.length,
          assetsAttached: logs.filter((l) => l.asset_id).length,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    log.error('Tracker fetch failed', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Tracker fetch failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Fetch outreach logs from database
 * Queries campaign_outreach_logs table and joins with artist_assets
 */
interface DbOutreachLog {
  id: string
  contact_id?: string
  contact_name: string
  message_preview: string
  asset_ids?: string[]
  sent_at: string
  status: string
  created_at: string
}

async function fetchOutreachLogs(
  supabase: Awaited<ReturnType<typeof createRouteSupabaseClient>>,
  params: { sessionId: string; userId: string; campaignId: string }
): Promise<OutreachLog[]> {
  const { sessionId, userId, campaignId } = params
  log.debug('Fetching outreach logs', { sessionId, userId, campaignId })

  try {
    // Query outreach logs for this campaign
    const { data: logs, error } = await supabase
      .from('campaign_outreach_logs')
      .select(
        'id, contact_id, contact_name, message_preview, asset_ids, sent_at, status, created_at'
      )
      .eq('user_id', userId)
      .eq('campaign_id', campaignId)
      .order('sent_at', { ascending: false })
      .limit(50)

    if (error) {
      log.warn('Failed to fetch outreach logs from database', { error })
      return []
    }

    if (!logs || logs.length === 0) {
      return []
    }

    // Map database records to OutreachLog type
    const mappedLogs: OutreachLog[] = (logs as DbOutreachLog[]).map((dbLog) => ({
      id: dbLog.id,
      session_id: sessionId,
      user_id: userId,
      contact_id: dbLog.contact_id || undefined,
      contact_name: dbLog.contact_name,
      message: dbLog.message_preview,
      asset_id: dbLog.asset_ids?.[0], // Use first asset for display
      asset_title: undefined, // Would need to join with artist_assets table
      asset_kind: undefined, // Would need to join with artist_assets table
      sent_at: dbLog.sent_at,
      status: dbLog.status as 'sent' | 'replied' | 'bounced' | 'pending',
      created_at: dbLog.created_at,
    }))

    return mappedLogs
  } catch (error) {
    log.warn('Failed to fetch outreach logs', { error })
    return []
  }
}
