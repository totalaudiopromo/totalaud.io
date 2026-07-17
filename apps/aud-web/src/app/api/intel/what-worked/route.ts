/**
 * GET /api/intel/what-worked
 *
 * The release retrospective (Phase 5, docs/ROADMAP_2026.md): headline
 * numbers computed in code from the artist's own TAP outcomes, plus a
 * plain-English read of patterns worth repeating next release. Own data
 * only — no third-party scraping, no rankings.
 *
 * Degrades gracefully: TAP unconfigured or unreachable returns
 * `available: false`; thin history returns `empty: true` with the numbers.
 */

import { NextResponse } from 'next/server'
import { completeWithAnthropic } from '@total-audio/core-ai-provider'
import { requireAuth } from '@/lib/api/requireAuth'
import { getTapClient, TapApiError } from '@/lib/tap/client'
import {
  buildWhatWorkedSystemPrompt,
  buildWhatWorkedUserPrompt,
  computeOutcomeStats,
  describeStats,
  hasEnoughHistory,
  parseWhatWorked,
  type ReleaseEvent,
} from '@/lib/intel/what-worked'
import { logger } from '@/lib/logger'

const log = logger.scope('WhatWorkedRoute')

export async function GET(): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response

  const tap = getTapClient()
  if (!tap.isConfigured) {
    return NextResponse.json({ available: false })
  }

  try {
    const [contacts, outcomes, releaseRows] = await Promise.all([
      tap.listContacts({ limit: 100 }),
      tap.listOutcomes({ limit: 100 }),
      auth.supabase
        .from('user_timeline_events')
        .select('title, event_date')
        .eq('user_id', auth.user.id)
        .eq('lane', 'release')
        .order('event_date', { ascending: false })
        .limit(12),
    ])

    const nowUnixSeconds = Math.floor(Date.now() / 1000)
    const stats = computeOutcomeStats(outcomes.data, nowUnixSeconds)

    if (!hasEnoughHistory(stats)) {
      return NextResponse.json({
        available: true,
        empty: true,
        headline: describeStats(stats),
        settled: stats.settled,
      })
    }

    const releases: ReleaseEvent[] = (releaseRows.data ?? []).map((row) => ({
      title: row.title,
      date: row.event_date,
    }))

    const result = await completeWithAnthropic(
      [
        { role: 'system', content: buildWhatWorkedSystemPrompt() },
        {
          role: 'user',
          content: buildWhatWorkedUserPrompt({
            stats,
            outcomes: outcomes.data,
            contacts: contacts.data,
            releases,
            nowUnixSeconds,
          }),
        },
      ],
      // Bounded JSON formatting task — keep the whole budget for the response
      { max_tokens: 1500, thinking: 'disabled' }
    )

    const review = parseWhatWorked(result.content)
    return NextResponse.json({
      available: true,
      empty: false,
      review,
      headline: describeStats(stats),
      stats: {
        settled: stats.settled,
        by_status: stats.byStatus,
        response_rate: stats.responseRate,
        added_rate: stats.addedRate,
        last_30: stats.last30,
        previous_30: stats.previous30,
      },
    })
  } catch (error) {
    if (error instanceof TapApiError && error.isTransient) {
      log.warn('TAP unreachable for what-worked review', { code: error.code })
      return NextResponse.json({ available: false })
    }
    log.error('What-worked review failed', error instanceof Error ? error : undefined)
    return NextResponse.json(
      { error: 'The retrospective is taking a moment — try again shortly' },
      { status: 502 }
    )
  }
}
