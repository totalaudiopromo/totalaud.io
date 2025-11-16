'use client'

import { useEffect, useState } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { useWorkspace } from '@/hooks/useWorkspace'
import { Brain, Sparkles, TrendingUp, Palette, Heart, Activity } from 'lucide-react'
import type { ArtistIdentity } from '@total-audio/loopos-db'

export default function ArtistIdentityPage() {
  return (
    <AuthGuard>
      <ArtistIdentityContent />
    </AuthGuard>
  )
}

function ArtistIdentityContent() {
  const { currentWorkspace } = useWorkspace()
  const [identity, setIdentity] = useState<ArtistIdentity | null>(null)
  const [loading, setLoading] = useState(true)
  const [creatingSnapshot, setCreatingSnapshot] = useState(false)

  useEffect(() => {
    if (!currentWorkspace) return
    loadIdentity()
  }, [currentWorkspace])

  const loadIdentity = async () => {
    if (!currentWorkspace) return

    try {
      setLoading(true)
      const res = await fetch(`/api/memory/identity?workspaceId=${currentWorkspace.id}`)
      const data = await res.json()

      if (data.success) {
        setIdentity(data.identity)
      }
    } catch (error) {
      console.error('Failed to load artist identity:', error)
    } finally {
      setLoading(false)
    }
  }

  const createSnapshot = async () => {
    if (!currentWorkspace) return

    try {
      setCreatingSnapshot(true)
      const res = await fetch('/api/memory/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: currentWorkspace.id,
          snapshotType: 'manual',
        }),
      })

      const data = await res.json()

      if (data.success) {
        // Show success (could use toast)
        console.log('Snapshot created:', data.summary)
      }
    } catch (error) {
      console.error('Failed to create snapshot:', error)
    } finally {
      setCreatingSnapshot(false)
    }
  }

  if (!currentWorkspace) {
    return <div className="p-8">No workspace selected</div>
  }

  if (loading) {
    return (
      <div className="flex items-centre justify-centre min-h-screen">
        <Activity className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  const isEmpty =
    !identity ||
    (identity.node_count === 0 &&
      identity.themes?.length === 0 &&
      identity.tones?.length === 0)

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-centre gap-3 mb-2">
            <Brain className="w-8 h-8 text-accent" />
            <h1 className="text-3xl font-bold">Artist Identity</h1>
          </div>
          <p className="text-foreground/60">
            Your creative DNA, learned from everything you create in LoopOS
          </p>
        </div>

        {isEmpty ? (
          // Empty state
          <div className="border border-border rounded-lg p-12 text-centre">
            <Sparkles className="w-16 h-16 text-accent mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-bold mb-2">No identity data yet</h2>
            <p className="text-foreground/60 mb-6">
              Your artist identity will emerge as you use LoopOS. Try creating journal entries,
              chatting with Coach, or designing scenes.
            </p>
          </div>
        ) : (
          <>
            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-background border border-border rounded-lg p-4">
                <div className="flex items-centre gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  <span className="text-sm text-foreground/60">Memory Nodes</span>
                </div>
                <div className="text-2xl font-bold">{identity.node_count || 0}</div>
              </div>
              <div className="bg-background border border-border rounded-lg p-4">
                <div className="flex items-centre gap-2 mb-1">
                  <Activity className="w-4 h-4 text-accent" />
                  <span className="text-sm text-foreground/60">Connections</span>
                </div>
                <div className="text-2xl font-bold">{identity.edge_count || 0}</div>
              </div>
            </div>

            {/* Identity Sections */}
            <div className="space-y-6">
              {/* Themes */}
              {identity.themes && identity.themes.length > 0 && (
                <IdentitySection
                  icon={<Sparkles className="w-5 h-5 text-accent" />}
                  title="Creative Themes"
                  items={identity.themes}
                />
              )}

              {/* Tones */}
              {identity.tones && identity.tones.length > 0 && (
                <IdentitySection
                  icon={<Activity className="w-5 h-5 text-accent" />}
                  title="Emotional Tones"
                  items={identity.tones}
                />
              )}

              {/* Values */}
              {identity.values && identity.values.length > 0 && (
                <IdentitySection
                  icon={<Heart className="w-5 h-5 text-accent" />}
                  title="Core Values"
                  items={identity.values}
                />
              )}

              {/* Visual Motifs */}
              {identity.visual_motifs && identity.visual_motifs.length > 0 && (
                <IdentitySection
                  icon={<Palette className="w-5 h-5 text-accent" />}
                  title="Visual Motifs"
                  items={identity.visual_motifs}
                />
              )}
            </div>

            {/* Actions */}
            <div className="mt-8 flex gap-4">
              <button
                onClick={createSnapshot}
                disabled={creatingSnapshot}
                className="px-4 py-2 bg-accent text-background rounded hover:bg-accent/90 transition-colours disabled:opacity-50"
              >
                {creatingSnapshot ? 'Creating...' : 'Create Snapshot'}
              </button>
              <a
                href="/memory"
                className="px-4 py-2 border border-border rounded hover:border-accent/50 transition-colours"
              >
                Inspect Memory Graph
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// =====================================================
// COMPONENTS
// =====================================================

interface IdentitySectionProps {
  icon: React.ReactNode
  title: string
  items: Array<{ label: string; confidence: number }>
}

function IdentitySection({ icon, title, items }: IdentitySectionProps) {
  return (
    <div className="bg-background border border-border rounded-lg p-6">
      <div className="flex items-centre gap-2 mb-4">
        {icon}
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-full"
            style={{ opacity: 0.5 + item.confidence * 0.5 }}
          >
            <span className="text-sm font-medium">{item.label}</span>
            <span className="text-xs text-foreground/60 ml-2">
              {Math.round(item.confidence * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
