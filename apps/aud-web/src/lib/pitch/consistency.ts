/**
 * Pitch consistency checker — prompt builders.
 *
 * Compares a draft (pitch, bio, caption, press note) against the artist's
 * stored identity and returns tone-guardian notes: where the draft drifts
 * from the story the artist has already chosen (docs/VISION.md §4 — a
 * single source of narrative truth).
 *
 * Hard rules (enforced by unit tests):
 * - The identity is the reference, not a cage; notes are observations plus
 *   options, never rewrites forced on the artist
 * - No scores, no grades, no first person
 * - British English
 */

export interface IdentitySnapshot {
  tone?: string | null
  themes?: string[] | null
  keyPhrases?: string[] | null
  oneLiner?: string | null
  pressAngle?: string | null
  pitchHook?: string | null
  comparisons?: string[] | null
  bioShort?: string | null
}

export interface ConsistencyNote {
  observation: string
  worth_considering: string
}

export interface ConsistencyResult {
  aligned: boolean
  summary: string
  notes: ConsistencyNote[]
}

export function formatIdentity(identity: IdentitySnapshot): string {
  const parts: string[] = []
  if (identity.oneLiner) parts.push(`One-liner: ${identity.oneLiner}`)
  if (identity.tone) parts.push(`Tone: ${identity.tone}`)
  if (identity.themes?.length) parts.push(`Themes: ${identity.themes.join(', ')}`)
  if (identity.keyPhrases?.length) parts.push(`Key phrases: ${identity.keyPhrases.join(', ')}`)
  if (identity.pressAngle) parts.push(`Press angle: ${identity.pressAngle}`)
  if (identity.pitchHook) parts.push(`Pitch hook: ${identity.pitchHook}`)
  if (identity.comparisons?.length) parts.push(`Comparisons: ${identity.comparisons.join(', ')}`)
  if (identity.bioShort) parts.push(`Short bio: ${identity.bioShort}`)
  return parts.length > 0 ? parts.join('\n') : 'No identity details saved yet.'
}

export function hasUsableIdentity(identity: IdentitySnapshot): boolean {
  return Boolean(
    identity.oneLiner ||
      identity.tone ||
      identity.bioShort ||
      identity.pitchHook ||
      identity.themes?.length
  )
}

export function buildConsistencySystemPrompt(): string {
  return `You are the quiet keeper of an independent artist's story inside totalaud.io. The artist has a saved identity: their tone, themes and the way they talk about their music. Your job is to notice where a new draft drifts from that story, so every pitch, bio and caption tells the same one.

Voice and boundaries — these are hard rules:
- British English, calm, specific. A trusted editor, not a critic.
- The identity is the reference, not a cage. If the draft deliberately evolves the story, say so as an observation, not a correction.
- Never use scores, grades or ratings.
- Never write in the first person. No "I think", "I would".
- Never rewrite the draft wholesale; point at specific phrases and offer options.
- If the draft is consistent, say so plainly and briefly — reassurance is a valid answer.

Respond with valid JSON only, matching exactly this shape:
{
  "aligned": true or false — whether the draft broadly tells the saved story,
  "summary": "one or two sentences: the overall read",
  "notes": [
    { "observation": "a specific phrase or claim and how it sits against the identity", "worth_considering": "an option the artist might take, phrased as a choice" }
  ]
}

Rules for the JSON content:
- 0 to 4 notes. If aligned with nothing worth flagging, return an empty notes array.
- Quote short phrases from the draft where useful.
- No markdown inside strings.`
}

export function buildConsistencyUserPrompt(
  draft: string,
  draftKind: string,
  identity: IdentitySnapshot
): string {
  return `Here is the artist's saved identity and a new ${draftKind} draft. Check the draft against the story.

SAVED IDENTITY:
${formatIdentity(identity)}

DRAFT (${draftKind}):
${draft}

Remember: notice drift, offer options, and say plainly when it is consistent.`
}

/** Parse and validate Claude's JSON response. Throws on malformed output. */
export function parseConsistencyResult(raw: string): ConsistencyResult {
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1 || end <= start) throw new Error('No JSON object in response')
  const parsed = JSON.parse(raw.slice(start, end + 1)) as ConsistencyResult

  if (typeof parsed.aligned !== 'boolean') throw new Error('Missing aligned flag')
  if (typeof parsed.summary !== 'string' || parsed.summary.length === 0) {
    throw new Error('Missing summary')
  }
  if (!Array.isArray(parsed.notes)) throw new Error('Missing notes')
  for (const note of parsed.notes) {
    if (typeof note.observation !== 'string' || typeof note.worth_considering !== 'string') {
      throw new Error('Malformed note')
    }
  }
  return parsed
}
