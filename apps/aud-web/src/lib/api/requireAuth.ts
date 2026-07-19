/**
 * requireAuth — server-verified authentication for route handlers.
 *
 * Uses supabase.auth.getUser() (a network-verified check) rather than the
 * legacy getSession() pattern, which trusts unverified JWT claims from the
 * cookie. New routes should use this helper; see docs/REPO_AUDIT_2026-06-10.md.
 *
 * Usage:
 *   const auth = await requireAuth()
 *   if (!auth.ok) return auth.response
 *   const { user, supabase } = auth
 */

import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'
import { createRouteSupabaseClient } from '@/lib/supabase/server'
import { isEmailAllowed } from '@/lib/auth/allowlist'

type RouteClient = Awaited<ReturnType<typeof createRouteSupabaseClient>>

export type AuthResult =
  | { ok: true; user: User; supabase: RouteClient }
  | { ok: false; response: NextResponse }

export async function requireAuth(): Promise<AuthResult> {
  const supabase = await createRouteSupabaseClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorised' }, { status: 401 }),
    }
  }

  // Beta gate — dormant unless BETA_ALLOWLIST is set. A valid session whose email
  // is not on the list is denied access to protected routes (guest-tolerant
  // routes fall back to guest behaviour via the ok:false branch).
  if (!isEmailAllowed(user.email)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'This account is not yet approved for access.' },
        { status: 403 }
      ),
    }
  }

  return { ok: true, user, supabase }
}
