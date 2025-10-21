/**
 * Onboarding Overlay Component
 *
 * First-time user experience with theme-aware Broker personality.
 * Explains the Flow Studio with animated highlights and contextual tips.
 *
 * Design Principle: "I'm inside an intelligent DAW for my promo campaign."
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, Sparkles } from 'lucide-react'
import { getBrokerPersonality } from '@total-audio/core-agent-executor/client'
import type { OSTheme } from '@aud-web/types/themes'

interface OnboardingOverlayProps {
  theme: OSTheme
  onDismiss: () => void
  reducedMotion?: boolean
}

interface OnboardingStep {
  title: string
  message: string
  highlight?: 'start-node' | 'skills-palette' | 'dashboard-toggle'
  position: { x: number; y: number }
}

const getOnboardingSteps = (theme: OSTheme): OnboardingStep[] => {
  const personality = getBrokerPersonality(theme)

  const stepsByTheme: Record<OSTheme, OnboardingStep[]> = {
    ascii: [
      {
        title: 'SYSTEM ONLINE',
        message: 'Agents initialised. Each block represents an intelligent agent. Press Start to begin orchestration.',
        position: { x: 50, y: 20 },
      },
      {
        title: 'EXECUTE NODE',
        message: 'Select any agent to commence execution. Agents will coordinate autonomously in sequence.',
        highlight: 'start-node',
        position: { x: 30, y: 45 },
      },
      {
        title: 'BUILD FLOW',
        message: 'Drag modules from the palette. Connect nodes. Construct your campaign workflow.',
        highlight: 'skills-palette',
        position: { x: 70, y: 70 },
      },
    ],
    xp: [
      {
        title: 'welcome to totalaud.io flow studio',
        message: 'Everything is set up and ready. Each module below is an agent. Press Start to get your campaign moving.',
        position: { x: 50, y: 20 },
      },
      {
        title: 'Starting Your Campaign',
        message: 'Select any agent to begin. They will work together automatically, handling research and outreach.',
        highlight: 'start-node',
        position: { x: 30, y: 45 },
      },
      {
        title: 'Adding Modules',
        message: 'Drag skills from the right panel to add more steps. Connect them to build your workflow.',
        highlight: 'skills-palette',
        position: { x: 70, y: 70 },
      },
    ],
    aqua: [
      {
        title: 'Welcome to Your Campaign Workspace',
        message: 'Your workspace is ready. Each agent below contributes to your campaign. When you are ready, press Start.',
        position: { x: 50, y: 20 },
      },
      {
        title: 'Press Start',
        message: 'Select any agent to begin. They will coordinate seamlessly, handling research, outreach, and tracking.',
        highlight: 'start-node',
        position: { x: 30, y: 45 },
      },
      {
        title: 'Build Your Flow',
        message: 'Drag skills from the palette. Connect modules. Create your perfect campaign flow.',
        highlight: 'skills-palette',
        position: { x: 70, y: 70 },
      },
    ],
    daw: [
      {
        title: 'session loaded',
        message: 'Each block is a performer in your mix. Hit Start to begin playback.',
        position: { x: 50, y: 20 },
      },
      {
        title: 'press start',
        message: 'Select an agent to trigger the sequence. Agents run in parallel, mixing your campaign data.',
        highlight: 'start-node',
        position: { x: 30, y: 45 },
      },
      {
        title: 'add to the chain',
        message: 'Drag effects from the browser. Patch them in. Create your signal flow.',
        highlight: 'skills-palette',
        position: { x: 70, y: 70 },
      },
    ],
    analogue: [
      {
        title: 'system primed',
        message: 'Keep it simple: press Start and let the signal organise itself.',
        position: { x: 50, y: 20 },
      },
      {
        title: 'hit start',
        message: 'Select an agent and let it run. Agents handle the grind while you direct.',
        highlight: 'start-node',
        position: { x: 30, y: 45 },
      },
      {
        title: 'build the rig',
        message: 'Drag skills onto the canvas. Wire them up. Make your campaign work.',
        highlight: 'skills-palette',
        position: { x: 70, y: 70 },
      },
    ],
  }

  return stepsByTheme[theme] || stepsByTheme.ascii
}

export function OnboardingOverlay({ theme, onDismiss, reducedMotion = false }: OnboardingOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const steps = getOnboardingSteps(theme)
  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  // Pulse animation for highlighted elements
  useEffect(() => {
    if (!step.highlight || reducedMotion) return

    const element = document.querySelector(`[data-onboarding="${step.highlight}"]`)
    if (element) {
      element.classList.add('onboarding-highlight')
      return () => element.classList.remove('onboarding-highlight')
    }
  }, [step.highlight, reducedMotion])

  const handleNext = () => {
    if (isLastStep) {
      onDismiss()
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleSkip = () => {
    onDismiss()
  }

  // Theme-specific styling
  const themeColors = {
    ascii: { accent: '#00ff00', bg: '#000000', text: '#00ff00' },
    xp: { accent: '#0078d4', bg: '#001e3c', text: '#ffffff' },
    aqua: { accent: '#5ac8fa', bg: '#001529', text: '#ffffff' },
    daw: { accent: '#ff764d', bg: '#1a1a1a', text: '#ffffff' },
    analogue: { accent: '#d3b98c', bg: '#1a1a18', text: '#d3b98c' },
  }

  const colors = themeColors[theme] || themeColors.ascii

  return (
    <AnimatePresence>
      <motion.div
        key="onboarding-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={handleSkip}
      >
        {/* Overlay Content */}
        <motion.div
          key={`onboarding-step-${currentStep}`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="relative max-w-2xl w-full mx-4"
          style={{
            backgroundColor: colors.bg,
            border: `2px solid ${colors.accent}`,
            boxShadow: `0 0 40px ${colors.accent}40`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="px-6 py-4 border-b flex items-center justify-between"
            style={{ borderColor: `${colors.accent}40` }}
          >
            <div className="flex items-center gap-3">
              <Sparkles
                className="w-5 h-5"
                style={{ color: colors.accent }}
              />
              <h2
                className="text-lg font-mono font-semibold"
                style={{ color: colors.text }}
              >
                {step.title}
              </h2>
            </div>
            <button
              onClick={handleSkip}
              className="p-2 rounded hover:bg-white/10 transition-colors"
              aria-label="Skip onboarding"
            >
              <X className="w-5 h-5" style={{ color: colors.accent }} />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            <p
              className="text-base font-mono leading-relaxed"
              style={{ color: colors.text }}
            >
              {step.message}
            </p>

            {/* Progress Dots */}
            <div className="flex items-center gap-2 mt-8">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep ? 'w-8' : 'w-2'
                  }`}
                  style={{
                    backgroundColor: index <= currentStep ? colors.accent : `${colors.accent}30`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div
            className="px-6 py-4 border-t flex items-center justify-between"
            style={{ borderColor: `${colors.accent}40` }}
          >
            <button
              onClick={handleSkip}
              className="text-sm font-mono opacity-60 hover:opacity-100 transition-opacity"
              style={{ color: colors.text }}
            >
              Skip Tutorial
            </button>

            <button
              onClick={handleNext}
              className="px-6 py-2 rounded font-mono font-semibold flex items-center gap-2 transition-all hover:scale-105"
              style={{
                backgroundColor: colors.accent,
                color: theme === 'ascii' ? '#000000' : '#ffffff',
              }}
            >
              {isLastStep ? 'Got it → Begin' : 'Next'}
              {!isLastStep && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </motion.div>

        {/* Animated Arrow/Pulse Highlight */}
        {step.highlight && !reducedMotion && (
          <motion.div
            className="fixed pointer-events-none"
            style={{
              left: `${step.position.x}%`,
              top: `${step.position.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div
              className="w-32 h-32 rounded-full"
              style={{
                border: `3px solid ${colors.accent}`,
                boxShadow: `0 0 60px ${colors.accent}`,
              }}
            />
          </motion.div>
        )}
      </motion.div>

      {/* Global CSS for highlight effect */}
      <style jsx global>{`
        .onboarding-highlight {
          animation: onboarding-pulse 2s ease-in-out infinite;
          position: relative;
          z-index: 40;
        }

        @keyframes onboarding-pulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 ${colors.accent}80;
          }
          50% {
            box-shadow: 0 0 30px 15px ${colors.accent}40;
          }
        }
      `}</style>
    </AnimatePresence>
  )
}
