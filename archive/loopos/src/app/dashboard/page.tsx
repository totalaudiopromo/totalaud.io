'use client'

import { AuthGuard } from '@/components/AuthGuard'
import { AppShell } from '@/components/AppShell'
import { useWorkspace } from '@/hooks/useWorkspace'
import { TimelineCanvas } from '@/components/timeline/TimelineCanvas'

export default function DashboardPage() {
  return (
    <AuthGuard>
      <AppShell>
        <DashboardContent />
      </AppShell>
    </AuthGuard>
  )
}

function DashboardContent() {
  const { currentWorkspace } = useWorkspace()

  if (!currentWorkspace) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Timeline</h1>
          <p className="text-foreground/60">Select or create a workspace to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-1">Timeline</h1>
        <p className="text-sm text-foreground/60">
          {currentWorkspace.name} — Double-click to create a node
        </p>
      </div>

      <div className="flex-1 bg-background border border-border rounded-lg overflow-hidden">
        <TimelineCanvas workspaceId={currentWorkspace.id} />
      </div>
    </div>
  )
}
