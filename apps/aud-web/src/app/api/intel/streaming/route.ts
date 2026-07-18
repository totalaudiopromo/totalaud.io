/**
 * /api/intel/streaming
 *
 * Streaming stats from the artist's own exports (Phase 5,
 * docs/ROADMAP_2026.md). POST takes the text of a Spotify for Artists CSV
 * download and upserts it into streaming_stats — re-importing the same
 * export is a no-op, not a duplicate. GET returns the daily series with a
 * plain-English summary computed in code. Own data only; nothing here
 * touches the Spotify Web API (docs/STRATEGY_2026.md §5).
 */

import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import { requireAuth } from '@/lib/api/requireAuth'
import { validateRequestBody, validationErrorResponse } from '@/lib/api-validation'
import { parseStreamingCsv, summariseStreaming, type StreamingRow } from '@/lib/intel/streaming'
import { logger } from '@/lib/logger'

const log = logger.scope('StreamingStatsRoute')

// A year of daily rows is 365; leave headroom without letting one paste flood the table
const MAX_ROWS_PER_IMPORT = 1100

const importSchema = z.object({
  csv: z.string().min(1).max(1_000_000),
  source: z.literal('spotify_csv').default('spotify_csv'),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response

  let body: z.input<typeof importSchema>
  try {
    body = await validateRequestBody(request, importSchema)
  } catch (error) {
    if (error instanceof ZodError) return validationErrorResponse(error)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = parseStreamingCsv(body.csv)
  if (parsed.length === 0) {
    return NextResponse.json(
      {
        error:
          'That file did not look like a streaming export — expected a CSV with date and streams columns, like the Spotify for Artists download.',
      },
      { status: 400 }
    )
  }

  // Keep the most recent rows if someone pastes years of history
  const rows = parsed.slice(-MAX_ROWS_PER_IMPORT)

  const { error } = await auth.supabase.from('streaming_stats').upsert(
    rows.map((row) => ({
      user_id: auth.user.id,
      source: body.source ?? 'spotify_csv',
      stat_date: row.date,
      streams: row.streams,
      listeners: row.listeners,
      saves: row.saves,
      followers: row.followers,
    })),
    { onConflict: 'user_id,source,stat_date' }
  )

  if (error) {
    log.error('Streaming stats import failed', new Error(error.message))
    return NextResponse.json(
      { error: 'Could not save the import — try again shortly' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    imported: rows.length,
    from: rows[0].date,
    to: rows[rows.length - 1].date,
  })
}

export async function GET(): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response

  const { data, error } = await auth.supabase
    .from('streaming_stats')
    .select('stat_date, streams, listeners, saves, followers')
    .eq('user_id', auth.user.id)
    .order('stat_date', { ascending: true })
    .limit(400)

  if (error) {
    log.error('Could not load streaming stats', new Error(error.message))
    return NextResponse.json({ error: 'Failed to load streaming stats' }, { status: 500 })
  }

  const rows: StreamingRow[] = (data ?? []).map((row) => ({
    date: row.stat_date,
    streams: row.streams,
    listeners: row.listeners,
    saves: row.saves,
    followers: row.followers,
  }))

  const summary = summariseStreaming(rows)
  if (!summary) {
    return NextResponse.json({ empty: true })
  }

  // Small charts second (Phase 5): just the last four weeks of daily streams
  const series = rows
    .filter((row) => row.streams !== null)
    .slice(-28)
    .map((row) => ({ date: row.date, streams: row.streams as number }))

  return NextResponse.json({ empty: false, summary, series })
}
