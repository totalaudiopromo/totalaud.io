'use client'

import React, { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useThemeAudio } from '@/hooks/useThemeAudio'

interface AquaToggleProps {
  label?: string
  checked?: boolean
  onChange?: (value: boolean) => void
}

/**
 * AquaToggle
 * Glass switch with smooth slide and click audio
 */
export function AquaToggle({ label, checked, onChange }: AquaToggleProps) {
  const { play } = useThemeAudio()
  const prefersReducedMotion = useReducedMotion()
  const [internalChecked, setInternalChecked] = useState(false)

  const isOn = typeof checked === 'boolean' ? checked : internalChecked

  const handleToggle = () => {
    const next = !isOn
    setInternalChecked(next)
    onChange?.(next)
    play('click')
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="group inline-flex items-center gap-3"
    >
      {label && (
        <span className="text-xs font-medium tracking-wide text-slate-100/80">
          {label}
        </span>
      )}

      <div
        className="relative flex h-6 w-11 items-center rounded-full border border-white/25 bg-white/10 px-[3px]"
        style={{
          background: 'rgba(15,23,42,0.75)',
          boxShadow:
            '0 6px 18px rgba(15,23,42,0.9), 0 0 0 1px rgba(148,163,184,0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Track glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-[2px] rounded-full"
          style={{
            background: isOn
              ? 'linear-gradient(90deg, rgba(56,189,248,0.8), rgba(96,165,250,0.9))'
              : 'linear-gradient(90deg, rgba(148,163,184,0.6), rgba(71,85,105,0.9))',
            opacity: 0.45,
          }}
        />

        <motion.div
          className="relative h-4 w-4 rounded-full border border-white/70 bg-slate-900/80"
          style={{
            boxShadow:
              '0 4px 10px rgba(15,23,42,0.9), 0 0 0 1px rgba(148,163,184,0.6)',
          }}
          animate={{ x: isOn ? 18 : 0 }}
          transition={
            prefersReducedMotion
              ? { type: 'tween', duration: 0.16 }
              : { type: 'spring', stiffness: 260, damping: 20, mass: 0.4 }
          }
        >
          {/* Inner highlight */}
          <div
            aria-hidden
            className="absolute inset-[2px] rounded-full"
            style={{
              background: isOn
                ? 'radial-gradient(circle at 30% 20%, rgba(56,189,248,0.95), transparent 70%)'
                : 'radial-gradient(circle at 30% 20%, rgba(148,163,184,0.9), transparent 70%)',
            }}
          />
        </motion.div>
      </div>
    </button>
  )
}


