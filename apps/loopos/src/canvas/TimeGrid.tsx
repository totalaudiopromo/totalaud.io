'use client'

import { useCanvasStore } from '@/stores/canvas'

export function TimeGrid() {
  const { timeline } = useCanvasStore()
  const pixelsPerSecond = 1 / timeline.zoom

  // Generate time markers every 5 seconds
  const markers = []
  for (let i = 0; i <= timeline.duration; i += 5) {
    markers.push(i)
  }

  return (
    <div className="absolute top-0 left-0 right-0 h-12 border-b border-[var(--border)] bg-matte-black/80 backdrop-blur-sm z-40">
      <div className="relative h-full">
        {markers.map((time) => {
          const left = time * pixelsPerSecond

          return (
            <div
              key={time}
              className="absolute top-0 bottom-0 flex flex-col justify-center"
              style={{ left }}
            >
              {/* Time marker line */}
              <div className="w-[1px] h-2 bg-[var(--border)]" />

              {/* Time label */}
              <div className="absolute top-4 left-1 text-xs text-slate-400 font-mono">
                {formatTimeLabel(time)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function formatTimeLabel(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
