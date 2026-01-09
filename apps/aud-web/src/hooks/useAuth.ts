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
import { logger } from '@/lib/logger'
import { env } from '@/lib/env'

const log = logger.scope('useAuth')

// Helper to construct a proper User object for development mocking
const createDevUser = (id: string, email: string, name: string): User => {
  return {
    id,
    email,
    user_metadata: { full_name: name },
    app_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    role: 'authenticated',
    factors: [],
    identities: [],
    phone: '',
  }
}

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

      // Gated dev-only mock auth bypass
      if (
        !user &&
        env.NODE_ENV === 'development' &&
        env.NEXT_PUBLIC_ENABLE_DEV_MOCK_AUTH === true
      ) {
        log.warn('Mock auth enabled: bypassing Supabase and using dev user')
        const devUserId = '62a086b1-411e-4d2b-894e-71dfd8cb5d4e' // The verify@totalaud.io ID
        const devUser = createDevUser(devUserId, 'verify@totalaud.io', 'Verify Artist')
        setUser(devUser)
        setLoading(false)
        return
      }

      setUser(user)
    } catch (error) {
      log.error('Error fetching user', error)
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
      log.error('Error signing out', error)
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
