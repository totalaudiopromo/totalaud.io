/**
 * Supabase Server Client
 *
 * Creates server-side Supabase clients for Next.js API routes and server components.
 */

import { createClient as createSupabaseClient } from '@total-audio/core-supabase'

/**
 * Create a Supabase client for server-side usage (API routes, server components)
 *
 * Note: For Next.js 15+ with async cookies, we use a simplified approach.
 * The client will work without cookie integration for API routes.
 */
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
