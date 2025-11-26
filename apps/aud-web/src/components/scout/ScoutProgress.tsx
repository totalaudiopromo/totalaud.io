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
                className={`flex h-6 w-6 items-center justify-center rounded-[4px] text-[10px] font-semibold ${
                  isComplete
                    ? 'bg-[rgba(73,163,108,0.1)] text-[#49A36C]'
                    : isCurrent
                      ? 'border border-[#3AA9BE]/40 bg-[rgba(58,169,190,0.1)] text-[#3AA9BE]'
                      : 'bg-[#1A1D21] text-[#4B5563]'
                }`}
                initial={false}
                animate={{
                  scale: isCurrent ? 1.05 : 1,
                }}
                transition={{ duration: 0.12 }}
              >
                {isComplete ? '+' : i + 1}
              </motion.div>
              <span
                className={`text-[9px] uppercase tracking-[0.1em] ${
                  isCurrent ? 'text-[#E8EAED]' : isComplete ? 'text-[#6B7280]' : 'text-[#4B5563]'
                }`}
              >
                {stepLabels[i]}
              </span>
            </div>

            {i < totalSteps - 1 && (
              <div className={`h-px w-6 ${isComplete ? 'bg-[#49A36C]/40' : 'bg-[#1F2327]'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
