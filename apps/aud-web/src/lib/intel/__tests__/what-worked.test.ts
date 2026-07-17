import { describe, expect, it } from 'vitest'
import {
  buildWhatWorkedSystemPrompt,
  buildWhatWorkedUserPrompt,
  computeOutcomeStats,
  describeStats,
  formatReleases,
  hasEnoughHistory,
  parseWhatWorked,
} from '../what-worked'
import type { TapContact, TapOutcome } from '@/lib/tap/types'

const NOW = 1_784_283_000 // fixed unix seconds for deterministic tests
const DAY = 86_400

function outcome(partial: Partial<TapOutcome>): TapOutcome {
  return {
    id: 'out_1',
    object: 'outcome',
    contact: 'ctc_1',
    status: 'replied',
    created: NOW - DAY,
    ...partial,
  }
}

const contacts: TapContact[] = [
  {
    id: 'ctc_1',
    object: 'contact',
    name: 'Amara Okafor',
    outlet: 'Night Shift Radio',
    created: NOW - 90 * DAY,
  },
]

describe('computeOutcomeStats', () => {
  it('counts statuses and computes rates', () => {
    const stats = computeOutcomeStats(
      [
        outcome({ id: 'out_1', status: 'replied' }),
        outcome({ id: 'out_2', status: 'added' }),
        outcome({ id: 'out_3', status: 'declined' }),
        outcome({ id: 'out_4', status: 'no_response' }),
        outcome({ id: 'out_5', status: 'pending' }),
      ],
      NOW
    )
    expect(stats.settled).toBe(4)
    expect(stats.pending).toBe(1)
    expect(stats.responseRate).toBeCloseTo(0.5)
    expect(stats.addedRate).toBeCloseTo(0.25)
  })

  it('treats unknown forward-compatible statuses as pending', () => {
    const stats = computeOutcomeStats(
      [outcome({ status: 'shortlisted' as TapOutcome['status'] })],
      NOW
    )
    expect(stats.pending).toBe(1)
    expect(stats.settled).toBe(0)
    expect(stats.responseRate).toBeNull()
  })

  it('splits momentum into the last 30 days and the 30 before', () => {
    const stats = computeOutcomeStats(
      [
        outcome({ id: 'out_1', logged_at: NOW - 5 * DAY }),
        outcome({ id: 'out_2', logged_at: NOW - 29 * DAY }),
        outcome({ id: 'out_3', logged_at: NOW - 45 * DAY }),
        outcome({ id: 'out_4', logged_at: NOW - 70 * DAY }),
      ],
      NOW
    )
    expect(stats.last30).toBe(2)
    expect(stats.previous30).toBe(1)
  })

  it('needs five settled outcomes before a retrospective', () => {
    const thin = computeOutcomeStats([outcome({})], NOW)
    expect(hasEnoughHistory(thin)).toBe(false)
    const enough = computeOutcomeStats(
      Array.from({ length: 5 }, (_, i) => outcome({ id: `out_${i}` })),
      NOW
    )
    expect(hasEnoughHistory(enough)).toBe(true)
  })
})

describe('formatting', () => {
  it('describes the headline numbers in plain English', () => {
    const stats = computeOutcomeStats(
      [outcome({ id: 'out_1', status: 'replied' }), outcome({ id: 'out_2', status: 'added' })],
      NOW
    )
    const line = describeStats(stats)
    expect(line).toContain('2 outcomes logged')
    expect(line).toContain('1 reply')
    expect(line).toContain('1 added')
  })

  it('formats releases and handles the empty case', () => {
    expect(formatReleases([])).toContain('No releases')
    expect(
      formatReleases([{ title: 'Release day: Night Drive', date: '2026-06-20T12:00:00Z' }])
    ).toContain('Night Drive (2026-06-20)')
  })
})

describe('prompt guardrails', () => {
  it('system prompt keeps the hard rules', () => {
    const prompt = buildWhatWorkedSystemPrompt()
    expect(prompt).toMatch(/Never rank people/)
    expect(prompt).toMatch(/no leaderboards/i)
    expect(prompt).toMatch(/Never suggest mass outreach/)
    expect(prompt).toMatch(/British English/)
    expect(prompt).toMatch(/Small numbers are normal/)
  })

  it('user prompt carries names, numbers and releases', () => {
    const outcomes = [outcome({ status: 'added', logged_at: NOW - 2 * DAY })]
    const prompt = buildWhatWorkedUserPrompt({
      stats: computeOutcomeStats(outcomes, NOW),
      outcomes,
      contacts,
      releases: [{ title: 'Release day: Night Drive', date: '2026-06-20T12:00:00Z' }],
      nowUnixSeconds: NOW,
    })
    expect(prompt).toContain('Amara Okafor at Night Shift Radio')
    expect(prompt).toContain('Night Drive')
    expect(prompt).toContain('1 added')
    expect(prompt).not.toContain('ctc_1')
  })
})

describe('parseWhatWorked', () => {
  it('parses a valid review', () => {
    const review = parseWhatWorked(
      JSON.stringify({
        summary: 'A quiet but real start.',
        patterns: [
          {
            observation: 'Both adds came from radio people you had already spoken to.',
            worth_considering: 'Warm the radio circle up first for the next single.',
          },
        ],
      })
    )
    expect(review.patterns).toHaveLength(1)
  })

  it('rejects malformed responses', () => {
    expect(() => parseWhatWorked('nope')).toThrow(/No JSON/)
    expect(() => parseWhatWorked('{"patterns":[]}')).toThrow(/Missing summary/)
    expect(() => parseWhatWorked('{"summary":"x"}')).toThrow(/Missing patterns/)
  })
})
