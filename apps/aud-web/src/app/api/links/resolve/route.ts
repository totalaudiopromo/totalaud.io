/**
 * GET /api/links/resolve?url=<track-or-album-url>
 *
 * Resolves a streaming link into every-platform links via the Odesli
 * (song.link) public API — one link per release that works for every
 * listener, without a smart-link subscription.
 *
 * Auth-gated so this isn't an open proxy; responses cache for a day
 * (release links don't churn).
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/requireAuth'
import { logger } from '@/lib/logger'

const log = logger.scope('LinksResolveRoute')

const ODESLI_API = 'https://api.song.link/v1-alpha.1/links'

const ALLOWED_HOSTS = [
  'open.spotify.com',
  'music.apple.com',
  'itunes.apple.com',
  'youtube.com',
  'www.youtube.com',
  'youtu.be',
  'music.youtube.com',
  'soundcloud.com',
  'on.soundcloud.com',
  'bandcamp.com',
  'tidal.com',
  'listen.tidal.com',
  'deezer.com',
  'www.deezer.com',
  'audiomack.com',
  'music.amazon.com',
  'song.link',
  'album.link',
]

interface OdesliResponse {
  pageUrl: string
  entitiesByUniqueId: Record<string, { title?: string; artistName?: string; thumbnailUrl?: string }>
  entityUniqueId: string
  linksByPlatform: Record<string, { url: string }>
}

function isAllowedUrl(raw: string): boolean {
  try {
    const parsed = new URL(raw)
    if (parsed.protocol !== 'https:') return false
    return ALLOWED_HOSTS.some(
      (host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`)
    )
  } catch {
    return false
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response

  const url = request.nextUrl.searchParams.get('url')
  if (!url || !isAllowedUrl(url)) {
    return NextResponse.json(
      { error: 'Provide a track or album URL from a supported streaming service' },
      { status: 400 }
    )
  }

  try {
    const odesliUrl = `${ODESLI_API}?url=${encodeURIComponent(url)}&songIfSingle=true`
    const response = await fetch(odesliUrl, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
    })

    if (response.status === 404) {
      return NextResponse.json({ error: 'No links found for that URL' }, { status: 404 })
    }
    if (response.status === 429) {
      return NextResponse.json(
        { error: 'Link service is busy — try again in a minute' },
        { status: 429 }
      )
    }
    if (!response.ok) {
      log.error('Odesli request failed', undefined, { status: response.status })
      return NextResponse.json({ error: 'Link resolution failed' }, { status: 502 })
    }

    const data = (await response.json()) as OdesliResponse
    const entity = data.entitiesByUniqueId?.[data.entityUniqueId]
    const platforms = Object.fromEntries(
      Object.entries(data.linksByPlatform ?? {}).map(([platform, value]) => [platform, value.url])
    )

    return NextResponse.json(
      {
        pageUrl: data.pageUrl,
        title: entity?.title ?? null,
        artistName: entity?.artistName ?? null,
        thumbnailUrl: entity?.thumbnailUrl ?? null,
        platforms,
      },
      { headers: { 'Cache-Control': 'private, max-age=86400' } }
    )
  } catch (error) {
    log.error('Link resolution failed', error instanceof Error ? error : undefined)
    return NextResponse.json({ error: 'Link resolution failed' }, { status: 502 })
  }
}
