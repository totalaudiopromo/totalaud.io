import { describe, expect, it } from 'vitest'
import {
  buildIntelSystemPrompt,
  buildIntelUserPrompt,
  formatContacts,
  formatOutcomes,
  parseIntelSummary,
} from '../summary'
import type { TapContact, TapOutcome } from '@/lib/tap/types'

const NOW = 1_752_710_400 // fixed reference time (unix seconds)

const contacts: TapContact[] = [
  {
    id: 'ctc_a1',
    object: 'contact',
    name: 'Jo Smith',
    outlet: 'BBC Radio 6 Music',
    role: 'Presenter',
    genres: ['indie', 'alternative'],
    last_contacted_at: NOW - 5 * 86_400,
    created: NOW - 90 * 86_400,
  },
  {
    id: 'ctc_b2',
    object: 'contact',
    name: 'Amara Okafor',
    outlet: 'Folk Radio UK',
    last_contacted_at: null,
    created: NOW - 30 * 86_400,
  },
]

const outcomes: TapOutcome[] = [
  {
    id: 'out_1',
    object: 'outcome',
    contact: 'ctc_a1',
    status: 'added',
    logged_at: NOW - 4 * 86_400,
    created: NOW - 4 * 86_400,
  },
  {
    id: 'out_2',
    object: 'outcome',
    contact: 'ctc_b2',
    status: 'no_response',
    logged_at: NOW - 20 * 86_400,
    created: NOW - 20 * 86_400,
  },
]

describe('formatting', () => {
  it('formats contacts with recency in plain English', () => {
    const text = formatContacts(contacts, NOW)
    expect(text).toContain('Jo Smith at BBC Radio 6 Music (Presenter)')
    expect(text).toContain('last contacted: 5 days ago')
    expect(text).toContain('last contacted: never')
  })

  it('resolves outcome contact ids to names', () => {
    const text = formatOutcomes(outcomes, contacts, NOW)
    expect(text).toContain('added — Jo Smith')
    expect(text).toContain('no_response — Amara Okafor')
    expect(text).not.toContain('ctc_a1 (')
  })

  it('handles empty data', () => {
    expect(formatContacts([], NOW)).toBe('No contacts yet.')
    expect(formatOutcomes([], [], NOW)).toBe('No outcomes logged yet.')
  })
})

describe('prompt guardrails', () => {
  // Brand-voice hard rules: memory not ranking, perspectives not agents.
  // ("rankings" appears only inside the explicit prohibition, so it is
  // asserted separately rather than banned as a token.)
  const BANNED_IN_USER_PROMPT = [/\bscore\b/i, /\btop contact/i, /\bagent\b/i]

  it('system prompt forbids ranking and automation', () => {
    const prompt = buildIntelSystemPrompt()
    expect(prompt).toMatch(/Never rank people/i)
    expect(prompt).toMatch(/Never suggest mass outreach/i)
    expect(prompt).toMatch(/British English/)
  })

  it('user prompt carries data and no banned vocabulary', () => {
    const prompt = buildIntelUserPrompt(contacts, outcomes, NOW)
    expect(prompt).toContain('Jo Smith')
    expect(prompt).toContain('OUTCOMES (2')
    expect(prompt).toMatch(/not rankings/i)
    for (const pattern of BANNED_IN_USER_PROMPT) {
      expect(prompt).not.toMatch(pattern)
    }
  })
})

describe('parseIntelSummary', () => {
  it('parses a valid response wrapped in prose', () => {
    const valid = {
      summary: 'A small circle, but a warm one.',
      signals: [
        {
          observation: 'Jo Smith added the last single within a day of the pitch.',
          worth_considering: 'She may be the natural first listen for the next release.',
        },
      ],
    }
    const parsed = parseIntelSummary(`Notes:\n${JSON.stringify(valid)}\nDone.`)
    expect(parsed.summary).toContain('small circle')
    expect(parsed.signals).toHaveLength(1)
  })

  it('rejects malformed responses', () => {
    expect(() => parseIntelSummary('no json here')).toThrow(/No JSON/)
    expect(() => parseIntelSummary('{"summary":""}')).toThrow(/Missing summary/)
    expect(() => parseIntelSummary('{"summary":"x"}')).toThrow(/Missing signals/)
    expect(() => parseIntelSummary('{"summary":"x","signals":[{"observation":1}]}')).toThrow(
      /Malformed signal/
    )
  })
})
