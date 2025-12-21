/**
 * Copy to Clipboard Button
 *
 * One-click copy with satisfying feedback
 */

'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CopyButtonProps {
  text: string
  label?: string
  onCopy?: () => void
  className?: string
  variant?: 'default' | 'minimal' | 'icon-only'
}

export function CopyButton({
  text,
  label = 'Copy',
  onCopy,
  className = '',
  variant = 'default',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      onCopy?.()

      // Reset after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [text, onCopy])

  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: variant === 'icon-only' ? '8px' : '8px 14px',
    fontSize: 13,
    fontWeight: 500,
    color: copied ? '#10B981' : 'rgba(247, 248, 249, 0.8)',
    background: copied ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
    border: `1px solid ${copied ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  }

  return (
    <motion.button
      onClick={handleCopy}
      style={baseStyles}
      className={`tap-feedback ${className}`}
      whileHover={{ scale: 1.02, background: 'rgba(255, 255, 255, 0.08)' }}
      whileTap={{ scale: 0.98 }}
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          >
            ✓
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            📋
          </motion.span>
        )}
      </AnimatePresence>

      {variant !== 'icon-only' && <span>{copied ? 'Copied!' : label}</span>}
    </motion.button>
  )
}

// Utility function for copying with toast notification
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy:', err)
    return false
  }
}
