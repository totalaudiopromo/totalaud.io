'use client'

import React, { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { StudioContainer } from '@/components/os/studio/StudioContainer'
import { LoopCard } from '@/components/os/studio/LoopCard'
import { StudioSidebar } from '@/components/os/studio/StudioSidebar'
import { useLoopOSLocalStore } from '@/components/os/loopos'
import { useOptionalDemo } from '@/components/demo/DemoOrchestrator'

export default function StudioOSPage() {
  const router = useRouter()
  const demo = useOptionalDemo()

  const {
    availableLoops,
    activeLoopId,
    clips,
    momentum,
    setActiveLoopId,
  } = useLoopOSLocalStore()

  const isDemoMode =
    demo?.isDemoMode || (typeof window !== 'undefined' && (window as any).__TA_DEMO__ === true)

  const loopsWithStats = useMemo(() => {
    return availableLoops.map((loop) => {
      const isActive = loop.id === activeLoopId
      const createdAtLabel = loop.createdAt
        ? new Date(loop.createdAt).toLocaleDateString(undefined, {
            day: '2-digit',
            month: 'short',
          })
        : undefined

      let clipCount: number | null = null
      let laneSummary: string | null = null
      let momentumScore: number | null = null

      if (isActive) {
        clipCount = clips.length
        momentumScore = momentum?.score ?? null

        if (clips.length) {
          const laneCounts = clips.reduce<Record<string, number>>((acc, clip) => {
            const current = acc[clip.lane] ?? 0
            acc[clip.lane] = current + 1
            return acc
          }, {})

          const ordered = Object.entries(laneCounts).sort((a, b) => b[1] - a[1])
          const topTwo = ordered.slice(0, 2)
          laneSummary = topTwo
            .map(([lane, count]) => `${count} ${lane}`)
            .join(' • ')
        }
      }

      return {
        id: loop.id,
        name: loop.name,
        createdAtLabel,
        clipCount,
        laneSummary,
        momentumScore,
        isActive,
      }
    })
  }, [activeLoopId, availableLoops, clips, momentum?.score])

  return (
    <StudioContainer>
      <header className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-emerald-400">
            Loop Studio
          </p>
          <h1 className="text-lg font-semibold tracking-tight text-slate-50 md:text-xl">
            Your creative loop constellation
          </h1>
          <p className="mt-1 max-w-xl text-[11px] text-slate-300">
            Browse every loop in the system, see where momentum actually lives, and drop straight
            into LoopOS when it&apos;s time to build.
          </p>
        </div>
      </header>

      <main className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr),minmax(0,0.9fr)]">
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Loops
            </p>
            <p className="text-[10px] text-slate-500">
              {availableLoops.length ? `${availableLoops.length} total` : 'No loops yet'}
            </p>
          </div>

          {isDemoMode && (
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/80 p-3 text-[11px] text-slate-300">
              Loop Studio is view-only in demo. Use the main LoopOS surface in the tour to see how
              loops behave for Lana.
            </div>
          )}

          {loopsWithStats.length ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {loopsWithStats.map((loop) => (
                <LoopCard
                  key={loop.id}
                  name={loop.name}
                  createdAtLabel={loop.createdAtLabel}
                  momentumScore={loop.momentumScore}
                  clipCount={loop.clipCount}
                  laneSummary={loop.laneSummary}
                  onOpenLoop={() => {
                    setActiveLoopId(loop.id)
                    router.push('/os/loopos')
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-800/80 bg-slate-950/70 p-4 text-[11px] text-slate-300">
              <p className="font-medium text-slate-100">No loops yet.</p>
              <p className="mt-1 text-slate-400">
                Open LoopOS to spin up your first campaign loop. This studio view will light up as
                soon as clips exist.
              </p>
            </div>
          )}
        </section>

        <StudioSidebar />
      </main>
    </StudioContainer>
  )
}


