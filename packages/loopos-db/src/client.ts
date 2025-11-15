import { createClient } from '@supabase/supabase-js'

let supabaseUrl: string
let supabaseAnonKey: string
let supabaseServiceKey: string

if (typeof window === 'undefined') {
  // Server-side
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
} else {
  // Client-side
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  supabaseServiceKey = '' // Never expose service key on client
}

// Client for authenticated user operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations (use carefully!)
export const supabaseAdmin =
  typeof window === 'undefined' && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null
