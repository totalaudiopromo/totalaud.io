'use client'

import React, { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useThemeAudio } from '@/hooks/useThemeAudio'

interface AquaSliderProps {
  label?: string
  initialValue?: number
  onChange?: (value: number) => void
}

/**
 * AquaSlider
 * Thin frosted rail with glass handle and focus audio
 */
export function AquaSlider({
  label,
  initialValue = 0.4,
  onChange,
}: AquaSliderProps) {
  const { play } = useThemeAudio()
  const prefersReducedMotion = useReducedMotion()
  const [value, setValue] = useState(
    Math.min(1, Math.max(0, initialValue)),
  )

  const handleChange = (next: number) => {
    const clamped = Math.min(1, Math.max(0, next))
    setValue(clamped)
    onChange?.(clamped)
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      {label && (
        <div className="flex items-center justify-between text-xs text-slate-100/80">
          <span>{label}</span>
          <span className="tabular-nums text-slate-300/80">
            {Math.round(value * 100)}%
          </span>
        </div>
      )}

      <div className="relative h-7 w-full">
        {/* Visual rail */}
        <div
          className="absolute inset-y-2 left-0 right-0 rounded-full border border-white/20 bg-white/5"
          style={{
            background:
              'linear-gradient(90deg, rgba(15,23,42,0.9), rgba(15,23,42,0.7))',
            boxShadow:
              '0 6px 20px rgba(15,23,42,0.9), 0 0 0 1px rgba(30,64,175,0.5)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        />

        {/* Filled portion */}
        <div
          className="absolute inset-y-[9px] left-[3px] rounded-full"
          style={{
            width: `calc(${value * 100}% - 6px)`,
            background:
              'linear-gradient(90deg, rgba(56,189,248,0.9), rgba(59,130,246,1))',
            boxShadow: '0 0 18px rgba(56,189,248,0.8)',
          }}
        />

        {/* Handle */}
        <motion.div
          className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-white/70 bg-slate-900/90"
          style={{
            left: `calc(${value * 100}% - 8px)`,
            boxShadow:
              '0 8px 18px rgba(15,23,42,0.95), 0 0 0 1px rgba(148,163,184,0.8)',
          }}
          whileHover={
            prefersReducedMotion
              ? undefined
              : {
                  scale: 1.08,
                  boxShadow:
                    '0 10px 24px rgba(15,23,42,1), 0 0 24px rgba(56,189,248,0.9)',
                }
          }
          whileTap={
            prefersReducedMotion
              ? undefined
              : {
                  scale: 0.97,
                }
          }
          transition={{ type: 'tween', duration: 0.18 }}
        >
          <div
            aria-hidden
            className="absolute inset-[2px] rounded-full"
            style={{
              background:
                'radial-gradient(circle at 30% 20%, rgba(56,189,248,0.95), transparent 70%)',
            }}
          />
        </motion.div>

        {/* Invisible native range for pointer + keyboard handling */}
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(value * 100)}
          onChange={(event) => {
            const next = Number(event.target.value) / 100
            handleChange(next)
          }}
          onMouseDown={() => {
            // Map conceptual "focus" cue to existing success sound
            play('success')
          }}
          className="absolute inset-y-0 left-0 right-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
    </div>
  )
}


