/**
 * Intel Store
 *
 * Relationship memory in Scout: the "worth a follow-up" queue and the
 * who-matters summary, both fed by TAP through /api/intel/*.
 *
 * Principles (docs/STRATEGY_2026.md §6):
 * - Quiet and in-workspace. Nothing here sends anything; the artist decides.
 * - The summary is an AI call, so it only runs on an explicit user action.
 * - Everything degrades gracefully when TAP is not connected.
 */

import { create } from 'zustand'
import { logger } from '@/lib/logger'
import { capture } from '@/lib/analytics'
import type { TapActionQueueItem, TapOutcomeStatus } from '@/lib/tap/types'
import type { IntelSummary } from '@/lib/intel/summary'

const log = logger.scope('Intel Store')

export type QueueStatus = 'idle' | 'loading' | 'ready' | 'unavailable' | 'error'
export type SummaryStatus = 'idle' | 'generating' | 'ready' | 'empty' | 'unavailable' | 'error'

interface IntelState {
  queue: TapActionQueueItem[]
  queueStatus: QueueStatus

  summary: IntelSummary | null
  summaryStatus: SummaryStatus
  summaryError: string | null

  loadQueue: () => Promise<void>
  logOutcome: (item: TapActionQueueItem, status: TapOutcomeStatus) => Promise<void>
  generateSummary: () => Promise<void>
}

export const useIntelStore = create<IntelState>((set, get) => ({
  queue: [],
  queueStatus: 'idle',
  summary: null,
  summaryStatus: 'idle',
  summaryError: null,

  loadQueue: async () => {
    if (get().queueStatus === 'loading') return
    set({ queueStatus: 'loading' })

    try {
      const response = await fetch('/api/intel/action-queue?limit=25')
      if (!response.ok) throw new Error(`Queue fetch failed: ${response.status}`)
      const body = await response.json()

      if (body.available === false) {
        set({ queue: [], queueStatus: 'unavailable' })
        return
      }
      set({ queue: body.data ?? [], queueStatus: 'ready' })
    } catch (error) {
      log.error('Action queue load failed', error)
      set({ queueStatus: 'error' })
    }
  },

  logOutcome: async (item, status) => {
    const contact =
      item.follow_up?.contact ?? item.stale_contact?.contact ?? item.pending_pitch?.contact
    if (!contact) return

    // Optimistic: the row fades out immediately; restore on failure.
    const previous = get().queue
    set({ queue: previous.filter((queued) => queued.id !== item.id) })

    try {
      const response = await fetch('/api/intel/outcomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact,
          status,
          pitch: item.follow_up?.pitch ?? item.pending_pitch?.pitch,
        }),
      })
      if (!response.ok) throw new Error(`Outcome log failed: ${response.status}`)
      capture('outcome_logged', { status })
    } catch (error) {
      log.error('Outcome log failed', error)
      set({ queue: previous })
    }
  },

  generateSummary: async () => {
    if (get().summaryStatus === 'generating') return
    set({ summaryStatus: 'generating', summaryError: null })

    try {
      const response = await fetch('/api/intel/summary')
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || `Summary failed: ${response.status}`)
      }
      const body = await response.json()

      if (body.available === false) {
        set({ summaryStatus: 'unavailable' })
        return
      }
      if (body.empty) {
        set({ summaryStatus: 'empty' })
        return
      }
      set({ summary: body.summary, summaryStatus: 'ready' })
      capture('intel_summary_generated', {
        contacts: body.contact_count,
        outcomes: body.outcome_count,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'The notes are taking a moment, try again shortly'
      log.error('Intel summary failed', error)
      set({ summaryStatus: 'error', summaryError: message })
    }
  },
}))
