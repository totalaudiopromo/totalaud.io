/**
 * Showreel Controls
 * Phase 17: Playback controls for showreel
 */

'use client'

import { Play, Pause, RotateCcw, X } from 'lucide-react'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'

interface ShowreelControlsProps {
  isPlaying: boolean
  totalDuration: number
  currentTime: number
  onPlay: () => void
  onPause: () => void
  onRestart: () => void
  onExit: () => void
}

export function ShowreelControls({
  isPlaying,
  totalDuration,
  currentTime,
  onPlay,
  onPause,
  onRestart,
  onExit,
}: ShowreelControlsProps) {
  const progress = Math.min((currentTime / totalDuration) * 100, 100)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px 24px',
        backgroundColor: `${flowCoreColours.matteBlack}e6`,
        border: `1px solid ${flowCoreColours.borderSubtle}`,
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
        pointerEvents: 'auto',
      }}
    >
      {/* Play/Pause button */}
      <button
        onClick={isPlaying ? onPause : onPlay}
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: `${flowCoreColours.slateCyan}20`,
          border: `1px solid ${flowCoreColours.slateCyan}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 120ms ease',
        }}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <Pause size={20} strokeWidth={2} style={{ color: flowCoreColours.slateCyan }} />
        ) : (
          <Play size={20} strokeWidth={2} style={{ color: flowCoreColours.slateCyan }} />
        )}
      </button>

      {/* Progress bar */}
      <div
        style={{
          width: '300px',
          height: '6px',
          backgroundColor: `${flowCoreColours.borderSubtle}`,
          borderRadius: '3px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${progress}%`,
            backgroundColor: flowCoreColours.slateCyan,
            transition: 'width 200ms linear',
            borderRadius: '3px',
          }}
        />
      </div>

      {/* Time display */}
      <div
        style={{
          fontSize: '14px',
          fontWeight: 600,
          color: flowCoreColours.textSecondary,
          fontFamily: 'monospace',
          minWidth: '80px',
        }}
      >
        {formatTime(currentTime)} / {formatTime(totalDuration)}
      </div>

      {/* Restart button */}
      <button
        onClick={onRestart}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: `${flowCoreColours.matteBlack}cc`,
          border: `1px solid ${flowCoreColours.borderSubtle}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 120ms ease',
        }}
        aria-label="Restart"
      >
        <RotateCcw size={18} strokeWidth={2} style={{ color: flowCoreColours.textSecondary }} />
      </button>

      {/* Exit button */}
      <button
        onClick={onExit}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: `${flowCoreColours.matteBlack}cc`,
          border: `1px solid ${flowCoreColours.borderSubtle}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 120ms ease',
        }}
        aria-label="Exit showreel"
      >
        <X size={18} strokeWidth={2} style={{ color: flowCoreColours.textSecondary }} />
      </button>
    </div>
  )
}
