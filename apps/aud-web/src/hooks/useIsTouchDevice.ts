/**
 * useIsTouchDevice Hook
 *
 * Detects whether the current device supports touch input.
 * Used to swap hover/double-click interactions for touch-friendly ones.
 */

'use client'

import { useState, useEffect } from 'react'

export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  return isTouch
}
