'use client'

/**
 * Demo Overlay
 * Shows demo progress, controls, and director playback controls
 */

import { useDemo } from './DemoOrchestrator'
import { useOptionalDirector } from './director/DirectorProvider'
import { useOptionalAmbient } from '../ambient/AmbientEngineProvider'
import { Play, Pause, SkipForward, Square, ChevronLeft, ChevronRight } from 'lucide-react'

export function DemoOverlay() {
  const demo = useDemo()
  const director = useOptionalDirector()
  const ambient = useOptionalAmbient()

  const { activeStep, activeStepIndex, note, nextStep, previousStep } = demo

  const handlePlayDemo = () => {
    if (!director) return

    // Boost ambient slightly for cinematic feel
    if (ambient) {
      const currentIntensity = ambient.intensity
      if (currentIntensity < 0.6) {
        ambient.setIntensity(Math.max(currentIntensity, 0.6))
      }
    }

    director.start()
  }

  const handlePauseDemo = () => {
    director?.pause()
  }

  const handleResumeDemo = () => {
    director?.resume()
  }

  const handleStopDemo = () => {
    director?.stop()

    // Reset ambient to a neutral value
    if (ambient) {
      ambient.setIntensity(0.5)
    }
  }

  const handleSkipNext = () => {
    director?.skipToNext()
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg pointer-events-auto">
          {/* Progress bar */}
          {director && director.isEnabled && (
            <div className="h-1 bg-border/30 rounded-t-lg overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${director.progress * 100}%` }}
              />
            </div>
          )}

          <div className="p-4">
            {/* Step info */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-centre gap-2 mb-1">
                  <span className="text-xs font-mono text-foreground/60">
                    STEP {activeStepIndex + 1}/{demo.activeStepIndex + 1}
                  </span>
                  <span className="text-xs text-foreground/40">•</span>
                  <span className="text-xs font-mono text-accent">{activeStep.osSlug}</span>
                </div>
                <h3 className="text-lg font-bold text-foreground">{activeStep.title}</h3>
                <p className="text-sm text-foreground/70">{activeStep.description}</p>

                {/* Director note */}
                {director && director.isEnabled && note && (
                  <p className="text-xs text-accent/80 mt-2 italic">{note}</p>
                )}
              </div>

              {/* Manual navigation */}
              {!director?.isPlaying && (
                <div className="flex items-centre gap-2 ml-4">
                  <button
                    onClick={previousStep}
                    disabled={activeStepIndex === 0}
                    className="p-2 rounded hover:bg-accent/10 transition-colours disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Previous step"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={activeStepIndex === demo.activeStepIndex}
                    className="p-2 rounded hover:bg-accent/10 transition-colours disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Next step"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Director controls */}
            {director && (
              <div className="flex items-centre gap-2 pt-3 border-t border-border/50">
                {!director.isEnabled ? (
                  // Play Demo button
                  <button
                    onClick={handlePlayDemo}
                    className="flex items-centre gap-2 px-4 py-2 bg-accent text-background rounded hover:bg-accent/90 transition-colours font-medium text-sm"
                  >
                    <Play className="w-4 h-4" />
                    Play Demo
                  </button>
                ) : (
                  <>
                    {/* Pause/Resume */}
                    {director.isPlaying ? (
                      <button
                        onClick={handlePauseDemo}
                        className="flex items-centre gap-2 px-3 py-2 border border-border rounded hover:bg-accent/10 transition-colours text-sm"
                      >
                        <Pause className="w-4 h-4" />
                        Pause
                      </button>
                    ) : (
                      <button
                        onClick={handleResumeDemo}
                        className="flex items-centre gap-2 px-3 py-2 border border-accent rounded hover:bg-accent/10 transition-colours text-sm text-accent"
                      >
                        <Play className="w-4 h-4" />
                        Resume
                      </button>
                    )}

                    {/* Skip */}
                    <button
                      onClick={handleSkipNext}
                      className="flex items-centre gap-2 px-3 py-2 border border-border rounded hover:bg-accent/10 transition-colours text-sm"
                    >
                      <SkipForward className="w-4 h-4" />
                      Skip
                    </button>

                    {/* Stop */}
                    <button
                      onClick={handleStopDemo}
                      className="flex items-centre gap-2 px-3 py-2 border border-border rounded hover:bg-destructive/10 transition-colours text-sm text-destructive"
                    >
                      <Square className="w-3 h-3" />
                      Stop
                    </button>

                    {/* Progress text */}
                    <span className="ml-auto text-xs text-foreground/60 font-mono">
                      {director.currentIndex + 1} / {director.currentIndex + 1} actions
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
