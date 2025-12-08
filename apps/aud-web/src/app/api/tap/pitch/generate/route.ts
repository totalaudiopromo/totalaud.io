/**
 * TAP Pitch Generation Proxy Route
 *
 * Generates professional pitches using Total Audio Platform's Pitch service.
 * Used by Pitch Mode alongside the existing Claude coach.
 *
 * POST /api/tap/pitch/generate
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { createRouteSupabaseClient } from '@aud-web/lib/supabase/server'
import { tapClient, TotalAudioApiError } from '@/lib/tap-client'

const log = logger.scope('TAPPitchGenerate')

// Request validation schema
const generateRequestSchema = z.object({
  contactId: z.string().optional().default('manual'),
  contact: z
    .object({
      name: z.string().min(1),
      email: z.string().email().optional(),
      outlet: z.string().optional(),
    })
    .optional(),
  artistName: z.string().min(1, 'Artist name is required'),
  trackTitle: z.string().min(1, 'Track title is required'),
  genre: z.string().optional(),
  trackLink: z.string().url().optional(),
  releaseDate: z.string().optional(),
  keyHook: z.string().min(10, 'Key hook must be at least 10 characters'),
  tone: z.enum(['casual', 'professional', 'enthusiastic']).optional().default('professional'),
})

export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const supabase = createRouteSupabaseClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      log.error('Failed to verify session', sessionError)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AUTH_ERROR',
            message: 'Failed to verify authentication',
          },
        },
        { status: 500 }
      )
    }

    if (!session) {
      log.warn('Unauthenticated request to Pitch generate')
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORISED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      )
    }

    // Check if Pitch is configured
    if (!tapClient.isConfigured('pitch')) {
      log.warn('Pitch API not configured')
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_CONFIGURED',
            message: 'Pitch service is not configured',
          },
        },
        { status: 503 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = generateRequestSchema.safeParse(body)

    if (!validationResult.success) {
      log.warn('Validation failed', { errors: validationResult.error.errors })
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            details: validationResult.error.errors,
          },
        },
        { status: 400 }
      )
    }

    const pitchRequest = validationResult.data

    log.info('Generating pitch', {
      artistName: pitchRequest.artistName,
      trackTitle: pitchRequest.trackTitle,
      tone: pitchRequest.tone,
    })

    // Call TAP Pitch service
    const result = await tapClient.pitch.generate(pitchRequest)

    log.info('Pitch generated', { pitchId: result.pitchId })

    return NextResponse.json({
      success: true,
      data: {
        pitchId: result.pitchId,
        pitch: result.pitch,
      },
    })
  } catch (error) {
    if (error instanceof TotalAudioApiError) {
      log.error('TAP Pitch API error', undefined, { code: error.code, status: error.status })
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: error.status }
      )
    }

    log.error('Unexpected error in Pitch generation', error as Error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to generate pitch',
        },
      },
      { status: 500 }
    )
  }
}
