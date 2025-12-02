/**
 * Onboarding Page
 * 2025 Brand Pivot - Simple Artist Flow
 *
 * Minimal onboarding: collect artist name and primary goal,
 * then redirect to the workspace.
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

type Goal = 'release' | 'discover' | 'pitch' | 'plan'

const GOALS: { id: Goal; label: string; description: string }[] = [
  {
    id: 'release',
    label: 'Launch a release',
    description: 'Plan and execute a single, EP, or album release',
  },
  {
    id: 'discover',
    label: 'Find contacts',
    description: 'Scout radio DJs, playlist curators, and press contacts',
  },
  {
    id: 'pitch',
    label: 'Write pitches',
    description: 'Craft compelling pitches for radio, press, and playlists',
  },
  {
    id: 'plan',
    label: 'Plan my year',
    description: 'Map out releases and campaigns across the timeline',
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [artistName, setArtistName] = useState('')
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleContinue = () => {
    if (step === 0 && artistName.trim()) {
      setStep(1)
    }
  }

  const handleComplete = async () => {
    if (!selectedGoal) return

    setIsSubmitting(true)

    // Store onboarding data
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          'totalaud_onboarding',
          JSON.stringify({
            artistName: artistName.trim(),
            goal: selectedGoal,
            completedAt: new Date().toISOString(),
          })
        )
      } catch {
        // Non-blocking
      }
    }

    // Redirect based on goal
    const modeMap: Record<Goal, string> = {
      release: 'timeline',
      discover: 'ideas', // Scout not available yet
      pitch: 'pitch',
      plan: 'timeline',
    }

    router.push(`/workspace?mode=${modeMap[selectedGoal]}`)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0F1113',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          width: '100%',
          maxWidth: 480,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#3AA9BE',
              letterSpacing: '-0.02em',
            }}
          >
            totalaud.io
          </span>
        </div>

        {/* Step 1: Artist Name */}
        {step === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 600,
                color: '#F7F8F9',
                marginBottom: 12,
                textAlign: 'center',
                letterSpacing: '-0.02em',
              }}
            >
              Welcome
            </h1>
            <p
              style={{
                fontSize: 15,
                color: 'rgba(255, 255, 255, 0.5)',
                marginBottom: 40,
                textAlign: 'center',
                lineHeight: 1.5,
              }}
            >
              Let&apos;s get your workspace set up in under a minute.
            </p>

            <div style={{ marginBottom: 32 }}>
              <label
                htmlFor="artistName"
                style={{
                  display: 'block',
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.8)',
                  marginBottom: 8,
                }}
              >
                What&apos;s your artist or project name?
              </label>
              <input
                id="artistName"
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                placeholder="e.g. Glass Animals, The 1975"
                autoFocus
                style={{
                  width: '100%',
                  padding: '16px 18px',
                  fontSize: 16,
                  color: '#F7F8F9',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 10,
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#3AA9BE'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                }}
              />
            </div>

            <button
              onClick={handleContinue}
              disabled={!artistName.trim()}
              style={{
                width: '100%',
                padding: '16px 24px',
                fontSize: 15,
                fontWeight: 600,
                color: artistName.trim() ? '#0F1113' : 'rgba(255, 255, 255, 0.3)',
                backgroundColor: artistName.trim() ? '#3AA9BE' : 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: 10,
                cursor: artistName.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
              }}
            >
              Continue
            </button>
          </motion.div>
        )}

        {/* Step 2: Goal Selection */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 600,
                color: '#F7F8F9',
                marginBottom: 12,
                textAlign: 'center',
                letterSpacing: '-0.02em',
              }}
            >
              Hi, {artistName}
            </h1>
            <p
              style={{
                fontSize: 15,
                color: 'rgba(255, 255, 255, 0.5)',
                marginBottom: 40,
                textAlign: 'center',
                lineHeight: 1.5,
              }}
            >
              What brings you here today?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {GOALS.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => setSelectedGoal(goal.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: 20,
                    backgroundColor:
                      selectedGoal === goal.id
                        ? 'rgba(58, 169, 190, 0.1)'
                        : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${
                      selectedGoal === goal.id
                        ? 'rgba(58, 169, 190, 0.5)'
                        : 'rgba(255, 255, 255, 0.08)'
                    }`,
                    borderRadius: 10,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    fontFamily: 'inherit',
                  }}
                >
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: selectedGoal === goal.id ? '#3AA9BE' : '#F7F8F9',
                      marginBottom: 4,
                    }}
                  >
                    {goal.label}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      color: 'rgba(255, 255, 255, 0.5)',
                      lineHeight: 1.4,
                    }}
                  >
                    {goal.description}
                  </span>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setStep(0)}
                style={{
                  flex: 1,
                  padding: '16px 24px',
                  fontSize: 15,
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.6)',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 10,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                }}
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={!selectedGoal || isSubmitting}
                style={{
                  flex: 2,
                  padding: '16px 24px',
                  fontSize: 15,
                  fontWeight: 600,
                  color: selectedGoal ? '#0F1113' : 'rgba(255, 255, 255, 0.3)',
                  backgroundColor: selectedGoal ? '#3AA9BE' : 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: 10,
                  cursor: selectedGoal ? 'pointer' : 'not-allowed',
                  opacity: isSubmitting ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                }}
              >
                {isSubmitting ? 'Setting up...' : 'Go to workspace'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Skip link */}
        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <button
            onClick={() => router.push('/workspace')}
            style={{
              fontSize: 13,
              color: 'rgba(255, 255, 255, 0.4)',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontFamily: 'inherit',
            }}
          >
            Skip for now
          </button>
        </div>
      </motion.div>
    </div>
  )
}
