'use client'

import React, { useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { positionToUnit, unitToPosition } from './engines/timelineMath'

interface LoopOSPlayheadProps {
  isPlaying: boolean
  playhead: number
  unitWidth: number
  zoom: number
  height: number
  onSeek: (position: number) => void
  onEngineTick: (now: number) => void
}

export function LoopOSPlayhead({
  isPlaying,
  playhead,
  unitWidth,
  zoom,
  height,
  onSeek,
  onEngineTick,
}: LoopOSPlayheadProps) {
  const prefersReducedMotion = useReducedMotion()
  const x = unitToPosition(playhead, zoom)

  useEffect(() => {
    if (prefersReducedMotion || !isPlaying) return

    let frameId: number

    const step = (time: number) => {
      onEngineTick(time)
      frameId = window.requestAnimationFrame(step)
    }

    frameId = window.requestAnimationFrame(step)

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [isPlaying, onEngineTick, prefersReducedMotion])

  const handleSeek = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const relativeX = event.clientX - rect.left
    const nextPosition = positionToUnit(relativeX, zoom)
    onSeek(nextPosition)
  }

  return (
    <div
      className="pointer-events-none absolute inset-y-0 left-0"
      style={{
        height,
      }}
      onPointerDown={handleSeek}
    >
      <motion.div
        className="pointer-events-auto flex h-full w-px flex-col items-center justify-start"
        style={{ x }}
        whileTap={prefersReducedMotion ? undefined : { scaleY: 1.04 }}
        transition={{ type: 'tween', duration: 0.16 }}
      >
        <div className="relative flex h-full flex-col items-center">
          <div className="h-4 w-[7px] rounded-b-[999px] bg-[#3AA9BE] shadow-[0_0_18px_rgba(58,169,190,0.9)]" />
          <div className="mt-0.5 h-full w-px bg-gradient-to-b from-[#3AA9BE] via-[#38bdf8]/50 to-transparent" />
        </div>
      </motion.div>
    </div>
  )
}


