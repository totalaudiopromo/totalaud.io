/**
 * Console Layout
 * Provides OrchestrationProvider for console page
 */

export const dynamic = 'force-dynamic'

import { OrchestrationProvider } from '@/contexts/OrchestrationContext'
import type { ReactNode } from 'react'

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return <OrchestrationProvider>{children}</OrchestrationProvider>
}
