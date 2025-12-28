import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@total-audio/schemas-database'
import { env } from '@/lib/env'

/**
 * Create a Supabase client for Server Components
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {
            // Server Component context - cookies can only be modified in Server Actions or Route Handlers
            // This is expected behaviour in Server Components, not an error
            if (process.env.NODE_ENV === 'development') {
              console.debug('[Supabase] Cookie set skipped in Server Component context:', error)
            }
          }
        },
      },
    }
  )
}

/**
 * Create a Supabase client for Route Handlers
 */
export async function createRouteSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {
            // Route handler context - cookies may fail if response already started
            // This is expected in some edge cases with streaming responses
            if (process.env.NODE_ENV === 'development') {
              console.debug('[Supabase] Cookie set failed in route handler:', error)
            }
          }
        },
      },
    }
  )
}
