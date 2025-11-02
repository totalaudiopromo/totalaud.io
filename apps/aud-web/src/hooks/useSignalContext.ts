/**
 * useSignalContext Hook
 * Phase 14.4: Signal Intelligence data fetching
 *
 * Fetches:
 * - Latest operator context (artist, goal, horizon)
 * - Latest agent results per agent type
 *
 * Uses SWR-like pattern with 15s revalidate
 */

'use client'

import { useState, useEffect } from 'react'

export interface SignalContext {
  artist: string | null
  genre: string | null
  goal: 'radio' | 'playlist' | 'press' | 'growth' | 'experiment' | null
  horizon: number | null
  followers: number | null
  imageUrl: string | null
}

export interface AgentResult {
  agent: string
  status: 'success' | 'error' | 'pending'
  tookMs: number
  createdAt: string
  summary: string | null
}

interface UseSignalContextResult {
  context: SignalContext | null
  agentResults: AgentResult[] | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

const REVALIDATE_INTERVAL = 15000 // 15 seconds

export function useSignalContext(campaignId?: string): UseSignalContextResult {
  const [context, setContext] = useState<SignalContext | null>(null)
  const [agentResults, setAgentResults] = useState<AgentResult[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch latest operator context
      const contextRes = await fetch('/api/operator/context/latest')
      if (!contextRes.ok) {
        throw new Error(`Failed to fetch context: ${contextRes.statusText}`)
      }
      const contextData = await contextRes.json()
      setContext(contextData)

      // Fetch latest agent results (if campaignId provided)
      if (campaignId) {
        const agentRes = await fetch(`/api/agent/latest?campaignId=${campaignId}`)
        if (!agentRes.ok) {
          throw new Error(`Failed to fetch agent results: ${agentRes.statusText}`)
        }
        const agentData = await agentRes.json()
        setAgentResults(agentData.results || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [campaignId])

  // Revalidate on interval
  useEffect(() => {
    const interval = setInterval(fetchData, REVALIDATE_INTERVAL)
    return () => clearInterval(interval)
  }, [campaignId])

  return {
    context,
    agentResults,
    isLoading,
    error,
    refetch: fetchData,
  }
}
