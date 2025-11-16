'use client'

/**
 * Fusion Toggle Button
 * UI control to enter/exit Fusion Mode
 */

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface FusionToggleButtonProps {
  isActive: boolean
  onClick: () => void
  className?: string
}

export function FusionToggleButton({
  isActive,
  onClick,
  className = '',
}: FusionToggleButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`relative flex items-centre gap-2 rounded-lg border border-[var(--flowcore-colour-accent)] px-4 py-2 font-mono text-sm font-semibold transition-all ${
        isActive
          ? 'bg-[var(--flowcore-colour-accent)] text-white'
          : 'bg-[var(--flowcore-colour-accent)]/10 text-[var(--flowcore-colour-accent)] hover:bg-[var(--flowcore-colour-accent)]/20'
      } ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      animate={
        isActive
          ? {
              boxShadow: [
                '0 0 0 0 rgba(var(--flowcore-colour-accent-rgb), 0)',
                '0 0 20px 5px rgba(var(--flowcore-colour-accent-rgb), 0.3)',
                '0 0 0 0 rgba(var(--flowcore-colour-accent-rgb), 0)',
              ],
            }
          : {}
      }
      transition={{
        duration: isActive ? 2 : 0.12,
        repeat: isActive ? Infinity : 0,
      }}
    >
      <motion.div
        animate={
          isActive
            ? {
                rotate: [0, 180, 360],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: isActive ? Infinity : 0,
          ease: 'linear',
        }}
      >
        <Sparkles size={16} />
      </motion.div>

      <span>{isActive ? 'Exit Fusion' : 'Fusion Mode'}</span>

      {/* Active Indicator */}
      {isActive && (
        <motion.div
          className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-white"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [1, 0.7, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.button>
  )
}
