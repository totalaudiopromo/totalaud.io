/**
 * /api/intel/outcomes
 *
 * GET  — list outcomes logged against pitches (TAP outcome tracking).
 * POST — log an outcome (replied / added / declined / no_response) for a
 *        contact. This is the memory half of the release loop: what happened
 *        with each person, so the next release starts smarter.
 *
 * Proxies TAP (docs/TAP_API_REFERENCE.md). Nothing here contacts anyone —
 * outcomes are records of what already happened.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import { requireAuth } from '@/lib/api/requireAuth'
import { validateRequestBody, validationErrorResponse } from '@/lib/api-validation'
import { getTapClient, TapApiError } from '@/lib/tap/client'
import { logger } from '@/lib/logger'

const log = logger.scope('IntelOutcomesRoute')

const logOutcomeSchema = z.object({
  contact: z.string().min(1),
  status: z.enum(['pending', 'replied', 'added', 'declined', 'no_response']),
  campaign: z.string().optional(),
  pitch: z.string().optional(),
})

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response

  const tap = getTapClient()
  if (!tap.isConfigured) {
    return NextResponse.json({ data: [], has_more: false, available: false })
  }

  const { searchParams } = request.nextUrl
  const limitParam = Number(searchParams.get('limit') ?? 25)
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 25
  const startingAfter = searchParams.get('starting_after') ?? undefined

  try {
    const outcomes = await tap.listOutcomes({ limit, starting_after: startingAfter })
    return NextResponse.json({
      data: outcomes.data,
      has_more: outcomes.has_more,
      next_cursor: outcomes.next_cursor,
      available: true,
    })
  } catch (error) {
    if (error instanceof TapApiError && error.isTransient) {
      log.warn('TAP unreachable, degrading to empty outcomes', { code: error.code })
      return NextResponse.json({ data: [], has_more: false, available: false })
    }
    log.error('Outcome list failed', error instanceof Error ? error : undefined)
    return NextResponse.json({ error: 'Failed to load outcomes' }, { status: 502 })
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response

  const tap = getTapClient()
  if (!tap.isConfigured) {
    return NextResponse.json({ error: 'Outcome tracking is not available yet' }, { status: 503 })
  }

  let body: z.infer<typeof logOutcomeSchema>
  try {
    body = await validateRequestBody(request, logOutcomeSchema)
  } catch (error) {
    if (error instanceof ZodError) return validationErrorResponse(error)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  try {
    const outcome = await tap.logOutcome(body)
    return NextResponse.json({ data: outcome }, { status: 201 })
  } catch (error) {
    if (error instanceof TapApiError) {
      log.error('Outcome log failed', undefined, { status: error.status, code: error.code })
      const status = error.isTransient ? 502 : 400
      return NextResponse.json({ error: error.message }, { status })
    }
    log.error('Outcome log failed', error instanceof Error ? error : undefined)
    return NextResponse.json({ error: 'Failed to log outcome' }, { status: 500 })
  }
}
