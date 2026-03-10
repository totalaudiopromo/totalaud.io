import { createClient } from '@supabase/supabase-js'
import type { Database } from '@total-audio/schemas-database'
import { env } from '@/lib/env'

let cachedClient: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseServiceRoleClient() {
  if (cachedClient) {
    return cachedClient
  }

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase service role credentials. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
    )
  }

  cachedClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  })

  return cachedClient
}
