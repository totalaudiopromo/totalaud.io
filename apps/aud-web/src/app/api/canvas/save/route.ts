/**
 * Canvas Save API Route
 * Phase 14.5: Save FlowCanvas scene state
 *
 * POST /api/canvas/save
 * Body: { sceneState, campaignId?, title? }
 * Returns: { sceneId, savedAt }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@total-audio/core-logger'
import { z } from 'zod'

const log = logger.scope('API:CanvasSave')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const saveSchema = z.object({
  sceneState: z.object({
    nodes: z.array(z.any()),
    edges: z.array(z.any()),
    viewport: z.object({
      x: z.number(),
      y: z.number(),
      zoom: z.number(),
    }),
  }),
  campaignId: z.string().uuid().optional().nullable(),
  title: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = saveSchema.parse(body)

    const supabase = createClient(supabaseUrl, supabaseKey)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      log.warn('Unauthorized save attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('canvas_scenes')
      .insert({
        user_id: user.id,
        campaign_id: validated.campaignId,
        title: validated.title || 'Untitled Scene',
        scene_state: validated.sceneState,
        updated_at: new Date().toISOString(),
      })
      .select('id, created_at')
      .single()

    if (error) {
      log.error('Failed to save scene', error)
      return NextResponse.json({ error: 'Failed to save scene' }, { status: 500 })
    }

    if (validated.campaignId) {
      await supabase
        .from('campaign_context')
        .update({ last_saved_at: new Date().toISOString() })
        .eq('id', validated.campaignId)
    }

    log.info('Scene saved', {
      userId: user.id,
      sceneId: data.id,
      campaignId: validated.campaignId,
    })

    return NextResponse.json({
      sceneId: data.id,
      savedAt: data.created_at,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      log.warn('Invalid save data', { errors: error.errors })
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }

    log.error('Save API error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
