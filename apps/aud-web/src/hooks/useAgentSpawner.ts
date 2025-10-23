'use client'

import { useState, useCallback, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useUISound } from './useUISound'

export type AgentRole = 'scout' | 'coach' | 'tracker' | 'insight' | 'custom'

export interface AgentManifest {
  id: string
  user_id: string
  name: string
  role: AgentRole
  personality?: string
  colour: string
  sound_profile: {
    start: number
    complete: number
    error: number
  }
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SpawnParams {
  name: string
  role: AgentRole
  personality?: string
  colour?: string
  sound_profile?: {
    start: number
    complete: number
    error: number
  }
}

interface UseAgentSpawnerReturn {
  spawn: (params: SpawnParams) => Promise<AgentManifest | null>
  list: () => Promise<AgentManifest[]>
  remove: (id: string) => Promise<boolean>
  isSpawning: boolean
  error: string | null
}

/**
 * Hook for managing agent lifecycle: spawn, list, remove.
 * Integrates with Supabase and plays spawn sounds.
 */
export function useAgentSpawner(): UseAgentSpawnerReturn {
  // Initialize Supabase client
  const supabase = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }

    return createClient(supabaseUrl, supabaseAnonKey)
  }, [])

  const sound = useUISound()
  const [isSpawning, setIsSpawning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Spawn a new agent with given parameters.
   * Plays spawn sound (240Hz → 480Hz glide) on success.
   */
  const spawn = useCallback(
    async (params: SpawnParams): Promise<AgentManifest | null> => {
      setIsSpawning(true)
      setError(null)

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          throw new Error('user not authenticated')
        }

        // Insert agent manifest
        const { data, error: insertError } = await supabase
          .from('agent_manifests')
          .insert([
            {
              user_id: user.id,
              name: params.name,
              role: params.role,
              personality: params.personality || null,
              colour: params.colour || '#6366f1',
              sound_profile: params.sound_profile || {
                start: 440,
                complete: 880,
                error: 220,
              },
              is_active: true,
            },
          ])
          .select()
          .single()

        if (insertError) {
          throw insertError
        }

        // Play spawn sound (240Hz → 480Hz glide)
        sound.agentStart()

        console.log(`[useAgentSpawner] Agent '${params.name}' spawned:`, data)
        return data as AgentManifest
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'failed to spawn agent'
        setError(errorMessage)
        console.error('[useAgentSpawner] Spawn error:', err)
        sound.error()
        return null
      } finally {
        setIsSpawning(false)
      }
    },
    [supabase, sound]
  )

  /**
   * List all active agent manifests for the current user.
   */
  const list = useCallback(async (): Promise<AgentManifest[]> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('user not authenticated')
      }

      const { data, error: fetchError } = await supabase
        .from('agent_manifests')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      return (data as AgentManifest[]) || []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'failed to list agents'
      setError(errorMessage)
      console.error('[useAgentSpawner] List error:', err)
      return []
    }
  }, [supabase])

  /**
   * Remove (soft delete) an agent manifest.
   * Plays fall sound (480Hz → 220Hz) on success.
   */
  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      setError(null)

      try {
        const { error: updateError } = await supabase
          .from('agent_manifests')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('id', id)

        if (updateError) {
          throw updateError
        }

        // Play fall sound (480Hz → 220Hz)
        if (sound.config.enabled) {
          const ctx = new AudioContext()
          const oscillator = ctx.createOscillator()
          const gainNode = ctx.createGain()

          oscillator.connect(gainNode)
          gainNode.connect(ctx.destination)

          oscillator.type = 'sine'
          oscillator.frequency.setValueAtTime(480, ctx.currentTime)
          oscillator.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.3)

          gainNode.gain.setValueAtTime(sound.config.volume * 0.3, ctx.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)

          oscillator.start(ctx.currentTime)
          oscillator.stop(ctx.currentTime + 0.3)
        }

        console.log(`[useAgentSpawner] Agent ${id} removed`)
        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'failed to remove agent'
        setError(errorMessage)
        console.error('[useAgentSpawner] Remove error:', err)
        sound.error()
        return false
      }
    },
    [supabase, sound]
  )

  return {
    spawn,
    list,
    remove,
    isSpawning,
    error,
  }
}
