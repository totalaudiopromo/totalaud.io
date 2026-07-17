import { describe, expect, it } from 'vitest'
import {
  buildSystemPrompt,
  buildUserPrompt,
  formatContext,
  parseFinishingNotes,
} from '../perspectives'
import type { AnalysisResult } from '@/lib/finisher-client'

const analysisFixture: AnalysisResult = {
  integrated_lufs: -14.2,
  true_peak_dbfs: -1.3,
  loudness_range_lu: 6.4,
  dynamic_range_db: 8.1,
  crest_factor_db: 11.2,
  rms_db: -17.5,
  stereo_width: 0.24,
  mid_side_ratio: 3.1,
  correlation: 0.82,
  dc_offset: 0.00001,
  silence_ratio: 0.01,
  sample_rate: 48000,
  channels: 2,
  duration_seconds: 214.5,
  spectral_centroid_hz: 1850.2,
  spectral_rolloff_hz: 8200.5,
  qc_passed: true,
  qc_warnings: [],
  suggestions: [],
}

/**
 * Brand-voice guardrails (docs/VISION.md hard rules). If any of these start
 * failing, the prompts have drifted from the product's voice — fix the
 * prompt, not the test.
 */
const BANNED_IN_PROMPTS = [
  /\bscore\b/i,
  /\brating\b/i,
  /\bgrade\b/i,
  /\bAI-powered\b/i,
  /\bagent\b/i, // perspectives, not agents
  /\brevolutionary\b/i,
  /\bgame-changing\b/i,
]

// The system prompt legitimately mentions banned words when forbidding them
// ("Never use scores..."). These checks apply to the *user* prompt, which
// carries data and framing only.
describe('prompt guardrails', () => {
  it('user prompt contains no banned vocabulary', () => {
    const prompt = buildUserPrompt(analysisFixture, {
      trackName: 'Platform 3',
      genre: 'lo-fi electronic',
      intent: 'First single of a new era',
      unsureAbout: 'Whether the low end is too much',
    })
    for (const pattern of BANNED_IN_PROMPTS) {
      expect(prompt).not.toMatch(pattern)
    }
  })

  it('system prompt forbids scores, judgement and first person', () => {
    const prompt = buildSystemPrompt()
    expect(prompt).toMatch(/Never use scores/i)
    expect(prompt).toMatch(/Never write in the first person/i)
    expect(prompt).toMatch(/British English/)
  })

  it('system prompt states the privacy position', () => {
    expect(buildSystemPrompt()).toMatch(/audio itself is never uploaded/i)
  })

  it('user prompt carries the measurements and context', () => {
    const prompt = buildUserPrompt(analysisFixture, { genre: 'folk' })
    expect(prompt).toContain('-14.2 LUFS')
    expect(prompt).toContain('folk')
    expect(prompt).toMatch(/cannot hear the track/i)
  })

  it('handles empty context gracefully', () => {
    expect(formatContext({})).toBe('No additional context provided.')
  })
})

describe('parseFinishingNotes', () => {
  const valid = {
    perspectives: [
      {
        perspective: 'producer',
        summary: 'The structure reads as confident.',
        notes: [
          {
            observation: 'Loudness sits at a comfortable streaming level.',
            worth_considering: 'Nothing needs to change here.',
          },
        ],
      },
    ],
    before_release: ['Check the final master on phone speakers.'],
  }

  it('parses valid JSON, including when wrapped in prose', () => {
    const wrapped = `Here are the notes:\n${JSON.stringify(valid)}\nHope that helps.`
    const parsed = parseFinishingNotes(wrapped)
    expect(parsed.perspectives[0].perspective).toBe('producer')
    expect(parsed.before_release).toHaveLength(1)
  })

  it('rejects unknown perspectives', () => {
    const bad = JSON.stringify({
      perspectives: [{ perspective: 'critic', summary: 'x', notes: [] }],
      before_release: [],
    })
    expect(() => parseFinishingNotes(bad)).toThrow(/Unknown perspective/)
  })

  it('rejects responses without JSON', () => {
    expect(() => parseFinishingNotes('Sorry, no notes today.')).toThrow(/No JSON/)
  })

  it('defaults missing before_release to an empty array', () => {
    const withoutBeforeRelease = JSON.stringify({ perspectives: valid.perspectives })
    expect(parseFinishingNotes(withoutBeforeRelease).before_release).toEqual([])
  })
})
