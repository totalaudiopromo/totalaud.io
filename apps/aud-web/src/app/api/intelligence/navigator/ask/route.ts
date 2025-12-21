import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createRouteSupabaseClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const log = logger.scope('NavigatorAPI')

const navigatorQuestionSchema = z.object({
  question: z.string().min(1, 'Question cannot be empty').max(1000, 'Question too long'),
})

const SYSTEM_PROMPT = `You are the AI Navigator for totalaud.io, a calm creative workspace for indie artists.

Your role is to help artists with:
- Understanding their release strategy
- Discovering promotion opportunities (playlists, blogs, radio, press)
- Planning their timeline and campaign activities
- Crafting pitches and stories about their music

Available workspace modes the user can access:
1. IDEAS - Capture and organize creative/marketing ideas on a canvas
2. SCOUT - Discover curated playlists, blogs, radio stations, and press opportunities
3. TIMELINE - Plan release schedules with drag-drop swim lanes
4. PITCH - Craft compelling narratives with AI coaching

Be helpful, concise, and encouraging. Speak like a knowledgeable industry friend who genuinely wants to help indie artists succeed. Keep responses focused and actionable.

When answering, always provide:
1. A direct answer to their question
2. 2-3 specific recommended actions they can take in the workspace`

export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const supabase = await createRouteSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    // Validate input
    const body = await request.json()
    const validationResult = navigatorQuestionSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const { question } = validationResult.data

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      log.error('ANTHROPIC_API_KEY not configured')
      return NextResponse.json({ error: 'AI service not configured' }, { status: 503 })
    }

    // Create client inside the handler to ensure env var is available
    const client = new Anthropic({ apiKey })

    log.debug('Calling Claude', { questionPreview: question.substring(0, 50) })

    const message = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: question,
        },
      ],
    })

    // Extract text content from response
    const textContent = message.content.find((block) => block.type === 'text')
    const answer =
      textContent?.type === 'text' ? textContent.text : 'I could not generate a response.'

    log.debug('Claude response received', { answerPreview: answer.substring(0, 100) })

    // Parse out recommended actions from the response
    const actions: string[] = []
    const lines = answer.split('\n')
    let inRecommendedSection = false

    for (const line of lines) {
      if (
        line.toLowerCase().includes('recommended action') ||
        line.toLowerCase().includes('you can')
      ) {
        inRecommendedSection = true
      }
      if (
        inRecommendedSection &&
        (line.startsWith('-') || line.startsWith('•') || line.match(/^\d+\./))
      ) {
        actions.push(line.replace(/^[-•\d.]+\s*/, '').trim())
      }
    }

    // If we couldn't parse actions, provide defaults based on question context
    if (actions.length === 0) {
      if (
        question.toLowerCase().includes('playlist') ||
        question.toLowerCase().includes('promotion')
      ) {
        actions.push('Browse Scout mode for playlist opportunities')
        actions.push('Add promising opportunities to your Timeline')
        actions.push('Use Pitch mode to craft your submission')
      } else if (
        question.toLowerCase().includes('release') ||
        question.toLowerCase().includes('plan')
      ) {
        actions.push('Create milestone events in Timeline mode')
        actions.push('Capture content ideas in Ideas mode')
        actions.push('Scout for PR opportunities 4-6 weeks ahead')
      } else {
        actions.push('Explore Scout to find new opportunities')
        actions.push('Organize your thoughts in Ideas mode')
        actions.push('Plan your next steps in Timeline')
      }
    }

    return NextResponse.json({
      answer,
      evidence: [],
      deepLinks: [],
      recommendedActions: actions.slice(0, 3),
      confidence: 0.85,
    })
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string }
    log.error('Navigator API error', error instanceof Error ? error : new Error(String(error)), {
      status: err?.status,
      message: err?.message,
    })

    // If it's a rate limit or auth error, provide a more specific message
    if (err?.status === 429) {
      return NextResponse.json({
        answer: 'The AI service is currently busy. Please try again in a moment.',
        recommendedActions: ['Wait a few seconds', 'Try again'],
        confidence: 0,
      })
    }

    if (err?.status === 401 || err?.status === 403) {
      return NextResponse.json(
        {
          answer: 'There was an authentication issue with the AI service.',
          recommendedActions: ['Contact support if this persists'],
          confidence: 0,
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to process question',
        answer: 'Sorry, I encountered an issue processing your question. Please try again.',
        recommendedActions: ['Try rephrasing your question', 'Check back in a moment'],
        confidence: 0,
      },
      { status: 500 }
    )
  }
}
