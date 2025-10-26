/**
 * Console Demo Modal - Interactive Showcase
 *
 * Full-screen modal with shared layout animation.
 * Expands seamlessly from inline preview block.
 * Keyboard accessible (Esc to close) with GPU-accelerated transforms.
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useState, useEffect } from 'react'

interface ConsoleDemoModalProps {
  trigger: React.ReactNode
}

// Motion grammar - consistent with landing page
const easeCubic = [0.22, 1, 0.36, 1] as const

export function ConsoleDemoModal({ trigger }: ConsoleDemoModalProps) {
  const [open, setOpen] = useState(false)

  // Keyboard accessibility - Esc to close
  useEffect(() => {
    if (!open) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [open])

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="w-full h-full cursor-pointer"
        aria-label="Open console demo"
      >
        {trigger}
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: easeCubic }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
              onClick={() => setOpen(false)}
              aria-label="Close demo"
            >
              {/* Modal content */}
              <motion.div
                layoutId="console-preview"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.4, ease: easeCubic }}
                className="w-full max-w-5xl aspect-video rounded-xl overflow-hidden
                  shadow-[0_0_80px_-20px_rgba(58,169,190,0.4)]
                  border border-[#2A2F33]/80
                  will-change-transform"
                onClick={(e) => e.stopPropagation()}
                style={{ transformOrigin: 'center' }}
              >
                {/* Video player */}
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  src="/videos/console-preview.mp4"
                >
                  <source src="/videos/console-preview.mp4" type="video/mp4" />
                  Your browser doesn't support video playback.
                </video>
              </motion.div>

              {/* Close button */}
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 md:top-8 md:right-8
                  text-neutral-400 hover:text-[#3AA9BE]
                  text-3xl md:text-4xl transition-colors
                  w-12 h-12 flex items-center justify-center
                  focus:outline-none focus:ring-2 focus:ring-[#3AA9BE] rounded"
                aria-label="Close demo"
              >
                ×
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
