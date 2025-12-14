/**
 * Workspace Layout
 *
 * Phase 6: MVP Pivot - Unified Workspace
 *
 * A minimal layout wrapper for the workspace pages.
 * Includes ToastProvider for notifications and TipsProvider for onboarding.
 */

'use client'

import { ReactNode } from 'react'
import { ToastProvider } from '@/contexts/ToastContext'
import { TipsProvider } from '@/components/onboarding'

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <TipsProvider>
      <ToastProvider>{children}</ToastProvider>
    </TipsProvider>
  )
}
