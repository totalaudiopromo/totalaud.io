/**
 * Contact Enrichment Engine
 *
 * Ported from TAP's enrichment logic. Uses Claude Haiku to research
 * music industry contacts and return structured intelligence.
 *
 * Pure function with no DB dependency -- caller handles credits and persistence.
 */

import Anthropic from '@anthropic-ai/sdk'

export interface EnrichmentInput {
  name: string
  email?: string
  outlet?: string
}

export interface EnrichmentOutput {
  email?: string
  name: string
  platform: string | null
  role: string | null
  genres: string[] | null
  coverage: string | null
  contactMethod: string | null
  bestTiming: string | null
  submissionGuidelines: string | null
  pitchTips: string[] | null
  confidence: 'High' | 'Medium' | 'Low'
  reasoning: string | null
  geographicScope: string | null
  bbcStation: string | null
}

const ENRICHMENT_SYSTEM_PROMPT =
  'You are a music industry contact researcher. Given a contact name, email, and optional outlet, research and return structured intelligence. Return ONLY valid JSON.'

function buildEnrichmentUserPrompt(input: EnrichmentInput): string {
  return `Research this music industry contact and return JSON:
Name: ${input.name || '(unknown)'}
${input.email ? `Email: ${input.email}` : ''}
${input.outlet ? `Outlet: ${input.outlet}` : ''}

CRITICAL: The "name" field in your response MUST be EXACTLY "${input.name}" -- do not correct spelling, add titles, or modify it in any way. We use this field to match results back to our database.

Return JSON with these fields:
{
  "name": "${input.name}",
  "email": "their likely professional email or empty string",
  "platform": "their outlet/platform name",
  "role": "their role (e.g. Producer, Presenter, Journalist, Music Programmer)",
  "genres": ["genres they cover"],
  "coverage": "coverage area description",
  "contactMethod": "preferred contact method",
  "bestTiming": "best time to pitch",
  "submissionGuidelines": "any known submission guidelines",
  "pitchTips": ["tips for pitching this contact"],
  "confidence": "High or Medium or Low",
  "reasoning": "brief explanation of confidence level",
  "geographicScope": "national or regional or local",
  "bbcStation": "if BBC, which station, else null"
}`
}

function normaliseConfidence(value?: string): 'High' | 'Medium' | 'Low' {
  if (!value) return 'Low'
  const c = value.toLowerCase()
  if (c === 'high') return 'High'
  if (c === 'medium') return 'Medium'
  return 'Low'
}

/**
 * Call Claude Haiku to enrich a single contact.
 * Returns parsed enrichment data or throws on failure.
 */
export async function enrichContactWithAI(
  client: Anthropic,
  input: EnrichmentInput
): Promise<EnrichmentOutput> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: ENRICHMENT_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: buildEnrichmentUserPrompt(input),
      },
    ],
  })

  const textBlock = response.content.find((b) => b.type === 'text')
  const text = textBlock && 'text' in textBlock ? textBlock.text : ''

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    const preview = text.slice(0, 100).replace(/\n/g, ' ')
    throw new Error(
      `AI returned no structured data for '${input.name}'. Response preview: "${preview}"`
    )
  }

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(jsonMatch[0])
  } catch {
    throw new Error(`AI returned invalid JSON for '${input.name}'`)
  }

  return {
    email: (typeof parsed.email === 'string' && parsed.email) || undefined,
    name: (typeof parsed.name === 'string' && parsed.name) || input.name,
    platform: (typeof parsed.platform === 'string' && parsed.platform) || null,
    role: (typeof parsed.role === 'string' && parsed.role) || null,
    genres: Array.isArray(parsed.genres) ? parsed.genres : null,
    coverage: (typeof parsed.coverage === 'string' && parsed.coverage) || null,
    contactMethod: (typeof parsed.contactMethod === 'string' && parsed.contactMethod) || null,
    bestTiming: (typeof parsed.bestTiming === 'string' && parsed.bestTiming) || null,
    submissionGuidelines:
      (typeof parsed.submissionGuidelines === 'string' && parsed.submissionGuidelines) || null,
    pitchTips: Array.isArray(parsed.pitchTips) ? parsed.pitchTips : null,
    confidence: normaliseConfidence(
      typeof parsed.confidence === 'string' ? parsed.confidence : undefined
    ),
    reasoning: (typeof parsed.reasoning === 'string' && parsed.reasoning) || null,
    geographicScope: (typeof parsed.geographicScope === 'string' && parsed.geographicScope) || null,
    bbcStation: (typeof parsed.bbcStation === 'string' && parsed.bbcStation) || null,
  }
}
