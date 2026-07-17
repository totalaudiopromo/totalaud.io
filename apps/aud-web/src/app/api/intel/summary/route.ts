/**
 * GET /api/intel/summary
 *
 * The "who matters" read: Claude reasons over the artist's TAP contacts and
 * pitch outcomes and returns plain-English relationship signals. Memory and
 * recall, never rankings (docs/VISION.md §3, docs/STRATEGY_2026.md §6).
 *
 * Degrades gracefully: TAP unconfigured or unreachable returns
 * `available: false` rather than an error.
 */

import { NextResponse } from 'next/server'
import { completeWithAnthropic } from '@total-audio/core-ai-provider'
import { requireAuth } from '@/lib/api/requireAuth'
import { getTapClient, TapApiError } from '@/lib/tap/client'
import {
  buildIntelSystemPrompt,
  buildIntelUserPrompt,
  parseIntelSummary,
} from '@/lib/intel/summary'
import { logger } from '@/lib/logger'

const log = logger.scope('IntelSummaryRoute')

export async function GET(): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response

  const tap = getTapClient()
  if (!tap.isConfigured) {
    return NextResponse.json({ available: false })
  }

  try {
    const [contacts, outcomes] = await Promise.all([
      tap.listContacts({ limit: 50 }),
      tap.listOutcomes({ limit: 100 }),
    ])

    if (contacts.data.length === 0) {
      return NextResponse.json({ available: true, empty: true })
    }

    const nowUnixSeconds = Math.floor(Date.now() / 1000)
    const result = await completeWithAnthropic(
      [
        { role: 'system', content: buildIntelSystemPrompt() },
        {
          role: 'user',
          content: buildIntelUserPrompt(contacts.data, outcomes.data, nowUnixSeconds),
        },
      ],
      // Bounded JSON formatting task — keep the whole budget for the response
      { max_tokens: 1500, thinking: 'disabled' }
    )

    const summary = parseIntelSummary(result.content)
    return NextResponse.json({
      available: true,
      empty: false,
      summary,
      contact_count: contacts.data.length,
      outcome_count: outcomes.data.length,
    })
  } catch (error) {
    if (error instanceof TapApiError && error.isTransient) {
      log.warn('TAP unreachable for intel summary', { code: error.code })
      return NextResponse.json({ available: false })
    }
    log.error('Intel summary failed', error instanceof Error ? error : undefined)
    return NextResponse.json(
      { error: 'The relationship notes are taking a moment — try again shortly' },
      { status: 502 }
    )
  }
}
