'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseDatabase } from '@/types/supabase'
import { env } from '@/lib/env'

export function createBrowserSupabaseClient() {
  return createBrowserClient<SupabaseDatabase>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
