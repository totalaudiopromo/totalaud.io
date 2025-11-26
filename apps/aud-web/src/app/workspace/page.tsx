'use client'

import { useMode } from '@/components/workspace'
import { ScoutWizard } from '@/components/scout/ScoutWizard'

export default function WorkspacePage() {
  const { mode } = useMode()

  // For MVP, we're focusing on the pitch/Scout mode
  // Ideas and Timeline are placeholder for now

  if (mode === 'ideas') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6">
        <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/50 px-8 py-6 text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Ideas Mode</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-200">Coming soon</h2>
          <p className="mt-2 max-w-md text-sm text-slate-400">
            Cards, notes, and loose ideas for early sketching. Switch to{' '}
            <span className="text-slate-200">Pitch</span> mode to discover opportunities with Scout.
          </p>
        </div>
      </div>
    )
  }

  if (mode === 'timeline') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6">
        <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/50 px-8 py-6 text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Timeline Mode</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-200">Coming soon</h2>
          <p className="mt-2 max-w-md text-sm text-slate-400">
            Loops, sequences, and campaign momentum. Switch to{' '}
            <span className="text-slate-200">Pitch</span> mode to discover opportunities with Scout.
          </p>
        </div>
      </div>
    )
  }

  // Pitch mode - The Scout wizard
  return <ScoutWizard />
}
