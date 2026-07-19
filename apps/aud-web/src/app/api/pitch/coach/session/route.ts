/**
 * Pitch Coach Session API Route
 * Phase 1.5: Intelligence Navigator - Multi-turn coaching conversations
 * Phase 2: DESSA Speed Improvements
 *
 * Handles guided Q&A sessions with context preservation,
 * follow-up suggestions, and phase-based coaching progression.
 *
 * FUTURE ENHANCEMENT - Streaming Responses:
 * To further improve perceived speed, this route could be enhanced with streaming:
 * - Use ReadableStream to send partial responses as they're generated
 * - Update frontend to handle streaming with fetch() + response.body.getReader()
 * - Show partial text as it arrives (like ChatGPT typing effect)
 * - Would reduce perceived latency from ~2-3s to near-instant feedback
 * - Implementation reference: https://sdk.vercel.ai/docs/guides/streaming
 */

import { NextRequest, NextResponse } from 'next/server'
import { completeWithAnthropic } from '@total-audio/core-ai-provider'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { createRouteSupabaseClient } from '@aud-web/lib/supabase/server'

const log = logger.scope('PitchCoachSessionAPI')

// ============ Types ============

type CoachingMode = 'quick' | 'guided'
type CoachingPhase = 'foundation' | 'refinement' | 'optimisation'
type PitchType = 'radio' | 'press' | 'playlist' | 'custom'

interface HistoryMessage {
  role: 'user' | 'coach'
  content: string
  sectionId?: string
}

interface SectionContext {
  id: string
  title: string
  content: string
}

// Type for artist identity from database
interface ArtistIdentity {
  brand_tone: string | null
  brand_themes: string[] | null
  brand_style: string | null
  key_phrases: string[] | null
  one_liner: string | null
  press_angle: string | null
  pitch_hook: string | null
  comparisons: string[] | null
  last_generated_at: string | null
}

// Type for track memory context
interface TrackMemoryContext {
  canonicalIntent: string | null
  storyFragments: string[]
}

// ============ Validation ============

const requestSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  sectionId: z.string().optional(),
  // Use .nullish() to accept null, undefined, or omitted values
  trackId: z.string().nullish(),
  pitchType: z.enum(['radio', 'press', 'playlist', 'custom']).nullish(),
  mode: z.enum(['quick', 'guided']).nullish(),
  phase: z.enum(['foundation', 'refinement', 'optimisation']).nullish(),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'coach']),
        content: z.string(),
        sectionId: z.string().optional(),
      })
    )
    .optional(),
  allSections: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        content: z.string().default(''),
      })
    )
    .optional(),
})

// ============ Prompts ============

const BASE_SYSTEM_PROMPT = `You are a music person the artist has come to for a proper sit-down. Not a coach, not an assistant — someone who has spent twenty-odd years in and around the UK independent scene: pitching records to radio, sitting in A&R meetings, running club nights, watching artists you believed in break and watching better ones get nowhere because they couldn't say what they were about. You know how a 6 Music playlist meeting actually works. You know the difference between a record NTS will love and one that'll die on submission. You've got taste and you're not shy about it.

How you talk:
- Like a real person across a table, not a chatbot. Plain, warm, direct. Contractions. The odd bit of dry humour.
- You have opinions and you share them. If something's a cliché, you say so, kindly. If something's genuinely good, you say that too — but you don't hand out empty praise, because they'll stop trusting you if you do.
- One thread at a time. You ask a real question, you listen to the answer, then you go deeper. You do NOT fire off a numbered list of five questions at once — that's a form, and you're not a form.
- Specific, always. Name the station, the show, the curator, the comparable record. "This feels like something Jamz Supernova would actually play at 1am" beats "this could work for radio."
- British English throughout.

Hard rules — these are the things that make you sound like a person, not a bot:
- Never open with reflexive enthusiasm ("Nice!", "Great!", "Love that!", "What a fun lane!"). Earn the reaction or skip it.
- Never say "As an AI", never mention being a model or a tool, never explain your own process.
- Don't over-scaffold. No "Here are three things to consider:" when a sentence will do.
- Keep it tight. A couple of short paragraphs. You're having a conversation, not writing an essay.

You're taking this artist under your wing. Act like their time and their record matter to you.`

const MODE_PROMPTS: Record<CoachingMode, string> = {
  quick: `Quick mode: they want a fast read, not a sit-down. Give them the one or two things that actually matter right now, in plain sentences. No preamble, no numbered lists unless they genuinely help. Say the useful thing and stop.`,

  guided: `Deep Dive mode: this is the proper conversation — the kind you'd have with an artist you've decided to back. Draw out who they actually are and what this record is really about. Follow the interesting thread when you hear one, and don't move on until you've got something true. You're not collecting answers to fields; you're getting to know them and their music so that what comes out the other end sounds like nobody else. Push gently where it's vague. This is where the good stuff comes from.`,
}

