'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface CheckoutToastProps {
  show: boolean
  onClose: () => void
  variant: 'success' | 'error'
  title: string
  children: React.ReactNode
}

const variantStyles = {
  success: {
    bg: 'rgba(34, 197, 94, 0.15)',
    border: 'rgba(34, 197, 94, 0.3)',
    iconBg: 'rgba(34, 197, 94, 0.2)',
    colour: '#22c55e',
    icon: '✓',
  },
  error: {
    bg: 'rgba(251, 191, 36, 0.15)',
    border: 'rgba(251, 191, 36, 0.3)',
    iconBg: 'rgba(251, 191, 36, 0.2)',
    colour: '#FBBF24',
    icon: '!',
  },
} as const

export function CheckoutToast({ show, onClose, variant, title, children }: CheckoutToastProps) {
  const styles = variantStyles[variant]

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            position: 'fixed',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '16px 24px',
            backgroundColor: styles.bg,
            border: `1px solid ${styles.border}`,
            borderRadius: 12,
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            zIndex: 100,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }}
        >
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: styles.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: styles.colour,
              fontSize: variant === 'error' ? 18 : undefined,
              fontWeight: variant === 'error' ? 'bold' : undefined,
            }}
          >
            {styles.icon}
          </span>
          <div>
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: styles.colour,
                margin: 0,
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              {title}
            </p>
            <p
              style={{
                fontSize: 12,
                color: 'rgba(255, 255, 255, 0.6)',
                margin: '4px 0 0 0',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              {children}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Dismiss notification"
            style={{
              marginLeft: 8,
              padding: 4,
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: 16,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
