/**
 * Feature Gating Hook
 * totalaud.io - December 2025
 *
 * Provides soft gating for features based on subscription tier.
 * Tracks usage against tier limits and shows upgrade prompts when limits are reached.
 *
 * Soft gate approach: Never blocks the user, just shows upgrade prompts.
 * This is intentional to avoid frustrating users during the launch phase.
 */

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSubscription, type SubscriptionTier } from './useSubscription'
import { useAuth } from './useAuth'
import { logger } from '@/lib/logger'

const log = logger.scope('FeatureGate')

// ============================================================================
// Types
// ============================================================================

export type GatedFeature =
  | 'scout_view' // Viewing opportunity details in Scout Mode
  | 'pitch_coach' // Using AI coach in Pitch Mode
  | 'timeline_project' // Creating timeline projects
  | 'export' // Exporting data

interface UsageData {
  scoutViewsToday: number
  pitchCoachThisMonth: number
  timelineProjects: number
  lastResetDate: string // ISO date for daily reset
  lastMonthReset: string // ISO month (YYYY-MM) for monthly reset
}

interface FeatureGateResult {
  /** Check if a feature can be used (soft check - always returns true for Pro+) */
  canUse: (feature: GatedFeature) => boolean
  /** Check if user is near their limit for a feature */
  isNearLimit: (feature: GatedFeature) => boolean
  /** Check if user has reached their limit for a feature */
  isAtLimit: (feature: GatedFeature) => boolean
  /** Record usage of a feature (call this when feature is used) */
  recordUsage: (feature: GatedFeature) => void
  /** Get remaining uses for a feature */
  getRemaining: (feature: GatedFeature) => number | 'unlimited'
  /** Get usage stats for display */
  getUsageStats: (feature: GatedFeature) => {
    used: number
    limit: number | 'unlimited'
    remaining: number | 'unlimited'
    resetLabel: string
  }
  /** Current tier */
  tier: SubscriptionTier
  /** Whether user is subscribed */
  isSubscribed: boolean
  /** Whether data is still loading */
  loading: boolean
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'totalaud-feature-usage'

const DEFAULT_USAGE: UsageData = {
  scoutViewsToday: 0,
  pitchCoachThisMonth: 0,
  timelineProjects: 0,
  lastResetDate: new Date().toISOString().split('T')[0],
  lastMonthReset: new Date().toISOString().slice(0, 7),
}

// Threshold for "near limit" warnings (80% of limit)
const NEAR_LIMIT_THRESHOLD = 0.8

// ============================================================================
// Helper Functions
// ============================================================================

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

function loadUsageFromStorage(): UsageData {
  if (typeof window === 'undefined') return DEFAULT_USAGE

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return DEFAULT_USAGE

    const data = JSON.parse(stored) as UsageData
    const today = getTodayDate()
    const currentMonth = getCurrentMonth()

    // Reset daily counters if date changed
    if (data.lastResetDate !== today) {
      data.scoutViewsToday = 0
      data.lastResetDate = today
    }

    // Reset monthly counters if month changed
    if (data.lastMonthReset !== currentMonth) {
      data.pitchCoachThisMonth = 0
      data.lastMonthReset = currentMonth
    }

    return data
  } catch (error) {
    log.warn('Failed to load usage data', { error })
    return DEFAULT_USAGE
  }
}

