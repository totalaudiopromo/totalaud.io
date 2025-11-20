/**
 * EPK Routes Layout
 * Provides FlowCoreThemeProvider for EPK pages
 */

'use client'

import { FlowCoreThemeProvider } from '@/providers/FlowCoreThemeProvider'
import type { ReactNode } from 'react'

export default function EPKLayout({ children }: { children: ReactNode }) {
  return <FlowCoreThemeProvider>{children}</FlowCoreThemeProvider>
}
