/**
 * POST /api/pitch/consistency
 *
 * The tone guardian: checks a draft (pitch, bio, caption) against the
 * artist's saved identity so every piece of writing tells the same story
 * (docs/VISION.md §4). Observations and options, never forced rewrites.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import { completeWithAnthropic } from '@total-audio/core-ai-provider'
import { requireAuth } from '@/lib/api/requireAuth'
import { validateRequestBody, validationErrorResponse } from '@/lib/api-validation'
import {
  buildConsistencySystemPrompt,
  buildConsistencyUserPrompt,
  hasUsableIdentity,
  parseConsistencyResult,
  type IdentitySnapshot,
} from '@/lib/pitch/consistency'
import { logger } from '@/lib/logger'

const log = logger.scope('PitchConsistencyRoute')

const requestSchema = z.object({
  draft: z.string().min(20, 'The draft needs a little more text to check').max(8000),
  kind: z.enum(['pitch', 'bio', 'caption', 'press note']).default('pitch'),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response

  let body: z.input<typeof requestSchema>
  try {
    body = await validateRequestBody(request, requestSchema)
  } catch (error) {
    if (error instanceof ZodError) return validationErrorResponse(error)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { data: identityRow, error: identityError } = await auth.supabase
    .from('artist_identities')
    .select(
      'brand_tone, brand_themes, key_phrases, one_liner, press_angle, pitch_hook, comparisons, bio_short'
    )
    .eq('user_id', auth.user.id)
    .maybeSingle()

  if (identityError) {
    log.error('Identity load failed', identityError)
    return NextResponse.json({ error: 'Could not load your identity' }, { status: 500 })
  }

  const identity: IdentitySnapshot = {
    tone: identityRow?.brand_tone ?? null,
    themes: identityRow?.brand_themes ?? null,
    keyPhrases: identityRow?.key_phrases ?? null,
    oneLiner: identityRow?.one_liner ?? null,
    pressAngle: identityRow?.press_angle ?? null,
    pitchHook: identityRow?.pitch_hook ?? null,
    comparisons: identityRow?.comparisons ?? null,
    bioShort: identityRow?.bio_short ?? null,
  }

  if (!hasUsableIdentity(identity)) {
    return NextResponse.json({ available: false, reason: 'no_identity' })
  }

  try {
    const result = await completeWithAnthropic(
      [
        { role: 'system', content: buildConsistencySystemPrompt() },
        {
          role: 'user',
          content: buildConsistencyUserPrompt(body.draft, body.kind ?? 'pitch', identity),
        },
      ],
      { max_tokens: 1200, thinking: 'disabled' }
    )

    const check = parseConsistencyResult(result.content)
    return NextResponse.json({ available: true, check })
  } catch (error) {
    log.error('Consistency check failed', error instanceof Error ? error : undefined)
    return NextResponse.json(
      { error: 'The check is taking a moment, try again shortly' },
      { status: 502 }
    )
  }
}
