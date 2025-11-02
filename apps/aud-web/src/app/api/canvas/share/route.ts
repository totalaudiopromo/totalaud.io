/**
 * Canvas Share API Route
 * Phase 14.5: Generate public share link for scene
 *
 * POST /api/canvas/share
 * Body: { sceneId }
 * Returns: { publicShareId, shareUrl }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@total-audio/core-logger'
import { z } from 'zod'

const log = logger.scope('API:CanvasShare')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const shareSchema = z.object({
  sceneId: z.string().uuid(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = shareSchema.parse(body)

    const supabase = createClient(supabaseUrl, supabaseKey)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      log.warn('Unauthorized share attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('canvas_scenes')
      .update({ is_public: true })
      .eq('id', validated.sceneId)
      .eq('user_id', user.id)
      .select('public_share_id')
      .single()

    if (error || !data) {
      log.error('Failed to share scene', error)
      return NextResponse.json({ error: 'Failed to share scene' }, { status: 500 })
    }

    log.info('Scene shared', {
      userId: user.id,
      sceneId: validated.sceneId,
      publicShareId: data.public_share_id,
    })

    return NextResponse.json({
      publicShareId: data.public_share_id,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      log.warn('Invalid share data', { errors: error.errors })
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }

    log.error('Share API error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
