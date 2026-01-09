/**
 * CrossModePrompt Component
 *
 * Suggests the next logical step in the workflow based on current mode
 * and what data exists in other modes.
 *
 * Workflow: Ideas → Scout → Timeline → Pitch
 */

'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Lightbulb, Search, Calendar, MessageSquare } from 'lucide-react'
import { useIdeasStore } from '@/stores/useIdeasStore'
import { useScoutStore } from '@/stores/useScoutStore'
import { useTimelineStore } from '@/stores/useTimelineStore'
import { usePitchStore } from '@/stores/usePitchStore'
import { useCurrentTrackId } from '@/hooks/useCurrentTrackId'

type WorkspaceMode = 'ideas' | 'scout' | 'timeline' | 'pitch'

interface CrossModePromptProps {
  currentMode: WorkspaceMode
  onNavigate?: (mode: WorkspaceMode) => void // Optional - uses router if not provided
}

interface PromptConfig {
  icon: typeof Lightbulb
  message: string
  targetMode: WorkspaceMode
  actionLabel: string
}

export function CrossModePrompt({ currentMode, onNavigate }: CrossModePromptProps) {
  const router = useRouter()
  const trackId = useCurrentTrackId()

  const navigate = useCallback(
    (mode: WorkspaceMode) => {
      if (onNavigate) {
        onNavigate(mode)
      } else {
        // Preserve track param when navigating between modes
        const params = new URLSearchParams({ mode })
        if (trackId) {
          params.set('track', trackId)
        }
        router.push(`/workspace?${params.toString()}`, { scroll: false })
      }
    },
    [router, onNavigate, trackId]
  )

  // Check each store for data
  const ideasCards = useIdeasStore((state) => state.cards)
  const scoutAddedToTimeline = useScoutStore((state) => state.addedToTimeline)
  const timelineEvents = useTimelineStore((state) => state.events)
  const pitchDrafts = usePitchStore((state) => state.drafts)

  // Determine which modes have meaningful data
  const hasIdeasData = ideasCards.some((card) => !card.isStarter)
  const hasScoutData = scoutAddedToTimeline.size > 0
  const hasTimelineData = timelineEvents.some((event) => !event.id.startsWith('sample-'))
  const hasPitchData = pitchDrafts.some((draft) =>
    draft.sections.some((section) => section.content.trim().length > 0)
  )

  // Determine the appropriate prompt based on current mode and data state
  const getPrompt = (): PromptConfig | null => {
    switch (currentMode) {
      case 'ideas':
        // Ideas is the start - no previous step to suggest
        // Could suggest Scout if they have ideas
        if (hasIdeasData) {
          return {
            icon: Search,
            message: "You've got ideas! Now find opportunities to share them.",
            targetMode: 'scout',
            actionLabel: 'Go to Scout',
          }
        }
        return null

      case 'scout':
        // If no ideas yet, suggest starting there
        if (!hasIdeasData) {
          return {
            icon: Lightbulb,
            message: 'Start with your ideas before finding opportunities.',
            targetMode: 'ideas',
            actionLabel: 'Go to Ideas',
          }
        }
        // If they have opportunities added, suggest timeline
        if (hasScoutData) {
          return {
            icon: Calendar,
            message: 'Found some targets! Plan when to pitch them.',
            targetMode: 'timeline',
            actionLabel: 'Go to Timeline',
          }
        }
        return null

      case 'timeline':
        // If no scout data, suggest going there first
        if (!hasScoutData) {
          return {
            icon: Search,
            message: 'Find opportunities in Scout to add to your timeline.',
            targetMode: 'scout',
            actionLabel: 'Go to Scout',
          }
        }
        // If they have timeline events, suggest pitch
        if (hasTimelineData) {
          return {
            icon: MessageSquare,
            message: 'Ready to reach out? Craft your pitch.',
            targetMode: 'pitch',
            actionLabel: 'Go to Pitch',
          }
        }
        return null

      case 'pitch':
        // If no timeline data, suggest going there
        if (!hasTimelineData) {
          return {
            icon: Calendar,
            message: 'Plan your outreach in Timeline first.',
            targetMode: 'timeline',
            actionLabel: 'Go to Timeline',
          }
        }
        // If they've completed the flow
        if (hasPitchData) {
          return {
            icon: Lightbulb,
            message: 'Pitch drafted! Keep capturing new ideas.',
            targetMode: 'ideas',
            actionLabel: 'Go to Ideas',
          }
        }
        return null

      default:
        return null
    }
  }

  const prompt = getPrompt()

  if (!prompt) {
    return null
  }

  const Icon = prompt.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: '10px 16px',
        backgroundColor: 'rgba(58, 169, 190, 0.06)',
        borderRadius: 8,
        border: '1px solid rgba(58, 169, 190, 0.12)',
        marginTop: 16,
      }}
    >
      <Icon size={16} style={{ color: '#3AA9BE', flexShrink: 0 }} />

      <span
        style={{
          fontSize: 13,
          color: 'rgba(255, 255, 255, 0.7)',
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        }}
      >
        {prompt.message}
      </span>

      <button
        onClick={() => navigate(prompt.targetMode)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '6px 12px',
          backgroundColor: 'rgba(58, 169, 190, 0.15)',
          border: '1px solid rgba(58, 169, 190, 0.3)',
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 500,
          color: '#3AA9BE',
          cursor: 'pointer',
          transition: 'all 0.12s ease',
          whiteSpace: 'nowrap',
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        }}
      >
        {prompt.actionLabel}
        <ArrowRight size={12} />
      </button>
    </motion.div>
  )
}

