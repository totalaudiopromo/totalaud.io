'use client'

import React, { useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useThemeAudio } from '@/hooks/useThemeAudio'
import { DAWButton } from './DAWButton'
import { DAWSlider } from './DAWSlider'

interface DawTransportProps {
  onPlayingChange?: (isPlaying: boolean) => void
}

/**
 * DawTransport
 * Bottom chrome with fake Play/Stop and a UI-only BPM slider.
 */
export function DawTransport({ onPlayingChange }: DawTransportProps) {
  const { play } = useThemeAudio()
  const prefersReducedMotion = useReducedMotion()
  const [isPlaying, setIsPlaying] = useState(false)
  const [bpm, setBpm] = useState(120)

  const handlePlayToggle = () => {
    const next = !isPlaying
    setIsPlaying(next)
    onPlayingChange?.(next)
    play(next ? 'success' : 'click')
  }

  const handleStop = () => {
    setIsPlaying(false)
    onPlayingChange?.(false)
    play('click')
  }

  const handleBpmChange = (value: number) => {
    // Map 0–1 slider to 80–160 BPM
    const next = Math.round(80 + value * 80)
    setBpm(next)
  }

  return (
    <div className="flex h-14 items-center justify-between border-t border-slate-800/90 bg-[#08090C]/95 px-4 text-xs text-slate-200 backdrop-blur">
      <div className="flex items-center gap-2">
        <DAWButton
          label={isPlaying ? 'Pause' : 'Play'}
          variant="primary"
          active={isPlaying}
          ariaLabel={isPlaying ? 'Pause playback' : 'Start playback'}
          onClick={handlePlayToggle}
        />

        <DAWButton
          label="Stop"
          variant="secondary"
          ariaLabel="Stop playback"
          onClick={handleStop}
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-baseline gap-2 text-[11px] text-slate-400">
          <span className="uppercase tracking-[0.25em] text-slate-500">Tempo</span>
          <span className="text-xs font-semibold text-slate-100 tabular-nums">{bpm}</span>
          <span className="text-[11px] text-slate-500">BPM</span>
        </div>

        <div className="flex w-40 items-center gap-2">
          <DAWSlider
            ariaLabel="Adjust tempo"
            value={(bpm - 80) / 80}
            onChange={handleBpmChange}
            glow={!prefersReducedMotion && isPlaying}
          />
        </div>
      </div>
    </div>
  )
}
