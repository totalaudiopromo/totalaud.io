'use client'

/**
 * LoopOS Page - Liberty Campaign Timeline
 * Supports director camera panning and playback control
 */

import { useEffect, useState, useRef } from 'react'
import { useDirector } from '@/components/demo/director/DirectorProvider'
import { Play, Pause } from 'lucide-react'

export function LoopOSPage() {
  const director = useDirector()
  const [isPlaying, setIsPlaying] = useState(false)
  const [playheadPosition, setPlayheadPosition] = useState(0)
  const [cameraTarget, setCameraTarget] = useState<'timeline' | 'inspector' | 'minimap'>(
    'timeline'
  )
  const playIntervalRef = useRef<number | null>(null)

  // Register director callbacks
  useEffect(() => {
    director.engine.setCallbacks({
      onPanCamera: async (target: string, durationMs: number) => {
        setCameraTarget(target as any)
        return new Promise((resolve) => setTimeout(resolve, durationMs))
      },

      onPlayLoopOS: async (durationMs: number) => {
        setIsPlaying(true)

        // Simulate playback
        const interval = window.setInterval(() => {
          setPlayheadPosition((prev) => Math.min(prev + 0.5, 100))
        }, 50)

        playIntervalRef.current = interval

        return new Promise((resolve) => {
          setTimeout(() => {
            if (playIntervalRef.current) {
              clearInterval(playIntervalRef.current)
              playIntervalRef.current = null
            }
            resolve()
          }, durationMs)
        })
      },

      onStopLoopOS: () => {
        setIsPlaying(false)
        if (playIntervalRef.current) {
          clearInterval(playIntervalRef.current)
          playIntervalRef.current = null
        }
      },
    })

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
      }
    }
  }, [director])

  // Calculate camera transform
  const getCameraTransform = () => {
    switch (cameraTarget) {
      case 'timeline':
        return 'translate3d(0, 0, 0) scale(1)'
      case 'inspector':
        return 'translate3d(-30%, 0, 0) scale(1.1)'
      case 'minimap':
        return 'translate3d(-10%, -20%, 0) scale(1.2)'
      default:
        return 'translate3d(0, 0, 0) scale(1)'
    }
  }

  return (
    <div className="w-full h-full bg-[#0F1113] text-foreground overflow-hidden">
      {/* Camera container */}
      <div
        className="w-full h-full transition-transform duration-1000 ease-out"
        style={{ transform: getCameraTransform() }}
      >
        <div className="w-full h-full p-6">
          {/* Header */}
          <div className="flex items-centre justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Liberty Campaign Timeline</h1>
              <p className="text-sm text-foreground/60">UK Indie Launch — Radio & Press</p>
            </div>

            {/* Playback controls */}
            <div className="flex items-centre gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={director.isPlaying}
                className="p-2 bg-accent text-background rounded hover:bg-accent/90 transition-colours disabled:opacity-50"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <span className="text-sm text-foreground/60 font-mono">
                {playheadPosition.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Timeline lanes */}
          <div className="space-y-4 mb-6">
            {/* BBC Introducing lane */}
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
              <div className="flex items-centre gap-2 mb-3">
                <div className="w-3 h-3 bg-accent rounded-full" />
                <span className="text-sm font-bold">BBC Introducing</span>
              </div>
              <div className="relative h-12 bg-background/50 rounded overflow-hidden">
                {/* Timeline blocks */}
                <div className="absolute left-[10%] top-2 bottom-2 w-[15%] bg-accent/60 rounded" />
                <div className="absolute left-[30%] top-2 bottom-2 w-[20%] bg-accent/80 rounded" />
                <div className="absolute left-[55%] top-2 bottom-2 w-[15%] bg-accent/60 rounded" />

                {/* Playhead */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-accent shadow-[0_0_10px_currentColor] transition-all"
                  style={{ left: `${playheadPosition}%` }}
                />
              </div>
            </div>

            {/* Student Radio lane */}
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
              <div className="flex items-centre gap-2 mb-3">
                <div className="w-3 h-3 bg-accent/60 rounded-full" />
                <span className="text-sm font-bold">Student Radio</span>
              </div>
              <div className="relative h-12 bg-background/50 rounded overflow-hidden">
                <div className="absolute left-[20%] top-2 bottom-2 w-[25%] bg-accent/50 rounded" />
                <div className="absolute left-[50%] top-2 bottom-2 w-[30%] bg-accent/70 rounded" />

                {/* Playhead */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-accent shadow-[0_0_10px_currentColor] transition-all"
                  style={{ left: `${playheadPosition}%` }}
                />
              </div>
            </div>

            {/* Spotify Editorial lane */}
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
              <div className="flex items-centre gap-2 mb-3">
                <div className="w-3 h-3 bg-accent/40 rounded-full" />
                <span className="text-sm font-bold">Spotify Editorial Pitch</span>
              </div>
              <div className="relative h-12 bg-background/50 rounded overflow-hidden">
                <div className="absolute left-[40%] top-2 bottom-2 w-[35%] bg-accent/30 rounded" />
                <div className="absolute left-[80%] top-2 bottom-2 w-[15%] bg-accent/40 rounded" />

                {/* Playhead */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-accent shadow-[0_0_10px_currentColor] transition-all"
                  style={{ left: `${playheadPosition}%` }}
                />
              </div>
            </div>
          </div>

          {/* Inspector panel */}
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
            <h3 className="text-sm font-bold mb-3">Campaign Inspector</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-foreground/60">Radio Targets:</span>
                <span className="ml-2 font-mono">24</span>
              </div>
              <div>
                <span className="text-foreground/60">Duration:</span>
                <span className="ml-2 font-mono">4 weeks</span>
              </div>
              <div>
                <span className="text-foreground/60">Press Outlets:</span>
                <span className="ml-2 font-mono">12</span>
              </div>
              <div>
                <span className="text-foreground/60">Status:</span>
                <span className="ml-2 text-accent font-mono">Planning</span>
              </div>
            </div>
          </div>

          {/* Minimap */}
          <div className="absolute top-6 right-6 w-48 h-32 bg-background/80 border border-accent/20 rounded-lg p-2">
            <div className="text-[10px] text-foreground/60 mb-1">Campaign Overview</div>
            <div className="relative h-full bg-accent/5 rounded">
              {/* Mini timeline bars */}
              <div className="absolute left-[10%] top-[20%] w-[30%] h-1 bg-accent/40 rounded" />
              <div className="absolute left-[25%] top-[40%] w-[40%] h-1 bg-accent/40 rounded" />
              <div className="absolute left-[45%] top-[60%] w-[35%] h-1 bg-accent/40 rounded" />

              {/* Mini playhead */}
              <div
                className="absolute top-0 bottom-0 w-px bg-accent transition-all"
                style={{ left: `${playheadPosition}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