/**
 * Inline version for use within empty states
 * More compact, just text + link
 */
export function CrossModeHint({ currentMode, onNavigate }: CrossModePromptProps) {
  const router = useRouter()
  const trackId = useCurrentTrackId()

  const navigate = useCallback(
    (mode: WorkspaceMode) => {
      if (onNavigate) {
        onNavigate(mode)
      } else {
        // Preserve track param when navigating between modes
        const params = new URLSearchParams({ mode })
        if (trackId) {
          params.set('track', trackId)
        }
        router.push(`/workspace?${params.toString()}`, { scroll: false })
      }
    },
    [router, onNavigate, trackId]
  )

  // Check each store for data
  const ideasCards = useIdeasStore((state) => state.cards)
  const scoutAddedToTimeline = useScoutStore((state) => state.addedToTimeline)
  const timelineEvents = useTimelineStore((state) => state.events)

  const hasIdeasData = ideasCards.some((card) => !card.isStarter)
  const hasScoutData = scoutAddedToTimeline.size > 0
  const hasTimelineData = timelineEvents.some((event) => !event.id.startsWith('sample-'))

  // Simple hints for common scenarios
  const getHint = (): { text: string; linkText: string; targetMode: WorkspaceMode } | null => {
    switch (currentMode) {
      case 'scout':
        if (hasIdeasData) {
          return {
            text: 'You have ideas to work with.',
            linkText: 'View Ideas',
            targetMode: 'ideas',
          }
        }
        break

      case 'timeline':
        if (!hasScoutData) {
          return {
            text: 'Add opportunities from',
            linkText: 'Scout',
            targetMode: 'scout',
          }
        }
        break

      case 'pitch':
        if (!hasTimelineData) {
          return {
            text: 'Plan your targets in',
            linkText: 'Timeline',
            targetMode: 'timeline',
          }
        }
        break
    }
    return null
  }

  const hint = getHint()

  if (!hint) {
    return null
  }

  return (
    <span
      style={{
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.4)',
      }}
    >
      {hint.text}{' '}
      <button
        onClick={() => navigate(hint.targetMode)}
        style={{
          color: '#3AA9BE',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 12,
          textDecoration: 'underline',
          textUnderlineOffset: 2,
        }}
      >
        {hint.linkText}
      </button>
    </span>
  )
}
