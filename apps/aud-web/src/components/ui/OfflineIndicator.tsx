/**
 * Offline Indicator Component
 *
 * Shows a banner when the user is offline, with reconnection feedback.
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, Wifi, X } from 'lucide-react'
import { useOfflineDetection } from '@/hooks/useOfflineDetection'
import { transition, variants, duration } from '@/lib/motion'

export function OfflineIndicator() {
  const { isOnline, wasOffline, clearWasOffline } = useOfflineDetection()

  // Show offline banner when disconnected
  // Show reconnected banner briefly when coming back online
  const showOffline = !isOnline
  const showReconnected = isOnline && wasOffline

  return (
    <AnimatePresence>
      {showOffline && (
        <motion.div
          key="offline"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
          {...variants.slideUp}
          transition={transition.normal}
        >
          <div
            className="flex items-center gap-3 px-4 py-2.5 rounded-full shadow-lg"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <WifiOff className="w-4 h-4 text-red-400" />
            <span
              className="text-sm font-medium text-red-300"
              style={{ fontFamily: 'var(--font-geist-sans), system-ui, sans-serif' }}
            >
              You're offline
            </span>
          </div>
        </motion.div>
      )}

      {showReconnected && (
        <motion.div
          key="reconnected"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={transition.normal}
          onAnimationComplete={() => {
            // Auto-dismiss after 3 seconds
            setTimeout(clearWasOffline, 3000)
          }}
        >
          <div
            className="flex items-center gap-3 px-4 py-2.5 rounded-full shadow-lg"
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <Wifi className="w-4 h-4 text-emerald-400" />
            <span
              className="text-sm font-medium text-emerald-300"
              style={{ fontFamily: 'var(--font-geist-sans), system-ui, sans-serif' }}
            >
              Back online
            </span>
            <button
              onClick={clearWasOffline}
              className="ml-1 p-1 hover:bg-white/10 rounded-full transition-colors"
              style={{ transitionDuration: `${duration.fast * 1000}ms` }}
              aria-label="Dismiss"
            >
              <X className="w-3 h-3 text-emerald-400" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
