/**
 * Supabase Client
 * Creates browser and server-side Supabase clients
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Create Supabase client for use in API routes and server components
 */
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}
