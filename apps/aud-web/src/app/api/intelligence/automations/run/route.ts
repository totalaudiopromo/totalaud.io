/**
 * POST /api/intelligence/automations/run
 *
 * Runs a quick automation action using Claude.
 * Each action has a specialised system prompt.
 */

import { NextRequest, NextResponse } from 'next/server'
import { completeWithAnthropic } from '@total-audio/core-ai-provider'
import { createRouteSupabaseClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const log = logger.scope('AutomationsAPI')

const VALID_ACTIONS = [
  'suggest_contacts',
  'fix_bottleneck',
  'generate_variations',
  'clean_segments',
  'detect_rot',
  'optimize_schedule',
] as const

const requestSchema = z.object({
  action: z.enum(VALID_ACTIONS),
  payload: z.record(z.unknown()).default({}),
})

const ACTION_PROMPTS: Record<(typeof VALID_ACTIONS)[number], string> = {
  suggest_contacts: `You are a music promotion strategist. Based on what you know about independent music promotion in the UK, suggest 10 types of contacts an indie artist should reach out to for their next release. For each contact type, give:
- The type (e.g. "BBC Introducing presenter", "Independent playlist curator")
- Why they matter
- A practical tip for reaching them

Format as a JSON object: { "contacts": [{ "type": "...", "why": "...", "tip": "..." }] }`,

  fix_bottleneck: `You are a campaign strategist for independent musicians. Analyse common campaign bottlenecks and identify the most likely one for an indie artist who is mid-release. Provide:
- The bottleneck identified
- Why it happens
- 3 specific actions to fix it

Format as a JSON object: { "bottleneck": "...", "reason": "...", "actions": ["...", "...", "..."] }`,

  generate_variations: `You are a pitch writing coach for independent musicians. Generate 5 different pitch variations for an indie artist reaching out to press, radio, or playlist curators. Each variation should have a different angle:
1. Story-led (personal narrative)
2. Sound-led (sonic description)
3. Context-led (cultural moment)
4. Social-proof-led (numbers/achievements)
5. Hook-led (attention-grabbing opener)

For each, write 2-3 sentences. Format as a JSON object: { "variations": [{ "angle": "...", "pitch": "..." }] }`,

  clean_segments: `You are a data hygiene specialist for music promotion. Provide a checklist for cleaning up a contact list, identifying signs of dead or unresponsive contacts. Include:
- 5 red flags that indicate a contact is stale
- 3 actions to take for each category
- A recommended review frequency

Format as a JSON object: { "red_flags": [{ "flag": "...", "actions": ["..."] }], "review_frequency": "..." }`,

  detect_rot: `You are a campaign health analyst for independent musicians. Identify common signs of "list rot" and stale campaign data. Provide:
- 5 indicators that data needs refreshing
- For each, a suggested fix
- An overall health recommendation

Format as a JSON object: { "indicators": [{ "sign": "...", "fix": "..." }], "recommendation": "..." }`,

  optimize_schedule: `You are a send-time optimisation specialist for music promotion emails. Based on industry best practices for the UK music industry, suggest the best times to send outreach over the next 5 days. Consider:
- Press/blog editors (typically check email early morning)
- Radio producers (often review submissions mid-week)
- Playlist curators (active evenings/weekends)

Provide a schedule. Format as a JSON object: { "schedule": [{ "day": "...", "time": "...", "target": "...", "reason": "..." }] }`,
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = requestSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const { action } = validationResult.data
    const startTime = Date.now()

    // Check API key before calling Claude
    if (!process.env.ANTHROPIC_API_KEY) {
      log.error('ANTHROPIC_API_KEY not configured')
      return NextResponse.json(
        { success: false, error: 'AI service not configured' },
        { status: 503 }
      )
    }

    log.info('Running automation', { userId: user.id, action })

    const completion = await completeWithAnthropic(
      [
        { role: 'system', content: ACTION_PROMPTS[action] },
        {
          role: 'user',
          content: `Run the "${action.replace(/_/g, ' ')}" automation now. Return only valid JSON.`,
        },
      ],
      { model: 'claude-3-5-haiku-20241022', max_tokens: 1024 }
    )

    // Parse JSON from response (greedy regex to capture full nested object)
    let result: Record<string, unknown> = {}
    try {
      const jsonMatch = completion.content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0])
      }
    } catch (parseError) {
      log.warn('Failed to parse automation JSON, returning raw response', {
        action,
        error: parseError instanceof Error ? parseError.message : String(parseError),
      })
      result = { raw_response: completion.content }
    }

    const executionTimeMs = Date.now() - startTime
    log.info('Automation completed', { action, executionTimeMs })

    return NextResponse.json({
      success: true,
      result,
      executionTimeMs,
    })
  } catch (error: unknown) {
    log.error('Automation error', error instanceof Error ? error : new Error(String(error)))

    const status = (error as { status?: number })?.status
    const message = error instanceof Error ? error.message : String(error)

    if (status === 429) {
      return NextResponse.json(
        { success: false, error: 'Service is busy. Try again in a moment.' },
        { status: 429 }
      )
    }

    if (status === 401 || status === 403 || message.toLowerCase().includes('authentication')) {
      return NextResponse.json(
        { success: false, error: 'AI service authentication failed' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Automation failed. Please try again.' },
      { status: 500 }
    )
  }
}
