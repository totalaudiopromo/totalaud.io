'use client'

/**
 * Demo Overlay - Phase 29 Polished
 * Shows demo progress, controls, and director playback controls
 * Uses design tokens for cohesive styling
 */

import { useDemo } from './DemoOrchestrator'
import { useOptionalDirector } from './director/DirectorProvider'
import { useOptionalAmbient } from '../ambient/AmbientEngineProvider'
import { MuteToggle } from './MuteToggle'
import { Play, Pause, SkipForward, Square, ChevronLeft, ChevronRight, RotateCcw, Home } from 'lucide-react'
import Link from 'next/link'
import { colours, radii, spacing, shadows } from '@/styles/tokens'
import { transitions, duration } from '@/styles/motion'

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

  const handleReplayDemo = () => {
    if (!director) return

    // Reset to beginning
    director.stop()

    // Restart after brief pause
    setTimeout(() => {
      director.start()
    }, 300)
  }

  // Check if demo is complete (progress === 1)
  const isDemoComplete = director && director.isEnabled && director.progress >= 1

  return (
    <>
      {/* Vignette effect when demo is active */}
      {director && director.isEnabled && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, transparent 40%, rgba(0, 0, 0, 0.4) 100%)',
            zIndex: 45,
            transition: transitions.opacity,
          }}
        />
      )}

      {/* Dimming overlay when paused */}
      {director && director.isEnabled && !director.isPlaying && !isDemoComplete && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(2px)',
            zIndex: 45,
            transition: transitions.opacity,
          }}
        />
      )}

      {/* Main overlay panel */}
      <div
        className="fixed bottom-0 left-0 right-0 pointer-events-none"
        style={{ zIndex: 50 }}
      >
        <div
          className="max-w-7xl mx-auto"
          style={{
            paddingLeft: spacing[6],
            paddingRight: spacing[6],
            paddingBottom: spacing[6],
          }}
        >
          <div
            className="pointer-events-auto"
            style={{
              backgroundColor: 'rgba(15, 17, 19, 0.95)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${colours.border}`,
              borderRadius: radii.lg,
              boxShadow: shadows.medium,
            }}
          >
            {/* Animated progress bar */}
            {director && director.isEnabled && (
              <div
                style={{
                  height: '2px',
                  backgroundColor: colours.border,
                  borderTopLeftRadius: radii.lg,
                  borderTopRightRadius: radii.lg,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${director.progress * 100}%`,
                    background: `linear-gradient(90deg, ${colours.accent} 0%, ${colours.glow} 100%)`,
                    boxShadow: shadows.glow,
                    transition: `width ${duration.medium}s cubic-bezier(0.22, 1, 0.36, 1)`,
                  }}
                />
              </div>
            )}

            <div style={{ padding: spacing[4] }}>
              {/* Step info */}
              <div className="flex items-start justify-between" style={{ marginBottom: spacing[3] }}>
                <div className="flex-1">
                  <div className="flex items-center gap-2" style={{ marginBottom: spacing[1] }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'ui-monospace, monospace',
                        color: colours.foregroundSubtle,
                        letterSpacing: '0.05em',
                      }}
                    >
                      STEP {activeStepIndex + 1}/{demo.activeStepIndex + 1}
                    </span>
                    <span style={{ fontSize: '11px', color: colours.foregroundFaint }}>•</span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'ui-monospace, monospace',
                        color: colours.accent,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {activeStep.osSlug}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: colours.foreground,
                      lineHeight: '1.3',
                    }}
                  >
                    {activeStep.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '14px',
                      color: colours.foregroundMuted,
                      lineHeight: '1.5',
                    }}
                  >
                    {activeStep.description}
                  </p>

                  {/* Director note */}
                  {director && director.isEnabled && note && (
                    <p
                      style={{
                        fontSize: '12px',
                        color: colours.accent,
                        marginTop: spacing[2],
                        fontStyle: 'italic',
                        opacity: 0.9,
                      }}
                    >
                      {note}
                    </p>
                  )}
                </div>

                {/* Manual navigation (only when not playing) */}
                {!director?.isPlaying && !isDemoComplete && (
                  <div className="flex items-center gap-2" style={{ marginLeft: spacing[4] }}>
                    <button
                      onClick={previousStep}
                      disabled={activeStepIndex === 0}
                      className="hover:bg-accent/10 disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Previous step"
                      style={{
                        padding: spacing[2],
                        borderRadius: radii.sm,
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        transition: transitions.colors,
                      }}
                    >
                      <ChevronLeft className="w-4 h-4" style={{ color: colours.foreground }} />
                    </button>
                    <button
                      onClick={nextStep}
                      disabled={activeStepIndex === demo.activeStepIndex}
                      className="hover:bg-accent/10 disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Next step"
                      style={{
                        padding: spacing[2],
                        borderRadius: radii.sm,
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        transition: transitions.colors,
                      }}
                    >
                      <ChevronRight className="w-4 h-4" style={{ color: colours.foreground }} />
                    </button>
                  </div>
                )}
              </div>

              {/* Director controls */}
              {director && (
                <div
                  className="flex items-center gap-2"
                  style={{
                    paddingTop: spacing[3],
                    borderTop: `1px solid ${colours.border}`,
                  }}
                >
                  {!director.isEnabled ? (
                    // Play Demo button (initial state)
                    <>
                      <button
                        onClick={handlePlayDemo}
                        className="hover:opacity-90"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: spacing[2],
                          padding: `${spacing[2]} ${spacing[4]}`,
                          backgroundColor: colours.accent,
                          color: colours.background,
                          borderRadius: radii.md,
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: '500',
                          fontSize: '14px',
                          transition: transitions.opacity,
                        }}
                      >
                        <Play className="w-4 h-4" />
                        Play Demo
                      </button>
                      <Link
                        href="/demo"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: spacing[2],
                          padding: `${spacing[2]} ${spacing[3]}`,
                          border: `1px solid ${colours.border}`,
                          borderRadius: radii.md,
                          fontSize: '14px',
                          color: colours.foreground,
                          textDecoration: 'none',
                          transition: transitions.colors,
                          marginLeft: 'auto',
                        }}
                        className="hover:bg-accent/10"
                      >
                        <Home className="w-4 h-4" />
                        Back to Demos
                      </Link>
                    </>
                  ) : isDemoComplete ? (
                    // Demo complete state - Replay + Exit
                    <>
                      <button
                        onClick={handleReplayDemo}
                        className="hover:bg-accent/10"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: spacing[2],
                          padding: `${spacing[2]} ${spacing[4]}`,
                          border: `1px solid ${colours.accent}`,
                          borderRadius: radii.md,
                          background: 'transparent',
                          color: colours.accent,
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500',
                          transition: transitions.colors,
                        }}
                      >
                        <RotateCcw className="w-4 h-4" />
                        Replay Demo
                      </button>
                      <Link
                        href="/demo"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: spacing[2],
                          padding: `${spacing[2]} ${spacing[3]}`,
                          border: `1px solid ${colours.border}`,
                          borderRadius: radii.md,
                          fontSize: '14px',
                          color: colours.foreground,
                          textDecoration: 'none',
                          transition: transitions.colors,
                        }}
                        className="hover:bg-accent/10"
                      >
                        <Home className="w-4 h-4" />
                        Back to Demos
                      </Link>
                      <span
                        style={{
                          marginLeft: 'auto',
                          fontSize: '11px',
                          color: colours.foregroundSubtle,
                          fontFamily: 'ui-monospace, monospace',
                        }}
                      >
                        ✓ Complete
                      </span>

                      {/* Mute toggle */}
                      {ambient && (
                        <MuteToggle isMuted={ambient.isMuted} onToggle={ambient.toggleMute} />
                      )}
                    </>
                  ) : (
                    // Active playback controls
                    <>
                      {/* Pause/Resume */}
                      {director.isPlaying ? (
                        <button
                          onClick={handlePauseDemo}
                          className="hover:bg-accent/10"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: spacing[2],
                            padding: `${spacing[2]} ${spacing[3]}`,
                            border: `1px solid ${colours.border}`,
                            borderRadius: radii.md,
                            background: 'transparent',
                            color: colours.foreground,
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: transitions.colors,
                          }}
                        >
                          <Pause className="w-4 h-4" />
                          Pause
                        </button>
                      ) : (
                        <button
                          onClick={handleResumeDemo}
                          className="hover:bg-accent/10"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: spacing[2],
                            padding: `${spacing[2]} ${spacing[3]}`,
                            border: `1px solid ${colours.accent}`,
                            borderRadius: radii.md,
                            background: 'transparent',
                            color: colours.accent,
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: transitions.colors,
                          }}
                        >
                          <Play className="w-4 h-4" />
                          Resume
                        </button>
                      )}

                      {/* Skip */}
                      <button
                        onClick={handleSkipNext}
                        className="hover:bg-accent/10"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: spacing[2],
                          padding: `${spacing[2]} ${spacing[3]}`,
                          border: `1px solid ${colours.border}`,
                          borderRadius: radii.md,
                          background: 'transparent',
                          color: colours.foreground,
                          cursor: 'pointer',
                          fontSize: '14px',
                          transition: transitions.colors,
                        }}
                      >
                        <SkipForward className="w-4 h-4" />
                        Skip
                      </button>

                      {/* Stop */}
                      <button
                        onClick={handleStopDemo}
                        className="hover:bg-red-500/10"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: spacing[2],
                          padding: `${spacing[2]} ${spacing[3]}`,
                          border: `1px solid ${colours.border}`,
                          borderRadius: radii.md,
                          background: 'transparent',
                          color: colours.error,
                          cursor: 'pointer',
                          fontSize: '14px',
                          transition: transitions.colors,
                        }}
                      >
                        <Square className="w-3 h-3" />
                        Stop
                      </button>

                      {/* Progress text */}
                      <span
                        style={{
                          marginLeft: 'auto',
                          fontSize: '11px',
                          color: colours.foregroundSubtle,
                          fontFamily: 'ui-monospace, monospace',
                        }}
                      >
                        {director.currentIndex + 1} / {director.totalActions} steps
                      </span>

                      {/* Mute toggle */}
                      {ambient && (
                        <MuteToggle isMuted={ambient.isMuted} onToggle={ambient.toggleMute} />
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
