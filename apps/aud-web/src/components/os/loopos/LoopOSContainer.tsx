'use client'

import React from 'react'

interface LoopOSContainerProps {
  children: React.ReactNode
}

/**
 * LoopOSContainer
 * Matte black, Slate Cyan–accented environment for the LoopOS timeline.
 * This surface is UI-only and fully local – no backend or agents.
 */
export function LoopOSContainer({ children }: LoopOSContainerProps) {
  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden bg-black text-slate-100"
      style={{
        backgroundImage:
          'radial-gradient(circle at top, rgba(58,169,190,0.16), transparent 55%), linear-gradient(to bottom, #020617 0%, #020617 30%, #000000 100%)',
      }}
    >
      {/* Subtle cyan halo at the top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#3AA9BE]/40 via-[#3AA9BE]/15 to-transparent"
      />

      {/* Neon grid atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.22] mix-blend-screen"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(148,163,184,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.14) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Soft vignette to keep focus near the centre */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.8),_transparent_60%)] opacity-40"
      />

      <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  )
}


