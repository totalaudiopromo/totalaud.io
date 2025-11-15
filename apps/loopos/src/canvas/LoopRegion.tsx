'use client'

import { useCanvasStore } from '@/stores/canvas'

export function LoopRegion() {
  const { timeline } = useCanvasStore()
  const pixelsPerSecond = 1 / timeline.zoom

  const leftPosition = timeline.loopStart * pixelsPerSecond
  const width = (timeline.loopEnd - timeline.loopStart) * pixelsPerSecond

  return (
    <div
      className="absolute top-12 bottom-0 bg-slate-cyan/5 border-l-2 border-r-2 border-slate-cyan/30 pointer-events-none z-10"
      style={{
        left: leftPosition,
        width,
      }}
    >
      {/* Loop start marker */}
      <div className="absolute top-0 left-0 w-4 h-4 -ml-2 bg-slate-cyan/50 rounded-full" />

      {/* Loop end marker */}
      <div className="absolute top-0 right-0 w-4 h-4 -mr-2 bg-slate-cyan/50 rounded-full" />
    </div>
  )
}
