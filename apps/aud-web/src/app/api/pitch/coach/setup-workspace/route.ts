/**
 * POST /api/pitch/coach/setup-workspace
 *
 * Turns a Deep Dive conversation into a set-up workspace. The artist has just
 * spent time telling the coach who they are and what the record is about — this
 * reads that whole transcript and pulls out the concrete things worth keeping:
 * a few captured ideas, opening drafts for the pitch sections, and a release
 * date if one came up. It returns a plan; the client applies it through the
 * existing Ideas / Pitch / Timeline stores so everything syncs the normal way.
 *
 * This is the agentic-first move: the conversation isn't a novelty, it's the
 * thing that furnishes the workspace. Nothing is sent anywhere and nothing is
 * overwritten without the artist seeing it — the client only fills empty
 * sections and only seeds an empty timeline.
 */

import { NextRequest, NextResponse } from 'next/server'
import { completeWithAnthropic } from '@total-audio/core-ai-provider'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { createRouteSupabaseClient } from '@aud-web/lib/supabase/server'

const log = logger.scope('CoachSetupWorkspaceAPI')

const requestSchema = z.object({
  transcript: z
    .array(
      z.object({
        role: z.enum(['user', 'coach']),
        content: z.string(),
      })
    )
    .min(2, 'Need a bit more of a conversation to work from'),
  pitchType: z.enum(['radio', 'press', 'playlist', 'custom']).nullish(),
})

// The shape we ask Claude to return, and validate before trusting it.
const planSchema = z.object({
  ideas: z
    .array(
      z.object({
        content: z.string().min(1).max(280),
        tag: z.enum(['content', 'brand', 'promo']),
      })
    )
    .max(8)
    .default([]),
  pitch: z
    .object({
      hook: z.string().max(600).optional().default(''),
      story: z.string().max(1200).optional().default(''),
      ask: z.string().max(600).optional().default(''),
    })
    .default({ hook: '', story: '', ask: '' }),
  releaseDate: z.string().nullish(),
  summary: z.string().max(300).default('Your workspace is set up from the conversation.'),
})

export type WorkspacePlan = z.infer<typeof planSchema>

const SYSTEM_PROMPT = `You are setting up an independent artist's workspace from a conversation they just had with their pitch coach. Read the whole exchange and pull out only what the artist actually said or clearly implied — never invent facts, names, dates or achievements they didn't give you. If something wasn't discussed, leave it empty. Better a short, true workspace than a padded, made-up one.

Return ONLY a JSON object (no prose, no code fences) with this shape:

{
  "ideas": [ { "content": "a short, concrete note worth keeping", "tag": "content" | "brand" | "promo" } ],
  "pitch": {
    "hook": "an opening line for their pitch, in their voice — only if there's enough to write one, else empty string",
    "story": "a short paragraph on who they are and what this record is, from what they told you — else empty string",
    "ask": "what they're asking for, if it came up — else empty string"
  },
  "releaseDate": "YYYY-MM-DD if a specific release date was discussed, otherwise null",
  "summary": "one plain sentence telling the artist what you've set up for them"
}

Rules:
- ideas: 3–6 items when the conversation supports it. Use "brand" for identity/sound/story notes, "content" for song/release/creative notes, "promo" for outreach/audience/pitching notes. Keep each under ~200 characters, phrased as the artist's own note-to-self.
- pitch: write in the artist's register, drawing on their actual words. Draft, not final — a strong starting point they'll refine. If the foundation is thin, return empty strings rather than generic filler.
- British English throughout.
- Output the JSON and nothing else.`

function parsePlan(raw: string): WorkspacePlan | null {
  // Strip code fences if the model added them despite instructions.
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1))
    const result = planSchema.safeParse(parsed)
    return result.success ? result.data : null
  } catch {
    return null
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createRouteSupabaseClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      log.error('Failed to verify session', sessionError)
      return NextResponse.json(
        { success: false, error: 'Failed to verify authentication' },
        { status: 500 }
      )
    }
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 })
    }

    const body = await request.json()
    const { transcript, pitchType } = requestSchema.parse(body)

    const conversation = transcript
      .map((m) => `${m.role === 'coach' ? 'COACH' : 'ARTIST'}: ${m.content}`)
      .join('\n\n')

    const targetLine = pitchType ? `\n\nThey're ultimately pitching to: ${pitchType}.` : ''

    const result = await completeWithAnthropic(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Here is the full conversation. Set up their workspace from it.${targetLine}\n\n${conversation}`,
        },
      ],
      // Bounded JSON extraction — no thinking needed, keep the budget for output.
      { max_tokens: 1500, thinking: 'disabled' }
    )

    const plan = parsePlan(result.content)
    if (!plan) {
      log.error('Could not parse workspace plan from model output')
      return NextResponse.json(
        {
          success: false,
          error: 'Could not read the conversation into a plan — give it another go',
        },
        { status: 502 }
      )
    }

    log.info('Workspace plan built from coaching session', {
      userId: session.user.id,
      ideaCount: plan.ideas.length,
      hasReleaseDate: !!plan.releaseDate,
      tokensUsed: result.tokens_used,
    })

    return NextResponse.json({ success: true, plan })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }
    log.error('Workspace setup failed', error instanceof Error ? error : undefined)
    return NextResponse.json(
      { success: false, error: 'Could not set up the workspace just now' },
      { status: 500 }
    )
  }
}
