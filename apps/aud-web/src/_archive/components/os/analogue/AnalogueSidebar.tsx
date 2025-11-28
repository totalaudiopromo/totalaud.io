'use client'

import React from 'react'

/**
 * AnalogueSidebar
 * Narrow vertical rail with labels to ground the OS surface
 */
export function AnalogueSidebar() {
  const labels = [
    { id: 'loops', label: 'loops', colour: '#22c55e' },
    { id: 'journal', label: 'journal', colour: '#3b82f6' },
    { id: 'tasks', label: 'tasks', colour: '#facc15' },
  ]

  return (
    <aside className="hidden h-full min-h-[420px] w-[80px] flex-col items-center justify-between rounded-[26px] border border-[#3a2518] bg-black/20 px-3 py-6 text-xs text-[#f5eadd]/80 shadow-[0_26px_60px_rgba(0,0,0,0.7)] backdrop-blur-sm sm:flex">
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-10 rounded-full border border-[#f5eadd]/40 bg-[#111111]/60 shadow-[0_0_0_1px_rgba(0,0,0,0.85)]" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#f5eadd]/70">audio</span>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#f5eadd]/30 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-5">
        {labels.map((item) => (
          <div key={item.id} className="flex flex-col items-center gap-1">
            <div
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: item.colour,
                boxShadow: `0 0 0 1px rgba(0,0,0,0.75), 0 0 12px ${item.colour}55`,
              }}
            />
            <span className="rotate-180 text-[9px] uppercase tracking-[0.26em] [writing-mode:vertical-rl]">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-2 text-[9px] uppercase tracking-[0.18em] text-[#f5eadd]/50">
        <div className="flex flex-col items-center gap-1">
          <span className="h-1 w-1 rounded-full bg-[#22c55e]" />
          <span>online</span>
        </div>
      </div>
    </aside>
  )
}
