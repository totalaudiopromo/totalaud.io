/**
 * Workspace Layout
 *
 * Phase 6: MVP Pivot - Unified Workspace
 *
 * A minimal layout wrapper for the workspace pages.
 */

import { ReactNode } from 'react'

export const metadata = {
  title: 'Workspace | totalaud',
  description: 'Your unified music promotion workspace',
}

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
