/**
 * OperatorForm Component
 * Phase 14.3: Three-step contextual form
 *
 * Steps:
 * 1. Campaign title input
 * 2. Goal chip selector
 * 3. Time horizon slider
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { flowCoreColours, flowCoreMotion } from '@aud-web/constants/flowCoreColours'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { ArtistData } from '@/hooks/useArtistLookup'
import type { CampaignGoal, OperatorPersonality } from '@/hooks/useOperatorPersonality'
import { getPersonalityMessage } from '@/hooks/useOperatorPersonality'

interface OperatorFormProps {
  artist: ArtistData | null
  onSubmit: (data: { title: string; goal: CampaignGoal; horizon: number }) => void
  personality: OperatorPersonality
}

type FormStep = 1 | 2 | 3

const GOALS: Array<{ id: CampaignGoal; label: string; description: string }> = [
  { id: 'radio', label: 'radio', description: 'get airplay on uk stations' },
  { id: 'playlist', label: 'playlist', description: 'land on curated playlists' },
  { id: 'press', label: 'press', description: 'secure music blog coverage' },
  { id: 'growth', label: 'growth', description: 'build audience + engagement' },
  { id: 'experiment', label: 'experiment', description: 'test new strategies' },
]

export function OperatorForm({ artist, onSubmit, personality }: OperatorFormProps) {
  const [step, setStep] = useState<FormStep>(1)
  const [title, setTitle] = useState('')
  const [goal, setGoal] = useState<CampaignGoal>('radio')
  const [horizon, setHorizon] = useState(28)

  const prefersReducedMotion = useReducedMotion()
  const animationDuration = prefersReducedMotion ? 0 : flowCoreMotion.normal / 1000

  // Set default title based on artist
  useEffect(() => {
    if (artist?.name) {
      setTitle(`${artist.name} - new campaign`)
    }
  }, [artist])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && step < 3) {
        e.preventDefault()
        handleNext()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        if (step > 1) {
          setStep((prev) => (prev - 1) as FormStep)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [step])

  const handleNext = () => {
    if (step === 1 && !title.trim()) return
    if (step < 3) {
      setStep((prev) => (prev + 1) as FormStep)
    } else {
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    onSubmit({ title, goal, horizon })
  }

  return (
    <div className="space-y-8">
      {/* Step indicator */}
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all"
            style={{
              backgroundColor: i <= step ? personality.accentColour : flowCoreColours.borderGrey,
              transitionDuration: `${flowCoreMotion.fast}ms`,
            }}
          />
        ))}
      </div>

      {/* Step content */}
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: animationDuration }}
      >
        {step === 1 && (
          <div className="space-y-6">
            <label className="block">
              <p
                className="font-mono text-lg lowercase mb-3"
                style={{ color: flowCoreColours.slateCyan }}
              >
                what's this campaign about?
              </p>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. summer single release"
                autoFocus
                className="w-full px-4 py-3 font-mono text-base lowercase bg-transparent border rounded outline-none transition-all focus:ring-2"
                style={{
                  borderColor: flowCoreColours.borderGrey,
                  color: flowCoreColours.textPrimary,
                  ['--tw-ring-color' as string]: personality.accentColour,
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && title.trim()) {
                    e.preventDefault()
                    handleNext()
                  }
                }}
              />
            </label>

            <p
              className="font-mono text-sm lowercase"
              style={{ color: flowCoreColours.textTertiary }}
            >
              give your campaign a memorable name
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <p className="font-mono text-lg lowercase" style={{ color: flowCoreColours.slateCyan }}>
              what's your goal?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {GOALS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setGoal(option.id)}
                  className="px-4 py-3 text-left border rounded transition-all"
                  style={{
                    backgroundColor:
                      goal === option.id ? `${personality.accentColour}15` : 'transparent',
                    borderColor:
                      goal === option.id ? personality.accentColour : flowCoreColours.borderGrey,
                    borderWidth: goal === option.id ? '2px' : '1px',
                  }}
                >
                  <p
                    className="font-mono text-base lowercase font-semibold"
                    style={{ color: flowCoreColours.textPrimary }}
                  >
                    {option.label}
                  </p>
                  <p
                    className="font-mono text-sm lowercase mt-1"
                    style={{ color: flowCoreColours.textSecondary }}
                  >
                    {option.description}
                  </p>
                </button>
              ))}
            </div>

            {artist && (
              <p
                className="font-mono text-sm lowercase"
                style={{ color: flowCoreColours.textTertiary }}
              >
                {getPersonalityMessage(goal, artist.name)}
              </p>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <p className="font-mono text-lg lowercase" style={{ color: flowCoreColours.slateCyan }}>
              how much time do you have?
            </p>

            <div className="space-y-4">
              <input
                type="range"
                min="1"
                max="56"
                value={horizon}
                onChange={(e) => setHorizon(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${personality.accentColour} 0%, ${personality.accentColour} ${(horizon / 56) * 100}%, ${flowCoreColours.borderGrey} ${(horizon / 56) * 100}%, ${flowCoreColours.borderGrey} 100%)`,
                }}
              />

              <div className="flex justify-between items-center">
                <p
                  className="font-mono text-2xl lowercase font-semibold"
                  style={{ color: personality.accentColour }}
                >
                  {horizon} days
                </p>

                <p
                  className="font-mono text-sm lowercase"
                  style={{ color: flowCoreColours.textSecondary }}
                >
                  {horizon < 7
                    ? 'sprint mode'
                    : horizon < 14
                      ? 'focused push'
                      : horizon < 28
                        ? 'standard campaign'
                        : 'long-term growth'}
                </p>
              </div>
            </div>

            <p
              className="font-mono text-sm lowercase"
              style={{ color: flowCoreColours.textTertiary }}
            >
              we'll adapt the strategy to your timeline
            </p>
          </div>
        )}
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4 pt-4">
        {step > 1 ? (
          <button
            onClick={() => setStep((prev) => (prev - 1) as FormStep)}
            className="px-4 py-2 font-mono text-sm lowercase border rounded"
            style={{
              borderColor: flowCoreColours.borderGrey,
              color: flowCoreColours.textSecondary,
            }}
          >
            ← back
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={handleNext}
          disabled={step === 1 && !title.trim()}
          className="px-6 py-3 font-mono text-sm lowercase font-semibold rounded transition-all"
          style={{
            backgroundColor:
              step === 1 && !title.trim() ? flowCoreColours.mediumGrey : personality.accentColour,
            color:
              step === 1 && !title.trim()
                ? flowCoreColours.textDisabled
                : flowCoreColours.matteBlack,
            cursor: step === 1 && !title.trim() ? 'not-allowed' : 'pointer',
            opacity: step === 1 && !title.trim() ? 0.5 : 1,
          }}
        >
          {step === 3 ? 'lock signal' : 'continue →'}
        </button>
      </div>

      {/* Keyboard hints */}
      <div
        className="pt-4 border-t text-xs font-mono lowercase text-center"
        style={{
          borderColor: flowCoreColours.borderGrey,
          color: flowCoreColours.textTertiary,
        }}
      >
        <span>↵ continue</span> · <span>esc {step > 1 ? 'back' : 'cancel'}</span>
      </div>
    </div>
  )
}
