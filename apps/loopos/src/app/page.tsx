'use client'

import { CinematicCanvas } from '@/canvas/CinematicCanvas'
import { NodeInspector } from '@/inspector/NodeInspector'
import { CreativeModeToggle } from '@/modes/CreativeModeToggle'
import { useMomentumStore } from '@/stores/momentum'

export default function LoopOSPage() {
  const creativeModeEnabled = useMomentumStore((state) => state.creativeModeEnabled)

  return (
    <div className={`flex h-screen w-screen ${creativeModeEnabled ? 'creative-mode' : ''}`}>
      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-[var(--border)] flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold glow-text">LoopOS</h1>
            <div className="text-sm text-slate-400">Cinematic Creative OS</div>
          </div>
          <CreativeModeToggle />
        </header>

        <CinematicCanvas />
      </div>

      {/* Node Inspector Sidebar */}
      <NodeInspector />
    </div>
  )
}
