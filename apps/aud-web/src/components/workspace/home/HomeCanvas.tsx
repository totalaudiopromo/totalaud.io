/**
 * HomeCanvas — the signed-in landing view for the workspace.
 *
 * Orients the artist before they choose a room: greeting, where the release
 * is (countdown + next timeline steps), and one clear way into each mode
 * with live context instead of a cold start.
 */

'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useUserProfileStore } from '@/stores/useUserProfileStore'
import { useTimelineStore } from '@/stores/useTimelineStore'
import { useIdeasStore } from '@/stores/useIdeasStore'
import { usePitchStore } from '@/stores/usePitchStore'
import { MODE_COLOURS, type WorkspaceMode } from '@/lib/workspace-modes'

const NORMAL_TRANSITION = { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const }

interface HomeCanvasProps {
  onNavigate: (mode: WorkspaceMode) => void
}

function greetingForHour(hour: number): string {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function HomeCanvas({ onNavigate }: HomeCanvasProps) {
  const profile = useUserProfileStore((s) => s.profile)
  const events = useTimelineStore((s) => s.events)
  const ideasCount = useIdeasStore((s) => s.cards.length)
  const pitchType = usePitchStore((s) => s.currentType)
  const pitchSections = usePitchStore((s) => s.sections)

  const greeting = greetingForHour(new Date().getHours())
  const firstName = profile?.artistName?.trim().split(/\s+/)[0]

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  // Next three upcoming timeline steps
  const upcoming = useMemo(() => {
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    return events
      .filter((e) => new Date(e.date) >= startOfToday)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3)
  }, [events])

  // Days until release, when a date is set
  const daysUntilRelease = useMemo(() => {
    if (!profile?.releaseDate) return null
    const release = new Date(profile.releaseDate)
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    const days = Math.ceil((release.getTime() - startOfToday.getTime()) / 86400000)
    return days >= 0 ? days : null
  }, [profile?.releaseDate])

  const hasPitchDraft = !!pitchType && pitchSections.some((s) => s.content.trim().length > 0)

  const rooms: {
    mode: WorkspaceMode
    label: string
    context: string
    action: string
  }[] = [
    {
      mode: 'ideas',
      label: 'Ideas',
      context:
        ideasCount > 0
          ? `${ideasCount} idea${ideasCount === 1 ? '' : 's'} captured`
          : 'Nothing captured yet',
      action: ideasCount > 0 ? 'Keep going' : 'Get it out of your head',
    },
    {
      mode: 'pitch',
      label: 'Pitch',
      context: hasPitchDraft ? 'Draft in progress' : 'No draft yet',
      action: hasPitchDraft ? 'Continue your draft' : 'Write your story',
    },
    {
      mode: 'finish',
      label: 'Finish',
      context: 'Analysis stays on your device',
      action: 'Get a second opinion on a track',
    },
    {
      mode: 'scout',
      label: 'Scout',
      context: 'Playlists, radio and blogs',
      action: 'Find people worth your time',
    },
  ]

  return (
    <div className="h-full overflow-y-auto custom-scrollbar font-sans">
      <div className="max-w-2xl mx-auto px-5 py-8 sm:py-12">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={NORMAL_TRANSITION}
        >
          <p className="text-xs text-ta-white/40 mb-1">{today}</p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-ta-white tracking-tight mb-2">
            {greeting}
            {firstName ? `, ${firstName}` : ''}.
          </h1>
          <p className="text-sm text-ta-white/50 leading-relaxed">
            {daysUntilRelease !== null && profile?.projectTitle
              ? daysUntilRelease === 0
                ? `${profile.projectTitle} is out today.`
                : `${daysUntilRelease} day${daysUntilRelease === 1 ? '' : 's'} until ${profile.projectTitle}.`
              : 'Where do you want to pick up?'}
          </p>
        </motion.div>

        {/* Next up — the release plan at a glance */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...NORMAL_TRANSITION, delay: 0.06 }}
          className="mt-8 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
          aria-label="Next on your timeline"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-medium uppercase tracking-wider text-ta-white/40">
              Next up
            </h2>
            <button
              onClick={() => onNavigate('timeline')}
              className="text-xs text-ta-cyan/80 hover:text-ta-cyan transition-colors"
            >
              Open Timeline →
            </button>
          </div>

          {upcoming.length > 0 ? (
            <ul className="space-y-3">
              {upcoming.map((event) => (
                <li key={event.id} className="flex items-start gap-3">
                  <span
                    className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: event.colour }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ta-white/85 truncate">{event.title}</p>
                    <p className="text-xs text-ta-white/40">{formatEventDate(event.date)}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-ta-white/50 leading-relaxed">
                No plan yet. A release goes better with a few weeks of runway — start with a
                week-by-week plan and adjust as you go.
              </p>
              <button
                onClick={() => onNavigate('timeline')}
                className="px-4 py-2.5 rounded-lg bg-ta-cyan text-ta-black text-xs font-medium hover:bg-ta-cyan/90 transition-colors"
              >
                Plan your release
              </button>
            </div>
          )}
        </motion.section>

        {/* Rooms */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...NORMAL_TRANSITION, delay: 0.12 }}
          className="mt-6"
          aria-label="Your rooms"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rooms.map((room) => (
              <button
                key={room.mode}
                onClick={() => onNavigate(room.mode)}
                className="text-left rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-white/[0.14] hover:bg-white/[0.04] transition-colors group"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: MODE_COLOURS[room.mode] }}
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium text-ta-white/90">{room.label}</span>
                  <span className="ml-auto text-ta-white/25 group-hover:text-ta-white/50 transition-colors">
                    →
                  </span>
                </div>
                <p className="text-xs text-ta-white/40 mb-0.5">{room.context}</p>
                <p className="text-xs text-ta-white/60">{room.action}</p>
              </button>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  )
}
