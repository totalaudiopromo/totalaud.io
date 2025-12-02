/**
 * Auth Hook
 * Phase 6: Auth + Landing Page
 *
 * Provides authentication state with guest mode detection.
 * Used to gate TAP features for unauthenticated users while
 * allowing them to use localStorage-based workspace features.
 */

'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  /** Current authenticated user, or null if guest */
  user: User | null
  /** True while checking initial auth state */
  loading: boolean
  /** True if user is authenticated */
  isAuthenticated: boolean
  /** True if user is not authenticated (guest mode) */
  isGuest: boolean
  /** User's display name (from metadata or email) */
  displayName: string | null
  /** Sign out the current user */
  signOut: () => Promise<void>
  /** Refresh the auth state */
  refresh: () => Promise<void>
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Create Supabase client once
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])

  // Fetch current user
  const fetchUser = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      console.error('[useAuth] Error fetching user:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Sign out handler
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error('[useAuth] Error signing out:', error)
    }
  }, [supabase])

  // Refresh auth state
  const refresh = useCallback(async () => {
    setLoading(true)
    await fetchUser()
  }, [fetchUser])

  useEffect(() => {
    // Get initial session
    fetchUser()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchUser])

  // Extract display name from user metadata or email
  const displayName = useMemo(() => {
    if (!user) return null
    const meta = user.user_metadata
    return meta?.full_name || meta?.display_name || meta?.name || user.email?.split('@')[0] || null
  }, [user])

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isGuest: !user && !loading,
    displayName,
    signOut,
    refresh,
  }
}
