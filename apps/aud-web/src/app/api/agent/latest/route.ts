/**
 * Latest Agent Results API Route
 * Phase 14.4: Get latest result per agent for a campaign
 *
 * GET /api/agent/latest?campaignId={id}
 * Returns: { results: [ { agent, status, tookMs, createdAt, summary }, ... ] }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@total-audio/core-logger'

const log = logger.scope('API:AgentLatest')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const campaignId = searchParams.get('campaignId')

    if (!campaignId) {
      return NextResponse.json({ error: 'Missing campaignId parameter' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      log.warn('Unauthorized agent results request')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get latest result per agent type
    // This is a simplified query - in production you'd use a window function or subquery
    const { data, error } = await supabase
      .from('agent_results')
      .select('agent_type, status, execution_time_ms, created_at, summary')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })
      .limit(20) // Get recent results, then dedupe by agent type

    if (error) {
      log.error('Failed to fetch agent results', error)
      return NextResponse.json({ results: [] })
    }

    if (!data || data.length === 0) {
      log.debug('No agent results found', { campaignId })
      return NextResponse.json({ results: [] })
    }

    // Dedupe by agent type - keep most recent per agent
    const seenAgents = new Set<string>()
    const latestResults = data
      .filter((result) => {
        if (seenAgents.has(result.agent_type)) {
          return false
        }
        seenAgents.add(result.agent_type)
        return true
      })
      .map((result) => ({
        agent: result.agent_type,
        status: result.status || 'pending',
        tookMs: result.execution_time_ms || 0,
        createdAt: result.created_at,
        summary: result.summary || null,
      }))

    log.info('Agent results fetched', {
      campaignId,
      resultsCount: latestResults.length,
    })

    return NextResponse.json({ results: latestResults })
  } catch (error) {
    log.error('Agent latest API error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