function saveUsageToStorage(data: UsageData): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    log.warn('Failed to save usage data', { error })
  }
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useFeatureGate(): FeatureGateResult {
  const { tier, isSubscribed, limits, loading: subLoading } = useSubscription()
  const { loading: authLoading } = useAuth()
  const [usage, setUsage] = useState<UsageData>(DEFAULT_USAGE)

  // Load usage data on mount
  useEffect(() => {
    const loadedUsage = loadUsageFromStorage()
    setUsage(loadedUsage)
  }, [])

  // Check if a feature can be used
  // Soft gate: Pro/Power users always return true
  // Starter users get limited but not blocked
  const canUse = useCallback(
    (feature: GatedFeature): boolean => {
      // Not subscribed = guest mode, allow limited free usage
      if (!isSubscribed) {
        // Guest users get very limited access (3 scout views, 1 pitch coach session)
        switch (feature) {
          case 'scout_view':
            return usage.scoutViewsToday < 3
          case 'pitch_coach':
            return usage.pitchCoachThisMonth < 1
          case 'timeline_project':
            return usage.timelineProjects < 1
          case 'export':
            return false
          default:
            return false
        }
      }

      // Subscribed users check against their tier limits
      switch (feature) {
        case 'scout_view':
          return (
            limits.scoutViewsPerDay === Infinity || usage.scoutViewsToday < limits.scoutViewsPerDay
          )
        case 'pitch_coach':
          return (
            limits.pitchCoachPerMonth === Infinity ||
            usage.pitchCoachThisMonth < limits.pitchCoachPerMonth
          )
        case 'timeline_project':
          return (
            limits.timelineProjects === Infinity || usage.timelineProjects < limits.timelineProjects
          )
        case 'export':
          return limits.canExport
        default:
          return true
      }
    },
    [isSubscribed, limits, usage]
  )

  // Check if near limit (80% or more of limit used)
  const isNearLimit = useCallback(
    (feature: GatedFeature): boolean => {
      // Unlimited features are never near limit
      if (!isSubscribed) return false

      switch (feature) {
        case 'scout_view':
          if (limits.scoutViewsPerDay === Infinity) return false
          return usage.scoutViewsToday >= limits.scoutViewsPerDay * NEAR_LIMIT_THRESHOLD
        case 'pitch_coach':
          if (limits.pitchCoachPerMonth === Infinity) return false
          return usage.pitchCoachThisMonth >= limits.pitchCoachPerMonth * NEAR_LIMIT_THRESHOLD
        case 'timeline_project':
          if (limits.timelineProjects === Infinity) return false
          return usage.timelineProjects >= limits.timelineProjects * NEAR_LIMIT_THRESHOLD
        case 'export':
          return false // Binary feature, no "near limit"
        default:
          return false
      }
    },
    [isSubscribed, limits, usage]
  )

  // Check if at limit
  const isAtLimit = useCallback(
    (feature: GatedFeature): boolean => {
      return !canUse(feature)
    },
    [canUse]
  )

  // Record usage of a feature
  const recordUsage = useCallback((feature: GatedFeature): void => {
    setUsage((prev) => {
      const today = getTodayDate()
      const currentMonth = getCurrentMonth()

      // Reset counters if needed
      const newUsage: UsageData = {
        ...prev,
        lastResetDate: today,
        lastMonthReset: currentMonth,
        scoutViewsToday: prev.lastResetDate !== today ? 0 : prev.scoutViewsToday,
        pitchCoachThisMonth: prev.lastMonthReset !== currentMonth ? 0 : prev.pitchCoachThisMonth,
      }

      // Increment the relevant counter
      switch (feature) {
        case 'scout_view':
          newUsage.scoutViewsToday++
          break
        case 'pitch_coach':
          newUsage.pitchCoachThisMonth++
          break
        case 'timeline_project':
          newUsage.timelineProjects++
          break
        case 'export':
          // No counter for export
          break
      }

      log.debug('Usage recorded', { feature, usage: newUsage })
      saveUsageToStorage(newUsage)
      return newUsage
    })
  }, [])

  // Get remaining uses for a feature
  const getRemaining = useCallback(
    (feature: GatedFeature): number | 'unlimited' => {
      // Guest users
      if (!isSubscribed) {
        switch (feature) {
          case 'scout_view':
            return Math.max(0, 3 - usage.scoutViewsToday)
          case 'pitch_coach':
            return Math.max(0, 1 - usage.pitchCoachThisMonth)
          case 'timeline_project':
            return Math.max(0, 1 - usage.timelineProjects)
          case 'export':
            return 0
          default:
            return 0
        }
      }

      // Subscribed users
      switch (feature) {
        case 'scout_view':
          if (limits.scoutViewsPerDay === Infinity) return 'unlimited'
          return Math.max(0, limits.scoutViewsPerDay - usage.scoutViewsToday)
        case 'pitch_coach':
          if (limits.pitchCoachPerMonth === Infinity) return 'unlimited'
          return Math.max(0, limits.pitchCoachPerMonth - usage.pitchCoachThisMonth)
        case 'timeline_project':
          if (limits.timelineProjects === Infinity) return 'unlimited'
          return Math.max(0, limits.timelineProjects - usage.timelineProjects)
        case 'export':
          return limits.canExport ? 'unlimited' : 0
        default:
          return 'unlimited'
      }
    },
    [isSubscribed, limits, usage]
  )

  // Get usage stats for display
  const getUsageStats = useCallback(
    (
      feature: GatedFeature
    ): {
      used: number
      limit: number | 'unlimited'
      remaining: number | 'unlimited'
      resetLabel: string
    } => {
      const remaining = getRemaining(feature)

      // Guest users
      if (!isSubscribed) {
        switch (feature) {
          case 'scout_view':
            return {
              used: usage.scoutViewsToday,
              limit: 3,
              remaining,
              resetLabel: 'Resets daily',
            }
          case 'pitch_coach':
            return {
              used: usage.pitchCoachThisMonth,
              limit: 1,
              remaining,
              resetLabel: 'Resets monthly',
            }
          case 'timeline_project':
            return {
              used: usage.timelineProjects,
              limit: 1,
              remaining,
              resetLabel: 'Upgrade for more',
            }
          case 'export':
            return {
              used: 0,
              limit: 0,
              remaining: 0,
              resetLabel: 'Upgrade to export',
            }
          default:
            return {
              used: 0,
              limit: 'unlimited',
              remaining: 'unlimited',
              resetLabel: '',
            }
        }
      }

      // Subscribed users
      switch (feature) {
        case 'scout_view':
          return {
            used: usage.scoutViewsToday,
            limit: limits.scoutViewsPerDay === Infinity ? 'unlimited' : limits.scoutViewsPerDay,
            remaining,
            resetLabel: limits.scoutViewsPerDay === Infinity ? 'Unlimited' : 'Resets daily',
          }
        case 'pitch_coach':
          return {
            used: usage.pitchCoachThisMonth,
            limit: limits.pitchCoachPerMonth === Infinity ? 'unlimited' : limits.pitchCoachPerMonth,
            remaining,
            resetLabel: limits.pitchCoachPerMonth === Infinity ? 'Unlimited' : 'Resets monthly',
          }
        case 'timeline_project':
          return {
            used: usage.timelineProjects,
            limit: limits.timelineProjects === Infinity ? 'unlimited' : limits.timelineProjects,
            remaining,
            resetLabel: limits.timelineProjects === Infinity ? 'Unlimited' : 'Upgrade for more',
          }
        case 'export':
          return {
            used: 0,
            limit: limits.canExport ? 'unlimited' : 0,
            remaining: limits.canExport ? 'unlimited' : 0,
            resetLabel: limits.canExport ? 'Unlimited' : 'Upgrade to export',
          }
        default:
          return {
            used: 0,
            limit: 'unlimited',
            remaining: 'unlimited',
            resetLabel: '',
          }
      }
    },
    [isSubscribed, limits, usage, getRemaining]
  )

  const loading = useMemo(() => subLoading || authLoading, [subLoading, authLoading])

  return {
    canUse,
    isNearLimit,
    isAtLimit,
    recordUsage,
    getRemaining,
    getUsageStats,
    tier,
    isSubscribed,
    loading,
  }
}

