'use client'

import React from 'react'
import { DAWButton } from './DAWButton'
import { DAWToggle } from './DAWToggle'

export function DawToolbar() {
  return (
    <div className="flex h-12 items-center justify-between border-b border-slate-800/90 bg-[#0A0C10]/95 px-4 text-xs text-slate-200 backdrop-blur">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500">
          Daw Surface
        </span>
        <span className="rounded-full border border-slate-700/70 bg-slate-900/80 px-2 py-0.5 text-[10px] text-slate-300">
          Session View
        </span>
      </div>

      <div className="flex items-center gap-2">
        <DAWButton label="Add Track" variant="ghost" />
        <DAWButton label="Add Clip" variant="ghost" />
        <DAWButton label="Settings" variant="ghost" />
        <div className="ml-3 flex items-center gap-3 border-l border-slate-800/80 pl-3">
          <DAWToggle label="Snap" initialOn />
          <DAWToggle label="Loop" />
        </div>
      </div>
    </div>
  )
}


