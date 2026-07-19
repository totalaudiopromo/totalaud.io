import { NextRequest, NextResponse } from 'next/server'
import { createRouteSupabaseClient } from '@aud-web/lib/supabase/server'
import { isEmailAllowed } from '@/lib/auth/allowlist'
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
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    log.error('exchangeCodeForSession failed', error)
    return NextResponse.redirect(`${origin}/login?error=oauth_exchange_failed`)
  }

  // Beta gate — dormant unless BETA_ALLOWLIST is set. Deny access to anyone not
  // on the list (including brand-new OAuth signups) and end their session so no
  // stray cookie remains.
  if (!isEmailAllowed(data.user?.email)) {
    log.warn('Blocked non-allowlisted login', { email: data.user?.email })
    await supabase.auth.signOut()
    return NextResponse.redirect(`${origin}/login?error=not_approved`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
