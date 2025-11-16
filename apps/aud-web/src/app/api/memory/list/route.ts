/**
 * API Route: List Memories
 * GET /api/memory/list
 * Query memories by campaign, OS, or agent
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createRouteSupabaseClient } from '@aud-web/lib/supabase/server'
import { getRelevantMemories } from '@totalaud/agents/memory/memoryReader'

const listMemoriesSchema = z.object({
  campaignId: z.string().uuid().optional(),
  os: z.enum(['ascii', 'xp', 'aqua', 'daw', 'analogue']).optional(),
  agent: z.enum(['scout', 'coach', 'tracker', 'insight']).optional(),
  memoryType: z.enum(['fact', 'pattern', 'reflection', 'emotion', 'warning']).optional(),
  minImportance: z.coerce.number().min(1).max(5).optional(),
  limit: z.coerce.number().min(1).max(100).default(20).optional(),
})

export async function GET(req: NextRequest) {
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

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams
    const params = {
      campaignId: searchParams.get('campaignId') || undefined,
      os: searchParams.get('os') || undefined,
      agent: searchParams.get('agent') || undefined,
      memoryType: searchParams.get('memoryType') || undefined,
      minImportance: searchParams.get('minImportance') || undefined,
      limit: searchParams.get('limit') || undefined,
    }

    // Validate
    const validated = listMemoriesSchema.parse(params)

    // Retrieve memories
    const memories = await getRelevantMemories({
      supabase,
      userId: user.id,
      campaignId: validated.campaignId,
      os: validated.os,
      agent: validated.agent,
      memoryType: validated.memoryType,
      minImportance: validated.minImportance,
      limit: validated.limit,
    })

    return NextResponse.json({ memories })
  } catch (error) {
    console.error('Failed to list memories:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query parameters', details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to retrieve memories' }, { status: 500 })
  }
}
