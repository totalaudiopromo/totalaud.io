/**
 * ASCII Cursor Component
 * Blinking terminal cursor
 * 
 * Features:
 * - Smooth blink animation
 * - Respects reduced motion
 * - Terminal-style underscore character
 */

'use client'

import { motion, useReducedMotion } from 'framer-motion'

export function AsciiCursor() {
  const prefersReducedMotion = useReducedMotion()

  // Blink animation (disabled if reduced motion)
  const cursorVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 }
  }

  if (prefersReducedMotion) {
    return (
      <span className="text-[#00ff99] font-mono">_</span>
    )
  }

  return (
    <motion.span
      className="text-[#00ff99] font-mono"
      initial="visible"
      animate="hidden"
      variants={cursorVariants}
      transition={{
        duration: 0.5,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut'
      }}
    >
      _
    </motion.span>
  )
}

