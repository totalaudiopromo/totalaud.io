'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useMomentumStore } from '@/stores/momentum'

export function CreativeModeToggle() {
  const { creativeModeEnabled, toggleCreativeMode } = useMomentumStore()

  return (
    <button
      onClick={toggleCreativeMode}
      className="relative flex items-center gap-3 px-4 py-2 bg-[var(--border)] hover:bg-slate-cyan/10 rounded transition-fast group"
      aria-label={creativeModeEnabled ? 'Disable creative mode' : 'Enable creative mode'}
    >
      {/* Icon */}
      <motion.div
        animate={{
          rotate: creativeModeEnabled ? 360 : 0,
          scale: creativeModeEnabled ? 1.1 : 1,
        }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <Sparkles
          className={`w-5 h-5 ${creativeModeEnabled ? 'text-slate-cyan' : 'text-slate-400'}`}
        />
      </motion.div>

      {/* Label */}
      <span className="text-sm font-medium">
        {creativeModeEnabled ? 'Creative Mode' : 'Focus Mode'}
      </span>

      {/* Toggle indicator */}
      <div
        className={`w-12 h-6 rounded-full relative transition-colors ${
          creativeModeEnabled ? 'bg-slate-cyan/30' : 'bg-[var(--border)]'
        }`}
      >
        <motion.div
          className={`absolute top-1 w-4 h-4 rounded-full ${
            creativeModeEnabled ? 'bg-slate-cyan' : 'bg-slate-400'
          }`}
          animate={{
            x: creativeModeEnabled ? 28 : 4,
          }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {/* Glow effect when active */}
      {creativeModeEnabled && (
        <motion.div
          className="absolute inset-0 rounded glow-accent pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </button>
  )
}
