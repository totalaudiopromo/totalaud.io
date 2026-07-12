import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/requireAuth'
import { labelDb } from '@/lib/label/db'
import { updateArtistSchema } from '@/lib/label/schemas'
import type { ArtistRow } from '@/lib/label/types'
import { logger } from '@/lib/logger'

const log = logger.scope('LabelArtistRoute')

type Params = { params: Promise<{ id: string }> }

/** PATCH /api/label/artists/[id] */
export async function PATCH(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response
  const { id } = await params
  const db = labelDb(auth.supabase)

  const parsed = updateArtistSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.format() },
      { status: 400 }
    )
  }

  const d = parsed.data
  const updates: Record<string, unknown> = {}
  if (d.name !== undefined) updates.name = d.name
  if (d.bio !== undefined) updates.bio = d.bio
  if (d.genres !== undefined) updates.genres = d.genres
  if (d.imageUrl !== undefined) updates.image_url = d.imageUrl
  if (d.website !== undefined) updates.website = d.website
  if (d.spotifyUrl !== undefined) updates.spotify_url = d.spotifyUrl

  const { data, error } = await db.artists().update(updates).eq('id', id).select().maybeSingle()

  if (error) {
    log.error('Failed to update artist', error)
    return NextResponse.json({ error: 'Failed to update artist' }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
  }

  return NextResponse.json({ data: data as ArtistRow })
}

/** DELETE /api/label/artists/[id] — owner/manager only (RLS). Cascades releases. */
export async function DELETE(_request: NextRequest, { params }: Params): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response
  const { id } = await params
  const db = labelDb(auth.supabase)

  const { error, count } = await db.artists().delete({ count: 'exact' }).eq('id', id)

  if (error) {
    log.error('Failed to delete artist', error)
    return NextResponse.json({ error: 'Failed to delete artist' }, { status: 500 })
  }
  if (!count) {
    return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
  }

  return NextResponse.json({ data: null })
}
