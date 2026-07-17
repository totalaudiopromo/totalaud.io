/**
 * "What worked" — the release retrospective (Phase 5, docs/ROADMAP_2026.md).
 *
 * Own-data analytics: the numbers come from the artist's TAP outcomes and
 * timeline history, computed here in plain code. Claude's only job is to
 * turn those numbers into calm, plain-English patterns worth repeating.
 * Plain-English summaries first, charts second (and later).
 *
 * Hard rules (enforced by unit tests):
 * - Never rank people, never score them, no leaderboards
 * - Patterns are observations plus something worth considering — the artist
 *   decides what to repeat
 * - Thin history is stated honestly, never padded
 * - British English throughout
 */

import type { TapContact, TapOutcome, TapOutcomeStatus } from '@/lib/tap/types'

export interface OutcomeStats {
  /** All outcomes with a settled status (everything except pending) */
  settled: number
  pending: number
  byStatus: Record<TapOutcomeStatus, number>
  /** replied + added, as a share of settled outcomes (0..1, null when no settled) */
  responseRate: number | null
  /** added alone, as a share of settled outcomes (0..1, null when no settled) */
  addedRate: number | null
  /** Settled outcomes logged in the last 30 days vs the 30 days before */
  last30: number
  previous30: number
}

export interface ReleaseEvent {
  title: string
  date: string // ISO
}

export interface WhatWorkedPattern {
  observation: string
  worth_considering: string
}

export interface WhatWorkedReview {
  summary: string
  patterns: WhatWorkedPattern[]
}

const SETTLED_STATUSES: readonly TapOutcomeStatus[] = [
  'replied',
  'added',
  'declined',
  'no_response',
]

const THIRTY_DAYS_SECONDS = 30 * 86_400

export function computeOutcomeStats(outcomes: TapOutcome[], nowUnixSeconds: number): OutcomeStats {
  const byStatus: Record<TapOutcomeStatus, number> = {
    pending: 0,
    replied: 0,
    added: 0,
    declined: 0,
    no_response: 0,
  }

  let last30 = 0
  let previous30 = 0

  for (const outcome of outcomes) {
    const status: TapOutcomeStatus = SETTLED_STATUSES.includes(outcome.status)
      ? outcome.status
      : 'pending'
    byStatus[status] += 1

    if (status !== 'pending') {
      const when = outcome.logged_at ?? outcome.created
      const age = nowUnixSeconds - when
      if (age <= THIRTY_DAYS_SECONDS) last30 += 1
      else if (age <= 2 * THIRTY_DAYS_SECONDS) previous30 += 1
    }
  }

  const settled = byStatus.replied + byStatus.added + byStatus.declined + byStatus.no_response

  return {
    settled,
    pending: byStatus.pending,
    byStatus,
    responseRate: settled > 0 ? (byStatus.replied + byStatus.added) / settled : null,
    addedRate: settled > 0 ? byStatus.added / settled : null,
    last30,
    previous30,
  }
}

/** A retrospective needs some history to be honest about. */
export function hasEnoughHistory(stats: OutcomeStats): boolean {
  return stats.settled >= 5
}

/** One plain-English line of the headline numbers, for the UI and the prompt. */
export function describeStats(stats: OutcomeStats): string {
  const parts = [
    `${stats.settled} outcome${stats.settled === 1 ? '' : 's'} logged`,
    `${stats.byStatus.replied} repl${stats.byStatus.replied === 1 ? 'y' : 'ies'}`,
    `${stats.byStatus.added} added`,
    `${stats.byStatus.declined} declined`,
    `${stats.byStatus.no_response} with no response`,
  ]
  return parts.join(', ')
}

export function formatReleases(releases: ReleaseEvent[]): string {
  if (releases.length === 0) return 'No releases on the timeline yet.'
  return releases.map((release) => `- ${release.title} (${release.date.slice(0, 10)})`).join('\n')
}

export function buildWhatWorkedSystemPrompt(): string {
  return `You write the release retrospective for an independent artist inside totalaud.io. The numbers are computed from the artist's own promo history: pitches, replies, playlist and coverage adds, and their release timeline. Your job is to notice patterns worth repeating next release, in plain English.

Voice and boundaries — these are hard rules:
- British English, calm, specific, honest. A trusted collaborator looking back, not a dashboard.
- Never rank people. No "top contacts", no leaderboards, no scores out of anything.
- Never suggest mass outreach, automation, or sending anything on the artist's behalf.
- Ground every pattern in the data provided — do not invent results.
- Small numbers are normal for independent artists. Never dress them up; a 2-reply month can still hold a real pattern.
- Declines and silence are information, not failure. No judgement.
- If the history is too thin for a real pattern, say so plainly in the summary and return fewer patterns.

Respond with valid JSON only, matching exactly this shape:
{
  "summary": "two or three sentences: the honest read of what happened and whether momentum is building",
  "patterns": [
    { "observation": "something true and specific from the data", "worth_considering": "what the artist might repeat or change next release, phrased as an option" }
  ]
}

Rules for the JSON content:
- 1 to 4 patterns. Quality over volume.
- Use people's and outlets' names, not IDs.
- No markdown inside strings.`
}

export function buildWhatWorkedUserPrompt(input: {
  stats: OutcomeStats
  outcomes: TapOutcome[]
  contacts: TapContact[]
  releases: ReleaseEvent[]
  nowUnixSeconds: number
}): string {
  const { stats, outcomes, contacts, releases, nowUnixSeconds } = input
  const nameById = new Map(contacts.map((contact) => [contact.id, contact]))

  const outcomeLines =
    outcomes.length === 0
      ? 'No outcomes logged yet.'
      : outcomes
          .map((outcome) => {
            const contact = nameById.get(outcome.contact)
            const who = contact
              ? `${contact.name}${contact.outlet ? ` at ${contact.outlet}` : ''}`
              : outcome.contact
            const when = outcome.logged_at ?? outcome.created
            const daysAgo = Math.max(0, Math.floor((nowUnixSeconds - when) / 86_400))
            return `- ${outcome.status} — ${who} (${daysAgo} days ago)`
          })
          .join('\n')

  const momentum =
    stats.previous30 > 0 || stats.last30 > 0
      ? `Momentum: ${stats.last30} settled outcomes in the last 30 days, ${stats.previous30} in the 30 days before.`
      : 'Momentum: no settled outcomes in the last 60 days.'

  return `Here is the artist's own promo history. Write the release retrospective.

HEADLINE NUMBERS:
${describeStats(stats)}
${momentum}

RELEASES ON THE TIMELINE:
${formatReleases(releases)}

OUTCOMES (newest first — what happened after pitches):
${outcomeLines}

Remember: patterns worth repeating, grounded in the data, no rankings.`
}

/** Parse and validate Claude's JSON response. Throws on malformed output. */
export function parseWhatWorked(raw: string): WhatWorkedReview {
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1 || end <= start) throw new Error('No JSON object in response')
  const parsed = JSON.parse(raw.slice(start, end + 1)) as WhatWorkedReview

  if (typeof parsed.summary !== 'string' || parsed.summary.length === 0) {
    throw new Error('Missing summary')
  }
  if (!Array.isArray(parsed.patterns)) throw new Error('Missing patterns')
  for (const pattern of parsed.patterns) {
    if (typeof pattern.observation !== 'string' || typeof pattern.worth_considering !== 'string') {
      throw new Error('Malformed pattern')
    }
  }
  return parsed
}
