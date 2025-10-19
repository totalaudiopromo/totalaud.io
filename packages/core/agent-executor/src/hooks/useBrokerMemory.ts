/**
 * useBrokerMemory Hook
 *
 * Provides persistent memory for Broker agent conversations.
 * Stores user responses in Supabase user_profiles table for later recall.
 *
 * Usage:
 * ```tsx
 * const { save, recall, complete } = useBrokerMemory(sessionId)
 *
 * await save('artist_name', 'sadact')
 * const name = await recall('artist_name')
 * await complete() // Mark broker onboarding as done
 * ```
 */

import { useState, useCallback } from 'react'
import type { BrokerMemoryData } from './types'

export interface UseBrokerMemoryReturn {
  /** Save a conversation field to Supabase */
  save: (key: keyof BrokerMemoryData, value: string) => Promise<void>

  /** Recall a previously saved field */
  recall: (key: keyof BrokerMemoryData) => Promise<string | null>

  /** Get all saved conversation data */
  getAll: () => Promise<BrokerMemoryData>

  /** Mark broker onboarding as complete */
  complete: () => Promise<void>

  /** Clear all broker memory */
  clear: () => Promise<void>

  /** Local state of saved data */
  data: BrokerMemoryData

  /** Loading state */
  isLoading: boolean

  /** Error state */
  error: Error | null
}

/**
 * Hook for managing Broker's conversation memory
 *
 * @param sessionId - Unique session identifier for this conversation
 * @param supabaseClient - Optional Supabase client (for server-side usage)
 */
export function useBrokerMemory(
  sessionId: string,
  supabaseClient?: any // TODO: Type as SupabaseClient when available
): UseBrokerMemoryReturn {
  const [data, setData] = useState<BrokerMemoryData>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * Save a conversation field to Supabase user_profiles
   */
  const save = useCallback(
    async (key: keyof BrokerMemoryData, value: string) => {
      setIsLoading(true)
      setError(null)

      try {
        // Get Supabase client (client-side or passed in)
        const supabase = supabaseClient || await getSupabaseClient()

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          throw new Error('User not authenticated')
        }

        // Upsert the field
        const { error: upsertError } = await supabase
          .from('user_profiles')
          .upsert(
            {
              id: user.id,
              [key]: value,
              broker_session_id: sessionId,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: 'id',
            }
          )

        if (upsertError) throw upsertError

        // Update local state
        setData((prev: BrokerMemoryData) => ({ ...prev, [key]: value }))

        console.log(`[BrokerMemory] Saved ${key}:`, value)
      } catch (err) {
        console.error(`[BrokerMemory] Error saving ${key}:`, err)
        setError(err as Error)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [sessionId, supabaseClient]
  )

  /**
   * Recall a previously saved field
   */
  const recall = useCallback(
    async (key: keyof BrokerMemoryData): Promise<string | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const supabase = supabaseClient || await getSupabaseClient()

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          throw new Error('User not authenticated')
        }

        const { data: profile, error: fetchError } = await supabase
          .from('user_profiles')
          .select(key)
          .eq('id', user.id)
          .single()

        if (fetchError) throw fetchError

        const value = profile?.[key] || null
        console.log(`[BrokerMemory] Recalled ${key}:`, value)

        return value
      } catch (err) {
        console.error(`[BrokerMemory] Error recalling ${key}:`, err)
        setError(err as Error)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [supabaseClient]
  )

  /**
   * Get all saved conversation data
   */
  const getAll = useCallback(async (): Promise<BrokerMemoryData> => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = supabaseClient || await getSupabaseClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data: profile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('artist_name, genre, goal, experience')
        .eq('id', user.id)
        .single()

      if (fetchError) throw fetchError

      const memoryData: BrokerMemoryData = {
        artist_name: profile?.artist_name || undefined,
        genre: profile?.genre || undefined,
        goal: profile?.goal || undefined,
        experience: profile?.experience || undefined,
      }

      setData(memoryData)
      return memoryData
    } catch (err) {
      console.error('[BrokerMemory] Error getting all data:', err)
      setError(err as Error)
      return {}
    } finally {
      setIsLoading(false)
    }
  }, [supabaseClient])

  /**
   * Mark broker onboarding as complete
   */
  const complete = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = supabaseClient || await getSupabaseClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('User not authenticated')
      }

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          onboarding_completed: true,
          broker_completed_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      console.log('[BrokerMemory] Marked onboarding as complete')
    } catch (err) {
      console.error('[BrokerMemory] Error completing onboarding:', err)
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [supabaseClient])

  /**
   * Clear all broker memory
   */
  const clear = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = supabaseClient || await getSupabaseClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('User not authenticated')
      }

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          artist_name: null,
          genre: null,
          goal: null,
          experience: null,
          broker_session_id: null,
          broker_completed_at: null,
          onboarding_completed: false,
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setData({})
      console.log('[BrokerMemory] Cleared all broker memory')
    } catch (err) {
      console.error('[BrokerMemory] Error clearing memory:', err)
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [supabaseClient])

  return {
    save,
    recall,
    getAll,
    complete,
    clear,
    data,
    isLoading,
    error,
  }
}

/**
 * Get Supabase client (client-side only)
 * This will be replaced with actual Supabase client import
 */
async function getSupabaseClient() {
  // TODO: Import actual Supabase client
  // For now, return a mock that throws
  throw new Error('Supabase client not configured. Pass supabaseClient to useBrokerMemory.')
}

/**
 * Design Principle: "Broker remembers so the user can stay in flow."
 *
 * This hook bridges personality-driven conversation and productive workflow
 * by persisting user responses and making them available for flow generation.
 */
