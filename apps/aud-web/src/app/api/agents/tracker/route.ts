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
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import type { OutreachLog } from '@/lib/tracker-with-assets'
import { cookies } from 'next/headers'

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

    // Check authentication
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    let isAuthenticated = false

    if (supabaseUrl && supabaseAnonKey) {
      const cookieStore = await cookies()
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          storageKey: 'supabase-auth-token',
        },
      })

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        isAuthenticated = true
      }
    }

    // Fetch outreach logs
    const logs = await fetchOutreachLogs(
      sessionId,
      userId,
      campaignId,
      isAuthenticated,
      supabaseUrl,
      supabaseAnonKey
    )

    return NextResponse.json(
      {
        success: true,
        logs,
        demo: !isAuthenticated,
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
async function fetchOutreachLogs(
  sessionId: string,
  userId?: string,
  campaignId?: string,
  isAuthenticated?: boolean,
  supabaseUrl?: string,
  supabaseAnonKey?: string
): Promise<OutreachLog[]> {
  log.debug('Fetching outreach logs', { sessionId, userId, campaignId, isAuthenticated })

  // If not authenticated or missing env vars, return empty array (not mock data)
  if (!isAuthenticated || !supabaseUrl || !supabaseAnonKey || !userId || !campaignId) {
    log.info('Unauthenticated or missing params, returning empty logs')
    return []
  }

  try {
    const cookieStore = await cookies()
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storageKey: 'supabase-auth-token',
      },
    })

    // Query outreach logs for this campaign
    const { data: logs, error } = await supabase
      .from('campaign_outreach_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('campaign_id', campaignId)
      .order('sent_at', { ascending: false })
      .limit(50)

    if (error) {
      log.warn('Failed to fetch outreach logs from database', error)
      return []
    }

    if (!logs || logs.length === 0) {
      return []
    }

    // Map database records to OutreachLog type
    const mappedLogs: OutreachLog[] = logs.map((dbLog) => ({
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
    log.warn('Failed to fetch outreach logs', error)
    return []
  }
}
