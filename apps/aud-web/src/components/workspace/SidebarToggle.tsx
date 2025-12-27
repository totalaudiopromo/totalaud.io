'use client'

import { motion } from 'framer-motion'
import { Bars3Icon } from '@heroicons/react/24/outline'
import { useSidebarStore } from '@/stores/useSidebarStore'

export function SidebarToggle() {
  const { toggle, isOpen } = useSidebarStore()

  // Don't show toggle if sidebar is already open
  if (isOpen) return null

  return (
    <motion.button
      onClick={toggle}
      className="fixed bottom-24 md:bottom-6 left-4 z-50 w-12 h-12 rounded-full bg-ta-cyan/90 border border-ta-cyan shadow-lg flex items-center justify-center hover:bg-ta-cyan transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Open navigation menu"
    >
      <Bars3Icon className="w-6 h-6 text-ta-black" />
    </motion.button>
  )
}
