'use client'

import { useEffect, useRef } from 'react'
import { motion, useAnimationFrame } from 'framer-motion'
import { useCanvasStore } from '@/stores/canvas'
import { TimeControls } from './TimeControls'
import { Playhead } from './Playhead'
import { TimeGrid } from './TimeGrid'
import { LoopRegion } from './LoopRegion'
import { NodeClip } from './NodeClip'

export function CinematicCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const { nodes, timeline, setPlayheadPosition } = useCanvasStore()

  // Playback animation
  useAnimationFrame((time, delta) => {
    if (!timeline.isPlaying) return

    const newPosition = timeline.playheadPosition + delta / 1000

    // Loop back if we reach the end
    if (newPosition >= timeline.loopEnd) {
      setPlayheadPosition(timeline.loopStart)
    } else {
      setPlayheadPosition(newPosition)
    }
  })

  // Sync sound cues with playhead
  useEffect(() => {
    if (!timeline.isPlaying) return

    // Find nodes at current playhead position
    const activeNodes = nodes.filter(
      (node) =>
        node.timeStart !== undefined &&
        node.duration !== undefined &&
        timeline.playheadPosition >= node.timeStart &&
        timeline.playheadPosition <= node.timeStart + node.duration
    )

    // Trigger sound cues for active nodes (Web Audio API)
    if (activeNodes.length > 0) {
      playNodeCue(activeNodes[0].type)
    }
  }, [timeline.playheadPosition, timeline.isPlaying, nodes])

  return (
    <div className="flex-1 flex flex-col bg-matte-black">
      {/* Time Controls */}
      <TimeControls />

      {/* Canvas with Timeline */}
      <div
        ref={canvasRef}
        className="flex-1 relative overflow-auto"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(58, 169, 190, 0.03) 0%, transparent 50%)',
        }}
      >
        {/* Time Grid */}
        <TimeGrid />

        {/* Loop Region */}
        <LoopRegion />

        {/* Node Clips */}
        <div className="relative" style={{ minHeight: '400px' }}>
          {nodes
            .filter((node) => node.timeStart !== undefined)
            .map((node) => (
              <NodeClip key={node.id} node={node} />
            ))}
        </div>

        {/* Playhead */}
        <Playhead />
      </div>
    </div>
  )
}

// Simple Web Audio API sound cues
function playNodeCue(type: 'create' | 'promote' | 'analyse' | 'refine') {
  if (typeof window === 'undefined') return

  const audioContext = new AudioContext()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  // Different frequencies for different node types
  const frequencies = {
    create: 440, // A4
    promote: 554, // C#5
    analyse: 659, // E5
    refine: 880, // A5
  }

  oscillator.type = 'sine'
  oscillator.frequency.value = frequencies[type]

  gainNode.gain.value = 0.1
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

  oscillator.start()
  oscillator.stop(audioContext.currentTime + 0.3)
}
