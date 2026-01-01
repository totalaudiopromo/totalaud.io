/**
 * Identity Generate API Route
 *
 * Analyses existing pitch drafts and generates artist identity profile:
 * - Brand voice (tone, themes, style, key phrases)
 * - Creative profile (motifs, emotional range, unique elements)
 * - EPK fragments (one-liner, press angle, pitch hook, comparisons)
 * - Auto-generated bios (short and long)
 */

import { NextRequest, NextResponse } from 'next/server'
import { completeWithAnthropic } from '@total-audio/core-ai-provider'
import { logger } from '@/lib/logger'
import { requireAuth } from '@/lib/api/auth'

const log = logger.scope('IdentityGenerateAPI')

// ============ Prompts ============

const SYSTEM_PROMPT = `You are an expert music industry strategist and brand consultant who helps independent artists discover and articulate their unique identity.

Your approach:
- Analyse the artist's existing pitch content to understand their authentic voice
- Extract patterns, themes, and distinctive elements
- Create compelling EPK fragments that feel genuine, not corporate
- Use British English spelling
- Be specific and actionable, not generic

You generate identity profiles in JSON format.`

const GENERATION_PROMPT = `Based on the artist's pitch drafts below, create a comprehensive identity profile.

## Artist's Existing Pitch Content
{PITCH_CONTENT}

## Your Task
Analyse their writing style, themes, and approach to generate an identity profile. Return a JSON object with this structure:

{
  "brandVoice": {
    "tone": "Single word or short phrase describing their overall tone (e.g., 'intimate and confessional', 'energetic and bold', 'introspective')",
    "themes": ["Theme 1", "Theme 2", "Theme 3"],
    "style": "Brief description of their writing/communication style",
    "keyPhrases": ["Phrase they use often", "Another distinctive phrase"]
  },
  "creativeProfile": {
    "primaryMotifs": ["Motif 1", "Motif 2"],
    "emotionalRange": "Description of the emotional territory they explore",
    "uniqueElements": ["What makes them distinctive", "Another unique element"]
  },
  "epkFragments": {
    "oneLiner": "A compelling one-sentence description (under 15 words)",
    "pressAngle": "The story angle a journalist would write about",
    "pitchHook": "Opening sentence that grabs attention",
    "comparisons": ["Artist comparison 1", "Artist comparison 2"]
  },
  "bios": {
    "short": "50-word bio for social media and quick intros",
    "long": "150-word bio for press releases and EPKs"
  }
}

Important:
- Keep comparisons to real artists, be specific (e.g., "PJ Harvey's intensity meets Phoebe Bridgers' vulnerability")
- The one-liner should be quotable and memorable
- Bios should feel authentic to their voice, not generic industry speak
- If you can't infer something confidently, leave it as null

Return ONLY the JSON object, no other text.`

const FALLBACK_PROMPT = `The artist has no existing pitch content yet. Create a starter identity profile with helpful placeholders they can customise.

Return a JSON object with this structure:

{
  "brandVoice": {
    "tone": null,
    "themes": [],
    "style": null,
    "keyPhrases": []
  },
  "creativeProfile": {
    "primaryMotifs": [],
    "emotionalRange": null,
    "uniqueElements": []
  },
  "epkFragments": {
    "oneLiner": null,
    "pressAngle": null,
    "pitchHook": null,
    "comparisons": []
  },
  "bios": {
    "short": null,
    "long": null
  }
}

Return ONLY the JSON object, no other text.`

// ============ Route Handler ============

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth()
    if (auth instanceof NextResponse) {
      if (auth.status === 401) {
        log.warn('Unauthenticated request to identity generate')
      }
      return auth
    }

    const { supabase, session } = auth

    // Fetch user's pitch drafts
    const { data: drafts, error: draftsError } = await supabase
      .from('user_pitch_drafts')
      .select('name, pitch_type, sections')
      .eq('user_id', session.user.id)
      .order('updated_at', { ascending: false })
      .limit(10)

    if (draftsError) {
      log.error('Failed to fetch pitch drafts', draftsError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch pitch history' },
        { status: 500 }
      )
    }

    // Build pitch content for analysis
    interface PitchSection {
      title?: string
      content?: string
    }

    let pitchContent = ''
    if (drafts && drafts.length > 0) {
      pitchContent = drafts
        .map((draft) => {
          const sections: PitchSection[] = Array.isArray(draft.sections)
            ? (draft.sections as PitchSection[])
            : []
          const sectionText = sections
            .filter((s) => s.content && s.content.trim())
            .map((s) => `**${s.title}**: ${s.content}`)
            .join('\n')

          return `### ${draft.name} (${draft.pitch_type})\n${sectionText || '(empty)'}`
        })
        .join('\n\n')
    }

    // Choose prompt based on whether we have content
    const hasContent = pitchContent.trim().length > 0
    const userMessage = hasContent
      ? GENERATION_PROMPT.replace('{PITCH_CONTENT}', pitchContent)
      : FALLBACK_PROMPT

    log.info('Generating identity', {
      userId: session.user.id,
      draftsCount: drafts?.length || 0,
      hasContent,
    })

    // Call Claude
    const result = await completeWithAnthropic(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      {
        max_tokens: 1500,
        temperature: 0.7,
      }
    )

    // Parse JSON response
    let identityData
    try {
      // Extract JSON from response (handle potential markdown code blocks)
      let jsonStr = result.content.trim()
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/^```json\n?/, '').replace(/\n?```$/, '')
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```\n?/, '').replace(/\n?```$/, '')
      }

      identityData = JSON.parse(jsonStr)
    } catch (parseError) {
      log.error('Failed to parse identity JSON', parseError, { content: result.content })
      return NextResponse.json(
        { success: false, error: 'Failed to parse generated identity' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: identityData,
      tokensUsed: result.tokens_used,
      sourceDrafts: drafts?.length || 0,
    })
  } catch (error) {
    log.error('Identity generation error', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate identity' },
      { status: 500 }
    )
  }
}
