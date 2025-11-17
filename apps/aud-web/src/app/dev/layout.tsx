/**
 * Dev Routes Layout
 * Provides FlowCoreThemeProvider and OrchestrationProvider for all dev pages
 */

'use client'

export const dynamic = 'force-dynamic'

import { OrchestrationProvider } from '@/contexts/OrchestrationContext'
import { FlowCoreThemeProvider } from '@/providers/FlowCoreThemeProvider'
import type { ReactNode } from 'react'

export default function DevLayout({ children }: { children: ReactNode }) {
  return (
    <FlowCoreThemeProvider>
      <OrchestrationProvider>{children}</OrchestrationProvider>
    </FlowCoreThemeProvider>
  )
}
