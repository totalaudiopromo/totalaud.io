/**
 * useScoutToPitch Hook
 *
 * DESSA Phase 3: Automation - Pre-generate Pitch from Scout Opportunity
 *
 * Handles cross-mode transition from Scout→Pitch with automatic pitch generation:
 * - Maps opportunity type to pitch type
 * - Pre-fills pitch sections with opportunity context
 * - Marks opportunity as pitched
 * - Navigates to Pitch mode
 */

'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useScoutStore } from '@/stores/useScoutStore'
import { usePitchStore } from '@/stores/usePitchStore'
import type { Opportunity, OpportunityType } from '@/types/scout'
import type { PitchType } from '@/stores/usePitchStore'

/**
 * Map Scout opportunity types to Pitch types
 */
function mapOpportunityTypeToPitchType(oppType: OpportunityType): PitchType {
  const mapping: Record<OpportunityType, PitchType> = {
    radio: 'radio',
    playlist: 'playlist',
    press: 'press',
    blog: 'press', // Blogs are similar to press pitches
    curator: 'playlist', // Curators are usually for playlists
  }
  return mapping[oppType]
}

/**
 * Generate pre-filled pitch content based on opportunity
 */
function generatePitchContent(opportunity: Opportunity) {
  const { name, type, description, genres, vibes, contactName } = opportunity

  // Hook section - attention-grabbing opener referencing the opportunity
  const hook = `Pitching to ${name}${contactName ? ` (${contactName})` : ''} - ${type === 'radio' ? 'Radio Airplay' : type === 'playlist' ? 'Playlist Inclusion' : type === 'press' ? 'Press Coverage' : type === 'blog' ? 'Blog Feature' : 'Curator Submission'}`

  // Story section - context about why this is a good match
  const genreText = genres.length > 0 ? genres.slice(0, 3).join(', ') : ''
  const vibeText = vibes.length > 0 ? vibes.slice(0, 2).join(', ') : ''

  let story = ''
  if (description) {
    story += `I'm reaching out regarding ${name}.\n\n`
    story += `Opportunity Details:\n${description}\n\n`
  }

  if (genreText) {
    story += `Genre Match: ${genreText}\n`
  }
  if (vibeText) {
    story += `Vibe Alignment: ${vibeText}\n`
  }

  story += `\n[Add your artist bio, track details, streaming stats, and why you're a perfect fit for ${name}]`

  // Ask section - clear call to action
  const ask = `I'd love to discuss ${type === 'radio' ? 'airplay opportunities' : type === 'playlist' ? 'playlist inclusion' : type === 'press' || type === 'blog' ? 'coverage opportunities' : 'collaboration'} for my upcoming release.\n\nWould you be open to listening?`

  return { hook, story, ask }
}

export function useScoutToPitch() {
  const router = useRouter()
  const markAsPitched = useScoutStore((state) => state.markAsPitched)
  const selectOpportunity = useScoutStore((state) => state.selectOpportunity)
  const selectType = usePitchStore((state) => state.selectType)
  const updateSection = usePitchStore((state) => state.updateSection)

  const handlePitchOpportunity = useCallback(
    (opportunity: Opportunity) => {
      // 1. Mark as being pitched in Scout store
      markAsPitched(opportunity.id)

      // 2. Determine pitch type based on opportunity type
      const pitchType = mapOpportunityTypeToPitchType(opportunity.type)

      // 3. Set up pitch with context
      selectType(pitchType)

      // 4. Pre-fill sections with opportunity context
      const { hook, story, ask } = generatePitchContent(opportunity)
      updateSection('hook', hook)
      updateSection('story', story)
      updateSection('ask', ask)

      // 5. Close Scout detail panel
      selectOpportunity(null)

      // 6. Navigate to Pitch mode
      router.push('/workspace?mode=pitch')
    },
    [markAsPitched, selectType, updateSection, selectOpportunity, router]
  )

  return { handlePitchOpportunity }
}
