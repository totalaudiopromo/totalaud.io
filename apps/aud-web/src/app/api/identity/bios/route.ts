/**
 * Identity Bios API Route
 *
 * Regenerates artist bios with optional tone adjustment.
 * Uses existing identity data for context.
 */

import { NextRequest, NextResponse } from 'next/server'
import { completeWithAnthropic } from '@total-audio/core-ai-provider'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { requireAuth } from '@/lib/api/auth'

const log = logger.scope('IdentityBiosAPI')

// ============ Validation ============

const requestSchema = z.object({
  tone: z.enum(['casual', 'professional', 'enthusiastic']).default('professional'),
  identity: z.object({
    brandVoice: z
      .object({
        tone: z.string().nullable().optional(),
        themes: z.array(z.string()).optional(),
        style: z.string().nullable().optional(),
        keyPhrases: z.array(z.string()).optional(),
      })
      .optional(),
    creativeProfile: z
      .object({
        primaryMotifs: z.array(z.string()).optional(),
        emotionalRange: z.string().nullable().optional(),
        uniqueElements: z.array(z.string()).optional(),
      })
      .optional(),
    epkFragments: z
      .object({
        oneLiner: z.string().nullable().optional(),
        pressAngle: z.string().nullable().optional(),
        pitchHook: z.string().nullable().optional(),
        comparisons: z.array(z.string()).optional(),
      })
      .optional(),
  }),
})

// ============ Prompts ============

const SYSTEM_PROMPT = `You are an expert music PR writer who crafts compelling artist bios. Your bios:
- Feel authentic and personal, never corporate or generic
- Use active voice and vivid language
- Highlight what makes the artist unique
- Are quotable and memorable
- Use British English spelling

You return bios in JSON format.`

const TONE_GUIDANCE: Record<string, string> = {
  casual: `Write in a relaxed, conversational tone. Like how the artist would introduce themselves at a gig. Contractions are good. Warmth over formality.`,
  professional: `Write in a polished but warm tone. Suitable for press releases and official bios. Professional without being stiff.`,
  enthusiastic: `Write with energy and excitement. Perfect for social media and promotional content. Let the passion shine through.`,
}

// ============ Route Handler ============

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth()
    if (auth instanceof NextResponse) {
      if (auth.status === 401) {
        log.warn('Unauthenticated request to identity bios')
      }
      return auth
    }

    const { session } = auth

    const body = await request.json()
    const validated = requestSchema.parse(body)
    const { tone, identity } = validated

    // Build context from identity
    const brandVoice = identity.brandVoice
    const creativeProfile = identity.creativeProfile
    const epkFragments = identity.epkFragments

    const contextParts: string[] = []

    if (brandVoice?.tone) {
      contextParts.push(`**Brand Tone**: ${brandVoice.tone}`)
    }
    if (brandVoice?.themes && brandVoice.themes.length > 0) {
      contextParts.push(`**Themes**: ${brandVoice.themes.join(', ')}`)
    }
    if (brandVoice?.style) {
      contextParts.push(`**Writing Style**: ${brandVoice.style}`)
    }
    if (creativeProfile?.emotionalRange) {
      contextParts.push(`**Emotional Range**: ${creativeProfile.emotionalRange}`)
    }
    if (creativeProfile?.uniqueElements && creativeProfile.uniqueElements.length > 0) {
      contextParts.push(`**Unique Elements**: ${creativeProfile.uniqueElements.join(', ')}`)
    }
    if (epkFragments?.oneLiner) {
      contextParts.push(`**One-Liner**: ${epkFragments.oneLiner}`)
    }
    if (epkFragments?.pressAngle) {
      contextParts.push(`**Press Angle**: ${epkFragments.pressAngle}`)
    }
    if (epkFragments?.comparisons && epkFragments.comparisons.length > 0) {
      contextParts.push(`**Artist Comparisons**: ${epkFragments.comparisons.join(', ')}`)
    }

    if (contextParts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No identity data provided. Generate identity first.' },
        { status: 400 }
      )
    }

    const userMessage = `## Artist Identity
${contextParts.join('\n')}

## Tone
${TONE_GUIDANCE[tone]}

## Your Task
Generate two bios for this artist:

1. **Short Bio** (50 words max): Perfect for social media, playlist submissions, and quick intros
2. **Long Bio** (150 words max): For press releases, EPKs, and official profiles

Return as JSON:
{
  "short": "The 50-word bio...",
  "long": "The 150-word bio..."
}

Important:
- Make them feel authentic to the artist's voice
- Include specific details, not generic statements
- The short bio should work standalone, not just be a truncated version
- Use third person ("they" or the artist's name placeholder "[Artist]")

Return ONLY the JSON object, no other text.`

    log.info('Generating bios', {
      userId: session.user.id,
      tone,
      contextSize: contextParts.length,
    })

    // Call Claude
    const result = await completeWithAnthropic(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      {
        max_tokens: 600,
        temperature: 0.7,
      }
    )

    // Parse JSON response
    let biosData
    try {
      let jsonStr = result.content.trim()
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/^```json\n?/, '').replace(/\n?```$/, '')
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```\n?/, '').replace(/\n?```$/, '')
      }

      biosData = JSON.parse(jsonStr)
    } catch (parseError) {
      log.error('Failed to parse bios JSON', parseError, { content: result.content })
      return NextResponse.json(
        { success: false, error: 'Failed to parse generated bios' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: biosData,
      tone,
      tokensUsed: result.tokens_used,
    })
  } catch (error) {
    log.error('Bio generation error', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request format', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: false, error: 'Failed to generate bios' }, { status: 500 })
  }
}
