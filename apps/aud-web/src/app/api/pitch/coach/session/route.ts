/**
 * Pitch Coach Session API Route
 * Phase 1.5: Intelligence Navigator - Multi-turn coaching conversations
 *
 * Handles guided Q&A sessions with context preservation,
 * follow-up suggestions, and phase-based coaching progression.
 */

import { NextRequest, NextResponse } from 'next/server'
import { completeWithAnthropic } from '@total-audio/core-ai-provider'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { requireAuth } from '@/lib/api/auth'
import type { CoachingMode, CoachingPhase, PitchType } from '@/types/pitch'

const log = logger.scope('PitchCoachSessionAPI')

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

// ============ Validation ============

const requestSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  sectionId: z.string().optional(),
  pitchType: z.enum(['radio', 'press', 'playlist', 'custom']).nullable(),
  mode: z.enum(['quick', 'guided']).nullable(),
  phase: z.enum(['foundation', 'refinement', 'optimisation']).nullable(),
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
        content: z.string(),
      })
    )
    .optional(),
})

// ============ Prompts ============

const BASE_SYSTEM_PROMPT = `You are a supportive, experienced music industry pitch coach with 15+ years of experience helping independent artists.

Your coaching style:
- Ask clarifying questions to understand what they really need
- Guide rather than dictate - help them find their authentic voice
- Give specific, actionable feedback
- Be encouraging but honest
- Use British English spelling
- Reference real examples when helpful (BBC Radio 6 Music, NTS, The Line of Best Fit, etc.)

You're having a conversation, not giving a lecture. Listen, understand, then guide.`

const MODE_PROMPTS: Record<CoachingMode, string> = {
  quick: `You're in Quick Tips mode. Keep responses short and punchy - 2-3 bullet points max. Artists want fast, actionable feedback they can apply immediately.`,

  guided: `You're in Deep Dive mode. This is a coaching conversation where you help the artist think through their pitch properly. Ask follow-up questions, explore their unique story, and guide them to stronger writing. Don't just give answers - help them discover what makes their pitch compelling.`,
}

const PHASE_PROMPTS: Record<CoachingPhase, string> = {
  foundation: `Current Phase: FOUNDATION
Focus on understanding the artist and their music. Ask questions about:
- Their sound and influences
- What makes them unique
- Who they're trying to reach
- What story they want to tell

Don't critique yet - just gather understanding.`,

  refinement: `Current Phase: REFINEMENT
Now that you understand their foundation, help them shape their message:
- Identify the strongest elements of their pitch
- Suggest ways to make language more vivid
- Help them cut what's not working
- Guide them toward clarity

Be specific with your suggestions.`,

  optimisation: `Current Phase: OPTIMISATION
Final polish phase. Focus on:
- Making every word count
- Ensuring the hook grabs attention
- Checking the ask is clear and specific
- Confirming the pitch matches the target (radio/press/playlist)

Help them get it ready to send.`,
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
  identity: ArtistIdentity | null
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

  return parts.join('\n')
}

function buildUserMessage(
  message: string,
  sectionId: string | undefined,
  sections: SectionContext[]
): string {
  const parts: string[] = []

  // Add current pitch content context
  const filledSections = sections.filter((s) => s.content.trim())
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
    const auth = await requireAuth()
    if (auth instanceof NextResponse) {
      if (auth.status === 401) {
        log.warn('Unauthenticated request to coaching session')
      }
      return auth
    }

    const { supabase, session } = auth

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

    // Build prompts
    const systemPrompt = buildSystemPrompt(mode, phase, pitchType, artistIdentity)
    const userMessage = buildUserMessage(message, sectionId, allSections)
    const conversationHistory = buildConversationHistory(history)

    log.info('Coaching session message', {
      userId: session.user.id,
      mode,
      phase,
      pitchType,
      historyLength: history.length,
      hasIdentity: !!artistIdentity,
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

    // Generate follow-up suggestions
    const suggestions = generateFollowUpSuggestions(result.content, phase, mode)

    // Check if we should suggest advancing phase
    const nextPhase = shouldAdvancePhase(phase, history.length + 2)

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
