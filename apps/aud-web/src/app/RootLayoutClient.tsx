/**
 * Root Layout Client Component
 * Handles route-based conditional rendering for OS routes
 *
 * OS routes bypass FlowCoreThemeProvider and get black background
 * Other routes use standard FlowCore layout
 */

'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { FlowCoreThemeProvider } from '@/providers/FlowCoreThemeProvider'

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isOS = pathname?.startsWith('/os/')
  const isDemo = pathname?.startsWith('/demo/')

  // Set body background for OS routes and demo routes. Non-OS routes are styled by FlowCoreThemeProvider.
  useEffect(() => {
    if (isOS || isDemo) {
      document.body.className = 'p-0 m-0 overflow-hidden bg-black text-white'
    }
  }, [isOS, isDemo])

  if (isOS || isDemo) {
    // OS routes and demo routes completely bypass global layout
    return <>{children}</>
  }

  // Normal routes use FlowCore + global chrome
  return <FlowCoreThemeProvider>{children}</FlowCoreThemeProvider>
}
