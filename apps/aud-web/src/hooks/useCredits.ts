/**
 * useCredits Hook
 *
 * Manages user credit balance for pay-per-contact enrichment.
 * Provides balance fetching, deduction, and purchase flows.
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAuth } from './useAuth'
import { logger } from '@/lib/logger'

const log = logger.scope('useCredits')

// ============================================================================
// Types
// ============================================================================

export interface CreditBalance {
  balancePence: number
  balancePounds: string
  totalPurchasedPence: number
  totalSpentPence: number
  enrichmentCostPence: number
  enrichmentsAvailable: number
}

interface UseCreditsReturn {
  /** Current credit balance */
  balance: CreditBalance | null
  /** Loading state for balance fetch */
  isLoading: boolean
  /** Error message if any */
  error: string | null
  /** Whether user has sufficient credits for one enrichment */
  hasSufficientCredits: boolean
  /** Refresh balance from server */
  refreshBalance: () => Promise<void>
  /** Deduct credits for an enrichment */
  deductForEnrichment: (opportunityId: string, opportunityName?: string) => Promise<boolean>
  /** Format pence as pounds string */
  formatPounds: (pence: number) => string
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useCredits(): UseCreditsReturn {
  const { isAuthenticated } = useAuth()
  const [balance, setBalance] = useState<CreditBalance | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Format pence as pounds
  const formatPounds = useCallback((pence: number): string => {
    return `£${(pence / 100).toFixed(2)}`
  }, [])

  // Fetch balance from API
  const refreshBalance = useCallback(async () => {
    if (!isAuthenticated) {
      setBalance(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/credits')
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch credits')
      }

      setBalance(data.balance)
    } catch (err) {
      log.error('Failed to fetch credits', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch credits')
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  // Deduct credits for an enrichment
  const deductForEnrichment = useCallback(
    async (opportunityId: string, opportunityName?: string): Promise<boolean> => {
      setError(null)

      try {
        const response = await fetch('/api/credits/deduct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ opportunityId, opportunityName }),
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          // Handle specific error codes
          if (data.code === 'INSUFFICIENT_FUNDS' || data.code === 'NO_CREDITS') {
            setError('Insufficient credits')
            return false
          }
          throw new Error(data.error || 'Failed to deduct credits')
        }

        // Update local balance
        if (balance && typeof data.newBalance === 'number') {
          setBalance({
            ...balance,
            balancePence: data.newBalance,
            balancePounds: (data.newBalance / 100).toFixed(2),
            totalSpentPence: balance.totalSpentPence + (data.amountDeducted || 0),
            enrichmentsAvailable: Math.floor(data.newBalance / balance.enrichmentCostPence),
          })
        }

        return true
      } catch (err) {
        log.error('Failed to deduct credits', err)
        setError(err instanceof Error ? err.message : 'Failed to deduct credits')
        return false
      }
    },
    [balance]
  )

  // Check if user has sufficient credits
  const hasSufficientCredits = balance ? balance.balancePence >= balance.enrichmentCostPence : false

  // Fetch balance on mount and when auth changes
  useEffect(() => {
    refreshBalance()
  }, [refreshBalance])

  return {
    balance,
    isLoading,
    error,
    hasSufficientCredits,
    refreshBalance,
    deductForEnrichment,
    formatPounds,
  }
}
