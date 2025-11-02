/**
 * HintBubble Component
 * Phase 14.6: Adaptive Console Hints System
 *
 * Visual component for adaptive hints:
 * - Fixed bottom-left, 280px × auto
 * - Matte Black background, Slate Cyan border
 * - Geist Mono, lowercase microcopy
 * - Fade in/out: 240ms (flowCoreMotion.normal)
 * - Sound feedback on appear/disappear
 * - Accessibility: role="status", aria-live="polite"
 */

'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { flowCoreColours, flowCoreMotion } from '@aud-web/constants/flowCoreColours'
import type { Hint } from '@/hooks/useAdaptiveHints'
import { logger } from '@total-audio/core-logger'

const log = logger.scope('HintBubble')

interface HintBubbleProps {
  hint: Hint | null
  prefersReducedMotion?: boolean
  muted?: boolean
}

export function HintBubble({ hint, prefersReducedMotion = false, muted = false }: HintBubbleProps) {
  const audioContextRef = useRef<AudioContext>()
  const previousHintRef = useRef<string | null>(null)

  // Play notification sound on hint change
  useEffect(() => {
    if (!hint || muted || prefersReducedMotion) return

    // Only play if hint actually changed
    if (previousHintRef.current === hint.id) return

    previousHintRef.current = hint.id

    try {
      const playSound = () => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.type = 'sine'
        oscillator.frequency.value = 880 // A5 - notification tone
        gainNode.gain.value = 0

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.start()

        // Quick fade in/out
        const now = audioContext.currentTime
        gainNode.gain.linearRampToValueAtTime(0.08, now + 0.02)
        gainNode.gain.linearRampToValueAtTime(0, now + 0.15)

        setTimeout(() => {
          oscillator.stop()
          audioContext.close()
        }, 200)

        audioContextRef.current = audioContext
      }

      playSound()
      log.debug('Played hint notification sound', { hintId: hint.id })
    } catch (error) {
      log.warn('Failed to play hint sound', { error })
    }
  }, [hint, muted, prefersReducedMotion])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  return (
    <AnimatePresence mode="wait">
      {hint && (
        <motion.div
          key={hint.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: prefersReducedMotion ? 1 : [0.8, 1, 0.8],
            y: 0,
          }}
          exit={{ opacity: 0, y: 20 }}
          transition={{
            opacity: {
              duration: flowCoreMotion.normal / 1000,
              times: prefersReducedMotion ? undefined : [0, 0.5, 1],
              repeat: prefersReducedMotion ? 0 : Infinity,
              repeatDelay: 2,
            },
            y: { duration: flowCoreMotion.normal / 1000 },
          }}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            width: '280px',
            padding: '12px 16px',
            backgroundColor: flowCoreColours.matteBlack,
            border: `2px solid ${flowCoreColours.slateCyan}`,
            borderRadius: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            fontWeight: 500,
            color: flowCoreColours.textPrimary,
            textTransform: 'lowercase',
            zIndex: 9998,
            boxShadow: `0 0 20px rgba(58, 169, 190, 0.15)`,
            backdropFilter: 'blur(8px)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {hint.emoji && (
              <span
                style={{
                  fontSize: '18px',
                  flexShrink: 0,
                }}
                aria-hidden="true"
              >
                {hint.emoji}
              </span>
            )}
            <span>{hint.message}</span>
          </div>

          {/* Accessibility: Screen reader only text */}
          <span
            style={{
              position: 'absolute',
              width: '1px',
              height: '1px',
              padding: 0,
              margin: '-1px',
              overflow: 'hidden',
              clip: 'rect(0, 0, 0, 0)',
              whiteSpace: 'nowrap',
              border: 0,
            }}
          >
            Hint: {hint.message.replace(/💾|🔍|✨/g, '')}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
