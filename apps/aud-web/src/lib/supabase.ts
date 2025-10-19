/**
 * Supabase Client Configuration
 *
 * Creates a browser-side Supabase client for aud-web app.
 */

import { createClient } from '@total-audio/core-supabase'

// Create singleton Supabase client
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * Create a Supabase client for client components
 */
export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
