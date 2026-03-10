/**
 * Asset List API
 * Phase 15.2-A: Core Infrastructure
 *
 * GET /api/assets/list?campaignId=&kind=&q=&tag=&page=&size=
 * Response: { assets: Asset[], total: number, page: number, size: number }
 *
 * Purpose:
 * - Lists assets for current user with filters
 * - Supports pagination
 * - Supports search by title/description
 * - Supports filtering by campaign, kind, tags
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { createRouteSupabaseClient } from '@aud-web/lib/supabase/server'

const log = logger.scope('AssetListAPI')

interface Asset {
  id: string
  user_id: string
  campaign_id: string | null
  kind: string
  title: string | null
  description: string | null
  tags: string[]
  path: string | null
  url: string | null
  mime_type: string | null
  byte_size: number | null
  is_public: boolean
  public_share_id: string
  created_at: string
  updated_at: string
}

interface ListResponse {
  success: boolean
  assets: Asset[]
  total: number
  page: number
  size: number
  duration: number
  message?: string
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const campaignId = searchParams.get('campaignId') || undefined
    const kind = searchParams.get('kind') || undefined
    const q = searchParams.get('q') || undefined // Search query
    const tag = searchParams.get('tag') || undefined
    const page = parseInt(searchParams.get('page') || '1', 10)
    const size = Math.min(parseInt(searchParams.get('size') || '50', 10), 100) // Max 100

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

    const userId = session.user.id

    // Build query
    let query = supabase
      .from('artist_assets')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    // Apply filters
    if (campaignId) {
      query = query.eq('campaign_id', campaignId)
    }

    if (kind) {
      query = query.eq('kind', kind)
    }

    if (tag) {
      query = query.contains('tags', [tag])
    }

    if (q) {
      // Search in title and description (case-insensitive)
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)
    }

    // Apply pagination
    const offset = (page - 1) * size
    query = query.range(offset, offset + size - 1)

    // Execute query
    const { data, error, count } = await query

    if (error) {
      log.error('Supabase query failed', error, { campaignId, kind, tag, q })
      return NextResponse.json(
        {
          error: 'Database query failed',
          details: error.message,
        },
        { status: 500 }
      )
    }

    const duration = Date.now() - startTime

    log.debug('Assets listed', {
      count: data?.length || 0,
      total: count || 0,
      page,
      size,
      duration,
    })

    const response: ListResponse = {
      success: true,
      assets: (data as Asset[]) || [],
      total: count || 0,
      page,
      size,
      duration,
    }

    return NextResponse.json(response)
  } catch (error) {
    const duration = Date.now() - startTime
    log.error('Asset list API error', error, { duration })

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
