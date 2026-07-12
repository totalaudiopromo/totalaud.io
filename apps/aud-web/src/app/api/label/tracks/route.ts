import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/requireAuth'
import { labelDb } from '@/lib/label/db'
import { createTrackSchema } from '@/lib/label/schemas'
import type { TrackRow } from '@/lib/label/types'
import { logger } from '@/lib/logger'

const log = logger.scope('LabelTracksRoute')

/** GET /api/label/tracks?releaseId= */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response
  const db = labelDb(auth.supabase)

  const releaseId = request.nextUrl.searchParams.get('releaseId')
  if (!releaseId) {
    return NextResponse.json({ error: 'releaseId is required' }, { status: 400 })
  }

  const { data, error } = await db
    .tracks()
    .select('*')
    .eq('release_id', releaseId)
    .order('track_number', { ascending: true, nullsFirst: false })
    .limit(200)

  if (error) {
    log.error('Failed to load tracks', error)
    return NextResponse.json({ error: 'Failed to load tracks' }, { status: 500 })
  }

  return NextResponse.json({ data: (data ?? []) as TrackRow[] })
}

/** POST /api/label/tracks */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response
  const db = labelDb(auth.supabase)

  const parsed = createTrackSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.format() },
      { status: 400 }
    )
  }

  const d = parsed.data
  const { data, error } = await db
    .tracks()
    .insert({
      label_id: d.labelId,
      release_id: d.releaseId,
      title: d.title,
      track_number: d.trackNumber ?? null,
      duration_seconds: d.durationSeconds ?? null,
      isrc: d.isrc ?? null,
      version: d.version ?? null,
      status: d.status ?? 'draft',
    })
    .select()
    .maybeSingle()

  if (error || !data) {
    log.error('Failed to create track', error)
    return NextResponse.json({ error: 'Failed to create track' }, { status: 500 })
  }

  return NextResponse.json({ data: data as TrackRow }, { status: 201 })
}
