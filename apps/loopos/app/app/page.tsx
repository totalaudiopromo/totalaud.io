/**
 * Main App Page
 * Protected route - requires authentication
 */

'use client'

import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AppPage() {
  const { user, isLoading } = useUser()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-matte-black">
        <div className="text-slate-cyan">Loading LoopOS...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-matte-black text-white">
      <header className="border-b border-slate-cyan/30 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold glow-accent">LoopOS</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{user.email}</span>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm border border-slate-cyan/30 rounded hover:border-slate-cyan hover:bg-slate-cyan/10 transition-all"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Welcome to LoopOS</h2>
            <p className="text-gray-400">
              Your artist-facing OS for music promotion is being built.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              title="Loop Canvas"
              description="Visual workflow with node dependencies and sequencing"
              status="Coming soon"
            />
            <FeatureCard
              title="Notes v2"
              description="Enhanced notes with tags, backlinks, and AI organisation"
              status="Coming soon"
            />
            <FeatureCard
              title="Momentum Engine"
              description="Automatic decay, streaks, and anti-drop system"
              status="Coming soon"
            />
            <FeatureCard
              title="Loop Health v2"
              description="Advanced insights and workflow analysis"
              status="Coming soon"
            />
            <FeatureCard
              title="Console Integration"
              description="Export tasks to TotalAudio Console"
              status="Coming soon"
            />
            <FeatureCard
              title="Command Palette"
              description="⌘K global search and actions"
              status="Coming soon"
            />
          </div>
        </div>
      </main>
    </div>
  )
}

function FeatureCard({
  title,
  description,
  status,
}: {
  title: string
  description: string
  status: string
}) {
  return (
    <div className="p-6 border border-slate-cyan/20 rounded-lg hover:border-slate-cyan/40 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-lg">{title}</h3>
        <span className="text-xs text-slate-cyan">{status}</span>
      </div>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  )
}
