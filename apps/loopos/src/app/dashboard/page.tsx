'use client'

import { AuthGuard } from '@/components/AuthGuard'
import { AppShell } from '@/components/AppShell'
import { useWorkspace } from '@/hooks/useWorkspace'
import { Plus } from 'lucide-react'

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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Timeline</h1>
        <p className="text-foreground/60">
          Your creative campaign canvas for {currentWorkspace?.name || 'your workspace'}
        </p>
      </div>

      <div className="bg-background border border-border rounded-lg p-8">
        <div className="text-centre py-12">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-centre justify-centre mx-auto mb-4">
            <Plus className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Your Timeline is empty</h2>
          <p className="text-foreground/60 mb-6">
            Create your first node to start mapping your campaign
          </p>
          <button className="px-6 py-3 bg-accent text-background font-medium rounded-lg hover:bg-accent/90 transition-colours">
            Create Node
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-background border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-2">Nodes</h3>
          <p className="text-3xl font-bold text-accent">0</p>
          <p className="text-sm text-foreground/60 mt-1">Ideas mapped</p>
        </div>
        <div className="bg-background border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-2">Notes</h3>
          <p className="text-3xl font-bold text-accent">0</p>
          <p className="text-sm text-foreground/60 mt-1">Captured thoughts</p>
        </div>
        <div className="bg-background border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-2">Flow Sessions</h3>
          <p className="text-3xl font-bold text-accent">0</p>
          <p className="text-sm text-foreground/60 mt-1">Active sessions</p>
        </div>
      </div>
    </div>
  )
}
