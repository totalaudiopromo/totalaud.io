/**
 * useCurrentTrackId Hook
 *
 * Track Context Propagation v0
 *
 * Reads track_id from URL query parameter.
 * The track param is set when navigating from Finish → Workspace modes
 * and should be preserved across mode switching.
 *
 * Usage:
 *   const trackId = useCurrentTrackId()
 *   // trackId is the artist_assets.id of the current audio
 *
 * URL format:
 *   /workspace?mode=pitch&track=<uuid>
 */

'use client'

import { useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'

const TRACK_PARAM = 'track'
const TRACK_STORAGE_KEY = 'totalaud-last-track-id'

/**
 * Get the current track ID from URL or fallback to localStorage.
 */
export function useCurrentTrackId(): string | null {
  const searchParams = useSearchParams()

  return useMemo(() => {
    // Primary: read from URL query param
    const trackFromUrl = searchParams?.get(TRACK_PARAM)
    if (trackFromUrl) {
      // Persist to localStorage as fallback for mode switching
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(TRACK_STORAGE_KEY, trackFromUrl)
        } catch {
          // localStorage may be unavailable
        }
      }
      return trackFromUrl
    }

    // Fallback: read from localStorage (last used track)
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(TRACK_STORAGE_KEY)
      } catch {
        return null
      }
    }

    return null
  }, [searchParams])
}

/**
 * Get a URL builder that preserves the track param.
 * Use this when navigating between modes.
 */
export function useTrackAwareNavigation() {
  const trackId = useCurrentTrackId()

  /**
   * Build a URL that includes the current track param if present.
   */
  const buildUrl = useCallback(
    (basePath: string, additionalParams?: Record<string, string>) => {
      const params = new URLSearchParams(additionalParams)
      if (trackId) {
        params.set(TRACK_PARAM, trackId)
      }
      const queryString = params.toString()
      return queryString ? `${basePath}?${queryString}` : basePath
    },
    [trackId]
  )

  /**
   * Build a workspace mode URL with track preserved.
   */
  const buildWorkspaceUrl = useCallback(
    (mode: string) => {
      const params: Record<string, string> = { mode }
      if (trackId) {
        params[TRACK_PARAM] = trackId
      }
      return `/workspace?${new URLSearchParams(params).toString()}`
    },
    [trackId]
  )

  return {
    trackId,
    buildUrl,
    buildWorkspaceUrl,
    hasTrack: !!trackId,
  }
}

/**
 * Clear the stored track ID.
 * Call this when the user explicitly wants to work on a different track
 * or start fresh.
 */
export function clearStoredTrackId(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(TRACK_STORAGE_KEY)
    } catch {
      // Ignore errors
    }
  }
}
