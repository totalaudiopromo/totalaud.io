/**
 * Finishing-note perspectives — prompt builders for Finish mode.
 *
 * Turns the client-side DSP analysis plus the artist's own context into
 * human-framed finishing notes from four perspectives (docs/VISION.md):
 * producer, mix/translation, trusted listener, industry/release context.
 *
 * Hard rules encoded here (and enforced by unit tests):
 * - No scores, ratings, grades or marks out of anything
 * - No judgement words ("bad", "amateur", "wrong")
 * - Never first person ("I think") — notes are framed as the perspective
 * - Decision support, not automation: every note ends with something the
 *   artist can choose to consider, never an instruction to obey
 * - British English throughout
 */

import type { AnalysisResult } from '@/lib/finisher-client'

export const PERSPECTIVE_IDS = ['producer', 'mix', 'listener', 'industry'] as const
export type PerspectiveId = (typeof PERSPECTIVE_IDS)[number]

export interface PerspectiveNote {
  observation: string
  worth_considering: string
}

export interface PerspectiveResult {
  perspective: PerspectiveId
  summary: string
  notes: PerspectiveNote[]
}

export interface FinishingNotes {
  perspectives: PerspectiveResult[]
  before_release: string[]
}

export interface TrackContext {
  trackName?: string
  genre?: string
  intent?: string
  references?: string
  unsureAbout?: string
}

const PERSPECTIVE_FRAMES: Record<PerspectiveId, string> = {
  producer:
    'A producer who has heard thousands of records in this lane. Cares about arrangement, energy, pacing, whether sections earn their length, and whether the hook arrives soon enough.',
  mix: 'A mix engineer thinking about translation: how this will sound on phone speakers, earbuds, club systems and radio. Cares about balance, low end, mono compatibility, harshness and headroom.',
  listener:
    'A trusted listener hearing the track for the first time on a normal evening. Cares about first impressions, where attention drifts, what sticks afterwards. Speaks plainly, no technical language.',
  industry:
    'Someone who places music for a living — playlists, radio, sync. Cares about release readiness, how the track opens (the first 15 seconds), edit potential, and how it sits next to current releases in its genre.',
}

export function formatMetrics(analysis: AnalysisResult): string {
  const lines = [
    `Integrated loudness: ${analysis.integrated_lufs} LUFS`,
    `True peak: ${analysis.true_peak_dbfs} dBTP`,
    `Loudness range: ${analysis.loudness_range_lu} LU`,
    `Short-term level movement: ${analysis.dynamic_range_db} dB`,
    `Crest factor: ${analysis.crest_factor_db} dB`,
    `Stereo width (side energy share): ${analysis.stereo_width}`,
    `Left/right correlation: ${analysis.correlation}`,
    `Spectral centroid: ${analysis.spectral_centroid_hz} Hz`,
    `Spectral rolloff (85%): ${analysis.spectral_rolloff_hz} Hz`,
    `Duration: ${analysis.duration_seconds}s, ${analysis.channels} channel(s) at ${analysis.sample_rate} Hz`,
    `Silence ratio: ${analysis.silence_ratio}`,
  ]
  if (analysis.qc_warnings.length > 0) {
    lines.push(`Technical flags: ${analysis.qc_warnings.join('; ')}`)
  }
  return lines.map((line) => `- ${line}`).join('\n')
}

export function formatContext(context: TrackContext): string {
  const parts: string[] = []
  if (context.trackName) parts.push(`Track: ${context.trackName}`)
  if (context.genre) parts.push(`Genre / lane: ${context.genre}`)
  if (context.intent) parts.push(`What the artist wants from this release: ${context.intent}`)
  if (context.references) parts.push(`Reference artists or tracks: ${context.references}`)
  if (context.unsureAbout) parts.push(`What the artist is unsure about: ${context.unsureAbout}`)
  return parts.length > 0 ? parts.join('\n') : 'No additional context provided.'
}

export function buildSystemPrompt(
  perspectives: readonly PerspectiveId[] = PERSPECTIVE_IDS
): string {
  const perspectiveLines = perspectives
    .map(
      (id, index) =>
        `    { "perspective": "${id}", "summary": "${index === 0 ? 'one-sentence overall read' : '...'}", "notes": [ ${index === 0 ? '{ "observation": "...", "worth_considering": "..." }' : '...'} ] }`
    )
    .join(',\n')

  return `You write finishing notes for independent artists inside totalaud.io — a calm second opinion before release, from someone on their side.

You are given objective measurements of a track (the audio itself is never uploaded; analysis happens on the artist's device) plus the artist's own context. You cannot hear the track. Reason honestly from the numbers and the context, and be explicit when something can only be confirmed by listening.

Voice and boundaries — these are hard rules:
- British English, calm, specific, warm. Like an experienced friend, not a consultant.
- Perspectives, not verdicts. Each note is an observation plus something worth considering — the artist decides.
- Never use scores, ratings, grades, rankings or "out of 10".
- Never use judgemental words such as "bad", "poor", "amateur", "wrong", "mistake", "failure".
- Never write in the first person. No "I think", "I would", "my advice".
- Never tell the artist to buy anything or use any specific paid service.
- If the numbers look healthy, say so plainly — reassurance is a valid finishing note.
- Frame every technical point through what it means for the music being heard.

Respond with valid JSON only, matching exactly this shape:
{
  "perspectives": [
${perspectiveLines}
  ],
  "before_release": [ "short plain-English item", ... ]
}

Rules for the JSON content:
- 2 to 4 notes per perspective. Quality over volume.
- "before_release" holds at most 4 items: only things genuinely worth checking before releasing, drawn from the technical flags and context. If nothing needs checking, return an empty array.
- No markdown inside strings.`
}

export function buildUserPrompt(
  analysis: AnalysisResult,
  context: TrackContext,
  perspectives: readonly PerspectiveId[] = PERSPECTIVE_IDS
): string {
  const frames = perspectives.map((id) => `${id}: ${PERSPECTIVE_FRAMES[id]}`).join('\n')
  return `Here is the track analysis and the artist's context. Write the finishing notes.

MEASUREMENTS (from the artist's device):
${formatMetrics(analysis)}

ARTIST CONTEXT:
${formatContext(context)}

PERSPECTIVE FRAMES:
${frames}

Remember: you cannot hear the track. Where a measurement suggests something a human should confirm by ear, say exactly what to listen for and where.`
}

/**
 * Parse and validate Claude's JSON response. Throws on malformed output so
 * the route can retry or degrade rather than rendering rubbish.
 */
export function parseFinishingNotes(raw: string): FinishingNotes {
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1 || end <= start) throw new Error('No JSON object in response')
  const parsed = JSON.parse(raw.slice(start, end + 1)) as FinishingNotes

  if (!Array.isArray(parsed.perspectives) || parsed.perspectives.length === 0) {
    throw new Error('Missing perspectives')
  }
  for (const perspective of parsed.perspectives) {
    if (!PERSPECTIVE_IDS.includes(perspective.perspective)) {
      throw new Error(`Unknown perspective: ${perspective.perspective}`)
    }
    if (typeof perspective.summary !== 'string' || !Array.isArray(perspective.notes)) {
      throw new Error('Malformed perspective')
    }
    for (const note of perspective.notes) {
      if (typeof note.observation !== 'string' || typeof note.worth_considering !== 'string') {
        throw new Error('Malformed note')
      }
    }
  }
  if (!Array.isArray(parsed.before_release)) parsed.before_release = []
  return parsed
}
