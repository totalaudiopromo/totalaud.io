/**
 * Auto-sequence utility for Timeline Mode
 * DESSA Phase 3: Automation
 *
 * Generates timeline events from a release date using a smart template.
 * Reduces manual event creation from 9+ steps to 1 step (69% reduction).
 */

import type { NewTimelineEvent } from '@/types/timeline'
import { getLaneColour } from '@/types/timeline'

interface SequenceTemplate {
  offsetDays: number
  lane: 'pre-release' | 'release' | 'post-release'
  title: string
  description?: string
}

/**
 * Standard release sequence based on industry best practices.
 * All events are positioned relative to release day (offsetDays: 0).
 */
const RELEASE_SEQUENCE: SequenceTemplate[] = [
  {
    offsetDays: -28,
    lane: 'pre-release',
    title: 'Finalise master',
    description: 'Send to mastering engineer',
  },
  {
    offsetDays: -21,
    lane: 'pre-release',
    title: 'Submit to distributors',
    description: 'Upload to DistroKid/TuneCore',
  },
  {
    offsetDays: -14,
    lane: 'pre-release',
    title: 'Submit to playlists',
    description: 'Spotify editorial + indie curators',
  },
  {
    offsetDays: -7,
    lane: 'pre-release',
    title: 'Send press pitches',
    description: 'Blogs, radio, press contacts',
  },
  {
    offsetDays: -3,
    lane: 'pre-release',
    title: 'Tease on socials',
    description: 'Countdown posts, snippets',
  },
  {
    offsetDays: 0,
    lane: 'release',
    title: 'Release Day!',
    description: 'Single drops on all platforms',
  },
  {
    offsetDays: 1,
    lane: 'post-release',
    title: 'Announce on socials',
    description: 'Share links, thank supporters',
  },
  {
    offsetDays: 5,
    lane: 'post-release',
    title: 'Thank who supported it',
    description:
      'Message the curators and press who added or covered it, and log what happened in Follow-ups',
  },
  {
    offsetDays: 7,
    lane: 'post-release',
    title: 'Week 1 recap',
    description: 'Share streaming stats, reviews',
  },
  {
    offsetDays: 14,
    lane: 'post-release',
    title: 'Follow-up outreach',
    description: "Re-pitch to contacts who didn't respond, then log the outcomes",
  },
  {
    offsetDays: 21,
    lane: 'post-release',
    title: 'Review what worked',
    description: 'Read The picture in Scout and note what to repeat next release',
  },
]

/**
 * Generate timeline events from a release date.
 *
 * @param releaseDate - The target release date
 * @returns Array of timeline events ready to be added to the store
 *
 * @example
 * ```ts
 * const releaseDate = new Date('2025-03-15')
 * const events = generateReleaseSequence(releaseDate)
 * events.forEach(event => await addEvent(event))
 * ```
 */
export function generateReleaseSequence(releaseDate: Date, trackName?: string): NewTimelineEvent[] {
  return RELEASE_SEQUENCE.map((template) => {
    const eventDate = new Date(releaseDate)
    eventDate.setDate(eventDate.getDate() + template.offsetDays)

    const isReleaseDay = template.offsetDays === 0
    const title = isReleaseDay && trackName ? `Release day: ${trackName}` : template.title

    return {
      lane: template.lane,
      title,
      date: eventDate.toISOString(),
      colour: getLaneColour(template.lane),
      description: template.description,
      source: 'manual' as const,
      tags: trackName ? ['auto-generated', trackName] : ['auto-generated'],
    }
  })
}
