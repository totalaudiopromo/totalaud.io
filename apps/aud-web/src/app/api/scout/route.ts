/**
 * Scout API Route
 *
 * GET /api/scout - Fetch opportunities with filters
 *
 * Query params:
 *   - type: radio | playlist | blog | curator | press
 *   - genre: string (partial match in genres array)
 *   - vibe: string (partial match in vibes array)
 *   - size: small | medium | large
 *   - q: string (search in name, description, contact_name)
 *   - limit: number (default 50, max 100)
 *   - offset: number (default 0)
 *
 * Requires authentication (RLS policy enforces this).
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import type { Opportunity, OpportunityType, AudienceSize, OpportunitySource } from '@/types/scout'
import { requireAuth } from '@/lib/api/auth'

const log = logger.scope('ScoutAPI')

// ============================================================================
// Types for database row
// ============================================================================

interface OpportunityRow {
  id: string
  name: string
  type: string
  genres: string[] | null
  vibes: string[] | null
  audience_size: string | null
  url: string | null
  contact_email: string | null
  contact_name: string | null
  importance: number | null
  description: string | null
  source: string | null
  source_url: string | null
  last_verified_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// ============================================================================
// Response types
// ============================================================================

interface ScoutAPIResponse {
  success: boolean
  opportunities: Opportunity[]
  total: number
  limit: number
  offset: number
  filters: {
    type: string | null
    genre: string | null
    vibe: string | null
    size: string | null
    q: string | null
  }
}

interface ScoutAPIError {
  success: false
  error: string
  code?: string
}

// ============================================================================
// Normalisation
// ============================================================================

function normaliseOpportunity(row: OpportunityRow): Opportunity {
  return {
    id: row.id,
    name: row.name,
    type: row.type as OpportunityType,
    genres: row.genres || [],
    vibes: row.vibes || [],
    audienceSize: (row.audience_size || 'medium') as AudienceSize,
    link: row.url || undefined,
    contactEmail: row.contact_email || undefined,
    contactName: row.contact_name || undefined,
    description: row.description || undefined,
    source: (row.source || 'curated') as OpportunitySource,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// ============================================================================
// Route Handler
// ============================================================================

export async function GET(
  request: NextRequest
): Promise<NextResponse<ScoutAPIResponse | ScoutAPIError>> {
  const startTime = Date.now()

  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const genre = searchParams.get('genre')
    const vibe = searchParams.get('vibe')
    const size = searchParams.get('size')
    const q = searchParams.get('q')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const auth = await requireAuth({
      onSessionError: () =>
        NextResponse.json(
          { success: false, error: 'Authentication error', code: 'AUTH_ERROR' },
          { status: 401 }
        ),
      onUnauthenticated: () =>
        NextResponse.json(
          { success: false, error: 'Authentication required', code: 'UNAUTHENTICATED' },
          { status: 401 }
        ),
    })
    if (auth instanceof NextResponse) {
      return auth
    }

    const { supabase } = auth

    // Build query
    let query = supabase
      .from('opportunities')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('importance', { ascending: false })
      .order('name', { ascending: true })

    // Apply filters
    if (type) {
      query = query.eq('type', type)
    }

    if (genre) {
      // Check if genre is in the genres array (case-insensitive)
      query = query.contains('genres', [genre])
    }

    if (vibe) {
      // Check if vibe is in the vibes array
      query = query.contains('vibes', [vibe])
    }

    if (size) {
      query = query.eq('audience_size', size)
    }

    if (q && q.length >= 2) {
      // Search in name, description, and contact_name
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%,contact_name.ilike.%${q}%`)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    // Execute query
    const { data, error, count } = await query

    if (error) {
      log.error('Query error', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch opportunities', code: 'QUERY_ERROR' },
        { status: 500 }
      )
    }

    // Normalise results
    const opportunities = (data || []).map((row) => normaliseOpportunity(row as OpportunityRow))

    const duration = Date.now() - startTime
    log.info(`Returned ${opportunities.length} opportunities in ${duration}ms`)

    return NextResponse.json({
      success: true,
      opportunities,
      total: count || 0,
      limit,
      offset,
      filters: {
        type,
        genre,
        vibe,
        size,
        q,
      },
    })
  } catch (error) {
    log.error('Unexpected error', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
