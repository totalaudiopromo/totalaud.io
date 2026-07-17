/**
 * "Who matters" — prompt builders for the Intel relationship summary.
 *
 * Claude reasons over the artist's TAP contacts and pitch outcomes and
 * returns plain-English relationship signals (docs/VISION.md §3: memory,
 * not scraping; context, not volume; people, not lists).
 *
 * Hard rules (enforced by unit tests):
 * - Never rank people, never score them, no leaderboards or "top contacts"
 * - Signals are observations plus something worth considering — the artist
 *   decides what to do
 * - Nothing here suggests sending anything automatically
 * - British English throughout
 */

import type { TapContact, TapOutcome } from '@/lib/tap/types'

export interface IntelSignal {
  observation: string
  worth_considering: string
}

export interface IntelSummary {
  summary: string
  signals: IntelSignal[]
}

function daysAgo(unixSeconds: number | null | undefined, now: number): string {
  if (!unixSeconds) return 'never'
  const days = Math.floor((now - unixSeconds) / 86_400)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  return `${days} days ago`
}

export function formatContacts(contacts: TapContact[], nowUnixSeconds: number): string {
  if (contacts.length === 0) return 'No contacts yet.'
  return contacts
    .map((contact) => {
      const parts = [contact.name]
      if (contact.outlet) parts.push(`at ${contact.outlet}`)
      if (contact.role) parts.push(`(${contact.role})`)
      if (contact.genres?.length) parts.push(`— genres: ${contact.genres.join(', ')}`)
      parts.push(`— last contacted: ${daysAgo(contact.last_contacted_at, nowUnixSeconds)}`)
      return `- [${contact.id}] ${parts.join(' ')}`
    })
    .join('\n')
}

export function formatOutcomes(
  outcomes: TapOutcome[],
  contacts: TapContact[],
  nowUnixSeconds: number
): string {
  if (outcomes.length === 0) return 'No outcomes logged yet.'
  const nameById = new Map(contacts.map((contact) => [contact.id, contact.name]))
  return outcomes
    .map((outcome) => {
      const name = nameById.get(outcome.contact) ?? outcome.contact
      const when = daysAgo(outcome.logged_at ?? outcome.created, nowUnixSeconds)
      return `- ${outcome.status} — ${name} (${when})`
    })
    .join('\n')
}

export function buildIntelSystemPrompt(): string {
  return `You write relationship notes for an independent artist inside totalaud.io. The artist's contacts are creative capital — people, not entries in a database. Your job is recall and context: help the artist see what actually happened across their outreach and who their music genuinely connected with.

Voice and boundaries — these are hard rules:
- British English, calm, specific, warm. Like a friend with a good memory.
- Never rank people. No "top contacts", no ordering by value, no numbers out of anything.
- Never suggest mass outreach, automation, or sending anything on the artist's behalf.
- Observations must be grounded in the data provided — do not invent interactions.
- People who declined or went quiet are not failures; frame them without judgement.
- If the history is thin, say so plainly and keep the notes short.

Respond with valid JSON only, matching exactly this shape:
{
  "summary": "two or three sentences: the honest overall read of these relationships",
  "signals": [
    { "observation": "something true and specific from the data", "worth_considering": "what the artist might do with that, phrased as an option" }
  ]
}

Rules for the JSON content:
- 2 to 5 signals. Quality over volume.
- Use people's names, not IDs.
- No markdown inside strings.`
}

export function buildIntelUserPrompt(
  contacts: TapContact[],
  outcomes: TapOutcome[],
  nowUnixSeconds: number
): string {
  return `Here is the artist's relationship data from their promo history. Write the relationship notes.

CONTACTS (${contacts.length}):
${formatContacts(contacts, nowUnixSeconds)}

OUTCOMES (${outcomes.length}, newest first — what happened after pitches):
${formatOutcomes(outcomes, contacts, nowUnixSeconds)}

Remember: recall and context, not rankings. Ground every observation in the data above.`
}

/** Parse and validate Claude's JSON response. Throws on malformed output. */
export function parseIntelSummary(raw: string): IntelSummary {
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1 || end <= start) throw new Error('No JSON object in response')
  const parsed = JSON.parse(raw.slice(start, end + 1)) as IntelSummary

  if (typeof parsed.summary !== 'string' || parsed.summary.length === 0) {
    throw new Error('Missing summary')
  }
  if (!Array.isArray(parsed.signals)) throw new Error('Missing signals')
  for (const signal of parsed.signals) {
    if (typeof signal.observation !== 'string' || typeof signal.worth_considering !== 'string') {
      throw new Error('Malformed signal')
    }
  }
  return parsed
}
