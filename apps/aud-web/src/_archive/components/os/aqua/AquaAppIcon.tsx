'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useThemeAudio } from '@/hooks/useThemeAudio'

export type AquaAppName = 'studio' | 'notes' | 'flow'

interface AquaAppIconProps {
  app: AquaAppName
  label?: string
  // Dock-injected props
  dockIndex?: number
  activeDockIndex?: number | null
  proximity?: number
  onDockHover?: () => void
  onDockLeave?: () => void
  onDockClick?: (app: AquaAppName) => void
}

/**
 * AquaAppIcon
 * Rounded glass icon with cyan glow + dock magnify behaviour
 */
export function AquaAppIcon({
  app,
  label,
  dockIndex,
  activeDockIndex,
  proximity,
  onDockHover,
  onDockLeave,
  onDockClick,
}: AquaAppIconProps) {
  const { play } = useThemeAudio()
  const prefersReducedMotion = useReducedMotion()

  const computedLabel = label ?? (app === 'studio' ? 'Studio' : app === 'notes' ? 'Notes' : 'Flow')

  let baseScale = 1
  if (
    !prefersReducedMotion &&
    typeof activeDockIndex === 'number' &&
    typeof proximity === 'number'
  ) {
    if (proximity === 0) baseScale = 1.4
    else if (proximity === 1) baseScale = 1.2
    else if (proximity === 2) baseScale = 1.06
    else baseScale = 1
  }

  const accentColor = app === 'studio' ? '#22d3ee' : app === 'notes' ? '#a855f7' : '#22c55e'

  return (
    <div className="flex flex-col items-center gap-1">
      <motion.button
        type="button"
        className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/30 bg-white/10 shadow-[0_10px_30px_rgba(15,23,42,0.85)]"
        style={{
          background: 'rgba(255,255,255,0.20)',
          borderColor: 'rgba(255,255,255,0.25)',
          boxShadow: '0 10px 30px rgba(15,23,42,0.85), 0 0 0 1px rgba(148,163,184,0.6)',
        }}
        onMouseEnter={onDockHover}
        onMouseLeave={onDockLeave}
        onFocus={onDockHover}
        onBlur={onDockLeave}
        onClick={() => {
          play('click')
          onDockClick?.(app)
        }}
        initial={{ scale: 1 }}
        animate={{ scale: baseScale }}
        transition={
          prefersReducedMotion
            ? { type: 'tween', duration: 0.18 }
            : { type: 'spring', stiffness: 260, damping: 18, mass: 0.4 }
        }
        whileHover={
          prefersReducedMotion
            ? undefined
            : {
                boxShadow: '0 16px 40px rgba(15,23,42,0.95), 0 0 25px rgba(56,189,248,0.9)',
              }
        }
        aria-label={computedLabel}
      >
        {/* Icon glyph */}
        <div
          className="relative h-7 w-7 rounded-xl bg-slate-900/60"
          style={{
            boxShadow: `0 0 0 1px rgba(148,163,184,0.7), 0 0 18px ${accentColor}55`,
          }}
        >
          <div
            className="absolute inset-[2px] rounded-[10px]"
            style={{
              background: `radial-gradient(circle at 0% 0%, ${accentColor}, transparent 70%)`,
            }}
          />

          {/* Simple app-specific glyphs */}
          {app === 'studio' && (
            <div className="absolute inset-1 flex items-center justify-center">
              <div className="flex h-3/4 w-[70%] items-end justify-between gap-[2px]">
                <span className="h-1/3 w-[3px] rounded-full bg-cyan-300/70" />
                <span className="h-2/3 w-[3px] rounded-full bg-cyan-200/90" />
                <span className="h-1/2 w-[3px] rounded-full bg-cyan-400/80" />
                <span className="h-full w-[3px] rounded-full bg-cyan-100" />
              </div>
            </div>
          )}
          {app === 'notes' && (
            <div className="absolute inset-1 flex items-center justify-center">
              <div className="h-6 w-5 rounded-lg border border-violet-200/70 bg-slate-900/60">
                <div className="h-1.5 rounded-t-lg bg-gradient-to-r from-violet-400 to-pink-400" />
                <div className="mt-[3px] space-y-[3px] px-[3px]">
                  <div className="h-[2px] w-full rounded-full bg-slate-300/80" />
                  <div className="h-[2px] w-3/4 rounded-full bg-slate-400/70" />
                </div>
              </div>
            </div>
          )}
          {app === 'flow' && (
            <div className="absolute inset-1 flex items-center justify-center">
              <div className="relative h-6 w-6">
                <div className="absolute inset-0 rounded-full border border-emerald-300/80" />
                <div className="absolute inset-1 rounded-full border border-emerald-400/70" />
                <div className="absolute inset-2 rounded-full border border-emerald-500/60" />
              </div>
            </div>
          )}
        </div>
      </motion.button>

      {/* Label */}
      <div className="pointer-events-none text-[10px] font-medium tracking-wide text-slate-100/80">
        {computedLabel}
      </div>
    </div>
  )
}
