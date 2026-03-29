'use client'

import { useEffect } from 'react'
import { initWebVitals } from '@/lib/vitals'

/**
 * Client component that initialises Web Vitals reporting on mount.
 * Renders nothing -- purely a side-effect wrapper.
 */
export function WebVitalsInit() {
  useEffect(() => {
    initWebVitals()
  }, [])

  return null
}
