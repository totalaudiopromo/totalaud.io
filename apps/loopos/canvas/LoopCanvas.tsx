'use client'

import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Plus, Minus } from 'lucide-react'
import { useLoopStore } from '@/state/loopStore'
import { LoopNode } from '@/nodes/LoopNode'
import { playSound } from '@/sounds/audioEngine'

export function LoopCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const {
    nodes,
    updateNode,
    completeNode,
    playback,
    togglePlayback,
    setCurrentTime,
    zoom,
    setZoom,
  } = useLoopStore()

  // Playback loop
  useEffect(() => {
    if (!playback.isPlaying) return

    const beatsPerSecond = playback.bpm / 60
    const intervalMs = (1000 / beatsPerSecond) / 4 // Update 4 times per beat for smooth animation

    const interval = setInterval(() => {
      setCurrentTime((playback.currentTime + 0.25) % playback.loopDuration)

      // Trigger sound on beat
      if (playback.currentTime % 1 < 0.25) {
        playSound('tick', 0.1)
      }
    }, intervalMs)

    return () => clearInterval(interval)
  }, [playback.isPlaying, playback.bpm, playback.currentTime, playback.loopDuration, setCurrentTime])

  const handleNodeDrag = (id: string, x: number, y: number) => {
    updateNode(id, { position: { x, y } })
  }

  const handleNodeComplete = (id: string) => {
    completeNode(id)
    playSound('complete', 0.3)
  }

  return (
    <div className="relative w-full h-[600px] bg-loop-black/40">
      {/* Canvas Controls */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        {/* Play/Pause */}
        <button
          onClick={togglePlayback}
          className="bg-loop-grey-900 border border-loop-grey-800 rounded-md p-2 hover:bg-loop-grey-800 transition-all duration-120"
        >
          {playback.isPlaying ? (
            <Pause className="w-4 h-4 text-loop-cyan" />
          ) : (
            <Play className="w-4 h-4 text-loop-cyan" />
          )}
        </button>

        {/* Zoom controls */}
        <div className="bg-loop-grey-900 border border-loop-grey-800 rounded-md flex items-center">
          <button
            onClick={() => setZoom(zoom - 0.1)}
            className="p-2 hover:bg-loop-grey-800 transition-all duration-120 border-r border-loop-grey-800"
            disabled={zoom <= 0.5}
          >
            <Minus className="w-4 h-4 text-loop-grey-400" />
          </button>
          <span className="px-3 text-sm font-mono text-loop-grey-400">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(zoom + 0.1)}
            className="p-2 hover:bg-loop-grey-800 transition-all duration-120 border-l border-loop-grey-800"
            disabled={zoom >= 2}
          >
            <Plus className="w-4 h-4 text-loop-grey-400" />
          </button>
        </div>

        {/* BPM display */}
        <div className="bg-loop-grey-900 border border-loop-grey-800 rounded-md px-3 py-2">
          <span className="text-xs text-loop-grey-400 font-mono">
            {playback.bpm} BPM
          </span>
        </div>
      </div>

      {/* Playback progress */}
      {playback.isPlaying && (
        <div className="absolute top-4 right-4 z-10 bg-loop-grey-900 border border-loop-grey-800 rounded-md px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-loop-cyan animate-pulse" />
            <span className="text-xs text-loop-grey-400 font-mono">
              {Math.floor(playback.currentTime)}/{playback.loopDuration}
            </span>
          </div>
        </div>
      )}

      {/* Canvas with grid */}
      <div
        ref={canvasRef}
        className="w-full h-full overflow-hidden relative"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(58, 169, 190, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(58, 169, 190, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: `${40 * zoom}px ${40 * zoom}px`,
        }}
      >
        {/* Nodes layer */}
        <motion.div
          className="w-full h-full relative"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
          }}
        >
          {nodes.map((node) => (
            <LoopNode
              key={node.id}
              node={node}
              onDrag={(x, y) => handleNodeDrag(node.id, x, y)}
              onComplete={() => handleNodeComplete(node.id)}
            />
          ))}
        </motion.div>
      </div>

      {/* Instructions overlay (when no nodes are active) */}
      {nodes.filter((n) => n.status !== 'completed').length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-loop-grey-900 border border-loop-grey-800 flex items-center justify-center">
              <Music className="w-8 h-8 text-loop-cyan" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-loop-grey-300">
              All caught up!
            </h3>
            <p className="text-sm text-loop-grey-500">
              Add new actions to keep the loop going
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function Music(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  )
}
