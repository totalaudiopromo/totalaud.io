'use client'

import { Play, Pause, SkipBack, ZoomIn, ZoomOut } from 'lucide-react'
import { useCanvasStore } from '@/stores/canvas'

export function TimeControls() {
  const { timeline, togglePlayback, setPlayheadPosition, setZoom } = useCanvasStore()

  const handleZoomIn = () => {
    setZoom(Math.max(0.01, timeline.zoom * 0.8)) // More pixels per second
  }

  const handleZoomOut = () => {
    setZoom(Math.min(1, timeline.zoom * 1.2)) // Fewer pixels per second
  }

  const handleReset = () => {
    setPlayheadPosition(timeline.loopStart)
  }

  return (
    <div className="h-16 border-b border-[var(--border)] flex items-center justify-between px-6 bg-matte-black">
      {/* Playback Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleReset}
          className="p-2 hover:bg-slate-cyan/10 rounded transition-fast"
          aria-label="Reset to loop start"
        >
          <SkipBack className="w-5 h-5" />
        </button>

        <button
          onClick={togglePlayback}
          className="p-3 bg-slate-cyan/20 hover:bg-slate-cyan/30 rounded transition-fast"
          aria-label={timeline.isPlaying ? 'Pause' : 'Play'}
        >
          {timeline.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>

        <div className="ml-4 font-mono text-sm text-slate-400">
          Loop: {formatTime(timeline.loopStart)} - {formatTime(timeline.loopEnd)}
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-slate-cyan/10 rounded transition-fast"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>

        <div className="px-3 py-1 bg-[var(--border)] rounded text-sm font-mono">
          {Math.round((1 / timeline.zoom) * 10)}px/s
        </div>

        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-slate-cyan/10 rounded transition-fast"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
