/**
 * Welcome Email API Route
 * POST /api/email/welcome
 *
 * Sends a welcome email to a user after onboarding completion.
 * Called from OnboardingChat component when onboarding finishes.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendWelcomeEmail } from '@/lib/email'
import { createRouteSupabaseClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

const log = logger.scope('API:Welcome Email')

// Request validation schema
const requestSchema = z.object({
  artistName: z.string().min(1, 'Artist name is required'),
  primaryGoal: z.enum(['discover', 'plan', 'pitch', 'explore']).optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createRouteSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const parsed = requestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { artistName, primaryGoal } = parsed.data

    // Send welcome email
    const result = await sendWelcomeEmail({
      to: user.email!,
      artistName,
      primaryGoal,
    })

    if (!result.success) {
      log.warn('Failed to send welcome email', { userId: user.id, error: result.error })
      // Don't fail the request - email is not critical
      return NextResponse.json({
        success: true,
        emailSent: false,
        reason: result.error,
      })
    }

    log.info('Welcome email sent', { userId: user.id, emailId: result.id })

    return NextResponse.json({
      success: true,
      emailSent: true,
      emailId: result.id,
    })
  } catch (error) {
    log.error('Welcome email route error', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
