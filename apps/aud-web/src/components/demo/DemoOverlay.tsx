'use client'

import { useDemo } from './DemoOrchestrator'
import { DEMO_STEPS } from './DemoScript'
import { DemoStepIndicator } from './DemoStepIndicator'
import { useOptionalDirector } from './director/DirectorProvider'
import { DIRECTOR_SCRIPT } from './director/directorScript'
import { useOptionalNarrative } from '@/components/narrative/useNarrative'

export function DemoOverlay() {
  const { activeStep, nextStep, prevStep, exitDemo } = useDemo()
  const director = useOptionalDirector()
  const narrative = useOptionalNarrative()
  const beat = narrative?.activeBeat ?? null

  const currentIndex = DEMO_STEPS.findIndex((step) => step.id === activeStep.id)
  const directorProgress =
    director && DIRECTOR_SCRIPT.length > 0
      ? Math.min(1, director.currentIndex / DIRECTOR_SCRIPT.length)
      : 0

  const handleNext = () => {
    nextStep()
  }

  const handleBack = () => {
    prevStep()
  }

  const handlePlayPause = () => {
    if (!director) return
    if (!director.isEnabled) {
      director.start()
      return
    }
    if (director.isPlaying) {
      director.pause()
    } else {
      director.resume()
    }
  }

  const handleStopDirector = () => {
    director?.stop()
  }

  const handleSkipDirector = () => {
    director?.skipToNext()
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-between">
      {/* Header label */}
      <div className="flex items-start justify-between px-4 pt-4 sm:px-6">
        <div className="rounded-full border border-white/10 bg-black/70 px-3 py-1 text-[11px] font-medium text-slate-50 shadow-lg shadow-black/60 backdrop-blur-sm">
          <span className="uppercase tracking-[0.18em] text-slate-400">
            totalaud.io
          </span>{' '}
          <span className="text-slate-100/90">— Artist journey: </span>
          <span className="font-semibold text-slate-50">LANA GLASS</span>
        </div>
      </div>

      {/* Bottom narrative panel */}
      <div className="flex justify-center pb-4 sm:pb-6">
        <div className="pointer-events-auto w-full max-w-xl rounded-2xl border border-white/10 bg-black/70 px-4 py-3 text-xs text-slate-100 shadow-2xl shadow-black/70 backdrop-blur-sm sm:px-6 sm:py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold tracking-wide text-slate-50">
                {beat?.title ?? activeStep.title}
              </h2>
              <p className="text-[12px] leading-relaxed text-slate-200/90">
                {beat?.body ?? activeStep.description}
              </p>
              {activeStep.helpText && (
                <p className="text-[11px] leading-relaxed text-slate-300/90">
                  {activeStep.helpText}
                </p>
              )}
              {beat?.choices && beat.choices.length > 0 && narrative && (
                <div className="mt-1 flex flex-wrap gap-2">
                  {beat.choices.map((choice) => (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => {
                        narrative.chooseChoice(choice)
                      }}
                      className="rounded-full border border-sky-400/80 bg-sky-500/20 px-3 py-1 text-[11px] font-medium text-sky-50 shadow-sm shadow-sky-500/30 transition-colors hover:bg-sky-500/35"
                    >
                      {choice.label}
                    </button>
                  ))}
                </div>
              )}
              {director?.note && (
                <p className="text-[11px] leading-relaxed text-slate-200">
                  {director.note}
                </p>
              )}
            </div>

            {currentIndex >= 0 && (
              <div className="hidden text-right text-[10px] uppercase tracking-[0.18em] text-slate-400/80 sm:block">
                <div>demo mode</div>
                <div className="mt-1">
                  step {currentIndex + 1}/{DEMO_STEPS.length}
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <DemoStepIndicator />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exitDemo}
                className="hidden items-center rounded-full border border-slate-600/70 bg-black/40 px-3 py-1.5 text-[11px] font-medium text-slate-200/90 shadow-sm shadow-black/50 transition-colors hover:border-slate-200/80 sm:inline-flex"
              >
                Exit demo
              </button>
              {director && (
                <>
                  <button
                    type="button"
                    onClick={handlePlayPause}
                    className="inline-flex items-center rounded-full border border-slate-600/70 bg-black/40 px-3 py-1.5 text-[11px] font-medium text-slate-100/90 shadow-sm shadow-black/50 transition-colors hover:border-slate-200/80"
                  >
                    {director.isEnabled && director.isPlaying ? 'Pause' : 'Play demo'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSkipDirector}
                    className="inline-flex items-center rounded-full border border-slate-600/70 bg-black/40 px-2.5 py-1.5 text-[11px] font-medium text-slate-100/90 shadow-sm shadow-black/50 transition-colors hover:border-slate-200/80"
                  >
                    Skip
                  </button>
                  <button
                    type="button"
                    onClick={handleStopDirector}
                    className="inline-flex items-center rounded-full border border-slate-600/70 bg-black/40 px-2.5 py-1.5 text-[11px] font-medium text-slate-100/90 shadow-sm shadow-black/50 transition-colors hover:border-slate-200/80"
                  >
                    Stop
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={handleBack}
                disabled={currentIndex <= 0}
                className="inline-flex items-center rounded-full border border-slate-600/70 bg-black/40 px-3 py-1.5 text-[11px] font-medium text-slate-100/90 shadow-sm shadow-black/50 transition-colors hover:border-slate-200/80 disabled:cursor-not-allowed disabled:border-slate-700/60 disabled:text-slate-500"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center rounded-full border border-sky-400/80 bg-sky-500/30 px-3 py-1.5 text-[11px] font-semibold text-slate-950 shadow-sm shadow-sky-500/40 transition-colors hover:border-sky-200 hover:bg-sky-400/80"
              >
                {activeStep.ctaLabel ?? 'Next'}
              </button>
            </div>
          </div>

          {director && (
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-800/80">
              <div
                className="h-full rounded-full bg-sky-400"
                style={{
                  width: `${Math.round(directorProgress * 100)}%`,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


