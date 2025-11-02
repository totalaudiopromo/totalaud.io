/**
 * OperatorScene Component
 * Phase 14.3: Cinematic intelligent onboarding
 *
 * Flow:
 * 1. Boot sequence (4 animated lines)
 * 2. Artist detection confirmation
 * 3. Three-step contextual form
 * 4. Signal lock confirmation
 * 5. Fade to console
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { flowCoreColours, flowCoreMotion } from '@aud-web/constants/flowCoreColours'
import { useArtistLookup } from '@/hooks/useArtistLookup'
import { useOperatorPersonality, type CampaignGoal } from '@/hooks/useOperatorPersonality'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { OperatorForm } from './OperatorForm'
import { logger } from '@total-audio/core-logger'

const log = logger.scope('OperatorScene')

type ScenePhase = 'boot' | 'artist-confirm' | 'form' | 'signal-lock' | 'fade-out'

export function OperatorScene() {
  const [phase, setPhase] = useState<ScenePhase>('boot')
  const [bootLine, setBootLine] = useState(0)
  const [selectedGoal, setSelectedGoal] = useState<CampaignGoal>('radio')
  const [campaignTitle, setCampaignTitle] = useState('')
  const [horizon, setHorizon] = useState(28)

  const { artist, isLoading } = useArtistLookup()
  const { personality } = useOperatorPersonality({ goal: selectedGoal })
  const prefersReducedMotion = useReducedMotion()
  const router = useRouter()

  const audioContextRef = useRef<AudioContext>()
  const oscillatorRef = useRef<OscillatorNode>()
  const gainNodeRef = useRef<GainNode>()

  // Boot sequence lines
  const bootLines = [
    'operator online.',
    'scanning for signal…',
    `found: ${artist?.name || 'signal'}.`,
    'ready to assist.',
  ]

  // Initialize ambient audio pad
  useEffect(() => {
    if (prefersReducedMotion) return

    const initAudio = () => {
      try {
        const audioContext = new AudioContext()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.type = 'sine'
        oscillator.frequency.value = 440 // A4 base frequency
        gainNode.gain.value = 0 // Start silent

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.start()

        audioContextRef.current = audioContext
        oscillatorRef.current = oscillator
        gainNodeRef.current = gainNode

        // Fade in ambient
        gainNode.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 0.8)

        log.debug('Ambient audio initialized')
      } catch (error) {
        log.warn('Failed to initialize audio', { error })
      }
    }

    initAudio()

    return () => {
      if (gainNodeRef.current && audioContextRef.current) {
        const fadeTime = audioContextRef.current.currentTime + 0.5
        gainNodeRef.current.gain.linearRampToValueAtTime(0, fadeTime)

        setTimeout(() => {
          oscillatorRef.current?.stop()
          audioContextRef.current?.close()
        }, 600)
      }
    }
  }, [prefersReducedMotion])

  // Boot sequence animation
  useEffect(() => {
    if (phase !== 'boot') return
    if (isLoading) return // Wait for artist data

    const timing = prefersReducedMotion ? 0 : 800

    const timers = bootLines.map((_, index) =>
      setTimeout(() => {
        setBootLine(index + 1)
      }, timing * (index + 1))
    )

    // After all lines, move to artist confirmation
    const finalTimer = setTimeout(() => {
      setPhase('artist-confirm')
    }, timing * (bootLines.length + 1))

    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(finalTimer)
    }
  }, [phase, isLoading, prefersReducedMotion])

  // Update ambient frequency based on personality
  useEffect(() => {
    if (!oscillatorRef.current || !audioContextRef.current) return

    oscillatorRef.current.frequency.setValueAtTime(
      personality.soundFrequency,
      audioContextRef.current.currentTime
    )
    oscillatorRef.current.type = personality.soundType

    log.debug('Ambient personality updated', { goal: personality.goal, freq: personality.soundFrequency })
  }, [personality])

  // Handle form submission
  const handleFormSubmit = async (data: { title: string; goal: CampaignGoal; horizon: number }) => {
    setCampaignTitle(data.title)
    setSelectedGoal(data.goal)
    setHorizon(data.horizon)

    log.info('Form submitted', data)

    // Save to Supabase
    try {
      await fetch('/api/operator/context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artist: artist?.name,
          title: data.title,
          goal: data.goal,
          horizon: data.horizon,
          genre: artist?.genres?.[0] || null,
          followers: artist?.followers || null,
        }),
      })

      log.info('Campaign context saved')
    } catch (error) {
      log.error('Failed to save context', error)
    }

    // Move to signal lock phase
    setPhase('signal-lock')

    // After 1.8s, fade out and redirect
    setTimeout(() => {
      setPhase('fade-out')
    }, 1800)

    setTimeout(() => {
      router.push('/console')
    }, 2500)
  }

  const handleSkipBoot = () => {
    setPhase('form')
  }

  const handleConfirmArtist = () => {
    setPhase('form')
  }

  const animationDuration = prefersReducedMotion ? 0 : flowCoreMotion.normal / 1000

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        backgroundColor: flowCoreColours.matteBlack,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        backgroundSize: '200px 200px',
        opacity: phase === 'fade-out' ? 0 : 1,
        transition: `opacity ${flowCoreMotion.slow}ms ease-out`,
      }}
    >
      {/* Grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
          opacity: 0.03,
        }}
      />

      <AnimatePresence mode="wait">
        {/* Boot sequence */}
        {phase === 'boot' && (
          <motion.div
            key="boot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: animationDuration }}
            className="relative z-10 max-w-2xl w-full px-8"
          >
            <div className="space-y-4 font-mono text-lg lowercase">
              {bootLines.slice(0, bootLine).map((line, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: animationDuration, delay: index * 0.1 }}
                  style={{ color: flowCoreColours.slateCyan }}
                >
                  {line}
                </motion.p>
              ))}
            </div>

            {bootLine >= bootLines.length && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleSkipBoot}
                className="mt-8 px-4 py-2 font-mono text-sm lowercase border rounded"
                style={{
                  borderColor: flowCoreColours.borderGrey,
                  color: flowCoreColours.textSecondary,
                }}
              >
                press enter to continue
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Artist confirmation */}
        {phase === 'artist-confirm' && artist && (
          <motion.div
            key="artist-confirm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: animationDuration }}
            className="relative z-10 max-w-2xl w-full px-8"
          >
            <div className="space-y-6">
              <p className="font-mono text-lg lowercase" style={{ color: flowCoreColours.slateCyan }}>
                we found <span className="font-semibold">{artist.name}</span>
                {artist.followers > 0 && ` — ${artist.followers.toLocaleString()} monthly listeners`}.
              </p>

              <p className="font-mono text-base lowercase" style={{ color: flowCoreColours.textSecondary }}>
                use this context?
              </p>

              <div className="flex gap-4">
                <button
                  onClick={handleConfirmArtist}
                  className="px-6 py-3 font-mono text-sm lowercase font-semibold rounded"
                  style={{
                    backgroundColor: flowCoreColours.slateCyan,
                    color: flowCoreColours.matteBlack,
                  }}
                >
                  yes, continue
                </button>

                <button
                  onClick={() => setPhase('form')}
                  className="px-6 py-3 font-mono text-sm lowercase border rounded"
                  style={{
                    borderColor: flowCoreColours.borderGrey,
                    color: flowCoreColours.textSecondary,
                  }}
                >
                  skip
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Form phase */}
        {phase === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: animationDuration }}
            className="relative z-10 max-w-2xl w-full px-8"
          >
            <OperatorForm artist={artist} onSubmit={handleFormSubmit} personality={personality} />
          </motion.div>
        )}

        {/* Signal lock confirmation */}
        {phase === 'signal-lock' && (
          <motion.div
            key="signal-lock"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: animationDuration }}
            className="relative z-10 max-w-2xl w-full px-8"
          >
            <div className="space-y-4">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-mono text-xl lowercase font-semibold"
                style={{ color: personality.accentColour }}
              >
                signal locked.
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="font-mono text-base lowercase"
                style={{ color: flowCoreColours.textSecondary }}
              >
                {artist?.name} – {selectedGoal}, {horizon} days horizon.
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="font-mono text-sm lowercase"
                style={{ color: flowCoreColours.textTertiary }}
              >
                transferring to console…
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
