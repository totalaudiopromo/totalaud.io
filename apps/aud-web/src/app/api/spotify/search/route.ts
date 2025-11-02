/**
 * Spotify Search API Route
 * Phase 14.3: Artist search proxy
 *
 * GET /api/spotify/search?q={artist}&type=artist&limit=1
 * Proxies Spotify Web API search with server-side auth
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@total-audio/core-logger'

const log = logger.scope('API:SpotifySearch')

// Spotify API credentials (should be in env variables)
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET

/**
 * Get Spotify access token using Client Credentials flow
 */
async function getSpotifyToken(): Promise<string | null> {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    log.warn('Spotify credentials not configured')
    return null
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    })

    if (!response.ok) {
      log.error('Spotify token request failed', { status: response.status })
      return null
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    log.error('Failed to get Spotify token', error)
    return null
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') || 'artist'
    const limit = searchParams.get('limit') || '1'

    if (!query) {
      return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 })
    }

    // Get Spotify access token
    const token = await getSpotifyToken()

    if (!token) {
      log.warn('Failed to get Spotify token, returning empty result')
      return NextResponse.json({ artists: { items: [] } })
    }

    // Search Spotify API
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`

    const response = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      log.error('Spotify search failed', { status: response.status, query })
      return NextResponse.json({ artists: { items: [] } })
    }

    const data = await response.json()

    log.info('Spotify search completed', {
      query,
      resultsCount: data.artists?.items?.length || 0,
    })

    return NextResponse.json(data)
  } catch (error) {
    log.error('Spotify search API error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
