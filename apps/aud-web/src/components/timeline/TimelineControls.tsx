'use client'

/**
 * Timeline Controls
 * Playback, zoom, and timeline management controls
 */

import { useTimeline } from '@totalaud/os-state/campaign'
import {
  Play,
  Pause,
  Square,
  ZoomIn,
  ZoomOut,
  Grid3x3,
  Plus,
  Maximize2,
} from 'lucide-react'

interface TimelineControlsProps {
  onAddTrack: () => void
}

export function TimelineControls({ onAddTrack }: TimelineControlsProps) {
  const {
    timeline,
    setPlaying,
    setPlayheadPosition,
    setZoom,
    toggleSnapToGrid,
    setGridSize,
  } = useTimeline()

  const handlePlayPause = () => {
    setPlaying(!timeline.isPlaying)
  }

  const handleStop = () => {
    setPlaying(false)
    setPlayheadPosition(0)
  }

  const handleZoomIn = () => {
    setZoom(timeline.zoom * 1.2)
  }

  const handleZoomOut = () => {
    setZoom(timeline.zoom / 1.2)
  }

  const handleZoomFit = () => {
    // Calculate zoom to fit timeline in view
    const containerWidth = window.innerWidth - 200 // Approximate
    const targetZoom = containerWidth / timeline.duration
    setZoom(targetZoom)
  }

  return (
    <div className="flex items-centre gap-2 border-b border-[var(--flowcore-colour-border)] bg-[var(--flowcore-overlay-strong)] px-4 py-2">
      {/* Playback controls */}
      <div className="flex items-centre gap-1">
        <button
          onClick={handlePlayPause}
          className="rounded p-2 text-[var(--flowcore-colour-fg)] transition-colours hover:bg-[var(--flowcore-colour-accent)]/10 hover:text-[var(--flowcore-colour-accent)]"
          title={timeline.isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        >
          {timeline.isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>

        <button
          onClick={handleStop}
          className="rounded p-2 text-[var(--flowcore-colour-fg)] transition-colours hover:bg-[var(--flowcore-colour-error)]/10 hover:text-[var(--flowcore-colour-error)]"
          title="Stop (Esc)"
        >
          <Square size={16} />
        </button>
      </div>

      <div className="h-6 w-px bg-[var(--flowcore-colour-border)]" />

      {/* Zoom controls */}
      <div className="flex items-centre gap-1">
        <button
          onClick={handleZoomOut}
          className="rounded p-2 text-[var(--flowcore-colour-fg)]/70 transition-colours hover:bg-[var(--flowcore-colour-accent)]/10 hover:text-[var(--flowcore-colour-fg)]"
          title="Zoom Out (Ctrl + -)"
        >
          <ZoomOut size={16} />
        </button>

        <span className="min-w-[4rem] text-centre font-mono text-xs text-[var(--flowcore-colour-fg)]/70">
          {Math.round((timeline.zoom / 50) * 100)}%
        </span>

        <button
          onClick={handleZoomIn}
          className="rounded p-2 text-[var(--flowcore-colour-fg)]/70 transition-colours hover:bg-[var(--flowcore-colour-accent)]/10 hover:text-[var(--flowcore-colour-fg)]"
          title="Zoom In (Ctrl + +)"
        >
          <ZoomIn size={16} />
        </button>

        <button
          onClick={handleZoomFit}
          className="rounded p-2 text-[var(--flowcore-colour-fg)]/70 transition-colours hover:bg-[var(--flowcore-colour-accent)]/10 hover:text-[var(--flowcore-colour-fg)]"
          title="Fit to View"
        >
          <Maximize2 size={16} />
        </button>
      </div>

      <div className="h-6 w-px bg-[var(--flowcore-colour-border)]" />

      {/* Grid controls */}
      <div className="flex items-centre gap-2">
        <button
          onClick={toggleSnapToGrid}
          className={`rounded p-2 transition-colours ${
            timeline.snapToGrid
              ? 'bg-[var(--flowcore-colour-accent)]/20 text-[var(--flowcore-colour-accent)]'
              : 'text-[var(--flowcore-colour-fg)]/70 hover:bg-[var(--flowcore-colour-accent)]/10 hover:text-[var(--flowcore-colour-fg)]'
          }`}
          title="Snap to Grid"
        >
          <Grid3x3 size={16} />
        </button>

        <select
          value={timeline.gridSize}
          onChange={(e) => setGridSize(Number(e.target.value))}
          className="rounded border border-[var(--flowcore-colour-border)] bg-[var(--flowcore-overlay-soft)] px-2 py-1 font-mono text-xs text-[var(--flowcore-colour-fg)] outline-none"
        >
          <option value={0.25}>1/4s</option>
          <option value={0.5}>1/2s</option>
          <option value={1}>1s</option>
          <option value={2}>2s</option>
          <option value={4}>4s</option>
          <option value={8}>8s</option>
        </select>
      </div>

      <div className="ml-auto flex items-centre gap-2">
        {/* Add track button */}
        <button
          onClick={onAddTrack}
          className="flex items-centre gap-2 rounded border border-[var(--flowcore-colour-accent)] px-3 py-1.5 font-mono text-xs text-[var(--flowcore-colour-accent)] transition-colours hover:bg-[var(--flowcore-colour-accent)]/10"
        >
          <Plus size={14} />
          Add Track
        </button>
      </div>
    </div>
  )
}
