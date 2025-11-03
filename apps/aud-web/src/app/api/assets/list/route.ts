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
import { getSupabaseClient } from '@aud-web/lib/supabaseClient'
import { logger } from '@/lib/logger'

export const runtime = 'edge'

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

/**
 * Generate demo fixtures for unauthenticated users
 */
function generateDemoFixtures(): Asset[] {
  return [
    {
      id: 'demo-1',
      user_id: 'demo',
      campaign_id: null,
      kind: 'audio',
      title: 'demo-track.mp3',
      description: 'Example audio file',
      tags: ['demo', 'audio'],
      path: null,
      url: null,
      mime_type: 'audio/mpeg',
      byte_size: 5242880,
      is_public: false,
      public_share_id: 'demo-share-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'demo-2',
      user_id: 'demo',
      campaign_id: null,
      kind: 'image',
      title: 'press-photo.jpg',
      description: 'Example press photo',
      tags: ['demo', 'image', 'press'],
      path: null,
      url: null,
      mime_type: 'image/jpeg',
      byte_size: 1048576,
      is_public: false,
      public_share_id: 'demo-share-2',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]
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

    // Get Supabase client
    const supabase = getSupabaseClient()

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Demo mode for unauthenticated users
    if (!user) {
      const duration = Date.now() - startTime
      const fixtures = generateDemoFixtures()

      log.debug('Demo mode: returning fixtures', { count: fixtures.length })

      const response: ListResponse = {
        success: true,
        assets: fixtures,
        total: fixtures.length,
        page: 1,
        size: fixtures.length,
        duration,
        message: 'Demo mode: showing example assets',
      }

      return NextResponse.json(response)
    }

    // Build query
    let query = supabase
      .from('artist_assets')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
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
