/**
 * TAP Tracker Campaigns Proxy Route
 *
 * Creates and lists campaigns in Total Audio Platform's Tracker service.
 * Used by Timeline Mode to log submissions and track outreach.
 *
 * GET  /api/tap/tracker/campaigns - List campaigns
 * POST /api/tap/tracker/campaigns - Create campaign
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { createRouteSupabaseClient } from '@aud-web/lib/supabase/server'
import { tapClient, TotalAudioApiError } from '@/lib/tap-client'

const log = logger.scope('TAPTrackerCampaigns')

// Request validation schema for creating campaigns
// Note: platform and genre are optional strings because TAP Tracker has
// specific database check constraints that may not match these enums.
// The TAP database will validate the actual values.
const createCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  artist_name: z.string().optional(),
  status: z
    .enum(['planning', 'active', 'completed', 'paused', 'draft'])
    .optional()
    .default('active'),
  platform: z.string().optional(), // TAP DB has its own constraints
  genre: z.string().optional(), // TAP DB has its own constraints
  target_type: z.string().optional(), // TAP DB has its own constraints
  notes: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  budget: z.number().optional(),
  target_reach: z.number().optional(),
})

/**
 * GET /api/tap/tracker/campaigns
 * List all campaigns with metrics and patterns
 */
/**
 * Helper to verify authentication
 */
async function verifyAuth() {
  const supabase = await createRouteSupabaseClient()
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  return { session, sessionError, supabase }
}

export async function GET() {
  try {
    // Authenticate request
    const { session, sessionError } = await verifyAuth()

    if (sessionError) {
      log.error('Failed to verify session', sessionError)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AUTH_ERROR',
            message: 'Failed to verify authentication',
          },
        },
        { status: 500 }
      )
    }

    if (!session) {
      log.warn('Unauthenticated request to Tracker campaigns GET')
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORISED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      )
    }

    // Check if Tracker is configured
    if (!tapClient.isConfigured('tracker')) {
      log.warn('Tracker API not configured')
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_CONFIGURED',
            message: 'Tracker service is not configured',
          },
        },
        { status: 503 }
      )
    }

    log.info('Fetching campaigns')

    const result = await tapClient.tracker.listCampaigns(session.user.id)

    log.info('Campaigns fetched', { count: result.campaigns.length })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    if (error instanceof TotalAudioApiError) {
      log.error('TAP Tracker API error', undefined, { code: error.code, status: error.status })
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: error.status }
      )
    }

    log.error('Unexpected error fetching campaigns', error as Error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch campaigns',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/tap/tracker/campaigns
 * Create a new campaign (used when logging timeline submissions)
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const { session, sessionError } = await verifyAuth()

    if (sessionError) {
      log.error('Failed to verify session', sessionError)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AUTH_ERROR',
            message: 'Failed to verify authentication',
          },
        },
        { status: 500 }
      )
    }

    if (!session) {
      log.warn('Unauthenticated request to Tracker campaigns POST')
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORISED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      )
    }

    // Check if Tracker is configured
    if (!tapClient.isConfigured('tracker')) {
      log.warn('Tracker API not configured')
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_CONFIGURED',
            message: 'Tracker service is not configured',
          },
        },
        { status: 503 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = createCampaignSchema.safeParse(body)

    if (!validationResult.success) {
      log.warn('Validation failed', { errors: validationResult.error.errors })
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            details: validationResult.error.errors,
          },
        },
        { status: 400 }
      )
    }

    const campaignData = validationResult.data

    log.info('Creating campaign', { name: campaignData.name, platform: campaignData.platform })

    const campaign = await tapClient.tracker.createCampaign(campaignData, session.user.id)

    log.info('Campaign created', { campaignId: campaign.id })

    return NextResponse.json({
      success: true,
      data: {
        campaign,
      },
    })
  } catch (error) {
    if (error instanceof TotalAudioApiError) {
      log.error('TAP Tracker API error', undefined, { code: error.code, status: error.status })
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: error.status }
      )
    }

    log.error('Unexpected error creating campaign', error as Error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create campaign',
        },
      },
      { status: 500 }
    )
  }
}
