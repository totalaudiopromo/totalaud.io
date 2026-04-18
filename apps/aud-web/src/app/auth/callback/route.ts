import { NextRequest, NextResponse } from 'next/server'
import { createRouteSupabaseClient } from '@aud-web/lib/supabase/server'
import { logger } from '@/lib/logger'

const log = logger.scope('AuthCallback')

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/workspace'

  if (!code) {
    log.warn('OAuth callback hit without a code parameter')
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = await createRouteSupabaseClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    log.error('exchangeCodeForSession failed', error)
    return NextResponse.redirect(`${origin}/login?error=oauth_exchange_failed`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
