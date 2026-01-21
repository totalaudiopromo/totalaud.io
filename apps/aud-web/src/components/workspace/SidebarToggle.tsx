/**
 * Sidebar Toggle Component
 *
 * Floating button to open the sidebar navigation.
 * P2 Fix: Added pulsing animation for first-time users who haven't
 * discovered the sidebar yet.
 */

'use client'

import { motion } from 'framer-motion'
import { Bars3Icon } from '@heroicons/react/24/outline'
import { useSidebarStore } from '@/stores/useSidebarStore'

export function SidebarToggle() {
  const { toggle, isOpen, hasSeenSidebar } = useSidebarStore()

  // Don't show toggle if sidebar is already open
  if (isOpen) return null

  const showPulse = !hasSeenSidebar

  return (
    <>
      <motion.button
        onClick={toggle}
        className={`fixed bottom-24 md:bottom-6 left-4 z-50 w-12 h-12 rounded-full bg-ta-cyan/90 border border-ta-cyan shadow-lg flex items-center justify-center hover:bg-ta-cyan transition-colors ${showPulse ? 'sidebar-pulse' : ''}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        aria-label="Open navigation menu"
      >
        <Bars3Icon className="w-6 h-6 text-ta-black" />
      </motion.button>

      {/* Pulsing animation for first-time users */}
      {showPulse && (
        <style>{`
          @keyframes sidebar-glow-pulse {
            0%, 100% {
              box-shadow: 0 0 8px rgba(58, 169, 190, 0.4), 0 4px 16px rgba(0, 0, 0, 0.3);
            }
            50% {
              box-shadow: 0 0 24px rgba(58, 169, 190, 0.8), 0 0 48px rgba(58, 169, 190, 0.4), 0 4px 16px rgba(0, 0, 0, 0.3);
            }
          }
          .sidebar-pulse {
            animation: sidebar-glow-pulse 2s ease-in-out infinite;
          }
        `}</style>
      )}
    </>
  )
}
