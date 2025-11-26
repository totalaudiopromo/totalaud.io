'use client'

import { motion } from 'framer-motion'

interface ScoutProgressProps {
  currentStep: number
  totalSteps: number
}

const stepLabels = ['Track', 'Genre', 'Goals', 'Scout', 'Results']

export function ScoutProgress({ currentStep, totalSteps }: ScoutProgressProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSteps }).map((_, i) => {
        const isComplete = i < currentStep
        const isCurrent = i === currentStep

        return (
          <div key={i} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <motion.div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold ${
                  isComplete
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : isCurrent
                      ? 'bg-sky-500/20 text-sky-400 ring-1 ring-sky-500/50'
                      : 'bg-slate-800 text-slate-500'
                }`}
                initial={false}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                }}
                transition={{ duration: 0.12 }}
              >
                {isComplete ? '✓' : i + 1}
              </motion.div>
              <span
                className={`text-[9px] uppercase tracking-[0.12em] ${
                  isCurrent ? 'text-slate-200' : 'text-slate-500'
                }`}
              >
                {stepLabels[i]}
              </span>
            </div>

            {i < totalSteps - 1 && (
              <div className={`h-px w-8 ${isComplete ? 'bg-emerald-500/40' : 'bg-slate-700'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
