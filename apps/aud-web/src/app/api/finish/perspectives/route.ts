/**
 * POST /api/finish/perspectives
 *
 * Turns client-side track analysis into finishing notes from four
 * perspectives (producer, mix, listener, industry). The audio never
 * reaches this route — only the measurements computed on the artist's
 * device plus their own words about the track.
 *
 * Claude is the reasoning layer here, invisible to the artist
 * (docs/VISION.md — perspectives, not agents). Notes persist to
 * finish_notes so they survive reload and can feed the release loop.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import { completeWithAnthropic } from '@total-audio/core-ai-provider'
import { requireAuth } from '@/lib/api/requireAuth'
import { validateRequestBody, validationErrorResponse } from '@/lib/api-validation'
import {
  buildSystemPrompt,
  buildUserPrompt,
  parseFinishingNotes,
  PERSPECTIVE_IDS,
  type PerspectiveId,
  type TrackContext,
} from '@/lib/finish/perspectives'
import type { AnalysisResult } from '@/lib/finisher-client'
import type { Json } from '@total-audio/schemas-database'
import { logger } from '@/lib/logger'

const log = logger.scope('FinishPerspectivesRoute')

const suggestionSchema = z.object({
  category: z.string(),
  severity: z.enum(['critical', 'warning', 'info']),
  message: z.string(),
  action: z.string(),
  metric_name: z.string().nullable(),
  current_value: z.number().nullable(),
  target_value: z.number().nullable(),
})

const analysisSchema = z.object({
  integrated_lufs: z.number(),
  true_peak_dbfs: z.number(),
  loudness_range_lu: z.number(),
  dynamic_range_db: z.number(),
  crest_factor_db: z.number(),
  rms_db: z.number(),
  stereo_width: z.number(),
  mid_side_ratio: z.number(),
  correlation: z.number(),
  dc_offset: z.number(),
  silence_ratio: z.number(),
  sample_rate: z.number(),
  channels: z.number(),
  duration_seconds: z.number(),
  spectral_centroid_hz: z.number(),
  spectral_rolloff_hz: z.number(),
  qc_passed: z.boolean(),
  qc_warnings: z.array(z.string()),
  suggestions: z.array(suggestionSchema),
})

const requestSchema = z.object({
  analysis: analysisSchema,
  context: z
    .object({
      trackName: z.string().max(200).optional(),
      genre: z.string().max(200).optional(),
      intent: z.string().max(1000).optional(),
      references: z.string().max(500).optional(),
      unsureAbout: z.string().max(1000).optional(),
    })
    .default({}),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Guests get a real taste before sign-up (STRATEGY_2026 §4, "real value
  // before sign-up"): the listener perspective, not persisted. Signed-in
  // artists get all four perspectives, saved to their notes.
  const auth = await requireAuth()
  const isGuest = !auth.ok

  let body: z.input<typeof requestSchema>
  try {
    body = await validateRequestBody(request, requestSchema)
  } catch (error) {
    if (error instanceof ZodError) return validationErrorResponse(error)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const analysis = body.analysis as AnalysisResult
  const context = (body.context ?? {}) as TrackContext
  const perspectives: readonly PerspectiveId[] = isGuest ? ['listener'] : PERSPECTIVE_IDS

  try {
    const result = await completeWithAnthropic(
      [
        { role: 'system', content: buildSystemPrompt(perspectives) },
        { role: 'user', content: buildUserPrompt(analysis, context, perspectives) },
      ],
      { max_tokens: isGuest ? 1200 : 3000 }
    )

    const notes = parseFinishingNotes(result.content)

    if (isGuest) {
      return NextResponse.json({
        notes,
        guest: true,
        locked: PERSPECTIVE_IDS.filter((id) => !perspectives.includes(id)),
      })
    }

    // Persist quietly — a failed insert should never cost the artist their notes
    const { error: insertError } = await auth.supabase.from('finish_notes').insert({
      user_id: auth.user.id,
      track_name: context.trackName ?? null,
      analysis: analysis as unknown as Json,
      notes: notes as unknown as Json,
    })
    if (insertError) {
      log.warn('Could not persist finishing notes', { code: insertError.code })
    }

    return NextResponse.json({ notes })
  } catch (error) {
    log.error('Perspectives generation failed', error instanceof Error ? error : undefined)
    return NextResponse.json(
      { error: 'Finishing notes are taking a moment — try again shortly' },
      { status: 502 }
    )
  }
}

/** GET /api/finish/perspectives — recent saved notes for the signed-in artist. */
export async function GET(): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response

  const { data, error } = await auth.supabase
    .from('finish_notes')
    .select('id, track_name, notes, created_at')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    log.error('Could not load finishing notes', error)
    return NextResponse.json({ error: 'Failed to load notes' }, { status: 500 })
  }

  return NextResponse.json({ data: data ?? [] })
}
