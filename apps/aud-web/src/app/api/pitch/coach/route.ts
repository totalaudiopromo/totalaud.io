/**
 * Pitch Coach API Route
 * Phase 5: AI-powered pitch coaching
 *
 * Uses Anthropic Claude via @total-audio/core-ai-provider
 */

import { NextRequest, NextResponse } from 'next/server'
import { completeWithAnthropic } from '@total-audio/core-ai-provider'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { createRouteSupabaseClient } from '@aud-web/lib/supabase/server'

const log = logger.scope('PitchCoachAPI')

// ============ Types ============

type CoachAction = 'improve' | 'suggest' | 'rewrite'
type PitchType = 'radio' | 'press' | 'playlist' | 'custom'

// ============ Validation ============

const requestSchema = z.object({
  action: z.enum(['improve', 'suggest', 'rewrite']),
  sectionId: z.string(),
  sectionTitle: z.string(),
  content: z.string(),
  pitchType: z.enum(['radio', 'press', 'playlist', 'custom']),
  allSections: z
    .array(
      z.object({
        title: z.string(),
        content: z.string(),
      })
    )
    .optional(),
})

// ============ Prompts ============

const SYSTEM_PROMPT = `You are a friendly, experienced music industry pitch coach with 15+ years of experience helping independent artists get radio airplay, press coverage, and playlist placements.

Your approach:
- Be encouraging but honest
- Give specific, actionable feedback
- Keep responses concise and scannable
- Use British English spelling
- Never be condescending
- Reference real examples when helpful (BBC Radio 6 Music, NTS, The Line of Best Fit, etc.)

Remember: The artist is the expert on their own music. Your job is to help them communicate it better.`

const ACTION_PROMPTS: Record<CoachAction, string> = {
  improve: `Review this section and suggest 2-3 specific improvements. Keep the artist's voice but make it more compelling. Format as bullet points.`,

  suggest: `This section might be empty or incomplete. Suggest:
1. What key information should go here
2. A strong opening line they could adapt
3. Common mistakes to avoid

Keep suggestions specific to their pitch type.`,

  rewrite: `Rewrite this section to be more compelling while preserving the core message and the artist's authentic voice. The rewrite should:
- Be ready to copy-paste
- Stay under 100 words
- Feel natural, not corporate

Return ONLY the rewritten text, no explanations.`,
}

const PITCH_CONTEXT: Record<PitchType, string> = {
  radio: `This pitch is for radio DJs and producers (BBC Radio 1/6 Music, NTS, Amazing Radio, etc.). They receive 100+ submissions daily. The pitch needs to stand out immediately and give them a clear reason to play the track.`,

  press: `This pitch is for music journalists and bloggers (The Line of Best Fit, DIY Magazine, Clash, etc.). They want a story angle, not just "here's my new song." The pitch should give them something to write about.`,

  playlist: `This pitch is for Spotify editorial and independent playlist curators. They care about: mood, genre accuracy, release timing, and how the track fits their playlist's vibe. Be specific about where the track fits.`,

  custom: `This is a general pitch the artist is crafting for their own purposes. Help them communicate their music and story clearly.`,
}

const SECTION_GUIDANCE: Record<string, string> = {
  hook: `The Hook is the first thing they read. It should make them want to keep reading. Great hooks often include: a surprising fact, an emotional moment, a bold claim, or an unexpected comparison.`,

  story: `The Story section should answer "why this, why now?" - what inspired the music, what makes it personal, what journey led here. Authenticity matters more than polish.`,

  sound: `The Sound section should paint a picture using reference points. "If X met Y" works but can be cliché. Better: describe the mood, the production choices, the feeling it creates.`,

  traction: `Proof Points build credibility. Include: previous radio plays, stream counts (if impressive), notable support, press coverage, live shows. If early-career, focus on the music itself.`,

  ask: `The Ask should be specific and easy to say yes to. "I'd love for you to consider this for your evening show" beats "please play my song." Make it clear what you're asking for.`,
}

// ============ Route Handler ============

export async function POST(request: NextRequest) {
  try {
    // Authenticate request
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
      log.warn('Unauthenticated request to pitch coach')
      return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 })
    }

    const body = await request.json()
    const validated = requestSchema.parse(body)

    const { action, sectionId, sectionTitle, content, pitchType, allSections } = validated

    // Build context
    const pitchContext = PITCH_CONTEXT[pitchType]
    const sectionGuidance = SECTION_GUIDANCE[sectionId] || ''
    const actionPrompt = ACTION_PROMPTS[action]

    // Build full context if other sections have content
    let otherSectionsContext = ''
    if (allSections && allSections.length > 0) {
      const filledSections = allSections.filter((s) => s.content.trim())
      if (filledSections.length > 0) {
        otherSectionsContext = `\n\nFor context, here's what the artist has written in other sections:\n${filledSections.map((s) => `**${s.title}**: ${s.content}`).join('\n\n')}`
      }
    }

    // Build user message
    const userMessage = `## Pitch Type
${pitchContext}

## Section: ${sectionTitle}
${sectionGuidance}

## Artist's Current Content
${content.trim() || "(empty - they haven't written anything yet)"}
${otherSectionsContext}

## Your Task
${actionPrompt}`

    // Call Claude
    const result = await completeWithAnthropic(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      {
        max_tokens: 600,
        temperature: 0.7,
      }
    )

    return NextResponse.json({
      success: true,
      suggestion: result.content,
      action,
      sectionId,
      tokensUsed: result.tokens_used,
    })
  } catch (error) {
    log.error('Pitch coach error', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request format', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to get coaching suggestion' },
      { status: 500 }
    )
  }
}
