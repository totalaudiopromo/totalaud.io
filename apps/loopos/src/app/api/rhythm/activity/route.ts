/**
 * Phase 31: Creative Rhythm System - Activity Tracking API
 *
 * Fire-and-forget endpoint for tracking creative activity events.
 * Never blocks the UI. Silent failures. Just awareness.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { rhythmDb, ActivityTypeSchema } from '@loopos/db'

// =====================================================
// SCHEMAS
// =====================================================

const TrackActivitySchema = z.object({
  workspaceId: z.string().uuid(),
  userId: z.string().uuid(),
  type: ActivityTypeSchema,
  metadata: z.record(z.unknown()).optional().default({}),
})

// =====================================================
// POST /api/rhythm/activity
// =====================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const request = TrackActivitySchema.parse(body)

    // Fire-and-forget: Track activity without waiting
    rhythmDb.activity
      .track(request.workspaceId, request.userId, request.type, request.metadata)
      .catch((err) => {
        // Silent failure - never interrupt user flow
        console.warn('[Rhythm] Activity tracking failed (silent):', err)
      })

    // Return immediately - don't block UI
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    // Even validation errors return 200 - fire-and-forget principle
    if (error instanceof z.ZodError) {
      console.warn('[Rhythm] Invalid activity tracking request:', error.errors)
      return NextResponse.json({ success: false, reason: 'validation' }, { status: 200 })
    }

    console.warn('[Rhythm] Activity tracking endpoint error:', error)
    return NextResponse.json({ success: false, reason: 'unknown' }, { status: 200 })
  }
}
