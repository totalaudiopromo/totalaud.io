'use client'

import { useState, useEffect } from 'react'

const FIRST_RUN_KEY = 'totalaud-first-run-dismissed'

export function useFirstRun() {
  const [showFirstRun, setShowFirstRun] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Check if first-run has been dismissed
    const dismissed = localStorage.getItem(FIRST_RUN_KEY)

    if (!dismissed) {
      setShowFirstRun(true)
    }
  }, [])

  const dismissFirstRun = () => {
    localStorage.setItem(FIRST_RUN_KEY, 'true')
    setShowFirstRun(false)
  }

  return {
    showFirstRun: isClient && showFirstRun,
    dismissFirstRun,
  }
}
