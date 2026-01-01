import { createClient } from '@supabase/supabase-js'
import type { SupabaseDatabase } from '@/types/supabase'

let cachedClient: ReturnType<typeof createClient<SupabaseDatabase>> | null = null

export function getSupabaseServiceRoleClient() {
  if (cachedClient) {
    return cachedClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase service role credentials. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
    )
  }

  cachedClient = createClient<SupabaseDatabase>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  })

  return cachedClient
}
