import { describe, expect, it } from 'vitest'
import {
  buildConsistencySystemPrompt,
  buildConsistencyUserPrompt,
  formatIdentity,
  hasUsableIdentity,
  parseConsistencyResult,
  type IdentitySnapshot,
} from '../consistency'

const identity: IdentitySnapshot = {
  tone: 'intimate, unhurried',
  themes: ['night journeys', 'small hours'],
  keyPhrases: ['made for headphones'],
  oneLiner: 'Bedroom electronics for 3am train rides',
  comparisons: ['Tycho', 'Burial'],
  bioShort: 'Maya Chen crafts intimate electronic soundscapes from her Bristol bedroom.',
}

describe('identity formatting', () => {
  it('formats saved identity fields', () => {
    const text = formatIdentity(identity)
    expect(text).toContain('One-liner: Bedroom electronics')
    expect(text).toContain('Comparisons: Tycho, Burial')
  })

  it('detects usable vs empty identities', () => {
    expect(hasUsableIdentity(identity)).toBe(true)
    expect(hasUsableIdentity({})).toBe(false)
    expect(hasUsableIdentity({ tone: 'warm' })).toBe(true)
  })
})

describe('prompt guardrails', () => {
  it('system prompt forbids scores, first person and forced rewrites', () => {
    const prompt = buildConsistencySystemPrompt()
    expect(prompt).toMatch(/Never use scores/i)
    expect(prompt).toMatch(/Never write in the first person/i)
    expect(prompt).toMatch(/not a cage/i)
    expect(prompt).toMatch(/British English/)
  })

  it('user prompt carries the identity and the draft', () => {
    const prompt = buildConsistencyUserPrompt(
      'Stadium-ready bangers from the loudest new act in Bristol.',
      'pitch',
      identity
    )
    expect(prompt).toContain('Stadium-ready bangers')
    expect(prompt).toContain('3am train rides')
    expect(prompt).toContain('DRAFT (pitch)')
  })
})

describe('parseConsistencyResult', () => {
  it('parses a valid aligned result with no notes', () => {
    const result = parseConsistencyResult(
      JSON.stringify({ aligned: true, summary: 'Reads as the same artist.', notes: [] })
    )
    expect(result.aligned).toBe(true)
    expect(result.notes).toHaveLength(0)
  })

  it('parses drift notes', () => {
    const result = parseConsistencyResult(
      JSON.stringify({
        aligned: false,
        summary: 'The draft pushes a bigger, louder story than the saved one.',
        notes: [
          {
            observation: '"Stadium-ready" sits oddly against "made for headphones".',
            worth_considering:
              'Keep the intimacy if that is still the story, or update the identity if it has changed.',
          },
        ],
      })
    )
    expect(result.aligned).toBe(false)
    expect(result.notes[0].observation).toContain('Stadium-ready')
  })

  it('rejects malformed responses', () => {
    expect(() => parseConsistencyResult('nope')).toThrow(/No JSON/)
    expect(() => parseConsistencyResult('{"summary":"x","notes":[]}')).toThrow(/Missing aligned/)
    expect(() => parseConsistencyResult('{"aligned":true,"notes":[]}')).toThrow(/Missing summary/)
  })
})
