/**
 * IntelPanel
 *
 * Relationship memory in Scout: "Worth a follow-up" (the TAP action queue,
 * with quiet outcome logging) and "The picture" (the who-matters summary).
 *
 * Nothing here sends anything. The queue is cheap and loads on mount; the
 * summary is an AI call and only runs when the artist asks for it.
 */

'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useIntelStore } from '@/stores/useIntelStore'
import { useTimelineStore } from '@/stores/useTimelineStore'
import { getLaneColour } from '@/types/timeline'
import { capture } from '@/lib/analytics'
import type { TapActionQueueItem, TapOutcomeStatus } from '@/lib/tap/types'

const NORMAL_TRANSITION = { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const }

const OUTCOME_ACTIONS: { status: TapOutcomeStatus; label: string }[] = [
  { status: 'replied', label: 'Replied' },
  { status: 'added', label: 'Added' },
  { status: 'declined', label: 'Declined' },
  { status: 'no_response', label: 'No response' },
]

function daysFromNow(unixSeconds: number): string {
  const diffDays = Math.round((unixSeconds * 1000 - Date.now()) / 86_400_000)
  if (diffDays <= 0 && diffDays > -1) return 'due today'
  if (diffDays < 0) return `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} overdue`
  if (diffDays === 1) return 'due tomorrow'
  return `due in ${diffDays} days`
}

function quietFor(unixSeconds: number): string {
  const days = Math.max(1, Math.floor((Date.now() - unixSeconds * 1000) / 86_400_000))
  if (days < 14) return `${days} day${days === 1 ? '' : 's'} quiet`
  const weeks = Math.round(days / 7)
  return `${weeks} weeks quiet`
}

function itemLabel(item: TapActionQueueItem): { title: string; detail: string; contact?: string } {
  switch (item.type) {
    case 'follow_up':
      return {
        title: 'Follow-up due',
        detail: item.follow_up ? daysFromNow(item.follow_up.due_at) : '',
        contact: item.follow_up?.contact,
      }
    case 'stale_contact':
      return {
        title: 'Gone quiet',
        detail: item.stale_contact ? quietFor(item.stale_contact.last_contacted_at) : '',
        contact: item.stale_contact?.contact,
      }
    case 'pending_pitch':
      return {
        title: 'Pitch drafted, not sent',
        detail: '',
        contact: item.pending_pitch?.contact,
      }
    default:
      return { title: 'Worth a look', detail: '' }
  }
}