// ============================================================================
// Utility: Upgrade Prompt Component Props
// ============================================================================

export interface UpgradePromptProps {
  feature: GatedFeature
  currentTier: SubscriptionTier
  message: string
}

/**
 * Get the appropriate upgrade prompt message for a feature at limit
 */
export function getUpgradePromptMessage(feature: GatedFeature, tier: SubscriptionTier): string {
  const tierName = tier ? tier.replace('_', ' ') : 'free'

  switch (feature) {
    case 'scout_view':
      return tier === 'starter'
        ? "You've reached your daily Scout limit. Upgrade to Pro for unlimited discovery."
        : "You've reached your daily discovery limit. Sign up to explore more opportunities."
    case 'pitch_coach':
      return tier === 'starter'
        ? "You've used your coaching sessions this month. Upgrade to Pro for unlimited AI coaching."
        : 'Sign up to access AI pitch coaching and improve your outreach.'
    case 'timeline_project':
      return tier === 'starter'
        ? "You've reached your project limit. Upgrade to Pro for unlimited projects."
        : 'Sign up to create and manage your release timeline.'
    case 'export':
      return `Export is available on Pro and above. Currently on ${tierName}.`
    default:
      return 'Upgrade to access this feature.'
  }
}

/**
 * Feature display names for UI
 */
export const FEATURE_DISPLAY_NAMES: Record<GatedFeature, string> = {
  scout_view: 'Scout Views',
  pitch_coach: 'AI Coach Sessions',
  timeline_project: 'Timeline Projects',
  export: 'Data Export',
}
