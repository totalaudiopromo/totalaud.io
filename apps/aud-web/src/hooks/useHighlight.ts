/**
 * useHighlight Hook
 * Phase 14.1: Element highlighting for onboarding tour
 *
 * Features:
 * - Draws cyan outline (#89DFF3) around target elements
 * - Smooth fade-in/out transitions (240ms)
 * - Auto-repositions on resize/scroll
 * - Respects prefers-reduced-motion
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export interface HighlightBounds {
  top: number
  left: number
  width: number
  height: number
}

interface UseHighlightOptions {
  selector?: string
  padding?: number
  enabled?: boolean
}

export function useHighlight({ selector, padding = 8, enabled = true }: UseHighlightOptions) {
  const [bounds, setBounds] = useState<HighlightBounds | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const frameRef = useRef<number>()

  useEffect(() => {
    if (!enabled || !selector) {
      setBounds(null)
      return
    }

    const updateBounds = () => {
      const element = document.querySelector(selector)
      if (!element) {
        setBounds(null)
        return
      }

      const rect = element.getBoundingClientRect()
      setBounds({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      })
    }

    // Initial update
    updateBounds()

    // Update on scroll/resize with debouncing via requestAnimationFrame
    const handleUpdate = () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
      frameRef.current = requestAnimationFrame(updateBounds)
    }

    window.addEventListener('resize', handleUpdate)
    window.addEventListener('scroll', handleUpdate, true) // Capture phase for all scrolls

    return () => {
      window.removeEventListener('resize', handleUpdate)
      window.removeEventListener('scroll', handleUpdate, true)
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [selector, padding, enabled])

  return {
    bounds,
    isVisible: bounds !== null,
    transitionDuration: prefersReducedMotion ? 0 : 240,
  }
}
