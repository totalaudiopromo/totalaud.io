/**
 * useArtistLookup Hook
 * Phase 14.3: Artist intelligence layer
 *
 * Detects artist identity from:
 * 1. Previous Supabase campaign data
 * 2. Spotify API search
 * 3. localStorage cache
 *
 * Returns enriched artist data with genres, followers, and visual identity
 */

'use client'

import { useState, useEffect } from 'react'
import { logger } from '@total-audio/core-logger'

const log = logger.scope('useArtistLookup')

export interface ArtistData {
  name: string
  genres: string[]
  followers: number
  imageUrl: string | null
  dominantColour: string | null
  spotifyId: string | null
}

interface UseArtistLookupResult {
  artist: ArtistData | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const STORAGE_KEY = 'totalaud-artist-context'
const DEFAULT_ARTIST = 'sadact' // Fallback for demo

/**
 * Extract dominant colour from image URL
 * Simplified version - returns accent colour for now
 */
function getDominantColour(imageUrl: string | null): string | null {
  // TODO: Implement actual colour extraction from image
  // For now, return theme accent
  return '#3AA9BE'
}

/**
 * Search Spotify for artist
 */
async function searchSpotifyArtist(artistName: string): Promise<ArtistData | null> {
  try {
    const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`)

    if (!response.ok) {
      throw new Error(`Spotify search failed: ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.artists?.items?.length) {
      log.warn('No Spotify artist found', { artistName })
      return null
    }

    const artist = data.artists.items[0]
    const imageUrl = artist.images?.[0]?.url || null

    return {
      name: artist.name,
      genres: artist.genres || [],
      followers: artist.followers?.total || 0,
      imageUrl,
      dominantColour: getDominantColour(imageUrl),
      spotifyId: artist.id,
    }
  } catch (error) {
    log.error('Spotify artist search error', error)
    return null
  }
}

/**
 * Get artist from previous campaign
 */
async function getPreviousCampaignArtist(): Promise<string | null> {
  try {
    const response = await fetch('/api/operator/previous-artist')

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.artist || null
  } catch (error) {
    log.error('Failed to fetch previous artist', error)
    return null
  }
}

/**
 * useArtistLookup
 *
 * Intelligently detects and enriches artist data
 */
export function useArtistLookup(): UseArtistLookupResult {
  const [artist, setArtist] = useState<ArtistData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const lookupArtist = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // 1. Check localStorage cache
      const cached = localStorage.getItem(STORAGE_KEY)
      if (cached) {
        try {
          const cachedData = JSON.parse(cached) as ArtistData
          log.debug('Artist loaded from cache', { name: cachedData.name })
          setArtist(cachedData)
          setIsLoading(false)
          return
        } catch (parseError) {
          log.warn('Failed to parse cached artist data')
          localStorage.removeItem(STORAGE_KEY)
        }
      }

      // 2. Check previous Supabase campaign
      const previousArtist = await getPreviousCampaignArtist()
      const artistToSearch = previousArtist || DEFAULT_ARTIST

      log.info('Searching for artist', { artistToSearch, source: previousArtist ? 'campaign' : 'default' })

      // 3. Search Spotify
      const spotifyData = await searchSpotifyArtist(artistToSearch)

      if (spotifyData) {
        setArtist(spotifyData)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(spotifyData))
        log.info('Artist found and cached', { name: spotifyData.name, followers: spotifyData.followers })
      } else {
        // Fallback to basic data
        const fallback: ArtistData = {
          name: artistToSearch,
          genres: [],
          followers: 0,
          imageUrl: null,
          dominantColour: '#3AA9BE',
          spotifyId: null,
        }
        setArtist(fallback)
        log.warn('Using fallback artist data', { name: artistToSearch })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      log.error('Artist lookup failed', err)
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    lookupArtist()
  }, [])

  return {
    artist,
    isLoading,
    error,
    refresh: lookupArtist,
  }
}
