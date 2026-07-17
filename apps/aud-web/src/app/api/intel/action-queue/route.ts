/**
 * GET /api/intel/action-queue
 *
 * Today's prioritised follow-ups, stale contacts and pending pitches from
 * TAP's action queue (docs/TAP_API_REFERENCE.md). Quiet, in-workspace only —
 * nothing here sends anything; the artist always decides.
 *
 * Degrades gracefully: if TAP is unconfigured or unreachable this returns an
 * empty queue with `available: false` rather than an error, so the workspace
 * never blocks on the engine room (docs/STRATEGY_2026.md §7).
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/requireAuth'
import { getTapClient, TapApiError } from '@/lib/tap/client'
import { logger } from '@/lib/logger'

const log = logger.scope('IntelActionQueueRoute')

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
    const queue = await tap.listActionQueue({ limit, starting_after: startingAfter })
    return NextResponse.json({
      data: queue.data,
      has_more: queue.has_more,
      next_cursor: queue.next_cursor,
      available: true,
    })
  } catch (error) {
    if (error instanceof TapApiError && error.isTransient) {
      log.warn('TAP unreachable, degrading to empty queue', { code: error.code })
      return NextResponse.json({ data: [], has_more: false, available: false })
    }
    log.error('Action queue fetch failed', error instanceof Error ? error : undefined)
    return NextResponse.json({ error: 'Failed to load action queue' }, { status: 502 })
  }
}
