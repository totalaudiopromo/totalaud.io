/**
 * useProgress Hook
 *
 * Tracks user progress across all modes and provides
 * summary data for email digests and progress indicators.
 */

'use client'

import { useMemo } from 'react'
import { useIdeasStore } from '@/stores/useIdeasStore'
import { useTimelineStore } from '@/stores/useTimelineStore'
import { useScoutStore } from '@/stores/useScoutStore'
import { usePitchStore } from '@/stores/usePitchStore'
import { useUserProfileStore } from '@/stores/useUserProfileStore'

export interface ProgressStats {
  ideas: {
    total: number
    thisWeek: number
  }
  timeline: {
    total: number
    thisWeek: number
    upcoming: number
    completed: number
  }
  scout: {
    addedToTimeline: number
    pitched: number
  }
  pitch: {
    drafts: number
    thisWeek: number
  }
  overall: {
    completionPercentage: number
    nextMilestone: string | null
    daysUntilRelease: number | null
  }
}

export interface ProgressMilestone {
  type: 'ideas' | 'timeline' | 'scout' | 'pitch'
  count: number
  message: string
  achieved: boolean
}

// Calculate if a date is within the past week
function isWithinWeek(dateString: string): boolean {
  const date = new Date(dateString)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  return date >= weekAgo
}

// Calculate if a date is in the future
function isUpcoming(dateString: string): boolean {
  return new Date(dateString) > new Date()
}

export function useProgress(): ProgressStats {
  // Ideas
  const ideaCards = useIdeasStore((state) => state.cards)

  // Timeline
  const timelineEvents = useTimelineStore((state) => state.events)

  // Scout
  const addedToTimeline = useScoutStore((state) => state.addedToTimeline)
  const pitchedIds = useScoutStore((state) => state.pitchedIds)

  // Pitch
  const pitchDrafts = usePitchStore((state) => state.drafts)

  // User profile (for release date)
  const profile = useUserProfileStore((state) => state.profile)
  const daysUntilRelease = useUserProfileStore((state) => state.daysUntilRelease)

  return useMemo(() => {
    // Ideas stats
    const ideasThisWeek = ideaCards.filter(
      (card) => card.createdAt && isWithinWeek(card.createdAt)
    ).length

    // Timeline stats
    const nonSampleEvents = timelineEvents.filter((e) => e.source !== 'sample')
    const timelineThisWeek = nonSampleEvents.filter(
      (e) => e.createdAt && isWithinWeek(e.createdAt)
    ).length
    const upcomingEvents = nonSampleEvents.filter((e) => isUpcoming(e.date)).length
    const completedEvents = nonSampleEvents.filter((e) => !isUpcoming(e.date)).length

    // Pitch stats
    const pitchesThisWeek = pitchDrafts.filter((d) => isWithinWeek(d.createdAt)).length

    // Overall completion (based on having used each mode)
    const hasIdeas = ideaCards.length > 0
    const hasTimeline = nonSampleEvents.length > 0
    const hasScout = addedToTimeline.size > 0
    const hasPitch = pitchDrafts.length > 0
    const modesUsed = [hasIdeas, hasTimeline, hasScout, hasPitch].filter(Boolean).length
    const completionPercentage = Math.round((modesUsed / 4) * 100)

    // Next milestone suggestion
    let nextMilestone: string | null = null
    if (!hasIdeas) {
      nextMilestone = 'Start by capturing an idea'
    } else if (!hasScout) {
      nextMilestone = 'Discover opportunities in Scout'
    } else if (!hasTimeline) {
      nextMilestone = 'Plan your first action in Timeline'
    } else if (!hasPitch) {
      nextMilestone = 'Draft your first pitch'
    } else if (pitchDrafts.length < 3) {
      nextMilestone = 'Draft more pitches to expand your reach'
    }

    return {
      ideas: {
        total: ideaCards.length,
        thisWeek: ideasThisWeek,
      },
      timeline: {
        total: nonSampleEvents.length,
        thisWeek: timelineThisWeek,
        upcoming: upcomingEvents,
        completed: completedEvents,
      },
      scout: {
        addedToTimeline: addedToTimeline.size,
        pitched: pitchedIds.size,
      },
      pitch: {
        drafts: pitchDrafts.length,
        thisWeek: pitchesThisWeek,
      },
      overall: {
        completionPercentage,
        nextMilestone,
        daysUntilRelease: daysUntilRelease(),
      },
    }
  }, [ideaCards, timelineEvents, addedToTimeline, pitchedIds, pitchDrafts, daysUntilRelease])
}

/**
 * Generate a weekly summary for email digest
 */
export function generateWeeklySummary(stats: ProgressStats): string {
  const lines: string[] = []

  lines.push('Your totalaud.io Weekly Summary')
  lines.push('================================')
  lines.push('')

  // Release countdown
  if (stats.overall.daysUntilRelease !== null) {
    if (stats.overall.daysUntilRelease > 0) {
      lines.push(`${stats.overall.daysUntilRelease} days until your release`)
    } else if (stats.overall.daysUntilRelease === 0) {
      lines.push('Release day!')
    } else {
      lines.push(`${Math.abs(stats.overall.daysUntilRelease)} days since release`)
    }
    lines.push('')
  }

  // Activity summary
  lines.push('This Week')
  lines.push('---------')
  if (stats.ideas.thisWeek > 0) {
    lines.push(`- ${stats.ideas.thisWeek} new idea${stats.ideas.thisWeek > 1 ? 's' : ''} captured`)
  }
  if (stats.timeline.thisWeek > 0) {
    lines.push(
      `- ${stats.timeline.thisWeek} action${stats.timeline.thisWeek > 1 ? 's' : ''} planned`
    )
  }
  if (stats.pitch.thisWeek > 0) {
    lines.push(`- ${stats.pitch.thisWeek} pitch${stats.pitch.thisWeek > 1 ? 'es' : ''} drafted`)
  }
  if (stats.ideas.thisWeek === 0 && stats.timeline.thisWeek === 0 && stats.pitch.thisWeek === 0) {
    lines.push('- No activity this week')
  }
  lines.push('')

  // Totals
  lines.push('Overall Progress')
  lines.push('----------------')
  lines.push(`- ${stats.ideas.total} ideas`)
  lines.push(`- ${stats.timeline.total} timeline events (${stats.timeline.upcoming} upcoming)`)
  lines.push(`- ${stats.scout.addedToTimeline} opportunities saved`)
  lines.push(`- ${stats.pitch.drafts} pitch drafts`)
  lines.push('')

  // Next steps
  if (stats.overall.nextMilestone) {
    lines.push('Next Step')
    lines.push('---------')
    lines.push(stats.overall.nextMilestone)
  }

  return lines.join('\n')
}
