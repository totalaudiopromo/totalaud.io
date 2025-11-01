/**
 * useReducedMotion Hook
 * Phase 14: Accessibility - respects user's motion preferences
 *
 * Returns true if user has requested reduced motion
 * Use this to disable/reduce animations for accessibility
 */

'use client'

import { useEffect, useState } from 'react'

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Check if window is available (client-side only)
    if (typeof window === 'undefined') {
      return
    }

    // Create media query
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches)

    // Handler for media query changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange)

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return prefersReducedMotion
}

/**
 * Helper function to get motion duration based on reduced motion preference
 *
 * Usage:
 * ```tsx
 * const prefersReducedMotion = useReducedMotion()
 * const duration = getMotionDuration(240, prefersReducedMotion)
 * // Returns 0 if reduced motion is preferred, 240 otherwise
 * ```
 */
export function getMotionDuration(duration: number, prefersReducedMotion: boolean): number {
  return prefersReducedMotion ? 0 : duration
}

/**
 * Helper function to get motion variant based on reduced motion preference
 *
 * Usage:
 * ```tsx
 * const prefersReducedMotion = useReducedMotion()
 * const variant = getMotionVariant('animate', 'instant', prefersReducedMotion)
 * ```
 */
export function getMotionVariant<T>(
  animatedVariant: T,
  instantVariant: T,
  prefersReducedMotion: boolean
): T {
  return prefersReducedMotion ? instantVariant : animatedVariant
}
