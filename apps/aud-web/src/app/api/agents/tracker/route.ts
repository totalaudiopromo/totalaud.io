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

const log = logger.scope('TrackerAgentAPI')

const trackerRequestSchema = z.object({
  sessionId: z.string(),
  userId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json()
    const { sessionId, userId } = trackerRequestSchema.parse(body)

    log.info('Tracker request received', { sessionId, userId })

    // Fetch outreach logs (mock data for demo)
    const logs = await fetchOutreachLogs(sessionId, userId)

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
 * In real implementation, this would query campaign_outreach_logs table
 */
async function fetchOutreachLogs(sessionId: string, userId?: string): Promise<OutreachLog[]> {
  log.debug('Fetching outreach logs', { sessionId, userId })

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Mock outreach logs for demo
  const mockLogs: OutreachLog[] = [
    {
      id: `log-${Date.now()}-1`,
      session_id: sessionId,
      user_id: userId || 'demo-user',
      contact_id: 'contact-bbc-radio1',
      contact_name: 'BBC Radio 1 Introducing',
      message: 'Hi! I\'m reaching out to share my latest single "Night Drive" for your consideration...',
      asset_id: 'asset-demo-audio-1',
      asset_title: 'Night Drive - Final Master.mp3',
      asset_kind: 'audio',
      sent_at: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
      status: 'sent',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: `log-${Date.now()}-2`,
      session_id: sessionId,
      user_id: userId || 'demo-user',
      contact_id: 'contact-spotify-uk',
      contact_name: 'Spotify UK Editorial',
      message: 'Sharing my new release for potential playlist consideration. Press kit attached...',
      asset_id: 'asset-demo-doc-1',
      asset_title: 'Artist Press Kit 2025.pdf',
      asset_kind: 'document',
      sent_at: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
      status: 'replied',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: `log-${Date.now()}-3`,
      session_id: sessionId,
      user_id: userId || 'demo-user',
      contact_id: 'contact-nme-reviews',
      contact_name: 'NME Reviews Team',
      message: 'Would love to have "Night Drive" considered for review. Bio and press photos attached.',
      asset_id: 'asset-demo-image-1',
      asset_title: 'Press Photos 2025.zip',
      asset_kind: 'archive',
      sent_at: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
      status: 'sent',
      created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
    {
      id: `log-${Date.now()}-4`,
      session_id: sessionId,
      user_id: userId || 'demo-user',
      contact_id: 'contact-amazing-radio',
      contact_name: 'Amazing Radio',
      message: 'Quick follow-up on my submission from last week. Still keen to hear your thoughts!',
      sent_at: new Date(Date.now() - 3600000 * 72).toISOString(), // 3 days ago
      status: 'pending',
      created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    },
  ]

  return mockLogs
}