const PHASE_PROMPTS: Record<CoachingPhase, string> = {
  foundation: `Where you are now: getting the measure of them and the record before anyone writes a word.

You want to understand their sound, where they come from, who this is for, and what they're actually trying to say — but you get there like a person would, one honest question at a time, reacting to what they tell you. If they say "house", you don't nod along; you find out which house, which rooms, whose lineage. If their artist name has a story, pull it out of them.

Don't pitch anything yet and don't critique. This is the listening part. Ask the next question that a curious, well-connected person would actually ask.`,

  refinement: `Where you are now: you know the record and the artist, so start shaping the actual pitch.

Point to what's already strong and lean into it. Where the language is limp or generic, say so and show them a sharper way to put it — in their voice, not a press-release voice. Help them cut the bits that are there out of nerves. Be specific and be honest; a real note they can act on beats three vague encouragements.`,

  optimisation: `Where you are now: it's nearly there — this is the final pass before it goes out.

Make every line earn its place. Check the opening actually grabs — would a busy producer read past the first sentence? Make sure the ask is clear and the whole thing is pitched at the right target (radio, press, playlist — they're not the same). Tighten, don't rewrite. Then tell them, straight, whether it's ready to send.`,
}

const PITCH_CONTEXT: Record<PitchType, string> = {
  radio: `They're pitching to radio DJs/producers. Key things: stand out immediately, give a clear reason to play, respect the presenter's time.`,
  press: `They're pitching to journalists/bloggers. Key things: provide a story angle, be quotable, give them something to write about.`,
  playlist: `They're pitching to playlist curators. Key things: be specific about mood/genre fit, timing matters, explain why it fits their playlist.`,
  custom: `They're crafting a general pitch for their own purposes. Help them communicate clearly and compellingly.`,
}

// ============ Helpers ============

function buildSystemPrompt(
  mode: CoachingMode | null,
  phase: CoachingPhase | null,
  pitchType: PitchType | null,
  identity: ArtistIdentity | null,
  trackMemory: TrackMemoryContext | null
): string {
  const parts = [BASE_SYSTEM_PROMPT]

  // Add mode context
  if (mode) {
    parts.push(`\n## Coaching Mode\n${MODE_PROMPTS[mode]}`)
  }

  // Add phase context
  if (phase) {
    parts.push(`\n## ${PHASE_PROMPTS[phase]}`)
  }

  // Add pitch type context
  if (pitchType) {
    parts.push(`\n## Pitch Target\n${PITCH_CONTEXT[pitchType]}`)
  }

  // Add identity context if available
  if (identity && identity.last_generated_at) {
    const identityParts: string[] = []

    if (identity.brand_tone) {
      identityParts.push(`**Brand Tone**: ${identity.brand_tone}`)
    }
    if (identity.brand_themes && identity.brand_themes.length > 0) {
      identityParts.push(`**Key Themes**: ${identity.brand_themes.join(', ')}`)
    }
    if (identity.one_liner) {
      identityParts.push(`**Their One-Liner**: "${identity.one_liner}"`)
    }
    if (identity.comparisons && identity.comparisons.length > 0) {
      identityParts.push(`**Artist Comparisons**: ${identity.comparisons.join(' meets ')}`)
    }

    if (identityParts.length > 0) {
      parts.push(
        `\n## Artist Identity Profile\nUse this to ensure suggestions align with their established voice:\n${identityParts.join('\n')}`
      )
    }
  }

  // Add track memory context if available (provides continuity for this specific track)
  if (trackMemory) {
    const memoryParts: string[] = []

    if (trackMemory.canonicalIntent) {
      memoryParts.push(`**Original Intent**: "${trackMemory.canonicalIntent}"`)
    }

    if (trackMemory.storyFragments.length > 0) {
      // Only include the most recent 2 fragments to avoid context bloat
      const recentFragments = trackMemory.storyFragments.slice(0, 2)
      memoryParts.push(
        `**Previous Story Work**:\n${recentFragments.map((f, i) => `${i + 1}. ${f.slice(0, 200)}${f.length > 200 ? '...' : ''}`).join('\n')}`
      )
    }

    if (memoryParts.length > 0) {
      parts.push(
        `\n## Track Context\nThe artist has worked on this specific track before. Use this context to maintain continuity:\n${memoryParts.join('\n')}`
      )
    }
  }

  return parts.join('\n')
}

