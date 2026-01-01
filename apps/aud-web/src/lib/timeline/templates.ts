/**
 * Release Templates
 * totalaud.io - December 2025
 *
 * Pre-built timeline templates for common release scenarios.
 * Each template contains tasks positioned relative to the release date.
 * Negative weeksBeforeRelease means weeks AFTER release.
 */

import type { LaneType } from '@/types/timeline'

// ============================================================================
// Types
// ============================================================================

export interface TemplateTask {
  /** Task title */
  title: string
  /** Weeks before release (negative = after release) */
  weeksBeforeRelease: number
  /** Which lane the task belongs to */
  lane: LaneType
  /** Optional description */
  description?: string
  /** Optional tags */
  tags?: string[]
}

export interface ReleaseTemplate {
  /** Unique template ID */
  id: string
  /** Display name */
  name: string
  /** Short description */
  description: string
  /** Duration hint (e.g., "8 weeks") */
  duration: string
  /** Template tasks */
  tasks: TemplateTask[]
}

// ============================================================================
// Lane Colours (for reference)
// ============================================================================

// pre-release: #6366F1 (indigo)
// release: #3AA9BE (accent cyan)
// post-release: #10B981 (green)

// ============================================================================
// Templates
// ============================================================================

export const RELEASE_TEMPLATES: ReleaseTemplate[] = [
  // ---------------------------------------------------------------------------
  // 1. Single Release (8 weeks)
  // ---------------------------------------------------------------------------
  {
    id: 'single',
    name: 'Single Release',
    description: 'Standard 8-week promo cycle for a single track',
    duration: '8 weeks',
    tasks: [
      // Pre-release phase
      {
        title: 'Finalise mix & master',
        weeksBeforeRelease: 8,
        lane: 'pre-release',
        description: 'Complete final mixdown and mastering',
        tags: ['creative', 'deadline'],
      },
      {
        title: 'Create artwork',
        weeksBeforeRelease: 7,
        lane: 'pre-release',
        description: 'Design cover art and promotional visuals',
        tags: ['creative'],
      },
      {
        title: 'Submit to distributor',
        weeksBeforeRelease: 6,
        lane: 'pre-release',
        description: 'Upload to DistroKid/TuneCore/etc.',
        tags: ['deadline'],
      },
      {
        title: 'Pitch to editorial playlists',
        weeksBeforeRelease: 5,
        lane: 'post-release',
        description: 'Submit via Spotify for Artists',
        tags: ['playlist'],
      },
      {
        title: 'Send to independent playlisters',
        weeksBeforeRelease: 4,
        lane: 'post-release',
        description: 'Outreach to curators found in Scout',
        tags: ['playlist', 'outreach'],
      },
      {
        title: 'Contact blogs & press',
        weeksBeforeRelease: 4,
        lane: 'post-release',
        description: 'Send press release to music blogs',
        tags: ['press', 'outreach'],
      },
      {
        title: 'Submit to radio',
        weeksBeforeRelease: 3,
        lane: 'post-release',
        description: 'BBC Introducing and indie stations',
        tags: ['radio', 'outreach'],
      },
      {
        title: 'Announce release date',
        weeksBeforeRelease: 2,
        lane: 'post-release',
        description: 'Post announcement across socials',
        tags: ['social'],
      },
      {
        title: 'Share preview/snippet',
        weeksBeforeRelease: 1,
        lane: 'post-release',
        description: 'Tease track on stories/reels',
        tags: ['social'],
      },
      // Release day
      {
        title: 'Release day posts',
        weeksBeforeRelease: 0,
        lane: 'release',
        description: 'Celebrate release across all platforms',
        tags: ['social', 'release'],
      },
      // Post-release
      {
        title: 'Thank supporters',
        weeksBeforeRelease: -1,
        lane: 'post-release',
        description: 'Engagement posts thanking listeners',
        tags: ['social'],
      },
      {
        title: 'Review first week stats',
        weeksBeforeRelease: -1,
        lane: 'post-release',
        description: 'Check streams, saves, playlist adds',
        tags: ['analytics'],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 2. EP Release (12 weeks)
  // ---------------------------------------------------------------------------
  {
    id: 'ep',
    name: 'EP Release',
    description: 'Extended 12-week campaign for EP with lead single',
    duration: '12 weeks',
    tasks: [
      // Pre-release - earlier start
      {
        title: 'Finalise all tracks',
        weeksBeforeRelease: 12,
        lane: 'pre-release',
        description: 'Complete mixing and mastering for EP',
        tags: ['creative', 'deadline'],
      },
      {
        title: 'Create EP artwork',
        weeksBeforeRelease: 11,
        lane: 'pre-release',
        description: 'Design cover art and track visuals',
        tags: ['creative'],
      },
      {
        title: 'Choose lead single',
        weeksBeforeRelease: 10,
        lane: 'pre-release',
        description: 'Select strongest track for initial push',
        tags: ['strategy'],
      },
      {
        title: 'Submit EP to distributor',
        weeksBeforeRelease: 8,
        lane: 'pre-release',
        description: 'Upload full EP for distribution',
        tags: ['deadline'],
      },
      {
        title: 'Release lead single',
        weeksBeforeRelease: 6,
        lane: 'release',
        description: 'First taste of EP for listeners',
        tags: ['release'],
      },
      {
        title: 'Pitch EP to editorial playlists',
        weeksBeforeRelease: 5,
        lane: 'post-release',
        description: 'Submit via Spotify for Artists',
        tags: ['playlist'],
      },
      {
        title: 'Contact blogs & press',
        weeksBeforeRelease: 5,
        lane: 'post-release',
        description: 'Send EPK to music publications',
        tags: ['press', 'outreach'],
      },
      {
        title: 'Pitch to independent playlisters',
        weeksBeforeRelease: 4,
        lane: 'post-release',
        description: 'Outreach to curators found in Scout',
        tags: ['playlist', 'outreach'],
      },
      {
        title: 'Submit to radio',
        weeksBeforeRelease: 3,
        lane: 'post-release',
        description: 'Radio promo campaign',
        tags: ['radio', 'outreach'],
      },
      {
        title: 'Content rollout begins',
        weeksBeforeRelease: 3,
        lane: 'post-release',
        description: 'Behind the scenes, teasers',
        tags: ['social'],
      },
      {
        title: 'Pre-save campaign',
        weeksBeforeRelease: 2,
        lane: 'post-release',
        description: 'Push pre-saves with incentive',
        tags: ['social', 'marketing'],
      },
      {
        title: 'Final countdown posts',
        weeksBeforeRelease: 1,
        lane: 'post-release',
        description: 'Daily teasers building hype',
        tags: ['social'],
      },
      // Release day
      {
        title: 'EP release day',
        weeksBeforeRelease: 0,
        lane: 'release',
        description: 'Full EP goes live',
        tags: ['release'],
      },
      // Post-release
      {
        title: 'Listening party',
        weeksBeforeRelease: -1,
        lane: 'post-release',
        description: 'Live stream or Discord listening session',
        tags: ['social', 'engagement'],
      },
      {
        title: 'Review analytics',
        weeksBeforeRelease: -2,
        lane: 'post-release',
        description: 'Analyse performance across platforms',
        tags: ['analytics'],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 3. Album Release (16 weeks)
  // ---------------------------------------------------------------------------
  {
    id: 'album',
    name: 'Album Release',
    description: 'Full 16-week campaign for album with multiple singles',
    duration: '16 weeks',
    tasks: [
      {
        title: 'Complete album production',
        weeksBeforeRelease: 16,
        lane: 'pre-release',
        description: 'Finalise all tracks, mixing, mastering',
        tags: ['creative', 'deadline'],
      },
      {
        title: 'Create album artwork package',
        weeksBeforeRelease: 14,
        lane: 'pre-release',
        description: 'Cover, booklet, single artwork variants',
        tags: ['creative'],
      },
      {
        title: 'Submit album to distributor',
        weeksBeforeRelease: 12,
        lane: 'pre-release',
        description: 'Upload full album for distribution',
        tags: ['deadline'],
      },
      {
        title: 'Release first single',
        weeksBeforeRelease: 10,
        lane: 'release',
        description: 'Lead single to build anticipation',
        tags: ['release'],
      },
      {
        title: 'Begin press campaign',
        weeksBeforeRelease: 8,
        lane: 'post-release',
        description: 'Interviews, features, reviews',
        tags: ['press'],
      },
      {
        title: 'Release second single',
        weeksBeforeRelease: 6,
        lane: 'release',
        description: 'Keep momentum building',
        tags: ['release'],
      },
      {
        title: 'Pitch to editorial playlists',
        weeksBeforeRelease: 5,
        lane: 'post-release',
        description: 'Submit focus tracks to DSPs',
        tags: ['playlist'],
      },
      {
        title: 'Radio campaign',
        weeksBeforeRelease: 4,
        lane: 'post-release',
        description: 'Push singles to radio',
        tags: ['radio', 'outreach'],
      },
      {
        title: 'Release third single',
        weeksBeforeRelease: 3,
        lane: 'release',
        description: 'Final single before album',
        tags: ['release'],
      },
      {
        title: 'Launch pre-order',
        weeksBeforeRelease: 3,
        lane: 'post-release',
        description: 'Physical/digital pre-order goes live',
        tags: ['marketing'],
      },
      {
        title: 'Content blitz',
        weeksBeforeRelease: 2,
        lane: 'post-release',
        description: 'Daily content leading to release',
        tags: ['social'],
      },
      {
        title: 'Album release day',
        weeksBeforeRelease: 0,
        lane: 'release',
        description: 'Full album drops',
        tags: ['release'],
      },
      {
        title: 'Release week promotion',
        weeksBeforeRelease: -1,
        lane: 'post-release',
        description: 'Push for chart positions, streams',
        tags: ['marketing'],
      },
      {
        title: 'First month review',
        weeksBeforeRelease: -4,
        lane: 'post-release',
        description: 'Comprehensive performance analysis',
        tags: ['analytics'],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 4. Festival Submission
  // ---------------------------------------------------------------------------
  {
    id: 'festival',
    name: 'Festival Submission',
    description: 'Campaign timed around festival application deadlines',
    duration: '10 weeks',
    tasks: [
      {
        title: 'Research festival deadlines',
        weeksBeforeRelease: 10,
        lane: 'pre-release',
        description: 'List all relevant festivals and dates',
        tags: ['research'],
      },
      {
        title: 'Prepare EPK',
        weeksBeforeRelease: 8,
        lane: 'pre-release',
        description: 'Bio, photos, music, videos, tech rider',
        tags: ['creative'],
      },
      {
        title: 'Record live session',
        weeksBeforeRelease: 6,
        lane: 'pre-release',
        description: 'Professional live footage for applications',
        tags: ['creative', 'video'],
      },
      {
        title: 'Submit to tier 1 festivals',
        weeksBeforeRelease: 4,
        lane: 'post-release',
        description: 'Top priority festival applications',
        tags: ['outreach', 'deadline'],
      },
      {
        title: 'Submit to tier 2 festivals',
        weeksBeforeRelease: 2,
        lane: 'post-release',
        description: 'Secondary festival applications',
        tags: ['outreach', 'deadline'],
      },
      {
        title: 'Deadline day',
        weeksBeforeRelease: 0,
        lane: 'release',
        description: 'Final submission deadline',
        tags: ['deadline'],
      },
      {
        title: 'Follow up with bookers',
        weeksBeforeRelease: -2,
        lane: 'post-release',
        description: 'Check application status',
        tags: ['outreach'],
      },
      {
        title: 'Track responses',
        weeksBeforeRelease: -4,
        lane: 'post-release',
        description: 'Log acceptances and rejections',
        tags: ['analytics'],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 5. Remix/Collab Release
  // ---------------------------------------------------------------------------
  {
    id: 'remix-collab',
    name: 'Remix/Collab',
    description: 'Coordinated release with another artist or remixer',
    duration: '6 weeks',
    tasks: [
      {
        title: 'Finalise collab agreement',
        weeksBeforeRelease: 6,
        lane: 'pre-release',
        description: 'Splits, credits, release plan agreed',
        tags: ['admin'],
      },
      {
        title: 'Complete remix/collab',
        weeksBeforeRelease: 5,
        lane: 'pre-release',
        description: 'Final version approved by all parties',
        tags: ['creative'],
      },
      {
        title: 'Coordinate artwork',
        weeksBeforeRelease: 4,
        lane: 'pre-release',
        description: 'Design that represents both artists',
        tags: ['creative'],
      },
      {
        title: 'Submit to distributor',
        weeksBeforeRelease: 4,
        lane: 'pre-release',
        description: 'Upload with correct credits/splits',
        tags: ['deadline'],
      },
      {
        title: 'Align promo strategy',
        weeksBeforeRelease: 3,
        lane: 'post-release',
        description: 'Coordinate messaging with collaborator',
        tags: ['strategy'],
      },
      {
        title: 'Cross-promote on socials',
        weeksBeforeRelease: 2,
        lane: 'post-release',
        description: 'Both artists tease the collab',
        tags: ['social'],
      },
      {
        title: 'Release day',
        weeksBeforeRelease: 0,
        lane: 'release',
        description: 'Coordinated posts across both fanbases',
        tags: ['release'],
      },
      {
        title: 'Joint livestream/takeover',
        weeksBeforeRelease: -1,
        lane: 'post-release',
        description: 'Collaborative content post-release',
        tags: ['social', 'engagement'],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 6. Music Video Release
  // ---------------------------------------------------------------------------
  {
    id: 'music-video',
    name: 'Music Video',
    description: 'Video premiere campaign with visual content focus',
    duration: '8 weeks',
    tasks: [
      {
        title: 'Complete video production',
        weeksBeforeRelease: 8,
        lane: 'pre-release',
        description: 'Final cut approved and exported',
        tags: ['creative', 'video'],
      },
      {
        title: 'Create video thumbnails',
        weeksBeforeRelease: 6,
        lane: 'pre-release',
        description: 'YouTube/social media thumbnails',
        tags: ['creative'],
      },
      {
        title: 'Schedule premiere',
        weeksBeforeRelease: 5,
        lane: 'pre-release',
        description: 'Set up YouTube Premiere',
        tags: ['admin'],
      },
      {
        title: 'Pitch to music video blogs',
        weeksBeforeRelease: 4,
        lane: 'post-release',
        description: 'Submit to video premiere sites',
        tags: ['press', 'outreach'],
      },
      {
        title: 'Tease video snippets',
        weeksBeforeRelease: 2,
        lane: 'post-release',
        description: 'Behind the scenes, stills, clips',
        tags: ['social', 'video'],
      },
      {
        title: 'Premiere countdown',
        weeksBeforeRelease: 1,
        lane: 'post-release',
        description: 'Build hype for premiere',
        tags: ['social'],
      },
      {
        title: 'Video premiere',
        weeksBeforeRelease: 0,
        lane: 'release',
        description: 'YouTube Premiere with live chat',
        tags: ['release', 'video'],
      },
      {
        title: 'Clip for TikTok/Reels',
        weeksBeforeRelease: -1,
        lane: 'post-release',
        description: 'Repurpose video for short-form',
        tags: ['social', 'video'],
      },
      {
        title: 'Review video performance',
        weeksBeforeRelease: -2,
        lane: 'post-release',
        description: 'Views, engagement, retention',
        tags: ['analytics'],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 7. Live/Tour Announcement
  // ---------------------------------------------------------------------------
  {
    id: 'live-tour',
    name: 'Live/Tour',
    description: 'Show announcement and ticket sales campaign',
    duration: '10 weeks',
    tasks: [
      {
        title: 'Confirm venues and dates',
        weeksBeforeRelease: 10,
        lane: 'pre-release',
        description: 'Finalise all show details',
        tags: ['admin'],
      },
      {
        title: 'Create tour poster',
        weeksBeforeRelease: 8,
        lane: 'pre-release',
        description: 'Design promo materials',
        tags: ['creative'],
      },
      {
        title: 'Set up ticket links',
        weeksBeforeRelease: 6,
        lane: 'pre-release',
        description: 'Eventbrite/DICE/venue box office',
        tags: ['admin'],
      },
      {
        title: 'Press release to local media',
        weeksBeforeRelease: 4,
        lane: 'post-release',
        description: 'Announce to local press in each city',
        tags: ['press', 'outreach'],
      },
      {
        title: 'Announce tour',
        weeksBeforeRelease: 4,
        lane: 'release',
        description: 'Public announcement on all platforms',
        tags: ['release', 'social'],
      },
      {
        title: 'Tickets on sale',
        weeksBeforeRelease: 3,
        lane: 'release',
        description: 'General sale begins',
        tags: ['release'],
      },
      {
        title: 'Ticket push content',
        weeksBeforeRelease: 2,
        lane: 'post-release',
        description: 'Regular reminders and updates',
        tags: ['social', 'marketing'],
      },
      {
        title: 'Contact local promoters',
        weeksBeforeRelease: 2,
        lane: 'post-release',
        description: 'Support acts, local press, radio',
        tags: ['outreach'],
      },
      {
        title: 'Show day',
        weeksBeforeRelease: 0,
        lane: 'release',
        description: 'First show of tour/run',
        tags: ['release', 'live'],
      },
      {
        title: 'Share live content',
        weeksBeforeRelease: -1,
        lane: 'post-release',
        description: 'Photos, videos, stories from shows',
        tags: ['social', 'video'],
      },
      {
        title: 'Post-tour analysis',
        weeksBeforeRelease: -4,
        lane: 'post-release',
        description: 'Ticket sales, revenue, fan engagement',
        tags: ['analytics'],
      },
    ],
  },
]

// ============================================================================
// Helpers
// ============================================================================

/**
 * Get a template by ID
 */
export function getTemplateById(id: string): ReleaseTemplate | undefined {
  return RELEASE_TEMPLATES.find((t) => t.id === id)
}

/**
 * Get all template IDs and names (for quick selection UI)
 */
export function getTemplateOptions(): { id: string; name: string }[] {
  return RELEASE_TEMPLATES.map((t) => ({
    id: t.id,
    name: t.name,
  }))
}

/**
 * Calculate the actual date for a task given a release date
 */
export function calculateTaskDate(releaseDate: Date, weeksBeforeRelease: number): Date {
  const taskDate = new Date(releaseDate)
  taskDate.setDate(taskDate.getDate() - weeksBeforeRelease * 7)
  return taskDate
}

/**
 * Get lane colour from lane type
 */
export function getTemplateLaneColour(lane: LaneType): string {
  const colours: Record<LaneType, string> = {
    'pre-release': '#6366F1',
    release: '#3AA9BE',
    'post-release': '#10B981',
  }
  return colours[lane]
}
