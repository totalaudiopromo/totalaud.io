/**
 * Curated Contacts API Route
 *
 * GET /api/contacts/curated -- curated industry contacts, tier-gated.
 *
 * Sourced live from TAP (docs/TAP_API_REFERENCE.md, docs/STRATEGY_2026.md §7)
 * — TAP holds the enriched contact data; totalaud.io never mirrors it.
 * Previously this queried a local `aud_curated_contacts` table that was
 * never created in this project, so the grid always errored.
 *
 * Query params:
 *   - type: radio | press | playlist | blog | podcast
 *   - genre: string (matches in genres array)
 *   - q: string (search name, outlet, role)
 *   - limit: number (default 20, capped by tier)
 *   - offset: number (default 0)
 *
 * Tier limits:
 *   - No subscription: 10 contacts (name + outlet only, email hidden)
 *   - Starter (GBP5): 50 contacts with full detail
 *   - Pro (GBP19): 500 contacts with full detail
 *   - Power (GBP79): all contacts with full detail
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/requireAuth'
import { getTapClient, TapApiError } from '@/lib/tap/client'
import type { TapContact } from '@/lib/tap/types'
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

// TAP pages are 100 max; cap the fetch loop so one request can't fan out
// unboundedly. 5 pages covers the Pro tier fully.
const TAP_PAGE_SIZE = 100
const MAX_TAP_PAGES = 5

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

function toCuratedContact(contact: TapContact, showEmail: boolean): CuratedContact {
  const enrichment = contact.enrichment ?? {}
  return {
    id: contact.id,
    name: contact.name ?? null,
    outlet: contact.outlet ?? null,
    role: contact.role ?? (enrichment.role_detail as string | undefined) ?? null,
    email: showEmail ? (contact.email ?? null) : null,
    platformType: (enrichment.platform_type as string | undefined) ?? null,
    genres: contact.genres ?? enrichment.genres ?? [],
    coverageArea: (enrichment.coverage_area as string | undefined) ?? null,
    geographicScope: (enrichment.geographic_scope as string | undefined) ?? null,
    contactMethod: showEmail ? ((enrichment.contact_method as string | undefined) ?? null) : null,
    bestTiming: showEmail ? (enrichment.best_timing ?? null) : null,
    submissionGuidelines: showEmail ? (enrichment.submission_guidelines ?? null) : null,
    pitchTips: showEmail ? ((enrichment.pitch_tips as string[] | undefined) ?? []) : [],
    bbcStation: enrichment.bbc_station ?? null,
    enrichmentConfidence: contact.enriched_at ? 'High' : null,
  }
}

function matchesFilters(
  contact: CuratedContact,
  filters: { type: string | null; genre: string | null; q: string | null }
): boolean {
  if (filters.type && contact.platformType !== filters.type) return false
  if (filters.genre && !contact.genres.some((g) => g.toLowerCase() === filters.genre)) return false
  if (filters.q) {
    const haystack = [contact.name, contact.outlet, contact.role]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    if (!haystack.includes(filters.q)) return false
  }
  return true
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response

  try {
    const { searchParams } = request.nextUrl
    const filters = {
      type: searchParams.get('type'),
      genre: searchParams.get('genre')?.toLowerCase() ?? null,
      q: (searchParams.get('q')?.length ?? 0) >= 2 ? searchParams.get('q')!.toLowerCase() : null,
    }
    const requestedLimit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Get subscription tier
    const { data: profile } = await auth.supabase
      .from('user_profiles')
      .select('subscription_tier, subscription_status')
      .eq('id', auth.user.id)
      .single()

    const tierRaw = profile?.subscription_tier?.toLowerCase().replace('-', '_') || ''
    const isActive =
      profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing'
    const tier = isActive ? tierRaw : ''
    const maxContacts = TIER_CONTACT_LIMITS[tier] ?? FREE_LIMIT
    const showEmail = maxContacts > FREE_LIMIT

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

    const tap = getTapClient()
    if (!tap.isConfigured) {
      return NextResponse.json({
        success: true,
        contacts: [],
        total: 0,
        limit,
        offset,
        tier: tier || 'free',
        maxContacts,
        upgradeRequired: false,
        available: false,
      })
    }

    // Fetch pages from TAP up to the tier cap, filtering as we go.
    const matched: CuratedContact[] = []
    let cursor: string | undefined
    let hasMore = true
    let pages = 0

    while (hasMore && pages < MAX_TAP_PAGES && matched.length < maxContacts) {
      const page = await tap.listContacts({ limit: TAP_PAGE_SIZE, starting_after: cursor })
      for (const contact of page.data) {
        const curated = toCuratedContact(contact, showEmail)
        if (matchesFilters(curated, filters)) matched.push(curated)
      }
      hasMore = page.has_more
      cursor = page.next_cursor ?? undefined
      pages += 1
    }

    const capped = matched.slice(0, maxContacts)
    const pageOfContacts = capped.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      contacts: pageOfContacts,
      total: capped.length,
      limit,
      offset,
      tier: tier || 'free',
      maxContacts,
      upgradeRequired: matched.length > maxContacts,
      available: true,
    })
  } catch (error) {
    // Any TAP failure — unreachable (transient) or rejected (a bad/expired key
    // or wrong URL gives 401/403/404) — degrades to a calm empty state rather
    // than an error. The engine room being away is never the artist's problem
    // (docs/STRATEGY_2026.md §7). Non-transient failures still log at error
    // level so a misconfigured key is visible to us.
    if (error instanceof TapApiError) {
      if (error.isTransient) {
        log.warn('TAP unreachable for curated contacts', { code: error.code })
      } else {
        log.error('TAP rejected the curated-contacts request — check TAP_API_KEY/TAP_API_URL', undefined, {
          status: error.status,
          code: error.code,
        })
      }
      return NextResponse.json({
        success: true,
        contacts: [],
        total: 0,
        limit: 0,
        offset: 0,
        tier: 'free',
        maxContacts: FREE_LIMIT,
        upgradeRequired: false,
        available: false,
      })
    }
    log.error('Unexpected error', error instanceof Error ? error : undefined)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
