'use client'

import React from 'react'
import { CoreContainer } from '@/components/os/core/CoreContainer'
import { CoreMap } from '@/components/os/core/CoreMap'
import { CorePanels } from '@/components/os/core/CorePanels'
import { CoreMiniFeed } from '@/components/os/core/CoreMiniFeed'
import { CoreStats } from '@/components/os/core/CoreStats'

export default function CoreOSPage() {
  return (
    <CoreContainer>
      <header className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-emerald-400">
            Core OS
          </p>
          <h1 className="text-lg font-semibold tracking-tight text-slate-50 md:text-xl">
            Mission control for the constellation
          </h1>
          <p className="mt-1 max-w-xl text-[11px] text-slate-300">
            Live view of agents, bridges, mood, and personas across ASCII, XP, Aqua, DAW, Analogue,
            and LoopOS. Everything stays client-side and ephemeral.
          </p>
        </div>
      </header>

      <main className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr),minmax(0,0.9fr)]">
        <div className="space-y-4">
          <CoreMap />
          <CorePanels />
        </div>

        <div className="space-y-4">
          <CoreStats />
          <CoreMiniFeed />
        </div>
      </main>
    </CoreContainer>
  )
}
