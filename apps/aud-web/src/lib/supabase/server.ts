import { cookies } from 'next/headers'
import {
  createRouteHandlerClient,
  createServerComponentClient,
} from '@supabase/auth-helpers-nextjs'
import type { Database } from '@total-audio/schemas-database'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

export async function createRouteSupabaseClient() {
  const cookieStore = await cookies()
  return createRouteHandlerClient<Database>({ cookies: () => cookieStore })
}
