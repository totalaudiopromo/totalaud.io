/**
 * useUserActivity Hook
 *
 * Tracks user engagement and activity level.
 * Used to drive reactive Studio Aura effects.
 *
 * Phase 6: Enhancements - Activity Tracking
 */

import { useState, useEffect, useCallback, useRef } from 'react'

export interface UserActivityMetrics {
  /** Activity level from 0-100 */
  activityLevel: number

  /** Is user currently active (moved/typed in last 2s) */
  isActive: boolean

  /** Total interactions in current session */
  totalInteractions: number

  /** Last interaction timestamp */
  lastInteraction: Date | null
}

export function useUserActivity(): UserActivityMetrics {
  const [activityLevel, setActivityLevel] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [totalInteractions, setTotalInteractions] = useState(0)
  const [lastInteraction, setLastInteraction] = useState<Date | null>(null)

  const activityDecayRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(Date.now())

  // Track user interactions
  const recordActivity = useCallback(() => {
    const now = Date.now()
    const timeSinceLastActivity = now - lastActivityRef.current

    // Boost activity level based on frequency
    setActivityLevel((prev) => {
      let boost = 15
      if (timeSinceLastActivity < 500) {
        boost = 25 // Rapid activity
      } else if (timeSinceLastActivity < 2000) {
        boost = 15 // Moderate activity
      } else {
        boost = 10 // Slow activity
      }

      return Math.min(100, prev + boost)
    })

    setIsActive(true)
    setTotalInteractions((prev) => prev + 1)
    setLastInteraction(new Date())
    lastActivityRef.current = now

    // Reset active state after 2 seconds
    setTimeout(() => setIsActive(false), 2000)
  }, [])

  // Set up event listeners
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Track mouse movement
    const handleMouseMove = () => recordActivity()

    // Track keyboard input
    const handleKeyPress = () => recordActivity()

    // Track clicks
    const handleClick = () => recordActivity()

    // Track scroll
    const handleScroll = () => recordActivity()

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('keydown', handleKeyPress)
    window.addEventListener('click', handleClick)
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('keydown', handleKeyPress)
      window.removeEventListener('click', handleClick)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [recordActivity])

  // Activity decay over time (drop by 5 every second when idle)
  useEffect(() => {
    activityDecayRef.current = setInterval(() => {
      setActivityLevel((prev) => Math.max(0, prev - 5))
    }, 1000)

    return () => {
      if (activityDecayRef.current) {
        clearInterval(activityDecayRef.current)
      }
    }
  }, [])

  return {
    activityLevel,
    isActive,
    totalInteractions,
    lastInteraction,
  }
}
