/**
 * Coach Generate Endpoint
 *
 * POST /api/coach/generate
 * Body: { sessionId?: string, theme?: OSTheme }
 *
 * Generates AI-powered follow-up email drafts for unreplied contacts.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@aud-web/lib/supabase/server'
import { createCoachAgent, type OSTheme } from '@total-audio/core-agent-executor/server'
import { logger } from '@total-audio/core-logger'
import {
  validateRequestBody,
  ValidationError,
  validationErrorResponse,
} from '@aud-web/lib/api-validation'

const log = logger.scope('CoachGenerateAPI')

// Schema for coach generate request
const coachGenerateSchema = z.object({
  sessionId: z.string().uuid().optional(),
  theme: z.enum(['operator', 'guide', 'map', 'timeline', 'tape']).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const { sessionId, theme } = await validateRequestBody(request, coachGenerateSchema)

    // Get current user
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      log.warn('Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    log.info('Generating coach drafts', { sessionId, theme, userId: user.id })

    // Get or determine session
    let activeSessionId = sessionId

    if (!activeSessionId) {
      // Get most recent active session for user
      const { data: sessions } = await supabase
        .from('agent_sessions')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (sessions && sessions.length > 0) {
        activeSessionId = sessions[0].id
      } else {
        return NextResponse.json(
          { error: 'No active session found. Please start a campaign first.' },
          { status: 400 }
        )
      }
    }

    // Determine theme (default to 'operator' if not provided)
    const activeTheme: OSTheme = theme || 'operator'

    // Create Coach agent
    const coach = createCoachAgent({
      supabaseClient: supabase as any,
      sessionId: activeSessionId!,
      userId: user.id,
      theme: activeTheme,
      aiProvider: 'anthropic', // Use Claude for high-quality drafts
    })

    // Execute draft generation
    const startTime = Date.now()
    const result = await coach.execute()
    const executionTime = Date.now() - startTime

    // Write metrics to campaign_results
    if (result.drafts.length > 0) {
      await supabase.from('campaign_results').insert({
        session_id: activeSessionId,
        agent_name: 'coach',
        metric_key: 'follow_ups_generated',
        metric_value: result.drafts.length,
        metric_label: 'Follow-Ups Generated',
        metric_unit: 'drafts',
        metadata: {
          theme: activeTheme,
          execution_time_ms: executionTime,
        },
      } as any)
    }

    log.info('Coach drafts generated successfully', {
      sessionId: activeSessionId,
      draftsCount: result.drafts.length,
      executionTimeMs: executionTime,
    })

    // Return normalised response
    return NextResponse.json({
      success: result.success,
      message: result.message,
      drafts: result.drafts.map((draft) => ({
        contactEmail: draft.contact_email,
        contactName: draft.contact_name,
        subject: draft.subject,
        bodyPreview: draft.body.substring(0, 100) + '...',
        theme: draft.theme,
      })),
      totalDrafts: result.drafts.length,
      errors: result.errors,
      sessionId: activeSessionId,
      executionTimeMs: executionTime,
    })
  } catch (error) {
    if (error instanceof ValidationError) {
      return validationErrorResponse(error)
    }

    log.error('Failed to generate coach drafts', error)
    const message = error instanceof Error ? error.message : 'Failed to generate follow-ups'

    return NextResponse.json(
      {
        success: false,
        error: message,
        message: `Coach agent failed: ${message}`,
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/coach/generate
 *
 * Returns existing drafts for current session
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      log.warn('Unauthorized access to drafts')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    log.debug('Fetching coach drafts', { sessionId, userId: user.id })

    // Get drafts
    let query = supabase
      .from('coach_drafts')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'draft')
      .order('created_at', { ascending: false })

    if (sessionId) {
      query = query.eq('session_id', sessionId)
    }

    const { data: drafts, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    log.info('Coach drafts fetched', { count: drafts?.length || 0 })

    return NextResponse.json({
      drafts: drafts || [],
      total: drafts?.length || 0,
    })
  } catch (error) {
    log.error('Failed to fetch coach drafts', error)
    return NextResponse.json({ error: 'Failed to fetch drafts' }, { status: 500 })
  }
}
