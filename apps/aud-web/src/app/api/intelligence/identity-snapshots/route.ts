/**
 * Identity Snapshots API
 * Phase 15: CIB 2.0 - Time-based identity snapshots
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

/**
 * GET /api/intelligence/identity-snapshots
 * Returns identity snapshots for the current user with optional filters
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
    const limit = searchParams.get('limit') || '100'

    // Build query
    let query = supabase
      .from('os_identity_snapshots')
      .select('*')
      .eq('user_id', user.id)
      .order('taken_at', { ascending: false })
      .limit(parseInt(limit, 10))

    // Apply filters
    if (campaignId) {
      query = query.eq('campaign_id', campaignId)
    }

    if (from) {
      query = query.gte('taken_at', from)
    }

    if (to) {
      query = query.lte('taken_at', to)
    }

    const { data, error } = await query

    if (error) {
      console.error('[IdentitySnapshots] Error fetching snapshots:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ snapshots: data || [] })
  } catch (error) {
    console.error('[IdentitySnapshots] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
