'use client'

import { AuthGuard } from '@/components/AuthGuard'
import { AppShell } from '@/components/AppShell'
import { useWorkspace } from '@/hooks/useWorkspace'
import { CoachInterface } from '@/components/coach/CoachInterface'

export default function CoachPage() {
  return (
    <AuthGuard>
      <AppShell>
        <CoachContent />
      </AppShell>
    </AuthGuard>
  )
}

function CoachContent() {
  const { currentWorkspace } = useWorkspace()

  if (!currentWorkspace) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Coach</h1>
          <p className="text-foreground/60">Select or create a workspace to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-1">Coach</h1>
        <p className="text-sm text-foreground/60">
          Your AI creative strategist for {currentWorkspace.name}
        </p>
      </div>

      <div className="flex-1 bg-background border border-border rounded-lg overflow-hidden">
        <CoachInterface
          context={{
            workspaceName: currentWorkspace.name,
          }}
        />
      </div>
    </div>
  )
}
