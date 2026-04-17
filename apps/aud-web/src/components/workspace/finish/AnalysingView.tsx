/**
 * AnalysingView
 *
 * Multi-step animated progress during audio analysis.
 * Simulates step progression on a timer since the backend
 * returns all results in one response.
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

interface AnalysingViewProps {
  fileName: string | null
  done?: boolean
}

const STEPS = [
  'Reading audio file',
  'Measuring loudness',
  'Checking dynamics',
  'Analysing stereo image',
  'Scanning spectral balance',
  'Generating finishing notes',
] as const

const STEP_INTERVAL = 1400

function StepIcon({ status }: { status: 'pending' | 'active' | 'complete' }) {
  if (status === 'complete') {
    return (
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className="w-5 h-5 rounded-full bg-ta-cyan/20 flex items-center justify-center flex-shrink-0"
      >
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="text-ta-cyan">
          <path
            d="M2 6l3 3 5-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    )
  }

  if (status === 'active') {
    return (
      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
        <motion.div
          className="w-2.5 h-2.5 rounded-full bg-ta-cyan"
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    )
  }

  return (
    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
      <div className="w-1.5 h-1.5 rounded-full bg-ta-white/15" />
    </div>
  )
}

export function AnalysingView({ fileName, done = false }: AnalysingViewProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleNext = useCallback(() => {
    timerRef.current = setTimeout(() => {
      setCurrentStep((prev) => {
        const next = prev + 1
        if (next >= STEPS.length - 1) return STEPS.length - 1
        return next
      })
    }, STEP_INTERVAL)
  }, [])

  useEffect(() => {
    if (done) {
      setCurrentStep(STEPS.length)
      return
    }

    scheduleNext()

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [done, scheduleNext])

  // Chain: schedule next timeout when step advances (but not at final step)
  useEffect(() => {
    if (!done && currentStep > 0 && currentStep < STEPS.length - 1) {
      scheduleNext()
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [currentStep, done, scheduleNext])

  const progress = done ? 100 : Math.min(((currentStep + 1) / STEPS.length) * 100, 95)

  return (
    <div className="flex items-center justify-center h-full">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-xs space-y-6"
      >
        <div className="w-full h-px bg-ta-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-ta-cyan/60 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        <div className="space-y-1">
          {STEPS.map((label, i) => {
            const status =
              done || i < currentStep ? 'complete' : i === currentStep ? 'active' : 'pending'

            return (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.24,
                  delay: i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex items-center gap-3 py-1.5"
              >
                <StepIcon status={status} />
                <span
                  className={`text-xs transition-colors duration-300 ${
                    status === 'active'
                      ? 'text-ta-white/80'
                      : status === 'complete'
                        ? 'text-ta-cyan/60'
                        : 'text-ta-white/20'
                  }`}
                >
                  {label}
                </span>
              </motion.div>
            )
          })}
        </div>

        {fileName && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-[10px] text-ta-white/20 font-mono truncate text-center"
          >
            {fileName}
          </motion.p>
        )}
      </motion.div>
    </div>
  )
}
