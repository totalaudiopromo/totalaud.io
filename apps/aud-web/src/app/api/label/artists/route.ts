import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/requireAuth'
import { labelDb } from '@/lib/label/db'
import { createArtistSchema } from '@/lib/label/schemas'
import type { ArtistRow } from '@/lib/label/types'
import { logger } from '@/lib/logger'

const log = logger.scope('LabelArtistsRoute')

/** GET /api/label/artists?labelId= */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response
  const db = labelDb(auth.supabase)

  const labelId = request.nextUrl.searchParams.get('labelId')
  if (!labelId) {
    return NextResponse.json({ error: 'labelId is required' }, { status: 400 })
  }

  const { data, error } = await db
    .artists()
    .select('*')
    .eq('label_id', labelId)
    .order('name', { ascending: true })
    .limit(200)

  if (error) {
    log.error('Failed to load artists', error)
    return NextResponse.json({ error: 'Failed to load artists' }, { status: 500 })
  }

  return NextResponse.json({ data: (data ?? []) as ArtistRow[] })
}

/** POST /api/label/artists */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response
  const db = labelDb(auth.supabase)

  const parsed = createArtistSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.format() },
      { status: 400 }
    )
  }

  const { labelId, name, bio, genres, imageUrl, website, spotifyUrl } = parsed.data
  const { data, error } = await db
    .artists()
    .insert({
      label_id: labelId,
      name,
      bio: bio ?? null,
      genres: genres ?? [],
      image_url: imageUrl ?? null,
      website: website ?? null,
      spotify_url: spotifyUrl ?? null,
    })
    .select()
    .maybeSingle()

  if (error || !data) {
    log.error('Failed to create artist', error)
    // RLS insert failure surfaces as an error — likely not a label member
    return NextResponse.json({ error: 'Failed to create artist' }, { status: 500 })
  }

  return NextResponse.json({ data: data as ArtistRow }, { status: 201 })
}
