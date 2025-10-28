import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { logger } from '@total-audio/core-logger'

const log = logger.scope('CampaignsAPI')

// Validation schema for campaign creation
const createCampaignSchema = z.object({
  release: z.string().min(1, 'Release name is required'),
  artist: z.string().min(1, 'Artist name is required'),
  genre: z.string().optional(),
  goals: z.string().optional(),
})

/**
 * POST /api/campaigns
 * Create a new campaign
 *
 * Maps form fields to Supabase schema:
 * - release → title
 * - artist, genre, goals → stored for future schema expansion
 */
export async function POST(req: NextRequest) {
  try {
    // Validate request body
    const body = await req.json()
    const validatedData = createCampaignSchema.parse(body)

    log.info('Creating campaign', { release: validatedData.release })

    // Initialize Supabase client with service role key for auth bypass
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      log.error('Missing Supabase configuration')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get authenticated user (from session cookie)
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      log.warn('Unauthenticated campaign creation attempt')
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const userId = userData.user.id

    // Insert campaign into database
    // Note: Current schema only has title, release_date, goal_total
    // We'll store the full form data for now and update schema later
    const { data: campaign, error: insertError } = await supabase
      .from('campaigns')
      .insert({
        user_id: userId,
        title: `${validatedData.release} - ${validatedData.artist}`, // Combine release + artist
        release_date: null, // Will add date picker later
        goal_total: 50, // Default target
      })
      .select()
      .single()

    if (insertError) {
      log.error('Failed to insert campaign', insertError)
      return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
    }

    log.info('Campaign created successfully', { campaignId: campaign.id })

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        release: validatedData.release,
        artist: validatedData.artist,
        genre: validatedData.genre || '',
        goals: validatedData.goals || '',
        createdAt: campaign.created_at,
        status: 'planning', // Default status
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      log.warn('Invalid campaign data', { errors: error.errors })
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    log.error('Unexpected error creating campaign', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/campaigns
 * Fetch all campaigns for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    log.debug('Fetching campaigns')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      log.error('Missing Supabase configuration')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get authenticated user
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      log.warn('Unauthenticated campaigns fetch attempt')
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const userId = userData.user.id

    // Fetch campaigns for this user
    const { data: campaigns, error: fetchError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (fetchError) {
      log.error('Failed to fetch campaigns', fetchError)
      return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
    }

    log.info('Campaigns fetched successfully', { count: campaigns?.length || 0 })

    return NextResponse.json({
      success: true,
      campaigns: campaigns || [],
    })
  } catch (error) {
    log.error('Unexpected error fetching campaigns', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
