'use client'

import { useEffect, useState } from 'react'

/**
 * ClientOnly Wrapper
 *
 * Prevents hydration mismatches by only rendering children on the client.
 * Use this to wrap components that depend on browser APIs or Zustand stores.
 */
export function ClientOnly({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  if (!ready) return null

  return <>{children}</>
}
