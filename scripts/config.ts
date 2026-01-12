import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

export const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL

if (!SUPABASE_URL) {
  console.error(
    '❌ Error: SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is missing from environment variables.'
  )
  process.exit(1)
}
export const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY is missing from environment variables.')
  console.error('   Please ensure it is set in your .env.local file.')
  process.exit(1)
}

export const createAdminClient = () => {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
