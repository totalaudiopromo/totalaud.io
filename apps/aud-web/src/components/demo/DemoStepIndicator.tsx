'use client'

import { DEMO_ACTIVE_STEPS } from './DemoScript'
import { useDemo } from './DemoOrchestrator'

export function DemoStepIndicator() {
  const { activeStep, goToStep } = useDemo()

  const activeIndex = DEMO_ACTIVE_STEPS.findIndex((step) => step.id === activeStep.id)

  return (
    <div className="flex items-center gap-2">
      <div className="hidden text-[11px] uppercase tracking-[0.18em] text-slate-400/80 sm:block">
        step{' '}
        {activeIndex === -1
          ? DEMO_ACTIVE_STEPS.length
          : Math.max(1, activeIndex + 1)}
        /{DEMO_ACTIVE_STEPS.length}
      </div>
      <div className="flex items-center gap-1">
        {DEMO_ACTIVE_STEPS.map((step) => {
          const isActive = step.id === activeStep.id
          return (
            <button
              key={step.id}
              type="button"
              className={`h-2 w-2 rounded-full transition-colors ${
                isActive ? 'bg-sky-400' : 'bg-slate-500/60'
              }`}
              onClick={() => goToStep(step.id)}
            />
          )
        })}
      </div>
    </div>
  )
}


