import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { createRouteSupabaseClient } from '@aud-web/lib/supabase/server'

const log = logger.scope('AgentRunAPI')

const loopContextSchema = z
  .object({
    loopId: z.string().optional(),
    clipId: z.string().optional(),
    osSlug: z.string().optional(),
  })
  .optional()

const agentRunRequestSchema = z.object({
  role: z.enum(['scout', 'coach', 'tracker', 'insight', 'custom']),
  input: z.string().min(1, 'Input is required'),
  originOS: z.string().optional(),
  loopContext: loopContextSchema,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { role, input, loopContext, originOS } = agentRunRequestSchema.parse(body)

    const supabase = createRouteSupabaseClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      log.error('Failed to verify session', sessionError)
      return NextResponse.json({ error: 'Failed to verify authentication' }, { status: 500 })
    }

    if (!session) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const userId = session.user.id

    log.info('Agent run request received', {
      role,
      userId,
      hasLoopContext: Boolean(loopContext),
      originOS: originOS ?? 'unknown',
    })

    const output = await runSimpleAgent({ role, input, loopContext })

    return NextResponse.json(
      {
        output,
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    log.error('Agent run failed', error)

    return NextResponse.json(
      {
        error: 'Agent run failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

const roleSystemPrompts: Record<string, string> = {
  scout:
    'You are Scout, a research and ideas agent for independent music campaigns. You suggest concrete next moves, not vague theory.',
  coach:
    'You are Coach, a practical writing and feedback agent for pitches, EPKs, and campaign ideas. You keep it honest, clear, and music-industry aware.',
  tracker:
    'You are Tracker, a rhythm and sequencing agent. You help keep loops, campaigns, and workflows moving without fluff.',
  insight:
    'You are Insight, a strategic zoom-out agent. You summarise and highlight patterns, then propose 2-3 sharp next moves.',
  custom:
    'You are a focused assistant helping with music marketing workflows across OS surfaces. Keep answers short, concrete, and useful.',
}

async function runSimpleAgent(params: {
  role: 'scout' | 'coach' | 'tracker' | 'insight' | 'custom'
  input: string
  loopContext?: {
    loopId?: string
    clipId?: string
    osSlug?: string
  }
}): Promise<string> {
  const { complete } = await import('@total-audio/core-ai-provider')

  const systemPrompt = roleSystemPrompts[params.role] ?? roleSystemPrompts.custom

  const contextLines: string[] = []
  if (params.loopContext?.loopId) {
    contextLines.push(`Loop ID: ${params.loopContext.loopId}`)
  }
  if (params.loopContext?.clipId) {
    contextLines.push(`Clip ID: ${params.loopContext.clipId}`)
  }
  if (params.loopContext?.osSlug) {
    contextLines.push(`Origin surface: ${params.loopContext.osSlug}`)
  }

  const contextBlock = contextLines.length ? `\n\nContext:\n${contextLines.join('\n')}` : ''

  const result = await complete('anthropic', [
    {
      role: 'system',
      content: `${systemPrompt}\n\nAlways respond in plain text, no markdown, under 300 words.`,
    },
    {
      role: 'user',
      content: `${params.input}${contextBlock}`,
    },
  ])

  return result.content.trim()
}
