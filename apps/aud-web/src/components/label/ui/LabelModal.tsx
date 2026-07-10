'use client'

import { type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { transition } from '@/lib/motion'

interface LabelModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

/** Shared modal shell for Label OS forms. */
export function LabelModal({ open, title, onClose, children }: LabelModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transition.fast}
          className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={transition.normal}
            className="w-full max-w-lg rounded-ta border border-ta-border bg-ta-panel shadow-ta-lg max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-ta-border">
              <h2 className="text-sm font-semibold text-ta-white">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="text-ta-grey hover:text-ta-white transition-colors duration-120"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const fieldLabelClass = 'block text-xs font-medium text-ta-grey mb-1'
export const fieldInputClass =
  'w-full px-3 py-2 rounded-ta-sm border border-ta-border bg-white/[0.02] text-sm text-ta-white placeholder:text-ta-muted focus:outline-none focus:border-ta-cyan transition-colors duration-120'
export const primaryButtonClass =
  'px-4 py-2 rounded-ta-sm bg-ta-cyan text-ta-black text-sm font-semibold hover:opacity-90 transition-opacity duration-120 disabled:opacity-50 disabled:cursor-not-allowed'
export const secondaryButtonClass =
  'px-4 py-2 rounded-ta-sm border border-ta-border text-sm text-ta-grey hover:text-ta-white hover:bg-white/[0.04] transition-colors duration-120'
