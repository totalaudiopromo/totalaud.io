/**
 * Toast Component
 *
 * Simple toast notification system with theme microcopy integration
 * Phase 13.0.3: Save/Share button toast feedback
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { useFlowTheme } from '@/hooks/useFlowTheme'
import { getThemeTone } from '@/design/core/themes/tone'

export interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  isVisible: boolean
  onClose: () => void
  duration?: number
  useThemeTone?: boolean
}

export function Toast({
  message,
  type = 'success',
  isVisible,
  onClose,
  duration = 3000,
  useThemeTone = false,
}: ToastProps) {
  const { colours, activeTheme } = useFlowTheme()

  // Get theme-specific microcopy if requested
  const themeTone = useThemeTone ? getThemeTone(activeTheme) : null
  const displayMessage = useThemeTone && themeTone ? themeTone.confirm : message

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  const bgColor =
    type === 'success' ? colours.accent : type === 'error' ? 'var(--error)' : colours.border

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: bgColor,
            color: type === 'success' ? '#000' : '#fff',
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            fontFamily: 'var(--font-sans)',
            textTransform: 'lowercase',
          }}
        >
          {displayMessage}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
