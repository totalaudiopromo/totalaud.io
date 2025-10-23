'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOperatorInput } from '@aud-web/hooks/useOperatorInput'
import { AmbientSound } from '@aud-web/components/ui/ambient'

interface OperatorTerminalProps {
  onComplete: () => void
}

/**
 * Phase 1: Minimal operator terminal with blinking cursor.
 * User types freely, presses Enter to continue.
 */
export function OperatorTerminal({ onComplete }: OperatorTerminalProps) {
  const { lines, userInput, isComplete, handleKeyPress } = useOperatorInput(onComplete)
  const terminalRef = useRef<HTMLDivElement>(null)

  // Attach keyboard listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      handleKeyPress(e)
    }

    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
    }
  }, [handleKeyPress])

  // Auto-scroll to bottom when new lines appear
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [lines, userInput])

  return (
    <div className="operator-terminal">
      <AmbientSound type="operator-hum" autoPlay />

      <motion.div
        className="operator-terminal__window"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="operator-terminal__content" ref={terminalRef}>
          <AnimatePresence mode="popLayout">
            {lines.map((line, index) => (
              <motion.div
                key={index}
                className="operator-terminal__line"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {line}
              </motion.div>
            ))}
          </AnimatePresence>

          {!isComplete && (
            <div className="operator-terminal__input-line">
              <span className="operator-terminal__prompt">&gt;</span>
              <span className="operator-terminal__input">{userInput}</span>
              <span className="operator-terminal__cursor" />
            </div>
          )}
        </div>
      </motion.div>

      <div className="operator-terminal__hint">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 8, duration: 1 }}
        >
          press enter to continue
        </motion.span>
      </div>
    </div>
  )
}
