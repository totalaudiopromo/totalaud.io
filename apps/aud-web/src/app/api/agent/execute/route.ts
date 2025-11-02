/**
 * Agent Execution API
 * Phase 14.8: Execute specific agent actions from SignalPanel
 *
 * POST /api/agent/execute
 * Request: { action: string, campaignId?: string, context?: Record<string, any> }
 * Response: { success: boolean, result?: any, duration: number }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@aud-web/lib/supabaseClient'

export const runtime = 'edge'

interface AgentExecuteRequest {
  action: 'enrich' | 'pitch' | 'sync' | 'insights'
  campaignId?: string
  context?: Record<string, any>
}

interface AgentExecuteResponse {
  success: boolean
  result?: any
  duration: number
  agent: string
  summary?: string
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = (await request.json()) as AgentExecuteRequest
    const { action, campaignId, context } = body

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 })
    }

    // Get Supabase client
    const supabase = getSupabaseClient()

    // Get authenticated user (optional - allow demo mode)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Execute action based on type
    let result: any
    let summary: string

    switch (action) {
      case 'enrich':
        // TODO: Call contact enrichment service
        // For now, return mock success
        result = { enriched: 0, total: 0 }
        summary = 'contacts enriched successfully'
        break

      case 'pitch':
        // TODO: Call pitch generation service
        result = { pitchId: crypto.randomUUID(), status: 'draft' }
        summary = 'pitch draft generated'
        break

      case 'sync':
        // TODO: Call tracker sync service
        result = { synced: true, lastSync: new Date().toISOString() }
        summary = 'tracking data synced'
        break

      case 'insights':
        // TODO: Call insights generation service
        result = { insights: [] }
        summary = 'insights generated'
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const duration = Date.now() - startTime

    // Log agent execution to database (only if authenticated)
    if (campaignId && user) {
      await supabase.from('agent_results').insert({
        campaign_id: campaignId,
        agent: action,
        summary,
        took_ms: duration,
        result,
      })
    }

    const response: AgentExecuteResponse = {
      success: true,
      result,
      duration,
      agent: action,
      summary,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[Agent Execute] Error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
