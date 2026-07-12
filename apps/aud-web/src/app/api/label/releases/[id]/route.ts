import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/requireAuth'
import { labelDb } from '@/lib/label/db'
import { updateReleaseSchema } from '@/lib/label/schemas'
import type { ReleaseRow, ReleaseTaskRow, TrackRow } from '@/lib/label/types'
import { logger } from '@/lib/logger'

const log = logger.scope('LabelReleaseRoute')

type Params = { params: Promise<{ id: string }> }

/** GET /api/label/releases/[id] — release with its tracks and tasks. */
export async function GET(_request: NextRequest, { params }: Params): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response
  const { id } = await params
  const db = labelDb(auth.supabase)

  const { data: release, error } = await db.releases().select('*').eq('id', id).maybeSingle()

  if (error) {
    log.error('Failed to load release', error)
    return NextResponse.json({ error: 'Failed to load release' }, { status: 500 })
  }
  if (!release) {
    return NextResponse.json({ error: 'Release not found' }, { status: 404 })
  }

  const [tracksResult, tasksResult] = await Promise.all([
    db
      .tracks()
      .select('*')
      .eq('release_id', id)
      .order('track_number', { ascending: true, nullsFirst: false })
      .limit(200),
    db
      .tasks()
      .select('*')
      .eq('release_id', id)
      .order('due_date', { ascending: true, nullsFirst: false })
      .limit(200),
  ])

  return NextResponse.json({
    data: {
      release: release as ReleaseRow,
      tracks: (tracksResult.data ?? []) as TrackRow[],
      tasks: (tasksResult.data ?? []) as ReleaseTaskRow[],
    },
  })
}

/** PATCH /api/label/releases/[id] */
export async function PATCH(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response
  const { id } = await params
  const db = labelDb(auth.supabase)

  const parsed = updateReleaseSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.format() },
      { status: 400 }
    )
  }

  const d = parsed.data
  const updates: Record<string, unknown> = {}
  if (d.title !== undefined) updates.title = d.title
  if (d.type !== undefined) updates.type = d.type
  if (d.status !== undefined) updates.status = d.status
  if (d.releaseDate !== undefined) updates.release_date = d.releaseDate
  if (d.upc !== undefined) updates.upc = d.upc
  if (d.notes !== undefined) updates.notes = d.notes

  const { data, error } = await db.releases().update(updates).eq('id', id).select().maybeSingle()

  if (error) {
    log.error('Failed to update release', error)
    return NextResponse.json({ error: 'Failed to update release' }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: 'Release not found' }, { status: 404 })
  }

  return NextResponse.json({ data: data as ReleaseRow })
}

/** DELETE /api/label/releases/[id] — owner/manager only (RLS). */
export async function DELETE(_request: NextRequest, { params }: Params): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response
  const { id } = await params
  const db = labelDb(auth.supabase)

  const { error, count } = await db.releases().delete({ count: 'exact' }).eq('id', id)

  if (error) {
    log.error('Failed to delete release', error)
    return NextResponse.json({ error: 'Failed to delete release' }, { status: 500 })
  }
  if (!count) {
    return NextResponse.json({ error: 'Release not found' }, { status: 404 })
  }

  return NextResponse.json({ data: null })
}
