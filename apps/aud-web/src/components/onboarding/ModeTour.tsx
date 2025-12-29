/**
 * ModeTour Component
 *
 * First-visit tour for each workspace mode.
 * Shows 3-4 step spotlight tour highlighting key elements.
 * Persists hasSeenTour_{mode} in localStorage.
 *
 * Usage:
 *   <ModeTour mode="ideas" />
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'

type WorkspaceMode = 'ideas' | 'scout' | 'timeline' | 'pitch'

interface TourStep {
  title: string
  description: string
  highlight?: string // CSS selector to highlight (optional)
}

interface ModeTourProps {
  mode: WorkspaceMode
  onComplete?: () => void
}

// Tour content for each mode
const TOUR_CONTENT: Record<WorkspaceMode, TourStep[]> = {
  ideas: [
    {
      title: 'Welcome to Ideas',
      description:
        'This is your creative space. Capture lyrics, melodies, marketing ideas, or anything that sparks inspiration.',
    },
    {
      title: 'Add Ideas',
      description:
        'Click the + button or double-click anywhere on the canvas to create a new idea card.',
    },
    {
      title: 'Organise with Tags',
      description:
        'Use the filter buttons to organise by content type: Content, Brand, Music, or Promo.',
    },
    {
      title: 'Switch Views',
      description:
        "Toggle between Canvas view for spatial thinking or List view for a structured overview. You're all set!",
    },
  ],
  scout: [
    {
      title: 'Welcome to Scout',
      description:
        'Discover real opportunities - playlists, blogs, radio stations, and press contacts.',
    },
    {
      title: 'Filter Opportunities',
      description: 'Use the filters to narrow down by type (playlist, radio, blog) or genre.',
    },
    {
      title: 'Add to Timeline',
      description: 'Click the + button on any opportunity card to add it to your release timeline.',
    },
    {
      title: 'Preview Details',
      description:
        'Click any card to see full details, contact info, and submission guidelines. Happy scouting!',
    },
  ],
  timeline: [
    {
      title: 'Welcome to Timeline',
      description:
        'Plan your release with a visual calendar. Drag and drop to organise your activities.',
    },
    {
      title: 'Five Swim Lanes',
      description: 'Organise tasks into Pre-release, Release, Promo, Content, and Analytics lanes.',
    },
    {
      title: 'Drag to Reschedule',
      description: 'Drag events horizontally to change dates, or vertically to change lanes.',
    },
    {
      title: 'Next Steps',
      description:
        "Check the sidebar to see your upcoming deadlines at a glance. You're ready to plan!",
    },
  ],
  pitch: [
    {
      title: 'Welcome to Pitch',
      description: 'Craft compelling pitches for radio, press, and playlists with AI coaching.',
    },
    {
      title: 'Choose a Template',
      description: 'Start with Radio, Press, Playlist, or Custom pitch templates.',
    },
    {
      title: 'Fill in Sections',
      description:
        "Complete each section - Hook, Story, Sound, Proof Points, and The Ask. They're designed to flow naturally.",
    },
    {
      title: 'AI Coach',
      description:
        "Click 'Get coaching' on any section for AI-powered suggestions to improve your pitch. Good luck!",
    },
  ],
}

const STORAGE_KEY_PREFIX = 'ta_tour_seen_'

export function ModeTour({ mode, onComplete }: ModeTourProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const steps = TOUR_CONTENT[mode]
  const storageKey = `${STORAGE_KEY_PREFIX}${mode}`

  // Check if tour has been seen
  useEffect(() => {
    // Small delay to let the page load first
    const timer = setTimeout(() => {
      const hasSeen = localStorage.getItem(storageKey)
      if (!hasSeen) {
        setIsVisible(true)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [storageKey])

  const handleDismiss = useCallback(() => {
    localStorage.setItem(storageKey, 'true')
    setIsVisible(false)
    onComplete?.()
  }, [storageKey, onComplete])

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      handleDismiss()
    }
  }, [currentStep, steps.length, handleDismiss])

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }, [currentStep])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isVisible) return
      if (e.key === 'Escape') handleDismiss()
      if (e.key === 'ArrowRight' || e.key === 'Enter') handleNext()
      if (e.key === 'ArrowLeft') handlePrev()
    },
    [isVisible, handleDismiss, handleNext, handlePrev]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!isVisible) {
    return null
  }

  const step = steps[currentStep]
  const isLast = currentStep === steps.length - 1

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            onClick={handleDismiss}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              zIndex: 1000,
            }}
          />

          {/* Tour Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: 400,
              backgroundColor: '#1A1D21',
              borderRadius: 16,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              zIndex: 1001,
              overflow: 'hidden',
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tour-title"
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              {/* Step indicators */}
              <div style={{ display: 'flex', gap: 6 }}>
                {steps.map((_, index) => (
                  <div
                    key={index}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor:
                        index === currentStep
                          ? '#3AA9BE'
                          : index < currentStep
                            ? 'rgba(58, 169, 190, 0.4)'
                            : 'rgba(255, 255, 255, 0.15)',
                      transition: 'background-color 0.2s ease',
                    }}
                  />
                ))}
              </div>

              {/* Dismiss button */}
              <button
                onClick={handleDismiss}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.4)',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
                aria-label="Dismiss tour"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                style={{ padding: '24px 20px' }}
              >
                <h2
                  id="tour-title"
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: '#F7F8F9',
                    margin: '0 0 8px 0',
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  }}
                >
                  {step.title}
                </h2>
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: 'rgba(255, 255, 255, 0.6)',
                    margin: 0,
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  }}
                >
                  {step.description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              {/* Skip button */}
              <button
                onClick={handleDismiss}
                style={{
                  fontSize: 13,
                  color: 'rgba(255, 255, 255, 0.4)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px 0',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                }}
              >
                Skip tour
              </button>

              {/* Navigation buttons */}
              <div style={{ display: 'flex', gap: 8 }}>
                {currentStep > 0 && (
                  <button
                    onClick={handlePrev}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '8px 14px',
                      fontSize: 13,
                      fontWeight: 500,
                      color: 'rgba(255, 255, 255, 0.6)',
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'all 0.12s ease',
                      fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                    }}
                  >
                    <ChevronLeft size={14} />
                    Back
                  </button>
                )}

                <button
                  onClick={handleNext}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '8px 16px',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#0F1113',
                    backgroundColor: '#3AA9BE',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  }}
                >
                  {isLast ? 'Got it' : 'Next'}
                  {!isLast && <ChevronRight size={14} />}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/**
 * Reset tour for a specific mode (useful for testing)
 */
export function resetModeTour(mode: WorkspaceMode) {
  localStorage.removeItem(`${STORAGE_KEY_PREFIX}${mode}`)
}

/**
 * Reset all mode tours
 */
export function resetAllModeTours() {
  const modes: WorkspaceMode[] = ['ideas', 'scout', 'timeline', 'pitch']
  modes.forEach((mode) => localStorage.removeItem(`${STORAGE_KEY_PREFIX}${mode}`))
}
