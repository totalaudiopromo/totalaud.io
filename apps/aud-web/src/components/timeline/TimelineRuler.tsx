'use client'

/**
 * Timeline Ruler
 * Shows time markers and grid
 */

import { useTimeline } from '@totalaud/os-state/campaign'

export function TimelineRuler() {
  const { timeline } = useTimeline()

  const tickInterval = timeline.gridSize // seconds between ticks
  const tickCount = Math.ceil(timeline.duration / tickInterval)

  return (
    <div className="relative flex h-8 border-b border-[var(--flowcore-colour-border)] bg-[var(--flowcore-overlay-strong)]">
      {/* Track header spacer */}
      <div className="w-48 flex-shrink-0 border-r border-[var(--flowcore-colour-border)]" />

      {/* Ruler marks */}
      <div
        className="relative flex-1 overflow-hidden"
        style={{
          width: `${timeline.duration * timeline.zoom}px`,
          minWidth: '100%',
        }}
      >
        {Array.from({ length: tickCount + 1 }).map((_, i) => {
          const time = i * tickInterval
          const position = time * timeline.zoom

          return (
            <div
              key={i}
              className="absolute top-0 h-full"
              style={{ left: `${position}px` }}
            >
              {/* Tick mark */}
              <div className="h-full w-px bg-[var(--flowcore-colour-border)]" />

              {/* Time label */}
              <div className="absolute -translate-x-1/2 pt-1 font-mono text-[10px] text-[var(--flowcore-colour-fg)]/60">
                {formatRulerTime(time)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function formatRulerTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
