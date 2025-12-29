/**
 * Subscription Hook
 * totalaud.io - December 2025
 *
 * Provides subscription state and checkout/portal actions
 */

'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { useAuth } from './useAuth'
import { logger } from '@/lib/logger'

const log = logger.scope('useSubscription')

export type SubscriptionTier = 'starter' | 'pro' | 'pro_annual' | 'power' | 'power_annual' | null
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'cancelled' | null

// Valid tier values for type checking
const VALID_TIERS = ['starter', 'pro', 'pro_annual', 'power', 'power_annual'] as const
type ValidTier = (typeof VALID_TIERS)[number]

function isValidTier(value: string): value is ValidTier {
  return VALID_TIERS.includes(value as ValidTier)
}

interface TierLimits {
  scoutViewsPerDay: number
  timelineProjects: number
  pitchCoachPerMonth: number
  canExport: boolean
  whiteLabelEpk: boolean
  prioritySupport: boolean
  creditDiscount: number
}

const TIER_LIMITS: Record<ValidTier, TierLimits> = {
  starter: {
    scoutViewsPerDay: 10,
    timelineProjects: 1,
    pitchCoachPerMonth: 3,
    canExport: false,
    whiteLabelEpk: false,
    prioritySupport: false,
    creditDiscount: 0,
  },
  pro: {
    scoutViewsPerDay: Infinity,
    timelineProjects: Infinity,
    pitchCoachPerMonth: Infinity,
    canExport: true,
    whiteLabelEpk: false,
    prioritySupport: false,
    creditDiscount: 0,
  },
  pro_annual: {
    scoutViewsPerDay: Infinity,
    timelineProjects: Infinity,
    pitchCoachPerMonth: Infinity,
    canExport: true,
    whiteLabelEpk: false,
    prioritySupport: false,
    creditDiscount: 0,
  },
  power: {
    scoutViewsPerDay: Infinity,
    timelineProjects: Infinity,
    pitchCoachPerMonth: Infinity,
    canExport: true,
    whiteLabelEpk: true,
    prioritySupport: true,
    creditDiscount: 0.2,
  },
  power_annual: {
    scoutViewsPerDay: Infinity,
    timelineProjects: Infinity,
    pitchCoachPerMonth: Infinity,
    canExport: true,
    whiteLabelEpk: true,
    prioritySupport: true,
    creditDiscount: 0.2,
  },
}

const NO_SUBSCRIPTION_LIMITS: TierLimits = {
  scoutViewsPerDay: 0,
  timelineProjects: 0,
  pitchCoachPerMonth: 0,
  canExport: false,
  whiteLabelEpk: false,
  prioritySupport: false,
  creditDiscount: 0,
}

interface SubscriptionState {
  /** Current subscription tier */
  tier: SubscriptionTier
  /** Subscription status from Stripe */
  status: SubscriptionStatus
  /** True while loading subscription data */
  loading: boolean
  /** True if user has an active subscription */
  isSubscribed: boolean
  /** True if user is on Pro tier (monthly or annual) */
  isPro: boolean
  /** True if user is on Power tier (monthly or annual) */
  isPower: boolean
  /** Feature limits for current tier */
  limits: TierLimits
  /** Start checkout flow for a tier */
  checkout: (tier: ValidTier) => Promise<void>
  /** Open customer portal to manage subscription */
  openPortal: () => Promise<void>
  /** Refresh subscription state */
  refresh: () => Promise<void>
}

export function useSubscription(): SubscriptionState {
  const { user, isAuthenticated } = useAuth()
  const [tier, setTier] = useState<SubscriptionTier>(null)
  const [status, setStatus] = useState<SubscriptionStatus>(null)
  const [loading, setLoading] = useState(true)

  const supabase = useMemo(() => createBrowserSupabaseClient(), [])

  // Fetch subscription from user profile
  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setTier(null)
      setStatus(null)
      setLoading(false)
      return
    }

    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('subscription_tier, subscription_status')
        .eq('id', user.id)
        .single()

      if (error) {
        log.error('Failed to fetch subscription', error)
        setTier(null)
        setStatus(null)
      } else {
        const tierValue = profile?.subscription_tier?.toLowerCase().replace('-', '_')
        if (tierValue && isValidTier(tierValue)) {
          setTier(tierValue)
        } else {
          setTier(null)
        }
        setStatus(profile?.subscription_status as SubscriptionStatus)
      }
    } catch (error) {
      log.error('Subscription fetch error', error)
      setTier(null)
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  // Fetch on mount and when user changes
  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  // Listen for realtime subscription changes
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          const newTier = payload.new.subscription_tier?.toLowerCase().replace('-', '_')
          if (newTier && isValidTier(newTier)) {
            setTier(newTier)
          } else {
            setTier(null)
          }
          setStatus(payload.new.subscription_status as SubscriptionStatus)
          log.info('Subscription updated via realtime', { tier: newTier })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase])

  // Start checkout flow
  const checkout = useCallback(
    async (selectedTier: ValidTier) => {
      if (!isAuthenticated) {
        // Redirect to login first
        window.location.href = `/login?redirect=/pricing&tier=${selectedTier}`
        return
      }

      try {
        const response = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tier: selectedTier }),
        })

        const data = await response.json()

        if (data.url) {
          // Redirect to Stripe Checkout
          window.location.href = data.url
        } else if (data.error) {
          log.error('Checkout error', { error: data.error })
          throw new Error(data.error)
        }
      } catch (error) {
        log.error('Checkout failed', error)
        throw error
      }
    },
    [isAuthenticated]
  )

  // Open customer portal
  const openPortal = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else if (data.error) {
        log.error('Portal error', { error: data.error })
        throw new Error(data.error)
      }
    } catch (error) {
      log.error('Portal failed', error)
      throw error
    }
  }, [isAuthenticated])

  // Derived state
  const isSubscribed = useMemo(() => {
    return tier !== null && (status === 'active' || status === 'trialing')
  }, [tier, status])

  const isPro = useMemo(() => {
    return isSubscribed && (tier === 'pro' || tier === 'pro_annual')
  }, [isSubscribed, tier])

  const isPower = useMemo(() => {
    return isSubscribed && (tier === 'power' || tier === 'power_annual')
  }, [isSubscribed, tier])

  const limits = useMemo(() => {
    if (!tier || !isSubscribed) return NO_SUBSCRIPTION_LIMITS
    return TIER_LIMITS[tier]
  }, [tier, isSubscribed])

  return {
    tier,
    status,
    loading,
    isSubscribed,
    isPro,
    isPower,
    limits,
    checkout,
    openPortal,
    refresh: fetchSubscription,
  }
}
