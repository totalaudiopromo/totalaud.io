/**
 * Signal Presence Component
 *
 * The "signal>" character manifests differently in each Studio.
 * Provides ambient presence that reacts to user activity.
 *
 * Phase 6: Enhancements - Dynamic Signal System
 */

'use client'

import { motion } from 'framer-motion'

export interface SignalPresenceProps {
  studio: string
  activityLevel: number
  className?: string
}

export function SignalPresence({ studio, activityLevel, className = '' }: SignalPresenceProps) {
  // Normalize activity to 0-1
  const activity = Math.min(100, Math.max(0, activityLevel)) / 100

  switch (studio) {
    case 'ascii':
      // Static cursor that blinks faster with activity
      return (
        <motion.div
          className={`font-mono text-green-400 ${className}`}
          animate={{
            opacity: [1, 0.3, 1],
          }}
          transition={{
            duration: 0.8 - activity * 0.4, // Faster blink when active
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          &gt;_
        </motion.div>
      )

    case 'xp':
      // Floating orb that bounces
      return (
        <motion.div
          className={`relative ${className}`}
          animate={{
            y: [-5, 5, -5],
            scale: [1, 1 + activity * 0.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center shadow-lg">
            <motion.div
              className="text-white text-xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              ✨
            </motion.div>
          </div>
          {/* Hint bubble (optional) */}
          {activity > 0.5 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-lg shadow-md text-xs text-gray-700 whitespace-nowrap"
            >
              You're doing great!
            </motion.div>
          )}
        </motion.div>
      )

    case 'aqua':
      // Shimmering particle
      return (
        <motion.div
          className={`relative ${className}`}
          animate={{
            opacity: [0.4 + activity * 0.3, 0.8, 0.4 + activity * 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <motion.div
            className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-cyan-300 blur-sm"
            animate={{
              scale: [1, 1.5 + activity, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <div className="absolute inset-0 w-3 h-3 rounded-full bg-gradient-to-br from-blue-300 to-cyan-200" />
        </motion.div>
      )

    case 'daw':
      // Pulse synced to BPM
      const bpm = 120
      const beatDuration = 60 / bpm

      return (
        <motion.div
          className={`relative ${className}`}
          animate={{
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: beatDuration,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        >
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-pink-400"
              animate={{
                scale: [1, 2, 2.5],
                opacity: [0.8, 0.3, 0],
              }}
              transition={{
                duration: beatDuration,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          </div>
        </motion.div>
      )

    case 'analogue':
      // Soft brushstroke signature
      return (
        <motion.div
          className={`font-serif italic text-amber-600 ${className}`}
          style={{
            textShadow: '0 1px 3px rgba(245, 158, 11, 0.3)',
          }}
          animate={{
            opacity: [0.7 + activity * 0.2, 0.9, 0.7 + activity * 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          ~signal
        </motion.div>
      )

    default:
      return null
  }
}
