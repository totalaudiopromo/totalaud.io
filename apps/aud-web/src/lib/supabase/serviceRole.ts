'use server'

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@total-audio/schemas-database'

let cachedClient:
  | ReturnType<typeof createClient<Database>>
  | null = null

export function getSupabaseServiceRoleClient() {
  if (cachedClient) {
    return cachedClient
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase service role credentials. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
    )
  }

  cachedClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  })

  return cachedClient
}

