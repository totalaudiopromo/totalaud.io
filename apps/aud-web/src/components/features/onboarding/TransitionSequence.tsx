'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AmbientSound } from '@aud-web/components/ui/ambient'
import type { OSTheme } from '@aud-web/hooks/useOSSelection'

interface TransitionSequenceProps {
  theme: OSTheme
  onComplete: () => void
}

/**
 * Phase 3: Cinematic transition from operator to signal.
 * Fade to black → logo morph → ambient drone → reveal Flow Studio.
 */
export function TransitionSequence({ theme, onComplete }: TransitionSequenceProps) {
  const [phase, setPhase] = useState<'fade-out' | 'reveal' | 'complete'>('fade-out')

  useEffect(() => {
    // Phase 1: Fade to black (500ms)
    const fadeTimer = setTimeout(() => {
      setPhase('reveal')
    }, 500)

    // Phase 2: Logo reveal + messages (3000ms)
    const revealTimer = setTimeout(() => {
      setPhase('complete')
    }, 3500)

    // Phase 3: Transition to Flow Studio (4000ms total)
    const completeTimer = setTimeout(() => {
      onComplete()
    }, 4000)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(revealTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <div className="transition-sequence">
      {/* Transition glide sound */}
      {phase === 'reveal' && <AmbientSound type="transition-glide" autoPlay />}

      <AnimatePresence mode="wait">
        {/* Phase 1: Fade to black */}
        {phase === 'fade-out' && (
          <motion.div
            key="fade-out"
            className="transition-sequence__fade"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}

        {/* Phase 2: Reveal sequence */}
        {phase === 'reveal' && (
          <motion.div
            key="reveal"
            className="transition-sequence__reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Logo morph animation */}
            <motion.div
              className="transition-sequence__logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 1,
                delay: 0.2,
                ease: [0.16, 1, 0.3, 1], // Smooth ease-out
              }}
            >
              <svg
                className="transition-sequence__waveform"
                width="200"
                height="80"
                viewBox="0 0 200 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <motion.path
                  d="M0 40 L20 20 L40 60 L60 10 L80 70 L100 30 L120 50 L140 25 L160 55 L180 35 L200 40"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    pathLength: { duration: 1.5, delay: 0.3, ease: 'easeInOut' },
                    opacity: { duration: 0.3, delay: 0.3 },
                  }}
                />
              </svg>
            </motion.div>

            {/* Text messages */}
            <motion.div
              className="transition-sequence__messages"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <motion.div
                className="transition-sequence__message"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.4 }}
              >
                operator&gt; signal online.
              </motion.div>

              <motion.div
                className="transition-sequence__message transition-sequence__message--signal"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, duration: 0.4 }}
              >
                signal&gt; hello. ready when you are.
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
