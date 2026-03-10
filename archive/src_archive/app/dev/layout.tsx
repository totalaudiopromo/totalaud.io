/**
 * Dev Routes Layout
 * Provides OrchestrationProvider for all dev pages
 */

'use client'

export const dynamic = 'force-dynamic'

import { OrchestrationProvider } from '@/contexts/OrchestrationContext'
import type { ReactNode } from 'react'

export default function DevLayout({ children }: { children: ReactNode }) {
  return <OrchestrationProvider>{children}</OrchestrationProvider>
}
