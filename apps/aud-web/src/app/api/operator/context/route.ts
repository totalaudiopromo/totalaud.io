/**
 * Operator Context API Route
 * Phase 14.3: Store campaign context from operator scene
 *
 * POST /api/operator/context
 * Saves campaign context to Supabase
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@total-audio/core-logger'
import { z } from 'zod'

const log = logger.scope('API:OperatorContext')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const contextSchema = z.object({
  artist: z.string().optional().nullable(),
  title: z.string().min(1, 'Title is required'),
  goal: z.enum(['radio', 'playlist', 'press', 'growth', 'experiment']),
  horizon: z.number().min(1).max(365),
  genre: z.string().optional().nullable(),
  followers: z.number().optional().nullable(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = contextSchema.parse(body)

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      log.warn('Unauthorized context save attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Insert campaign context
    const { data, error } = await supabase
      .from('campaign_context')
      .insert({
        user_id: user.id,
        artist: validated.artist,
        title: validated.title,
        goal: validated.goal,
        horizon_days: validated.horizon,
        genre: validated.genre,
        followers: validated.followers,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      log.error('Failed to save campaign context', error)
      return NextResponse.json({ error: 'Failed to save context' }, { status: 500 })
    }

    log.info('Campaign context saved', {
      userId: user.id,
      contextId: data.id,
      goal: validated.goal,
    })

    return NextResponse.json({ success: true, id: data.id })
  } catch (error) {
    if (error instanceof z.ZodError) {
      log.warn('Invalid context data', { errors: error.errors })
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }

    log.error('Context API error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