function SkeletonLine({ width, delay }: { width: string; delay: number }) {
  return (
    <motion.div
      className="h-3 rounded-ta-sm bg-ta-white/[0.06]"
      style={{ width }}
      animate={{ opacity: [0.4, 0.9, 0.4] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  )
}

/** When a follow-up should land on the timeline: its due date, or a few days out. */
function plannedDate(item: TapActionQueueItem): string {
  if (item.follow_up?.due_at) return new Date(item.follow_up.due_at * 1000).toISOString()
  const date = new Date()
  date.setDate(date.getDate() + 3)
  return date.toISOString()
}

function QueueSection() {
  const queue = useIntelStore((s) => s.queue)
  const queueStatus = useIntelStore((s) => s.queueStatus)
  const logOutcome = useIntelStore((s) => s.logOutcome)
  const addEvent = useTimelineStore((s) => s.addEvent)
  const [plannedIds, setPlannedIds] = useState<Set<string>>(new Set())

  const planOnTimeline = async (item: TapActionQueueItem) => {
    if (plannedIds.has(item.id)) return
    const label = itemLabel(item)
    await addEvent({
      lane: 'post-release',
      title: item.type === 'pending_pitch' ? 'Send the pitch' : 'Follow up',
      date: plannedDate(item),
      colour: getLaneColour('post-release'),
      description: label.contact
        ? `From your follow-ups in Scout. Contact: ${label.contact}`
        : 'From your follow-ups in Scout.',
      source: 'manual',
      tags: ['follow-up'],
      contactId: label.contact ?? null,
    })
    setPlannedIds((previous) => new Set(previous).add(item.id))
    capture('follow_up_planned', { type: item.type })
  }

  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h4 className="text-xs font-medium text-ta-white/50 border-b border-ta-white/[0.06] pb-1.5">
          Worth a follow-up
        </h4>
        <p className="text-xs text-ta-white/40 leading-relaxed pt-1">
          What your promo history suggests is worth a look. Nothing sends itself.
        </p>
      </div>

      {queueStatus === 'loading' && (
        <div className="space-y-2.5 pt-1">
          <SkeletonLine width="80%" delay={0} />
          <SkeletonLine width="65%" delay={0.15} />
          <SkeletonLine width="72%" delay={0.3} />
        </div>
      )}

      {queueStatus === 'unavailable' && (
        <p className="text-xs text-ta-white/35 leading-relaxed">
          Relationship memory connects when TAP is linked.
        </p>
      )}

      {queueStatus === 'error' && (
        <p className="text-xs text-ta-white/40 leading-relaxed">
          Could not reach your follow-ups just now. They will be here when the connection is back.
        </p>
      )}

      {queueStatus === 'ready' && queue.length === 0 && (
        <p className="text-xs text-ta-white/40 leading-relaxed">
          Nothing waiting. When pitches go out, follow-ups gather here.
        </p>
      )}

      {queueStatus === 'ready' && queue.length > 0 && (
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {queue.map((item) => {
              const label = itemLabel(item)
              const canLogOutcome = item.type === 'follow_up' || item.type === 'pending_pitch'
              return (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={NORMAL_TRANSITION}
                  className="rounded-ta-sm border border-ta-white/[0.06] bg-ta-panel/50 p-3 space-y-2"
                >
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-xs text-ta-white/80">{label.title}</span>
                    {label.detail && (
                      <span className="text-[11px] text-ta-cyan/70">{label.detail}</span>
                    )}
                    {label.contact && (
                      <span className="text-[10px] font-mono text-ta-white/30">
                        {label.contact}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {canLogOutcome &&
                      OUTCOME_ACTIONS.map((action) => (
                        <button
                          key={action.status}
                          onClick={() => logOutcome(item, action.status)}
                          className="px-2.5 py-1 rounded-ta-sm border border-ta-white/[0.1] text-[11px] text-ta-white/55 hover:border-ta-cyan/40 hover:text-ta-white/80 transition-colors"
                        >
                          {action.label}
                        </button>
                      ))}
                    {plannedIds.has(item.id) ? (
                      <span className="px-2.5 py-1 text-[11px] text-ta-cyan/70">
                        On the timeline
                      </span>
                    ) : (
                      <button
                        onClick={() => void planOnTimeline(item)}
                        className="px-2.5 py-1 rounded-ta-sm border border-ta-cyan/25 text-[11px] text-ta-cyan/80 hover:border-ta-cyan/50 hover:text-ta-cyan transition-colors"
                      >
                        Put it on the timeline
                      </button>
                    )}
                  </div>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      )}
    </section>
  )
}

function SummarySection() {
  const summary = useIntelStore((s) => s.summary)
  const summaryStatus = useIntelStore((s) => s.summaryStatus)
  const summaryError = useIntelStore((s) => s.summaryError)
  const generateSummary = useIntelStore((s) => s.generateSummary)

  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h4 className="text-xs font-medium text-ta-white/50 border-b border-ta-white/[0.06] pb-1.5">
          The picture
        </h4>
        <p className="text-xs text-ta-white/40 leading-relaxed pt-1">
          A plain-English read of your relationships, from what actually happened.
        </p>
      </div>

      {summaryStatus === 'idle' && (
        <button
          onClick={generateSummary}
          className="px-4 py-2.5 rounded-ta-sm bg-ta-cyan text-ta-black text-xs font-medium hover:bg-ta-cyan/90 transition-colors"
        >
          What&apos;s the picture?
        </button>
      )}

      {summaryStatus === 'generating' && (
        <div className="space-y-2.5">
          <p className="text-xs text-ta-white/50">Reading your history…</p>
          <SkeletonLine width="85%" delay={0} />
          <SkeletonLine width="70%" delay={0.15} />
          <SkeletonLine width="78%" delay={0.3} />
        </div>
      )}

      {summaryStatus === 'unavailable' && (
        <p className="text-xs text-ta-white/35 leading-relaxed">
          Relationship memory connects when TAP is linked.
        </p>
      )}

      {summaryStatus === 'empty' && (
        <p className="text-xs text-ta-white/40 leading-relaxed">
          Not enough history yet. Log a few outcomes first and the picture will form.
        </p>
      )}

      {summaryStatus === 'error' && (
        <div className="space-y-2">
          <p className="text-xs text-ta-white/40 leading-relaxed">{summaryError}</p>
          <button
            onClick={generateSummary}
            className="px-3 py-1.5 rounded-ta-sm border border-ta-white/[0.12] text-ta-white/60 text-xs hover:border-ta-white/25 transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {summaryStatus === 'ready' && summary && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={NORMAL_TRANSITION}
          className="space-y-3"
        >
          <p className="text-xs text-ta-white/70 leading-relaxed">{summary.summary}</p>
          <div className="space-y-2">
            {summary.signals.map((signal, i) => (
              <div
                key={i}
                className="rounded-ta-sm border border-ta-white/[0.06] bg-ta-panel/50 p-3 space-y-1.5"
              >
                <p className="text-xs text-ta-white/80 leading-relaxed">{signal.observation}</p>
                <p className="text-xs text-ta-white/50 leading-relaxed">
                  <span className="text-ta-cyan/70">Worth considering:</span>{' '}
                  {signal.worth_considering}
                </p>
              </div>
            ))}
          </div>
          <button
            onClick={generateSummary}
            className="text-[11px] text-ta-white/40 hover:text-ta-white/70 transition-colors"
          >
            Refresh
          </button>
        </motion.div>
      )}
    </section>
  )
}

function WhatWorkedSection() {
  const whatWorked = useIntelStore((s) => s.whatWorked)
  const headline = useIntelStore((s) => s.whatWorkedHeadline)
  const whatWorkedStatus = useIntelStore((s) => s.whatWorkedStatus)
  const whatWorkedError = useIntelStore((s) => s.whatWorkedError)
  const generateWhatWorked = useIntelStore((s) => s.generateWhatWorked)

  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h4 className="text-xs font-medium text-ta-white/50 border-b border-ta-white/[0.06] pb-1.5">
          What worked
        </h4>
        <p className="text-xs text-ta-white/40 leading-relaxed pt-1">
          The release retrospective, from your own numbers. Patterns worth repeating.
        </p>
      </div>

      {whatWorkedStatus === 'idle' && (
        <button
          onClick={generateWhatWorked}
          className="px-4 py-2.5 rounded-ta-sm border border-ta-cyan/30 text-ta-cyan text-xs font-medium hover:border-ta-cyan/60 transition-colors"
        >
          Review what worked
        </button>
      )}

      {whatWorkedStatus === 'generating' && (
        <div className="space-y-2.5">
          <p className="text-xs text-ta-white/50">Reading your history…</p>
          <SkeletonLine width="85%" delay={0} />
          <SkeletonLine width="70%" delay={0.15} />
          <SkeletonLine width="78%" delay={0.3} />
        </div>
      )}

      {whatWorkedStatus === 'unavailable' && (
        <p className="text-xs text-ta-white/35 leading-relaxed">
          The retrospective connects when TAP is linked.
        </p>
      )}

      {whatWorkedStatus === 'empty' && (
        <p className="text-xs text-ta-white/40 leading-relaxed">
          Not enough history yet{headline ? ` (${headline})` : ''}. Log outcomes as pitches land and
          this becomes your release retrospective.
        </p>
      )}

      {whatWorkedStatus === 'error' && (
        <div className="space-y-2">
          <p className="text-xs text-ta-white/40 leading-relaxed">{whatWorkedError}</p>
          <button
            onClick={generateWhatWorked}
            className="px-3 py-1.5 rounded-ta-sm border border-ta-white/[0.12] text-ta-white/60 text-xs hover:border-ta-white/25 transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {whatWorkedStatus === 'ready' && whatWorked && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={NORMAL_TRANSITION}
          className="space-y-3"
        >
          {headline && <p className="text-[11px] font-mono text-ta-cyan/70">{headline}</p>}
          <p className="text-xs text-ta-white/70 leading-relaxed">{whatWorked.summary}</p>
          <div className="space-y-2">
            {whatWorked.patterns.map((pattern, i) => (
              <div
                key={i}
                className="rounded-ta-sm border border-ta-white/[0.06] bg-ta-panel/50 p-3 space-y-1.5"
              >
                <p className="text-xs text-ta-white/80 leading-relaxed">{pattern.observation}</p>
                <p className="text-xs text-ta-white/50 leading-relaxed">
                  <span className="text-ta-cyan/70">Worth considering:</span>{' '}
                  {pattern.worth_considering}
                </p>
              </div>
            ))}
          </div>
          <button
            onClick={generateWhatWorked}
            className="text-[11px] text-ta-white/40 hover:text-ta-white/70 transition-colors"
          >
            Refresh
          </button>
        </motion.div>
      )}
    </section>
  )
}

export function IntelPanel() {
  const loadQueue = useIntelStore((s) => s.loadQueue)

  useEffect(() => {
    void loadQueue()
  }, [loadQueue])

  return (
    <div className="h-full overflow-auto px-5 py-4">
      <div className="mx-auto max-w-2xl space-y-8">
        <QueueSection />
        <SummarySection />
        <WhatWorkedSection />
      </div>
    </div>
  )
}
