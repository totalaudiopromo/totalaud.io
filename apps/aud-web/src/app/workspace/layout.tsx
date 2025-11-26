/**
 * Workspace Layout
 * Unified creative environment that replaces the multi-OS routes
 *
 * This layout provides:
 * - ModeProvider context for Ideas/Timeline/Pitch modes
 * - Full-screen container with cinematic styling
 * - WorkspaceShell with header and mode switcher
 */

'use client'

import { ModeProvider, WorkspaceShell } from '@/components/workspace'

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModeProvider>
      <div
        className="fixed inset-0 m-0 h-screen w-screen overflow-hidden bg-[#0F1113] p-0 text-white"
        style={{
          isolation: 'isolate',
        }}
      >
        <WorkspaceShell>{children}</WorkspaceShell>
      </div>
    </ModeProvider>
  )
}
