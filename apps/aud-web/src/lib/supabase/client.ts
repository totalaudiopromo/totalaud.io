'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@total-audio/schemas-database'

export function createBrowserSupabaseClient() {
  return createClientComponentClient<Database>()
}

