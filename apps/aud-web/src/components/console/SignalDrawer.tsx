/**
 * SignalDrawer Component
 * Phase 14.8: Mobile slide-in drawer for SignalPanel
 *
 * Features:
 * - Slide-in from right on mobile (<1280px)
 * - Toggle with ⌘I keyboard shortcut
 * - Esc to close
 * - Backdrop click to close
 * - 240ms translateX animation (reduced motion safe)
 */

'use client'

import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { SignalPanel } from './SignalPanel'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'

interface SignalDrawerProps {
  isOpen: boolean
  onClose: () => void
  campaignId?: string
  emitActivity?: (event: string, metadata?: string) => void
}

export function SignalDrawer({ isOpen, onClose, campaignId, emitActivity }: SignalDrawerProps) {
  const prefersReducedMotion = useReducedMotion()

  // Close on Esc key
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.24 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              zIndex: 50,
            }}
            aria-label="Close drawer"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.24,
              ease: [0.22, 1, 0.36, 1], // FlowCore easing
            }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: '480px',
              backgroundColor: flowCoreColours.matteBlack,
              boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.3)',
              zIndex: 51,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="signal-drawer-title"
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 24px',
                borderBottom: `2px solid ${flowCoreColours.borderGrey}`,
                backgroundColor: flowCoreColours.darkGrey,
              }}
            >
              <h2
                id="signal-drawer-title"
                className="font-mono text-sm lowercase font-semibold"
                style={{ color: flowCoreColours.textPrimary }}
              >
                signal intelligence
              </h2>
              <button
                onClick={onClose}
                aria-label="Close drawer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '4px',
                  border: `1px solid ${flowCoreColours.borderGrey}`,
                  backgroundColor: 'transparent',
                  color: flowCoreColours.textSecondary,
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = flowCoreColours.slateCyan
                  e.currentTarget.style.color = flowCoreColours.slateCyan
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = flowCoreColours.borderGrey
                  e.currentTarget.style.color = flowCoreColours.textSecondary
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content: SignalPanel in drawer mode */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <SignalPanel
                campaignId={campaignId}
                isDrawerMode={true}
                onClose={onClose}
                emitActivity={emitActivity}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
