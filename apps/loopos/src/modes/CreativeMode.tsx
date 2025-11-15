'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useMomentumStore } from '@/stores/momentum'

interface CreativeModeProps {
  children: React.ReactNode
}

export function CreativeMode({ children }: CreativeModeProps) {
  const creativeModeEnabled = useMomentumStore((state) => state.creativeModeEnabled)

  return (
    <div className="relative">
      {/* Ambient Background Pulses */}
      <AnimatePresence>
        {creativeModeEnabled && (
          <>
            {/* Radial gradient pulse */}
            <motion.div
              className="fixed inset-0 pointer-events-none z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(58, 169, 190, 0.08) 0%, transparent 60%)',
              }}
            />

            {/* Floating particles */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-slate-cyan/20 rounded-full"
                  initial={{
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    opacity: 0,
                  }}
                  animate={{
                    y: [null, Math.random() * window.innerHeight],
                    opacity: [0, 0.3, 0],
                  }}
                  transition={{
                    duration: 8 + Math.random() * 4,
                    repeat: Infinity,
                    delay: Math.random() * 5,
                  }}
                />
              ))}
            </div>

            {/* Glow overlay */}
            <motion.div
              className="fixed inset-0 pointer-events-none z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                background:
                  'radial-gradient(circle at 30% 50%, rgba(58, 169, 190, 0.03) 0%, transparent 50%)',
              }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Content with dimmed chrome effect */}
      <motion.div
        className="relative z-10"
        animate={{
          filter: creativeModeEnabled ? 'brightness(0.9)' : 'brightness(1)',
        }}
        transition={{ duration: 0.4 }}
      >
        {children}
      </motion.div>
    </div>
  )
}
