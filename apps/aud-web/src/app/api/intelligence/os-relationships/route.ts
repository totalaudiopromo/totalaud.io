/**
 * OS Relationships API
 * Phase 15: CIB 2.0 - Relationship metrics over time
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

/**
 * GET /api/intelligence/os-relationships
 * Returns relationship time series for OS pairs
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    // Parse query params
    const { searchParams } = new URL(req.url)
    const campaignId = searchParams.get('campaignId')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const os = searchParams.get('os')

    // Get current relationships
    let relationshipsQuery = supabase
      .from('os_relationships')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (campaignId) {
      relationshipsQuery = relationshipsQuery.eq('campaign_id', campaignId)
    }

    if (os) {
      relationshipsQuery = relationshipsQuery.or(`os_a.eq.${os},os_b.eq.${os}`)
    }

    const { data: relationships, error: relationshipsError } = await relationshipsQuery

    if (relationshipsError) {
      console.error('[OSRelationships] Error fetching relationships:', relationshipsError)
      return NextResponse.json({ error: relationshipsError.message }, { status: 500 })
    }

    // For v1, we'll create simple time series from current state
    // In a future version, we could track relationship history in a separate table
    // For now, we'll use created_at and updated_at to create a basic series
    const relationshipSeries = (relationships || []).map((rel) => {
      const createdAt = rel.created_at
      const updatedAt = rel.updated_at

      // Create a simple 2-point series (creation and current)
      const trustSeries = [
        { at: createdAt, value: 0 }, // Assume relationships start neutral
        { at: updatedAt, value: rel.trust },
      ]

      const tensionSeries = [
        { at: createdAt, value: 0 },
        { at: updatedAt, value: rel.tension },
      ]

      const synergySeries = [
        { at: createdAt, value: 0 },
        { at: updatedAt, value: rel.synergy },
      ]

      return {
        osA: rel.os_a,
        osB: rel.os_b,
        trustSeries: filterTimeRange(trustSeries, from, to),
        tensionSeries: filterTimeRange(tensionSeries, from, to),
        synergySeries: filterTimeRange(synergySeries, from, to),
      }
    })

    return NextResponse.json({ relationships: relationshipSeries })
  } catch (error) {
    console.error('[OSRelationships] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Filter time series points by time range
 */
function filterTimeRange(
  series: Array<{ at: string; value: number }>,
  from?: string | null,
  to?: string | null
): Array<{ at: string; value: number }> {
  let filtered = series

  if (from) {
    const fromTime = new Date(from).getTime()
    filtered = filtered.filter((point) => new Date(point.at).getTime() >= fromTime)
  }

  if (to) {
    const toTime = new Date(to).getTime()
    filtered = filtered.filter((point) => new Date(point.at).getTime() <= toTime)
  }

  return filtered
}
