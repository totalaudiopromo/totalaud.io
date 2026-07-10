'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useLabelStore, selectActiveLabel } from '@/stores/useLabelStore'
import { LabelNav } from './LabelNav'
import { CreateLabelModal } from './CreateLabelModal'
import { primaryButtonClass } from './ui/LabelModal'

/**
 * LabelShell — persistent left rail + content column.
 * If the user has no labels yet, shows a calm first-run state instead.
 */
export function LabelShell({ children }: { children: ReactNode }) {
  const labels = useLabelStore((s) => s.labels)
  const isLoadingLabels = useLabelStore((s) => s.isLoadingLabels)
  const activeLabel = useLabelStore(selectActiveLabel)
  const loadArtists = useLabelStore((s) => s.loadArtists)
  const loadReleases = useLabelStore((s) => s.loadReleases)
  const loadTasks = useLabelStore((s) => s.loadTasks)
  const [showCreate, setShowCreate] = useState(false)

  // Base entity loads whenever the active label changes
  useEffect(() => {
    if (!activeLabel) return
    void loadArtists(activeLabel.id)
    void loadReleases(activeLabel.id)
    void loadTasks(activeLabel.id)
  }, [activeLabel, loadArtists, loadReleases, loadTasks])

  if (!isLoadingLabels && labels.length === 0) {
    return (
      <div className="min-h-screen bg-ta-black flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-ta-muted mb-4">totalaud.io</p>
          <h1 className="text-2xl font-semibold text-ta-white mb-2">Set up your label</h1>
          <p className="text-sm text-ta-grey mb-6">
            One home for your roster, releases and relationships. Start by naming your label —
            everything else hangs off it.
          </p>
          <button type="button" className={primaryButtonClass} onClick={() => setShowCreate(true)}>
            Create your label
          </button>
        </div>
        <CreateLabelModal open={showCreate} onClose={() => setShowCreate(false)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ta-black">
      <LabelNav />
      <main className="md:ml-64 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">{children}</div>
      </main>
    </div>
  )
}
