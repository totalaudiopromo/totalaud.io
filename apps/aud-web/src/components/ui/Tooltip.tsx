/**
 * Tooltip Component
 *
 * Reusable tooltip for progressive disclosure and contextual help.
 * Used to guide first-time users through workspace features.
 *
 * Stage 2: Experience Composer - Progressive Disclosure
 */

'use client'

import { ReactNode, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { tokens } from '@/themes/tokens'

export interface TooltipProps {
  /** Content to display in tooltip */
  content: string
  /** Element that triggers the tooltip */
  children: ReactNode
  /** Placement of tooltip relative to trigger */
  placement?: 'top' | 'bottom' | 'left' | 'right'
  /** Optional delay before showing (ms) */
  delay?: number
}

const placementStyles = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
}

/**
 * Tooltip - Contextual help and guidance
 *
 * @example
 * ```tsx
 * <Tooltip content="Click here to add your first release">
 *   <Button>Add Release</Button>
 * </Tooltip>
 * ```
 */
export function Tooltip({
  content,
  children,
  placement = 'top',
  delay = 200,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const showTooltip = () => {
    const id = setTimeout(() => setIsVisible(true), delay)
    setTimeoutId(id)
  }

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
    setIsVisible(false)
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`
              absolute z-50 px-3 py-2
              bg-foreground text-background
              text-sm font-medium rounded-md
              whitespace-nowrap pointer-events-none
              shadow-lg
              ${placementStyles[placement]}
            `}
          >
            {content}

            {/* Arrow */}
            <div
              className={`
                absolute w-2 h-2 bg-foreground rotate-45
                ${placement === 'top' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' : ''}
                ${placement === 'bottom' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''}
                ${placement === 'left' ? 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2' : ''}
                ${placement === 'right' ? 'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2' : ''}
              `}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
