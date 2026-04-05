/**
 * Curated Contacts API Route
 *
 * GET /api/contacts/curated -- Fetch curated contacts, tier-gated
 *
 * Query params:
 *   - type: radio | press | playlist | blog | podcast
 *   - genre: string (matches in genres array)
 *   - confidence: High | Medium
 *   - q: string (search name, outlet, role)
 *   - limit: number (default 20, max determined by tier)
 *   - offset: number (default 0)
 *
 * Tier limits:
 *   - No subscription: 10 contacts (name + outlet only, email hidden)
 *   - Starter (GBP5): 50 contacts with full detail
 *   - Pro (GBP19): 500 contacts with full detail
 *   - Power (GBP79): All contacts with full detail
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteSupabaseClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

const log = logger.scope('CuratedContactsAPI')

// Tier-based contact limits
const TIER_CONTACT_LIMITS: Record<string, number> = {
  starter: 50,
  pro: 500,
  pro_annual: 500,
  power: 10000,
  power_annual: 10000,
}

const FREE_LIMIT = 10

interface CuratedContact {
  id: string
  name: string | null
  outlet: string | null
  role: string | null
  email: string | null // null for free tier (hidden)
  platformType: string | null
  genres: string[]
  coverageArea: string | null
  geographicScope: string | null
  contactMethod: string | null
  bestTiming: string | null
  submissionGuidelines: string | null
  pitchTips: string[]
  bbcStation: string | null
  enrichmentConfidence: string | null
}

interface CuratedContactRow {
  id: string
  name: string | null
  outlet: string | null
  role: string | null
  email: string
  platform_type: string | null
  genres: string[] | null
  coverage_area: string | null
  geographic_scope: string | null
  contact_method: string | null
  best_timing: string | null
  submission_guidelines: string | null
  pitch_tips: string[] | null
  bbc_station: string | null
  enrichment_confidence: string | null
}

function normaliseContact(row: CuratedContactRow, showEmail: boolean): CuratedContact {
  return {
    id: row.id,
    name: row.name,
    outlet: row.outlet,
    role: row.role,
    email: showEmail ? row.email : null,
    platformType: row.platform_type,
    genres: row.genres ?? [],
    coverageArea: row.coverage_area,
    geographicScope: row.geographic_scope,
    contactMethod: showEmail ? row.contact_method : null,
    bestTiming: showEmail ? row.best_timing : null,
    submissionGuidelines: showEmail ? row.submission_guidelines : null,
    pitchTips: showEmail ? (row.pitch_tips ?? []) : [],
    bbcStation: row.bbc_station,
    enrichmentConfidence: row.enrichment_confidence,
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const genre = searchParams.get('genre')
    const confidence = searchParams.get('confidence')
    const q = searchParams.get('q')
    const requestedLimit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const supabase = await createRouteSupabaseClient()

    // Check auth
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get subscription tier
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('subscription_tier, subscription_status')
      .eq('id', session.user.id)
      .single()

    const tierRaw = profile?.subscription_tier?.toLowerCase().replace('-', '_') || ''
    const isActive =
      profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing'
    const tier = isActive ? tierRaw : ''
    const maxContacts = TIER_CONTACT_LIMITS[tier] ?? FREE_LIMIT
    const showEmail = maxContacts > FREE_LIMIT

    // Cap the limit to tier maximum
    const limit = Math.min(requestedLimit, maxContacts - offset)

    if (limit <= 0 || offset >= maxContacts) {
      return NextResponse.json({
        success: true,
        contacts: [],
        total: 0,
        limit: 0,
        offset,
        tier: tier || 'free',
        maxContacts,
        upgradeRequired: true,
      })
    }

    // Build query (table not yet in generated types -- cast to any until migration applied + types regenerated)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('aud_curated_contacts')
      .select(
        'id, name, outlet, role, email, platform_type, genres, coverage_area, geographic_scope, contact_method, best_timing, submission_guidelines, pitch_tips, bbc_station, enrichment_confidence',
        { count: 'exact' }
      )
      .order('enrichment_confidence', { ascending: false })
      .order('outlet', { ascending: true })

    if (type) {
      query = query.eq('platform_type', type)
    }

    if (genre) {
      query = query.contains('genres', [genre])
    }

    if (confidence) {
      query = query.eq('enrichment_confidence', confidence)
    }

    if (q && q.length >= 2) {
      const sanitised = q.replace(/[(),]/g, ' ')
      query = query.or(
        `name.ilike.%${sanitised}%,outlet.ilike.%${sanitised}%,role.ilike.%${sanitised}%`
      )
    }

    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      log.error('Query error', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch contacts' },
        { status: 500 }
      )
    }

    const contacts = (data ?? []).map((row: CuratedContactRow) => normaliseContact(row, showEmail))

    return NextResponse.json({
      success: true,
      contacts,
      total: Math.min(count ?? 0, maxContacts),
      limit,
      offset,
      tier: tier || 'free',
      maxContacts,
      upgradeRequired: (count ?? 0) > maxContacts,
    })
  } catch (error) {
    log.error('Unexpected error', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
