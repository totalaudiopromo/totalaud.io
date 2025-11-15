/**
 * useMomentum Hook
 * Client-side momentum management
 */

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { LoopOSMomentum } from '@total-audio/loopos-db'
import { useUser } from './useUser'

export function useMomentum() {
  const { user } = useUser()
  const [momentum, setMomentum] = useState<LoopOSMomentum | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return

    fetchMomentum()

    // Set up realtime subscription
    const channel = supabase
      .channel('momentum-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'loopos_momentum',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setMomentum(payload.new as LoopOSMomentum)
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user])

  async function fetchMomentum() {
    if (!user) return

    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('loopos_momentum')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Failed to fetch momentum:', error)
        return
      }

      if (!data) {
        // Create initial momentum record
        const { data: newMomentum, error: createError } = await supabase
          .from('loopos_momentum')
          .insert({
            user_id: user.id,
            current_momentum: 0,
            max_momentum: 100,
          })
          .select()
          .single()

        if (createError) {
          console.error('Failed to create momentum:', createError)
          return
        }

        setMomentum(newMomentum as LoopOSMomentum)
      } else {
        setMomentum(data as LoopOSMomentum)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    momentum,
    isLoading,
    refetch: fetchMomentum,
  }
}
