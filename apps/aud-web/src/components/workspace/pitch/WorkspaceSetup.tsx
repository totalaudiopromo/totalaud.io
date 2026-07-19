/**
 * Set up your workspace from the Deep Dive conversation.
 *
 * The point of the Deep Dive isn't a nice chat — it's that the conversation
 * furnishes the workspace. This takes the transcript to
 * /api/pitch/coach/setup-workspace, gets back a plan, and applies it through
 * the existing stores: captured ideas into Ideas, opening drafts into the Pitch
 * sections (only where they're still empty), and a release sequence into the
 * Timeline (only if it's empty). Nothing overwrites work the artist has already
 * done, and nothing is sent anywhere.
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { usePitchStore, selectCoachingSession } from '@/stores/usePitchStore'
import { useIdeasStore } from '@/stores/useIdeasStore'
import { useTimelineStore } from '@/stores/useTimelineStore'
import { capture } from '@/lib/analytics'
import { logger } from '@/lib/logger'

const log = logger.scope('WorkspaceSetup')

type SetupState = 'idle' | 'working' | 'done' | 'error'

interface AppliedSummary {
  ideas: number
  pitchSections: number
  timelineEvents: number
  summary: string
}

export function WorkspaceSetup() {
  const router = useRouter()
  const { session: messages, mode } = usePitchStore(selectCoachingSession)
  const pitchType = usePitchStore((s) => s.currentType)
  const sections = usePitchStore((s) => s.sections)
  const updateSection = usePitchStore((s) => s.updateSection)

  const addCard = useIdeasStore((s) => s.addCard)
  const timelineEvents = useTimelineStore((s) => s.events)
  const generateFromReleaseDate = useTimelineStore((s) => s.generateFromReleaseDate)

  const [state, setState] = useState<SetupState>('idle')
  const [applied, setApplied] = useState<AppliedSummary | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Only worth offering once there's a real conversation to work from.
  const hasEnough = mode === 'guided' && messages.filter((m) => m.role === 'user').length >= 2

  if (!hasEnough && state === 'idle') return null

  const runSetup = async () => {
    setState('working')
    setErrorMessage(null)
    try {
      const response = await fetch('/api/pitch/coach/setup-workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: messages.map((m) => ({ role: m.role, content: m.content })),
          pitchType,
        }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Could not set up the workspace')
      }

      const plan = data.plan as {
        ideas: { content: string; tag: 'content' | 'brand' | 'promo' }[]
        pitch: { hook?: string; story?: string; ask?: string }
        releaseDate?: string | null
        summary: string
      }

      // 1. Ideas — capture each note.
      let ideaCount = 0
      for (const idea of plan.ideas) {
        try {
          await addCard(idea.content, idea.tag)
          ideaCount += 1
        } catch (e) {
          log.warn('Could not add an idea card', { error: e instanceof Error ? e.message : e })
        }
      }

      // 2. Pitch — fill only empty sections so we never clobber their words.
      let pitchCount = 0
      const fills: [string, string | undefined][] = [
        ['hook', plan.pitch.hook],
        ['story', plan.pitch.story],
        ['ask', plan.pitch.ask],
      ]
      for (const [sectionId, text] of fills) {
        const trimmed = (text ?? '').trim()
        if (!trimmed) continue
        const section = sections.find((s) => s.id === sectionId)
        if (section && !section.content.trim()) {
          updateSection(sectionId, trimmed)
          pitchCount += 1
        }
      }

      // 3. Timeline — only seed an empty timeline, and only with a valid date.
      let eventCount = 0
      if (plan.releaseDate && timelineEvents.length === 0) {
        const releaseDate = new Date(plan.releaseDate)
        if (!Number.isNaN(releaseDate.getTime())) {
          const before = useTimelineStore.getState().events.length
          await generateFromReleaseDate(releaseDate)
          eventCount = useTimelineStore.getState().events.length - before
        }
      }

      capture('workspace_setup_from_chat', {
        ideas: ideaCount,
        pitchSections: pitchCount,
        timelineEvents: eventCount,
      })

      setApplied({
        ideas: ideaCount,
        pitchSections: pitchCount,
        timelineEvents: eventCount,
        summary: plan.summary,
      })
      setState('done')
    } catch (error) {
      log.error('Workspace setup failed', error instanceof Error ? error : undefined)
      setErrorMessage(error instanceof Error ? error.message : 'Could not set up the workspace')
      setState('error')
    }
  }

  return (
    <div className="px-4 pb-3">
      <AnimatePresence mode="wait">
        {state === 'done' && applied ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-ta-cyan/20 bg-ta-cyan/5 p-4"
          >
            <p className="text-xs font-medium text-ta-white mb-1">Workspace set up</p>
            <p className="text-xs text-ta-grey leading-relaxed mb-3">{applied.summary}</p>
            <div className="flex flex-wrap gap-2 mb-3 text-[11px] text-ta-grey">
              {applied.ideas > 0 && (
                <span className="px-2 py-1 rounded-md bg-white/5">
                  {applied.ideas} idea{applied.ideas === 1 ? '' : 's'}
                </span>
              )}
              {applied.pitchSections > 0 && (
                <span className="px-2 py-1 rounded-md bg-white/5">
                  {applied.pitchSections} pitch draft{applied.pitchSections === 1 ? '' : 's'}
                </span>
              )}
              {applied.timelineEvents > 0 && (
                <span className="px-2 py-1 rounded-md bg-white/5">
                  {applied.timelineEvents} timeline event{applied.timelineEvents === 1 ? '' : 's'}
                </span>
              )}
              {applied.ideas === 0 &&
                applied.pitchSections === 0 &&
                applied.timelineEvents === 0 && (
                  <span className="px-2 py-1 rounded-md bg-white/5">
                    Nothing new to add — your workspace already has this
                  </span>
                )}
            </div>
            <div className="flex flex-wrap gap-2">
              {applied.ideas > 0 && (
                <button
                  onClick={() => router.push('/workspace?mode=ideas')}
                  className="px-3 py-1.5 text-[11px] font-medium text-ta-black bg-ta-cyan rounded-lg hover:bg-ta-cyan/90 transition-colors"
                >
                  See Ideas
                </button>
              )}
              {applied.timelineEvents > 0 && (
                <button
                  onClick={() => router.push('/workspace?mode=timeline')}
                  className="px-3 py-1.5 text-[11px] font-medium text-ta-white bg-white/5 border border-white/10 rounded-lg hover:border-white/20 transition-colors"
                >
                  See Timeline
                </button>
              )}
            </div>
          </motion.div>
        ) : state === 'error' ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-white/10 bg-[#161A1D] p-3"
          >
            <p className="text-xs text-ta-white/90 mb-2">{errorMessage}</p>
            <button
              onClick={runSetup}
              className="px-3 py-1.5 text-[11px] font-medium text-ta-white bg-white/5 border border-white/10 rounded-lg hover:border-white/20 transition-colors"
            >
              Try again
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="cta"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={runSetup}
            disabled={state === 'working'}
            whileHover={{ scale: state === 'working' ? 1 : 1.01 }}
            whileTap={{ scale: state === 'working' ? 1 : 0.99 }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-ta-black bg-ta-cyan rounded-lg hover:bg-ta-cyan/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_0_15px_-5px_rgba(58,169,190,0.5)]"
          >
            {state === 'working' ? (
              'Setting up your workspace…'
            ) : (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 3v18M3 12h18" />
                </svg>
                Set up my workspace from this chat
              </>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