function buildUserMessage(
  message: string,
  sectionId: string | undefined,
  sections: SectionContext[]
): string {
  const parts: string[] = []

  // Add current pitch content context
  const filledSections = sections.filter((s) => (s.content || '').trim())
  if (filledSections.length > 0) {
    parts.push('## Their Current Pitch Content')
    for (const section of filledSections) {
      parts.push(`**${section.title}**: ${section.content}`)
    }
    parts.push('')
  }

  // Add section focus if specified
  if (sectionId) {
    const section = sections.find((s) => s.id === sectionId)
    if (section) {
      parts.push(`## Currently Working On: ${section.title}`)
      parts.push('')
    }
  }

  // Add the actual message
  parts.push('## Artist Message')
  parts.push(message)

  return parts.join('\n')
}

function buildConversationHistory(
  history: HistoryMessage[]
): Array<{ role: 'user' | 'assistant'; content: string }> {
  return history.map((msg) => ({
    role: msg.role === 'coach' ? 'assistant' : 'user',
    content: msg.content,
  }))
}

function generateFollowUpSuggestions(
  response: string,
  phase: CoachingPhase | null,
  mode: CoachingMode | null
): string[] {
  // In quick mode, fewer suggestions
  if (mode === 'quick') {
    return ['Tell me more', 'Rewrite this for me']
  }

  // Phase-specific follow-up suggestions
  const suggestions: Record<CoachingPhase, string[]> = {
    foundation: [
      'What makes my sound unique?',
      'Help me describe my influences',
      "Who's my ideal listener?",
      'What story should I tell?',
    ],
    refinement: [
      'How can I make this more vivid?',
      'What should I cut?',
      'Is my hook strong enough?',
      'Does this sound like me?',
    ],
    optimisation: [
      'Is this ready to send?',
      'Check my ask is clear',
      'Make this more punchy',
      'Final polish suggestions',
    ],
  }

  return phase ? suggestions[phase] : suggestions.foundation
}

function shouldAdvancePhase(
  currentPhase: CoachingPhase | null,
  messageCount: number
): CoachingPhase | null {
  if (!currentPhase) return null

  // Simple heuristic: advance phase every 4-6 exchanges
  if (currentPhase === 'foundation' && messageCount >= 6) {
    return 'refinement'
  }
  if (currentPhase === 'refinement' && messageCount >= 12) {
    return 'optimisation'
  }

  return null
}

// ============ Route Handler ============

export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const supabase = await createRouteSupabaseClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      log.error('Failed to verify session', sessionError)
      return NextResponse.json(
        { success: false, error: 'Failed to verify authentication' },
        { status: 500 }
      )
    }

    if (!session) {
      log.warn('Unauthenticated request to coaching session')
      return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 })
    }

    const body = await request.json()
    const validated = requestSchema.parse(body)

    const { message, sectionId, pitchType, mode, phase, history = [], allSections = [] } = validated

    // Fetch artist identity for context (optional enhancement)
    let artistIdentity: ArtistIdentity | null = null
    try {
      const { data: identity } = await supabase
        .from('artist_identities')
        .select(
          'brand_tone, brand_themes, brand_style, key_phrases, one_liner, press_angle, pitch_hook, comparisons, last_generated_at'
        )
        .eq('user_id', session.user.id)
        .single()

      if (identity) {
        artistIdentity = identity as ArtistIdentity
      }
    } catch {
      // Identity not found - continue without it
    }

    // The console-era track-memory store was removed (its tables never
    // existed in production), so coaching runs without persisted track
    // context. Conversation history still provides session continuity.
    const trackMemoryContext: TrackMemoryContext | null = null

    // Build prompts (convert undefined to null for type safety)
    const systemPrompt = buildSystemPrompt(
      mode ?? null,
      phase ?? null,
      pitchType ?? null,
      artistIdentity,
      trackMemoryContext
    )
    const userMessage = buildUserMessage(message, sectionId, allSections)
    const conversationHistory = buildConversationHistory(history)

    log.info('Coaching session message', {
      userId: session.user.id,
      mode,
      phase,
      pitchType,
      historyLength: history.length,
      hasIdentity: !!artistIdentity,
      hasTrackMemory: !!trackMemoryContext,
    })

    // Build message array with history
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ]

    // Call Claude
    const result = await completeWithAnthropic(messages, {
      max_tokens: 800,
      temperature: 0.7,
    })

    // Generate follow-up suggestions (convert undefined to null for type safety)
    const suggestions = generateFollowUpSuggestions(result.content, phase ?? null, mode ?? null)

    // Check if we should suggest advancing phase
    const nextPhase = shouldAdvancePhase(phase ?? null, history.length + 2)

    return NextResponse.json({
      success: true,
      response: result.content,
      suggestions,
      nextPhase,
      tokensUsed: result.tokens_used,
    })
  } catch (error) {
    log.error('Coaching session error', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request format', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to process coaching message' },
      { status: 500 }
    )
  }
}
