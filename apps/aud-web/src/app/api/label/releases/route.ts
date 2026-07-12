import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/requireAuth'
import { labelDb } from '@/lib/label/db'
import { createReleaseSchema } from '@/lib/label/schemas'
import type { ReleaseRow } from '@/lib/label/types'
import { logger } from '@/lib/logger'

const log = logger.scope('LabelReleasesRoute')

/** GET /api/label/releases?labelId=&artistId= */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response
  const db = labelDb(auth.supabase)

  const labelId = request.nextUrl.searchParams.get('labelId')
  const artistId = request.nextUrl.searchParams.get('artistId')
  if (!labelId) {
    return NextResponse.json({ error: 'labelId is required' }, { status: 400 })
  }

  let query = db
    .releases()
    .select('*')
    .eq('label_id', labelId)
    .order('release_date', { ascending: true, nullsFirst: false })
    .limit(500)

  if (artistId) {
    query = query.eq('artist_id', artistId)
  }

  const { data, error } = await query

  if (error) {
    log.error('Failed to load releases', error)
    return NextResponse.json({ error: 'Failed to load releases' }, { status: 500 })
  }

  return NextResponse.json({ data: (data ?? []) as ReleaseRow[] })
}

/** POST /api/label/releases */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response
  const db = labelDb(auth.supabase)

  const parsed = createReleaseSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.format() },
      { status: 400 }
    )
  }

  const d = parsed.data
  const { data, error } = await db
    .releases()
    .insert({
      label_id: d.labelId,
      artist_id: d.artistId,
      title: d.title,
      type: d.type,
      status: d.status ?? 'idea',
      release_date: d.releaseDate ?? null,
      upc: d.upc ?? null,
      notes: d.notes ?? null,
    })
    .select()
    .maybeSingle()

  if (error || !data) {
    log.error('Failed to create release', error)
    return NextResponse.json({ error: 'Failed to create release' }, { status: 500 })
  }

  return NextResponse.json({ data: data as ReleaseRow }, { status: 201 })
}
