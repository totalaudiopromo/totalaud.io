/**
 * SaveStatus Component
 * Phase 14.8: Tiny bottom-left status pill for save state
 *
 * States:
 * - idle: Hidden
 * - saving: Slate Cyan border, pulsing
 * - saved: Ice Cyan border, static
 * - error: Red border, static
 *
 * Design: FlowCore tokens, 240ms pulse animation, reduced motion safe
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import type { SaveState } from '@/hooks/useSaveSignal'

export interface SaveStatusProps {
  state: SaveState
  muted?: boolean
}

const stateConfig = {
  idle: {
    visible: false,
    label: '',
    borderColour: '',
  },
  saving: {
    visible: true,
    label: 'saving...',
    borderColour: flowCoreColours.slateCyan,
    pulse: true,
  },
  saved: {
    visible: true,
    label: 'saved',
    borderColour: flowCoreColours.iceCyan,
    pulse: false,
  },
  error: {
    visible: true,
    label: 'save failed',
    borderColour: '#E57373', // Red for errors
    pulse: false,
  },
}

export function SaveStatus({ state, muted = false }: SaveStatusProps) {
  const prefersReducedMotion = useReducedMotion()
  const config = stateConfig[state]

  if (!config.visible) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state}
        role="status"
        aria-live="polite"
        aria-label={config.label}
        initial={{ opacity: 0, y: 8 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: config.pulse && !prefersReducedMotion ? [1, 1.05, 1] : 1,
        }}
        exit={{ opacity: 0, y: 8 }}
        transition={{
          duration: 0.24,
          ease: [0.22, 1, 0.36, 1],
          scale: {
            repeat: config.pulse && !prefersReducedMotion ? Infinity : 0,
            duration: 1.2,
            ease: 'easeInOut',
          },
        }}
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          zIndex: 40,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          backgroundColor: flowCoreColours.matteBlack,
          border: `2px solid ${config.borderColour}`,
          borderRadius: '24px',
          fontSize: '13px',
          fontWeight: 500,
          color: flowCoreColours.textSecondary,
          textTransform: 'lowercase',
          letterSpacing: '0.3px',
          boxShadow: `0 4px 12px rgba(0, 0, 0, 0.4)`,
          fontFamily:
            'var(--font-geist-mono, ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace)',
        }}
      >
        {/* Status indicator dot */}
        <motion.div
          animate={{
            opacity: config.pulse && !prefersReducedMotion ? [0.5, 1, 0.5] : 1,
          }}
          transition={{
            repeat: config.pulse && !prefersReducedMotion ? Infinity : 0,
            duration: 1.2,
            ease: 'easeInOut',
          }}
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: config.borderColour,
          }}
        />

        {/* Status label */}
        <span>{config.label}</span>
      </motion.div>
    </AnimatePresence>
  )
}
