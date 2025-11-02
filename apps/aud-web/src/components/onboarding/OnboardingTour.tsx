/**
 * OnboardingTour Component
 * Phase 14.1: Cinematic guided tour for first-time users
 *
 * Features:
 * - Full-screen overlay with FlowCore grain effect
 * - 5-step walkthrough of key features
 * - Keyboard navigation (Escape to skip, Tab, arrows)
 * - Accessibility compliant (WCAG AA)
 * - Ambient sound layer with transition effects
 */

'use client'

import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { onboardingCopy, onboardingActions } from '@/constants/onboardingCopy'
import { useHighlight } from '@/hooks/useHighlight'
import { useOnboardingAudio } from '@/hooks/useOnboardingAudio'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { flowCoreColours, flowCoreMotion } from '@aud-web/constants/flowCoreColours'

export function OnboardingTour() {
  const { isOnboardingActive, endOnboarding, currentStep, setCurrentStep, totalSteps } = useOnboarding()
  const prefersReducedMotion = useReducedMotion()

  const currentStepData = onboardingCopy[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === totalSteps - 1

  // Highlight hook for current step
  const { bounds, transitionDuration } = useHighlight({
    selector: currentStepData?.targetSelector,
    enabled: isOnboardingActive && !!currentStepData?.targetSelector,
    padding: 12,
  })

  // Audio layer
  const { playTransitionSound, playSuccessSound } = useOnboardingAudio({
    enabled: isOnboardingActive,
    volume: 0.12,
  })

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOnboardingActive) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault()
          endOnboarding()
          break
        case 'ArrowRight':
          e.preventDefault()
          if (!isLastStep) {
            playTransitionSound()
            setCurrentStep(currentStep + 1)
          }
          break
        case 'ArrowLeft':
          e.preventDefault()
          if (!isFirstStep) {
            playTransitionSound()
            setCurrentStep(currentStep - 1)
          }
          break
        case 'Enter':
          e.preventDefault()
          if (isLastStep) {
            playSuccessSound()
            endOnboarding()
          } else {
            playTransitionSound()
            setCurrentStep(currentStep + 1)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    isOnboardingActive,
    currentStep,
    isFirstStep,
    isLastStep,
    endOnboarding,
    setCurrentStep,
    playTransitionSound,
    playSuccessSound,
  ])

  const handleNext = useCallback(() => {
    if (isLastStep) {
      playSuccessSound()
      endOnboarding()
    } else {
      playTransitionSound()
      setCurrentStep(currentStep + 1)
    }
  }, [currentStep, isLastStep, setCurrentStep, endOnboarding, playTransitionSound, playSuccessSound])

  const handlePrevious = useCallback(() => {
    if (!isFirstStep) {
      playTransitionSound()
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep, isFirstStep, setCurrentStep, playTransitionSound])

  const handleSkip = useCallback(() => {
    endOnboarding()
  }, [endOnboarding])

  // Animation duration based on reduced motion preference
  const animDuration = prefersReducedMotion ? 0 : flowCoreMotion.normal / 1000

  if (!isOnboardingActive) return null

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(12px)',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        aria-describedby="onboarding-description"
      >
        {/* Background grain effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
            opacity: 0.05,
          }}
        />

        {/* Element highlight */}
        {bounds && (
          <motion.div
            className="absolute pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: transitionDuration / 1000 }}
            style={{
              top: bounds.top,
              left: bounds.left,
              width: bounds.width,
              height: bounds.height,
              border: `3px solid ${flowCoreColours.iceCyan}`,
              borderRadius: '8px',
              boxShadow: `0 0 40px ${flowCoreColours.iceCyan}80`,
            }}
          />
        )}

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: animDuration }}
          className="relative max-w-lg w-full mx-4"
          style={{
            backgroundColor: flowCoreColours.darkGrey,
            border: `1px solid ${flowCoreColours.borderGrey}`,
            borderRadius: '12px',
            padding: '32px',
            boxShadow: `0 0 60px -20px ${flowCoreColours.slateCyan}`,
          }}
        >
          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 rounded-lg transition-colors"
            style={{
              color: flowCoreColours.textTertiary,
              border: `1px solid ${flowCoreColours.borderGrey}`,
            }}
            aria-label="Skip tour"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Step indicator */}
          <div
            className="flex gap-2 mb-6"
            role="progressbar"
            aria-valuenow={currentStep + 1}
            aria-valuemin={1}
            aria-valuemax={totalSteps}
          >
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className="h-1 flex-1 rounded-full transition-colors"
                style={{
                  backgroundColor:
                    index <= currentStep ? flowCoreColours.slateCyan : flowCoreColours.mediumGrey,
                  transitionDuration: `${flowCoreMotion.fast}ms`,
                }}
              />
            ))}
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: animDuration }}
            >
              <h2
                id="onboarding-title"
                className="text-2xl font-semibold mb-4 lowercase"
                style={{
                  color: flowCoreColours.slateCyan,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {currentStepData.title}
              </h2>

              <p
                id="onboarding-description"
                className="text-base mb-8 lowercase"
                style={{
                  color: flowCoreColours.textSecondary,
                  fontFamily: 'var(--font-sans)',
                  lineHeight: '1.6',
                }}
              >
                {currentStepData.text}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-4">
            {/* Previous button */}
            <button
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all lowercase"
              style={{
                color: isFirstStep ? flowCoreColours.textDisabled : flowCoreColours.textSecondary,
                border: `1px solid ${isFirstStep ? flowCoreColours.mediumGrey : flowCoreColours.borderGrey}`,
                fontFamily: 'var(--font-mono)',
                fontSize: '14px',
                cursor: isFirstStep ? 'not-allowed' : 'pointer',
                opacity: isFirstStep ? 0.5 : 1,
              }}
              aria-label="Previous step"
            >
              <ArrowLeft className="w-4 h-4" />
              {onboardingActions.previous}
            </button>

            {/* Step counter */}
            <div
              className="text-sm lowercase"
              style={{
                color: flowCoreColours.textTertiary,
                fontFamily: 'var(--font-mono)',
              }}
            >
              {currentStep + 1} / {totalSteps}
            </div>

            {/* Next/Finish button */}
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 rounded-lg transition-all lowercase font-semibold"
              style={{
                backgroundColor: flowCoreColours.slateCyan,
                color: flowCoreColours.matteBlack,
                fontFamily: 'var(--font-mono)',
                fontSize: '14px',
                boxShadow: `0 0 20px -5px ${flowCoreColours.slateCyan}`,
              }}
              aria-label={isLastStep ? 'Finish tour' : 'Next step'}
            >
              {isLastStep ? (
                <>
                  <Check className="w-4 h-4" />
                  {onboardingActions.finish}
                </>
              ) : (
                <>
                  {onboardingActions.next}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Keyboard hints */}
          <div
            className="mt-6 pt-4 border-t text-xs lowercase text-center"
            style={{
              borderColor: flowCoreColours.borderGrey,
              color: flowCoreColours.textTertiary,
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span>↑↓ navigate</span> · <span>↵ continue</span> · <span>esc skip</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
