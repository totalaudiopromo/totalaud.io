/**
 * API Route: Get Memories By Entity
 * GET /api/memory/by-entity
 * Retrieve memories linked to a specific entity (clip, card, loop, campaign, fusion_session)
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createRouteSupabaseClient } from '@aud-web/lib/supabase/server'
import { getMemoriesForEntity } from '@totalaud/agents/memory/memoryReader'

const byEntitySchema = z.object({
  entityType: z.enum(['clip', 'card', 'loop', 'campaign', 'fusion_session']),
  entityId: z.string().uuid(),
  limit: z.coerce.number().min(1).max(50).default(10).optional(),
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
      entityType: searchParams.get('entityType'),
      entityId: searchParams.get('entityId'),
      limit: searchParams.get('limit') || undefined,
    }

    // Validate
    const validated = byEntitySchema.parse(params)

    // Retrieve memories for entity
    const memories = await getMemoriesForEntity({
      supabase,
      userId: user.id,
      entityType: validated.entityType,
      entityId: validated.entityId,
      limit: validated.limit,
    })

    return NextResponse.json({ memories })
  } catch (error) {
    console.error('Failed to get entity memories:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query parameters', details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to retrieve entity memories' }, { status: 500 })
  }
}
