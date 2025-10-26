'use client'

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { playSound } from '@aud-web/tokens/sounds'
import { motionTokens } from '@aud-web/tokens/motion'

interface SystemInitOverlayProps {
  isVisible: boolean
  onComplete?: () => void
}

/**
 * SystemInitOverlay - Cinematic system initialisation transition
 *
 * Design principles:
 * - Matte Black (#0F1113) background with Slate Cyan (#3AA9BE) ambient pulse
 * - Sequential text fade-in matching Totalaud.io motion grammar (120/240/400ms)
 * - Subtle sound cues (task-armed → success-soft)
 * - Respects prefers-reduced-motion
 * - No cheap spinners, graphs, or "Signal loading" text
 *
 * Phase 9.8: Cinematic system transition
 */
export function SystemInitOverlay({ isVisible, onComplete }: SystemInitOverlayProps) {
  const prefersReducedMotion = useReducedMotion()
  const [stage, setStage] = useState(0)

  useEffect(() => {
    if (!isVisible) return

    // Play start sound
    playSound('task-armed', { volume: 0.08 })

    // Sequential message timing
    const timers = [
      setTimeout(() => setStage(1), 1000), // "loading workspace context…"
      setTimeout(() => setStage(2), 2400), // "connecting creative agents."
      setTimeout(() => setStage(3), 3600), // Start fade-out
      setTimeout(() => {
        setStage(4)
        playSound('success-soft', { volume: 0.12 })
        if (onComplete) onComplete()
      }, 4200),
    ]

    return () => timers.forEach(clearTimeout)
  }, [isVisible, onComplete])

  const messages = [
    'system initialising.',
    'loading workspace context…',
    'connecting creative agents.',
  ]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0F1113] text-[#E5E7EB]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: motionTokens.slow.duration / 1000 } }}
        >
          {/* Ambient pulse (12s breathing cycle) */}
          {!prefersReducedMotion && (
            <motion.div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(circle at center, rgba(58, 169, 190, 0.05) 0%, transparent 70%)',
              }}
              animate={{
                opacity: [0.05, 0.1, 0.05],
              }}
              transition={{
                repeat: Infinity,
                duration: 12,
                ease: 'easeInOut',
              }}
            />
          )}

          {/* Message sequence */}
          <div className="relative z-10 flex flex-col items-center gap-4">
            {messages.map((msg, i) => {
              const isActive = stage === i
              const isPast = stage > i
              const shouldShow = isActive || isPast

              return (
                <motion.p
                  key={i}
                  className="font-mono text-sm tracking-wide text-white/60"
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10, scale: 0.98 }}
                  animate={
                    shouldShow
                      ? {
                          opacity: stage === 3 ? 0 : 1, // Fade out all on stage 3
                          y: 0,
                          scale: 1,
                        }
                      : {
                          opacity: 0,
                          y: prefersReducedMotion ? 0 : 10,
                          scale: 0.98,
                        }
                  }
                  transition={{
                    duration: prefersReducedMotion
                      ? 0
                      : motionTokens.normal.duration / 1000,
                    ease: 'easeOut',
                  }}
                >
                  {msg}
                </motion.p>
              )
            })}
          </div>

          {/* Optional mini waveform line (breathing with pulse) */}
          {!prefersReducedMotion && (
            <motion.div
              className="absolute bottom-1/3 h-[1px] w-24 bg-[#3AA9BE]/30"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                repeat: Infinity,
                duration: 4,
                ease: 'easeInOut',
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
