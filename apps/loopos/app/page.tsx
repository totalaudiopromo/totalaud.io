'use client'

import { LoopCanvas } from '@/canvas/LoopCanvas'
import { MomentumMeter } from '@/momentum/MomentumMeter'
import { DailyActions } from '@/components/DailyActions'
import { NotesList } from '@/notes/NotesList'

export default function LoopOSHome() {
  return (
    <main className="min-h-screen bg-loop-black text-loop-grey-100">
      {/* Header */}
      <header className="border-b border-loop-grey-800 bg-loop-black/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-loop-cyan rounded-full flex items-center justify-center">
              <span className="text-loop-black font-bold text-sm">L</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              Loop<span className="text-loop-cyan">OS</span>
            </h1>
          </div>

          {/* Momentum Meter in Header */}
          <MomentumMeter />
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Canvas */}
          <div className="lg:col-span-8">
            <div className="bg-loop-grey-900/30 border border-loop-grey-800 rounded-lg overflow-hidden">
              <div className="border-b border-loop-grey-800 px-4 py-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-loop-grey-400">
                  Loop Canvas
                </h2>
              </div>
              <LoopCanvas />
            </div>
          </div>

          {/* Right Column - Actions & Notes */}
          <div className="lg:col-span-4 space-y-6">
            {/* Daily Actions */}
            <div className="bg-loop-grey-900/30 border border-loop-grey-800 rounded-lg overflow-hidden">
              <div className="border-b border-loop-grey-800 px-4 py-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-loop-grey-400">
                  Today&apos;s Actions
                </h2>
              </div>
              <DailyActions />
            </div>

            {/* Notes */}
            <div className="bg-loop-grey-900/30 border border-loop-grey-800 rounded-lg overflow-hidden">
              <div className="border-b border-loop-grey-800 px-4 py-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-loop-grey-400">
                  Notes
                </h2>
              </div>
              <NotesList />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
