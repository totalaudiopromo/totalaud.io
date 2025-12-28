'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@total-audio/schemas-database'
import { env } from '@/lib/env'

export function createBrowserSupabaseClient() {
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
