'use client'

import { useEffect, useState } from 'react'
import { createClient, User } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Silent early return for SSR, but error in client
  if (typeof window !== 'undefined') {
    console.error('Missing Supabase environment variables')
  }
}

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    supabase,
    user,
    loading,
    isAuthenticated: !!user,
    userId: user?.id ?? null,
    // For now, workspaceId defaults to userId or a constant
    workspaceId: user?.id ?? null,
  }
}
