import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/requireAuth'
import { labelDb } from '@/lib/label/db'
import { updateTrackSchema } from '@/lib/label/schemas'
import type { TrackRow } from '@/lib/label/types'
import { logger } from '@/lib/logger'

const log = logger.scope('LabelTrackRoute')

type Params = { params: Promise<{ id: string }> }

/** PATCH /api/label/tracks/[id] */
export async function PATCH(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response
  const { id } = await params
  const db = labelDb(auth.supabase)

  const parsed = updateTrackSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.format() },
      { status: 400 }
    )
  }

  const d = parsed.data
  const updates: Record<string, unknown> = {}
  if (d.title !== undefined) updates.title = d.title
  if (d.trackNumber !== undefined) updates.track_number = d.trackNumber
  if (d.durationSeconds !== undefined) updates.duration_seconds = d.durationSeconds
  if (d.isrc !== undefined) updates.isrc = d.isrc
  if (d.version !== undefined) updates.version = d.version
  if (d.status !== undefined) updates.status = d.status

  const { data, error } = await db.tracks().update(updates).eq('id', id).select().maybeSingle()

  if (error) {
    log.error('Failed to update track', error)
    return NextResponse.json({ error: 'Failed to update track' }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: 'Track not found' }, { status: 404 })
  }

  return NextResponse.json({ data: data as TrackRow })
}

/** DELETE /api/label/tracks/[id] */
export async function DELETE(_request: NextRequest, { params }: Params): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response
  const { id } = await params
  const db = labelDb(auth.supabase)

  const { error, count } = await db.tracks().delete({ count: 'exact' }).eq('id', id)

  if (error) {
    log.error('Failed to delete track', error)
    return NextResponse.json({ error: 'Failed to delete track' }, { status: 500 })
  }
  if (!count) {
    return NextResponse.json({ error: 'Track not found' }, { status: 404 })
  }

  return NextResponse.json({ data: null })
}
