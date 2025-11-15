/**
 * useUser Hook
 * Access current user and auth state
 */

'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/state/authStore'

export function useUser() {
  const { user, session, isLoading, setSession, setLoading } = useAuthStore()
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase, setSession, setLoading])

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
  }
}
