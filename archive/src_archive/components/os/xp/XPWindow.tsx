'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useThemeAudio } from '@/hooks/useThemeAudio'
import { useXPWindowStore } from './state/xpWindowStore'
import { useOptionalMood } from '@/components/mood/useMood'
import { useProjectEngine } from '@/components/projects/useProjectEngine'

interface XPWindowProps {
  id: string
  title: string
  children: React.ReactNode
  className?: string
  initialPosition: { x: number; y: number }
  isFocused: boolean
  minimized: boolean
  zIndex: number
}

/**
 * XP-style draggable window with glossy header
 */
export function XPWindow({
  id,
  title,
  children,
  className = '',
  initialPosition,
  isFocused,
  minimized,
  zIndex,
}: XPWindowProps) {
  const { play } = useThemeAudio()
  const prefersReducedMotion = useReducedMotion()
  const { closeWindow, minimiseWindow, focusWindow, updateWindowPosition } = useXPWindowStore()
  const mood = useOptionalMood()
  const { currentProject } = useProjectEngine()

  const handleBounceSound = () => {
    // Map XP-specific "bounce" cue to existing click sound
    play('click')
  }

  const handleClose = (event: React.MouseEvent) => {
    event.stopPropagation()
    play('click')
    closeWindow(id)
  }

  const handleMinimise = (event: React.MouseEvent) => {
    event.stopPropagation()
    play('click')
    minimiseWindow(id)
  }

  const handleFocus = () => {
    focusWindow(id)
  }

  if (minimized) {
    return null
  }

  return (
    <motion.div
      className={`absolute rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.15)] ${className}`}
      drag
      dragMomentum={false}
      dragElastic={prefersReducedMotion ? 0 : 0.3}
      onDragEnd={(_, info) => {
        handleBounceSound()
        updateWindowPosition(id, { x: info.point.x, y: info.point.y })
      }}
      onMouseDown={handleFocus}
      initial={initialPosition}
      animate={prefersReducedMotion ? {} : { scale: isFocused ? 1 : 0.98 }}
      transition={
        prefersReducedMotion
          ? { type: 'tween', duration: 0 }
          : { type: 'spring', bounce: 0.3, stiffness: 220, damping: 22 }
      }
      style={{
        background: '#f5f7fb',
        zIndex,
      }}
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between rounded-t-xl bg-gradient-to-r from-[#3C6FF5] to-[#5DA0FF] px-3 py-1.5 text-xs text-white"
        style={{
          boxShadow:
            mood?.mood === 'charged'
              ? '0 0 14px rgba(56,189,248,0.45)'
              : mood?.mood === 'chaotic'
                ? '0 0 16px rgba(56,189,248,0.5)'
                : mood?.mood === 'focused'
                  ? '0 0 10px rgba(56,189,248,0.35)'
                  : '0 0 8px rgba(15,23,42,0.65)',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#4ade80] shadow-[0_0_6px_rgba(74,222,128,0.9)]" />
          <span className="font-medium tracking-wide">
            {title === 'Agent Monitor' && currentProject
              ? `Agent Monitor — ${currentProject.name}`
              : title}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px]">
          <button
            type="button"
            onClick={handleMinimise}
            className="flex h-3 w-4 items-center justify-center rounded-sm bg-gradient-to-b from-white/80 to-white/40 text-[10px] text-sky-900 shadow-[0_0_3px_rgba(0,0,0,0.25)] hover:brightness-110"
            aria-label="Minimise window"
          >
            ▃
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-3 w-4 items-center justify-center rounded-sm bg-gradient-to-b from-[#ef4444] to-[#b91c1c] text-[10px] shadow-[0_0_3px_rgba(0,0,0,0.35)] hover:brightness-110"
            aria-label="Close window"
          >
            ×
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-b-xl bg-white/95 px-4 py-4 backdrop-blur-sm">{children}</div>
    </motion.div>
  )
}
