/**
 * ASCII Button Component
 * Terminal-style button with bracket styling
 *
 * Features:
 * - Bracket-style appearance [ BUTTON ]
 * - Hover glow effect
 * - Click animation
 * - Sound feedback
 */

'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useThemeAudio } from '@/hooks/useThemeAudio'

interface AsciiButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
  className?: string
}

export function AsciiButton({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
}: AsciiButtonProps) {
  const { play } = useThemeAudio()
  const prefersReducedMotion = useReducedMotion()

  const handleClick = () => {
    if (!disabled) {
      play('click')
      onClick?.()
    }
  }

  const isPrimary = variant === 'primary'
  const baseColor = isPrimary ? '#00ff99' : '#00ff9966'
  const hoverColor = isPrimary ? '#1affb2' : '#00ff99'

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      className={`
        relative font-mono text-sm px-4 py-2
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      whileHover={
        !disabled && !prefersReducedMotion
          ? {
              scale: 1.02,
              textShadow: '0 0 8px rgba(0, 255, 153, 0.6)',
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
      style={{
        color: baseColor,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.color = hoverColor
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = baseColor
      }}
    >
      {/* Opening bracket */}
      <span className="mr-2">[</span>

      {/* Button text */}
      <span>{children}</span>

      {/* Closing bracket */}
      <span className="ml-2">]</span>

      {/* Hover glow effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded"
        initial={{ opacity: 0 }}
        whileHover={!disabled ? { opacity: 1 } : undefined}
        style={{
          boxShadow: '0 0 12px rgba(0, 255, 153, 0.3)',
        }}
      />
    </motion.button>
  )
}
