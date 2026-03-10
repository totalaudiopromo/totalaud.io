'use client'

import React, { useEffect } from 'react'
import { motion, useDragControls, useReducedMotion, type PanInfo } from 'framer-motion'
import { useThemeAudio } from '@/hooks/useThemeAudio'

interface AquaAppWindowProps {
  title: string
  children: React.ReactNode
  className?: string
  isOpen?: boolean
  onClose?: () => void
  onDragEnd?: (info: PanInfo) => void
}

/**
 * AquaAppWindow
 * Floating cinematic glass app / palette window
 */
export function AquaAppWindow({
  title,
  children,
  className = '',
  isOpen = true,
  onClose,
  onDragEnd,
}: AquaAppWindowProps) {
  const { play } = useThemeAudio()
  const prefersReducedMotion = useReducedMotion()
  const dragControls = useDragControls()

  useEffect(() => {
    if (isOpen) {
      // Map "open" cue to success sound in current theme audio engine
      play('success')
    }
  }, [isOpen, play])

  if (!isOpen) return null

  return (
    <motion.div
      className={`relative w-full max-w-xl rounded-3xl border border-white/35 bg-white/10 ${className}`}
      style={{
        background: 'rgba(15,23,42,0.35)',
        borderColor: 'rgba(255,255,255,0.32)',
        boxShadow:
          '0 22px 80px rgba(15,23,42,0.75), 0 0 0 1px rgba(148,163,184,0.55), 0 0 60px rgba(56,189,248,0.2)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
      initial={
        prefersReducedMotion
          ? { opacity: 1, scale: 1, y: 0, rotateX: 0 }
          : { opacity: 0, scale: 0.96, y: 24, rotateX: 4 }
      }
      animate={
        prefersReducedMotion
          ? { opacity: 1, scale: 1, y: 0, rotateX: 0 }
          : { opacity: 1, scale: 1, y: 0, rotateX: 2 }
      }
      transition={
        prefersReducedMotion
          ? { type: 'tween', duration: 0.18 }
          : {
              type: 'spring',
              stiffness: 160,
              damping: 22,
              mass: 0.9,
              duration: 0.24,
            }
      }
      drag={prefersReducedMotion ? false : true}
      dragControls={dragControls}
      dragListener={false}
      dragElastic={prefersReducedMotion ? 0 : 0.15}
      dragMomentum={false}
      onDragEnd={(_, info) => {
        onDragEnd?.(info)
      }}
      whileTap={
        prefersReducedMotion
          ? undefined
          : {
              scale: 0.97,
            }
      }
    >
      {/* Gradient title bar / drag handle */}
      <div
        className="relative flex cursor-grab items-center justify-between rounded-t-3xl px-5 py-3 text-xs text-sky-50"
        onPointerDown={(event) => {
          // Treat grabbing / focusing the window as a conceptual "focus" cue
          play('success')
          if (prefersReducedMotion) return
          event.preventDefault()
          dragControls.start(event)
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-t-3xl"
          style={{
            background: 'linear-gradient(135deg, rgba(56,189,248,0.65), rgba(30,64,175,0.8))',
            boxShadow: '0 0 18px rgba(56,189,248,0.7), 0 0 40px rgba(37,99,235,0.6)',
          }}
        />

        <div className="relative flex items-center gap-3">
          {/* Drag pill */}
          <div className="flex items-center gap-1 rounded-full bg-black/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-sky-100/80">
            <span className="h-1 w-4 rounded-full bg-sky-100/70" />
            <span>AQUA SURFACE</span>
          </div>
          <span className="text-[11px] font-medium tracking-wide text-sky-50/95">{title}</span>
        </div>

        {onClose && (
          <button
            type="button"
            onMouseDownCapture={(event) => {
              // Prevent focus sound from firing when clicking the close control
              event.stopPropagation()
            }}
            onClick={() => {
              play('click')
              onClose()
            }}
            className="relative flex h-6 w-6 items-center justify-center rounded-full bg-black/20 text-[11px] text-slate-100 shadow-[0_0_0_1px_rgba(148,163,184,0.6)] hover:bg-black/35 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/90"
            aria-label="Close window"
          >
            ×
          </button>
        )}
      </div>

      {/* Body */}
      <div className="relative rounded-b-3xl border-t border-white/10 bg-slate-900/50 px-6 pb-6 pt-5">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-16 rounded-b-[40px] bg-gradient-to-b from-white/12 to-transparent"
        />
        <div className="relative">{children}</div>
      </div>
    </motion.div>
  )
}
