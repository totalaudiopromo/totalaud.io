/**
 * API Route: Create Memory
 * POST /api/memory/create
 * Create a new memory with optional entity links
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createRouteSupabaseClient } from '@aud-web/lib/supabase/server'
import { writeAgentMemory } from '@totalaud/agents/memory/memoryWriter'

const createMemorySchema = z.object({
  campaignId: z.string().uuid().nullable().optional(),
  os: z.enum(['ascii', 'xp', 'aqua', 'daw', 'analogue']),
  agent: z.enum(['scout', 'coach', 'tracker', 'insight']).nullable().optional(),
  memoryType: z.enum(['fact', 'pattern', 'reflection', 'emotion', 'warning']),
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  content: z.record(z.unknown()),
  importance: z.number().min(1).max(5).default(3).optional(),
  links: z
    .array(
      z.object({
        entityType: z.enum(['clip', 'card', 'loop', 'campaign', 'fusion_session']),
        entityId: z.string().uuid(),
      })
    )
    .optional(),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createRouteSupabaseClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await req.json()
    const validated = createMemorySchema.parse(body)

    // Create memory
    const memory = await writeAgentMemory({
      supabase,
      userId: user.id,
      campaignId: validated.campaignId ?? null,
      os: validated.os,
      agent: validated.agent ?? undefined,
      memoryType: validated.memoryType,
      title: validated.title,
      content: validated.content,
      importance: validated.importance,
      links: validated.links,
    })

    if (!memory) {
      return NextResponse.json({ error: 'Failed to create memory' }, { status: 500 })
    }

    return NextResponse.json({ memory }, { status: 201 })
  } catch (error) {
    console.error('Failed to create memory:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request body', details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to create memory' }, { status: 500 })
  }
}
