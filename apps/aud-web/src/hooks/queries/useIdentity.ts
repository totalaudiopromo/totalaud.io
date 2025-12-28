'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { queryKeys } from '@/lib/react-query'
import { logger } from '@/lib/logger'

const log = logger.scope('useIdentity')

// Types
interface ArtistIdentity {
  id: string
  userId: string
  brandVoice: {
    tone: string | null
    themes: string[]
    style: string | null
    keyPhrases: string[]
  }
  creativeProfile: {
    primaryMotifs: string[]
    emotionalRange: string | null
    uniqueElements: string[]
  }
  epkFragments: {
    oneLiner: string | null
    pressAngle: string | null
    pitchHook: string | null
    comparisons: string[]
  }
  bios: {
    short: string | null
    long: string | null
  }
  lastGeneratedAt: string | null
  createdAt: string
  updatedAt: string
}

interface DatabaseArtistIdentity {
  id: string
  user_id: string
  brand_tone: string | null
  brand_themes: string[] | null
  brand_style: string | null
  key_phrases: string[] | null
  primary_motifs: string[] | null
  emotional_range: string | null
  unique_elements: string[] | null
  one_liner: string | null
  press_angle: string | null
  pitch_hook: string | null
  comparisons: string[] | null
  bio_short: string | null
  bio_long: string | null
  last_generated_at: string | null
  created_at: string
  updated_at: string
}

// Transform from database format to client format
function fromSupabaseIdentity(data: DatabaseArtistIdentity): ArtistIdentity {
  return {
    id: data.id,
    userId: data.user_id,
    brandVoice: {
      tone: data.brand_tone,
      themes: data.brand_themes ?? [],
      style: data.brand_style,
      keyPhrases: data.key_phrases ?? [],
    },
    creativeProfile: {
      primaryMotifs: data.primary_motifs ?? [],
      emotionalRange: data.emotional_range,
      uniqueElements: data.unique_elements ?? [],
    },
    epkFragments: {
      oneLiner: data.one_liner,
      pressAngle: data.press_angle,
      pitchHook: data.pitch_hook,
      comparisons: data.comparisons ?? [],
    },
    bios: {
      short: data.bio_short,
      long: data.bio_long,
    },
    lastGeneratedAt: data.last_generated_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

// Fetch identity from Supabase
async function fetchIdentity(): Promise<ArtistIdentity | null> {
  const supabase = createBrowserSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('artist_identities')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found - return null
      return null
    }
    throw error
  }

  return fromSupabaseIdentity(data as unknown as DatabaseArtistIdentity)
}

// Generate identity via API
async function generateIdentity(): Promise<ArtistIdentity> {
  const response = await fetch('/api/identity/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })

  const result = await response.json()

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to generate identity')
  }

  return result.data
}

/**
 * React Query hook for artist identity
 *
 * Provides:
 * - Automatic caching with 5 minute stale time
 * - Background refetch on window focus
 * - Request deduplication
 * - Loading and error states
 */
export function useIdentity() {
  return useQuery({
    queryKey: queryKeys.identity.current(),
    queryFn: fetchIdentity,
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  })
}

/**
 * Mutation hook for generating identity
 *
 * Automatically invalidates the identity query on success
 */
export function useGenerateIdentity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: generateIdentity,
    onSuccess: (data) => {
      // Update cache with new data
      queryClient.setQueryData(queryKeys.identity.current(), data)
      log.info('Identity generated successfully')
    },
    onError: (error) => {
      log.error('Failed to generate identity', error)
    },
  })
}

// Selectors for common data access patterns
export const selectHasIdentity = (data: ArtistIdentity | null | undefined): boolean => {
  return data !== null && data !== undefined && data.lastGeneratedAt !== null
}

export const selectOneLiner = (data: ArtistIdentity | null | undefined): string | null => {
  return data?.epkFragments.oneLiner ?? null
}

export const selectShortBio = (data: ArtistIdentity | null | undefined): string | null => {
  return data?.bios.short ?? null
}
