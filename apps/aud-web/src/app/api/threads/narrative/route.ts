/**
 * Signal Threads Narrative API Route
 * Phase 2: AI-powered story generation for timeline threads
 *
 * Generates:
 * - Narrative summary: The story of connected events
 * - Insights: Patterns, observations, and recommendations
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { completeWithAnthropic } from '@total-audio/core-ai-provider'
import { logger } from '@/lib/logger'
import type { SignalThreadRow } from '@/types/signal-thread'
import { requireAuth } from '@/lib/api/auth'

const log = logger.scope('ThreadNarrativeAPI')

// ============ Validation Schema ============

const narrativeSchema = z.object({
  threadId: z.string().uuid('Invalid thread ID'),
})

// ============ Prompts ============

const SYSTEM_PROMPT = `You are an expert music industry storyteller who helps artists understand and articulate the narrative arc of their journey.

Your approach:
- Analyse connected timeline events to find the story
- Identify patterns, turning points, and themes
- Craft compelling narratives that artists can use in press materials
- Provide actionable insights based on the timeline
- Use British English spelling
- Be specific, not generic

You generate narrative summaries and insights in JSON format.`

const NARRATIVE_PROMPT = `Analyse this artist's Signal Thread and create a compelling narrative.

## Thread Details
**Title**: {THREAD_TITLE}
**Type**: {THREAD_TYPE}
**Date Range**: {DATE_RANGE}

## Connected Events
{EVENTS_LIST}

## Your Task
Create a narrative summary and insights based on these connected events. Return a JSON object:

{
  "narrativeSummary": "A 2-3 paragraph story (150-250 words) that weaves these events into a compelling narrative. This should be usable in press materials, EPKs, or social media. Focus on the journey, growth, and significance of these moments.",
  "insights": [
    "Insight 1: A specific observation about patterns or significance",
    "Insight 2: A strategic recommendation based on what you see",
    "Insight 3: A potential story angle for press or content"
  ]
}

Guidelines for each thread type:
- **narrative**: Focus on the artist's creative journey and evolution
- **campaign**: Highlight strategy, execution, and results
- **creative**: Emphasise artistic development and creative decisions
- **scene**: Capture the energy and connections of live moments
- **performance**: Analyse metrics and suggest optimisations

Return ONLY the JSON object, no other text.`

// ============ Route Handler ============

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth()
    if (auth instanceof NextResponse) {
      if (auth.status === 401) {
        log.warn('Unauthenticated request to generate narrative')
      }
      return auth
    }

    const { supabase, session } = auth

    // Parse and validate body
    const body = await request.json()
    const validation = narrativeSchema.safeParse(body)

    if (!validation.success) {
      log.warn('Invalid narrative request', { errors: validation.error.errors })
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { threadId } = validation.data

    // Fetch the thread
    const threadResult = await supabase
      .from('signal_threads')
      .select('*')
      .eq('id', threadId)
      .eq('user_id', session.user.id)
      .single()

    const thread = threadResult.data as SignalThreadRow | null
    const threadError = threadResult.error

    if (threadError || !thread) {
      log.warn('Thread not found', { threadId })
      return NextResponse.json({ success: false, error: 'Thread not found' }, { status: 404 })
    }

    // Fetch connected events
    const eventIds = thread.event_ids || []
    interface TimelineEventRow {
      id: string
      title: string
      event_date: string
      event_type?: string | null
      description: string | null
    }
    let events: TimelineEventRow[] = []

    if (eventIds.length > 0) {
      const { data: eventData, error: eventsError } = await supabase
        .from('user_timeline_events')
        .select('id, title, event_date, description')
        .in('id', eventIds)
        .eq('user_id', session.user.id)
        .order('event_date', { ascending: true })

      if (eventsError) {
        log.error('Failed to fetch thread events', eventsError)
        return NextResponse.json(
          { success: false, error: 'Failed to fetch thread events' },
          { status: 500 }
        )
      }

      events = (eventData || []) as TimelineEventRow[]
    }

    // Need at least one event to generate narrative
    if (events.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Thread has no events to analyse' },
        { status: 400 }
      )
    }

    // Format events for the prompt
    const eventsList = events
      .map((e, i) => {
        const date = e.event_date ? new Date(e.event_date).toLocaleDateString('en-GB') : 'No date'
        return `${i + 1}. **${e.title}** (${date})
   Type: ${e.event_type || 'General'}
   ${e.description ? `Description: ${e.description}` : ''}`
      })
      .join('\n\n')

    // Calculate date range
    const dates = events.filter((e) => e.event_date).map((e) => new Date(e.event_date as string))
    const dateRange =
      dates.length > 0
        ? `${dates[0].toLocaleDateString('en-GB')} to ${dates[dates.length - 1].toLocaleDateString('en-GB')}`
        : 'No dates available'

    // Build prompt
    const userMessage = NARRATIVE_PROMPT.replace('{THREAD_TITLE}', thread.title)
      .replace('{THREAD_TYPE}', thread.thread_type)
      .replace('{DATE_RANGE}', dateRange)
      .replace('{EVENTS_LIST}', eventsList)

    log.info('Generating narrative', {
      threadId,
      type: thread.thread_type,
      eventCount: events.length,
    })

    // Call Claude
    const result = await completeWithAnthropic(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      {
        max_tokens: 1500,
        temperature: 0.7,
      }
    )

    // Parse JSON response
    let narrativeData
    try {
      let jsonStr = result.content.trim()
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/^```json\n?/, '').replace(/\n?```$/, '')
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```\n?/, '').replace(/\n?```$/, '')
      }

      narrativeData = JSON.parse(jsonStr)
    } catch (parseError) {
      log.error('Failed to parse narrative JSON', parseError, { content: result.content })
      return NextResponse.json(
        { success: false, error: 'Failed to parse generated narrative' },
        { status: 500 }
      )
    }

    // Update thread with narrative
    const { error: updateError } = await supabase
      .from('signal_threads')
      .update({
        narrative_summary: narrativeData.narrativeSummary,
        insights: narrativeData.insights || [],
      })
      .eq('id', threadId)
      .eq('user_id', session.user.id)

    if (updateError) {
      log.error('Failed to save narrative to thread', updateError)
      // Continue anyway, return the generated content
    }

    log.info('Generated narrative', {
      threadId,
      summaryLength: narrativeData.narrativeSummary?.length || 0,
      insightsCount: narrativeData.insights?.length || 0,
    })

    return NextResponse.json({
      success: true,
      data: {
        narrativeSummary: narrativeData.narrativeSummary,
        insights: narrativeData.insights || [],
      },
      tokensUsed: result.tokens_used,
    })
  } catch (error) {
    log.error('Narrative generation error', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate narrative' },
      { status: 500 }
    )
  }
}
