/**
 * Enhanced Toast Component
 *
 * Clean, animated toast notifications
 */

'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'info' | 'error' | 'celebration'
  duration?: number
}

interface ToastProps {
  toast: Toast
  onDismiss: (id: string) => void
}

const typeStyles = {
  success: {
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.25)',
    accent: '#10B981',
  },
  info: {
    bg: 'rgba(58, 169, 190, 0.12)',
    border: 'rgba(58, 169, 190, 0.25)',
    accent: '#3AA9BE',
  },
  error: {
    bg: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.25)',
    accent: '#EF4444',
  },
  celebration: {
    bg: 'rgba(139, 92, 246, 0.12)',
    border: 'rgba(139, 92, 246, 0.25)',
    accent: '#8B5CF6',
  },
}

function ToastItem({ toast, onDismiss }: ToastProps) {
  const style = typeStyles[toast.type]

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id)
    }, toast.duration || 3000)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onDismiss])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
      }}
      onClick={() => onDismiss(toast.id)}
      className="cursor-pointer"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 16px',
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: 8,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
        maxWidth: 320,
      }}
    >
      {/* Accent bar */}
      <div
        style={{
          width: 3,
          height: 16,
          background: style.accent,
          borderRadius: 2,
        }}
      />
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: '#F7F8F9',
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        }}
      >
        {toast.message}
      </span>
    </motion.div>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} style={{ pointerEvents: 'auto' }}>
            <ToastItem toast={toast} onDismiss={onDismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Hook for managing toasts
export function useToasts() {
  return null // Use ToastContext instead
}
