/**
 * ASCII Toggle Component
 * Terminal-style toggle switch
 *
 * Features:
 * - ON/OFF text display
 * - Bracket-style appearance
 * - Click animation
 * - Sound feedback
 */

'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useThemeAudio } from '@/hooks/useThemeAudio'

interface AsciiToggleProps {
  label: string
  value: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
}

export function AsciiToggle({ label, value, onChange, disabled = false }: AsciiToggleProps) {
  const { play } = useThemeAudio()
  const prefersReducedMotion = useReducedMotion()

  const handleToggle = () => {
    if (!disabled) {
      play('click')
      onChange(!value)
    }
  }

  return (
    <motion.button
      onClick={handleToggle}
      disabled={disabled}
      className={`
        flex items-center gap-3 font-mono text-sm
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      whileHover={
        !disabled && !prefersReducedMotion
          ? {
              scale: 1.02,
            }
          : undefined
      }
      whileTap={
        !disabled && !prefersReducedMotion
          ? {
              scale: 0.98,
            }
          : undefined
      }
    >
      {/* Label */}
      <span className="text-[#00ff9966]">{label}</span>

      {/* Toggle visual */}
      <div className="flex items-center gap-1">
        <span className="text-[#00ff99]">[</span>
        <span
          className={`
            px-2 transition-all duration-200
            ${value ? 'text-[#00ff99]' : 'text-[#00ff9933]'}
            ${value && !disabled ? 'drop-shadow-[0_0_6px_rgba(0,255,153,0.5)]' : ''}
          `}
        >
          {value ? 'ON' : 'OFF'}
        </span>
        <span className="text-[#00ff99]">]</span>
      </div>
    </motion.button>
  )
}
