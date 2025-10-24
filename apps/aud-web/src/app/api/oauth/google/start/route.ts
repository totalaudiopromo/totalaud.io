/**
 * OAuth Start Endpoint
 *
 * POST /api/oauth/google/start
 * Body: { provider: "gmail" | "google_sheets" }
 *
 * Returns: { redirectUrl: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@aud-web/lib/supabase/server'
import { getGoogleAuthUrl, type IntegrationType } from '@aud-web/lib/oauth'
import { logger } from '@total-audio/core-logger'
import { validateRequestBody, ValidationError, validationErrorResponse } from '@aud-web/lib/api-validation'

const log = logger.scope('OAuthStartAPI')

const oauthStartSchema = z.object({
  provider: z.enum(['gmail', 'google_sheets'], {
    errorMap: () => ({ message: 'Provider must be "gmail" or "google_sheets"' })
  }),
})

export async function POST(request: NextRequest) {
  try {
    const { provider } = await validateRequestBody(request, oauthStartSchema)

    // Get current user
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      log.warn('Unauthorised OAuth start attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    log.info('Starting OAuth flow', { provider, userId: user.id })

    // Generate OAuth URL with PKCE
    const { url } = await getGoogleAuthUrl(supabase as any, user.id, provider as IntegrationType)

    log.info('OAuth URL generated', { provider, userId: user.id })

    return NextResponse.json({ redirectUrl: url })
  } catch (error) {
    if (error instanceof ValidationError) {
      return validationErrorResponse(error)
    }

    log.error('Failed to start OAuth flow', error)
    const message = error instanceof Error ? error.message : 'Failed to start OAuth flow'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
