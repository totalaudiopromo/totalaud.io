'use client'

/**
 * Fusion Mode Canvas
 * Radial layout showing all 5 OS perspectives collaborating
 * Phase 12B: Now with live OS activity states and real-time reactions
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFusion } from '@totalaud/os-state/campaign'
import type { ThemeId, FusionOutput } from '@totalaud/os-state/campaign'
import { X, Sparkles, Zap } from 'lucide-react'
import { FusionOSBubble } from './FusionOSBubble'
import { FusionOutputRenderer } from './FusionOutputRenderer'
import { liveEventBus, type LiveEventPayload } from '@totalaud/agents/events'

interface FusionModeCanvasProps {
  isOpen: boolean
  onClose: () => void
  fusionOutput?: FusionOutput | null
  onCreateFusionCard?: () => void
}

export type OSActivityState = 'idle' | 'thinking' | 'speaking'

interface OSActivity {
  os: ThemeId
  state: OSActivityState
  lastSpokeAt?: string
  messageCount: number
}

const OS_COLOURS: Record<ThemeId, string> = {
  ascii: '#00ff99',
  xp: '#3478f6',
  aqua: '#3b82f6',
  daw: '#ff8000',
  analogue: '#ff1aff',
}

const OS_POSITIONS: Record<ThemeId, { x: number; y: number }> = {
  ascii: { x: 0, y: -200 },
  xp: { x: 190, y: -60 },
  aqua: { x: 120, y: 160 },
  daw: { x: -120, y: 160 },
  analogue: { x: -190, y: -60 },
}

export function FusionModeCanvas({
  isOpen,
  onClose,
  fusionOutput,
  onCreateFusionCard,
}: FusionModeCanvasProps) {
  const { fusion, setLiveEnabled } = useFusion()
  const [activeOS, setActiveOS] = useState<ThemeId | null>(null)
  const [osActivities, setOSActivities] = useState<Map<ThemeId, OSActivity>>(new Map())

  const currentSession = fusion.currentSession
  const osContributors = currentSession?.osContributors || [
    'ascii',
    'xp',
    'aqua',
    'daw',
    'analogue',
  ]

  // Initialize OS activities from fusion messages
  useEffect(() => {
    if (!currentSession) return

    const activities = new Map<ThemeId, OSActivity>()

    osContributors.forEach((os) => {
      const osMessages = fusion.messages.filter(
        (msg) => msg.sessionId === currentSession.id && msg.os === os
      )
      const lastMessage = osMessages[osMessages.length - 1]

      activities.set(os, {
        os,
        state: 'idle',
        lastSpokeAt: lastMessage?.createdAt,
        messageCount: osMessages.length,
      })
    })

    setOSActivities(activities)
  }, [currentSession, osContributors, fusion.messages])

  // Subscribe to live events for activity updates
  useEffect(() => {
    if (!isOpen || !fusion.liveEnabled) return

    const handleEvent = (event: LiveEventPayload) => {
      // fusion_message_created → set OS to 'speaking'
      if (event.type === 'fusion_message_created' && event.osHint) {
        setOSActivities((prev) => {
          const updated = new Map(prev)
          const activity = updated.get(event.osHint!)

          if (activity) {
            updated.set(event.osHint!, {
              ...activity,
              state: 'speaking',
              lastSpokeAt: event.timestamp,
              messageCount: activity.messageCount + 1,
            })
          }

          return updated
        })

        // Reset to idle after 5 seconds
        setTimeout(() => {
          setOSActivities((prev) => {
            const updated = new Map(prev)
            const activity = updated.get(event.osHint!)

            if (activity && activity.state === 'speaking') {
              updated.set(event.osHint!, {
                ...activity,
                state: 'idle',
              })
            }

            return updated
          })
        }, 5000)
      }

      // High-priority events → set OS to 'thinking'
      if (
        (event.type === 'agent_warning' ||
          event.type === 'loop_suggestion_created' ||
          event.type === 'memory_created') &&
        event.osHint
      ) {
        setOSActivities((prev) => {
          const updated = new Map(prev)
          const activity = updated.get(event.osHint!)

          if (activity && activity.state === 'idle') {
            updated.set(event.osHint!, {
              ...activity,
              state: 'thinking',
            })
          }

          return updated
        })

        // Reset to idle after 3 seconds if still thinking
        setTimeout(() => {
          setOSActivities((prev) => {
            const updated = new Map(prev)
            const activity = updated.get(event.osHint!)

            if (activity && activity.state === 'thinking') {
              updated.set(event.osHint!, {
                ...activity,
                state: 'idle',
              })
            }

            return updated
          })
        }, 3000)
      }
    }

    const unsubscribe = liveEventBus.subscribe(handleEvent)
    return () => unsubscribe()
  }, [isOpen, fusion.liveEnabled])

  const handleToggleLive = () => {
    setLiveEnabled(!fusion.liveEnabled)
  }

  if (!isOpen) return null

  // Check if there's consensus or tension
  const hasConsensus = checkForConsensus(fusion.messages, currentSession?.id)
  const hasTension = checkForTension(fusion.messages, currentSession?.id)

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-centre justify-centre"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Main Canvas */}
        <motion.div
          className="relative z-10 h-[90vh] w-[90vw] max-w-6xl rounded-lg border border-[var(--flowcore-colour-border)] bg-[var(--flowcore-colour-bg)] shadow-2xl"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Header */}
          <div className="flex items-centre justify-between border-b border-[var(--flowcore-colour-border)] p-4">
            <div className="flex items-centre gap-3">
              <Sparkles
                size={24}
                className="text-[var(--flowcore-colour-accent)]"
              />
              <div>
                <h2 className="font-mono text-lg font-semibold text-[var(--flowcore-colour-fg)]">
                  Fusion Mode
                </h2>
                <p className="font-mono text-xs text-[var(--flowcore-colour-fg)]/70">
                  5 OS Perspectives Collaborating
                </p>
              </div>
            </div>

            <div className="flex items-centre gap-2">
              {/* Live Toggle */}
              <button
                onClick={handleToggleLive}
                className="flex items-centre gap-2 rounded border px-3 py-1.5 font-mono text-xs font-semibold transition-all hover:bg-[var(--flowcore-colour-fg)]/5"
                style={{
                  color: fusion.liveEnabled
                    ? 'var(--flowcore-colour-accent)'
                    : 'var(--flowcore-colour-fg)',
                  borderColor: fusion.liveEnabled
                    ? 'var(--flowcore-colour-accent)'
                    : 'var(--flowcore-colour-border)',
                }}
              >
                <Zap size={14} />
                Live: {fusion.liveEnabled ? 'On' : 'Off'}
              </button>

              {onCreateFusionCard && fusionOutput && (
                <button
                  onClick={onCreateFusionCard}
                  className="rounded bg-[var(--flowcore-colour-accent)] px-4 py-2 font-mono text-sm font-semibold text-white transition-all hover:opacity-90"
                >
                  Create Fusion Card
                </button>
              )}

              <button
                onClick={onClose}
                className="rounded p-2 text-[var(--flowcore-colour-fg)]/70 transition-colours hover:bg-[var(--flowcore-colour-fg)]/10 hover:text-[var(--flowcore-colour-fg)]"
                aria-label="Close fusion mode"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex h-[calc(100%-80px)] flex-col">
            {/* Radial OS Layout */}
            <div className="relative flex-1">
              {/* Centre Focus */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <motion.div
                  className="flex h-32 w-32 items-centre justify-centre rounded-full border-2 bg-[var(--flowcore-colour-accent)]/10"
                  style={{
                    borderColor: hasConsensus
                      ? '#3AA9BE'
                      : hasTension
                        ? '#ff8000'
                        : 'var(--flowcore-colour-accent)',
                  }}
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <p className="text-centre font-mono text-sm font-semibold uppercase text-[var(--flowcore-colour-accent)]">
                    {currentSession?.focusType || 'Focus'}
                  </p>
                </motion.div>

                {/* Consensus Ring */}
                {hasConsensus && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      border: '2px solid #3AA9BE',
                      opacity: 0.3,
                    }}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.3, 0.1, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}

                {/* Tension Ripple */}
                {hasTension && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      border: '2px solid #ff8000',
                      opacity: 0.4,
                    }}
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.4, 0, 0.4],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeOut',
                    }}
                  />
                )}
              </div>

              {/* OS Bubbles in Radial Layout */}
              {osContributors.map((os, index) => {
                const position = OS_POSITIONS[os]
                const colour = OS_COLOURS[os]
                const contribution = fusionOutput?.perOS[os]
                const activity = osActivities.get(os)

                return (
                  <motion.div
                    key={os}
                    className="absolute left-1/2 top-1/2"
                    style={{
                      transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: index * 0.1,
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {/* Connection Line to Centre */}
                    <svg
                      className="pointer-events-none absolute left-1/2 top-1/2"
                      style={{
                        width: Math.abs(position.x) * 2 + 100,
                        height: Math.abs(position.y) * 2 + 100,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <motion.line
                        x1="50%"
                        y1="50%"
                        x2={position.x > 0 ? '0%' : '100%'}
                        y2={position.y > 0 ? '0%' : '100%'}
                        stroke={colour}
                        strokeWidth="2"
                        strokeDasharray="4 4"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: index * 0.1 + 0.2, duration: 0.6 }}
                      />
                    </svg>

                    <FusionOSBubble
                      os={os}
                      contribution={contribution}
                      isActive={activeOS === os}
                      activityState={activity?.state || 'idle'}
                      messageCount={activity?.messageCount || 0}
                      lastSpokeAt={activity?.lastSpokeAt}
                      onClick={() => setActiveOS(activeOS === os ? null : os)}
                    />
                  </motion.div>
                )
              })}
            </div>

            {/* Output Renderer (Bottom Panel) */}
            {fusionOutput && (
              <div className="border-t border-[var(--flowcore-colour-border)] p-4">
                <FusionOutputRenderer fusionOutput={fusionOutput} activeOS={activeOS} />
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * Check if there's consensus (3+ OSs with same sentiment)
 */
function checkForConsensus(messages: any[], sessionId?: string): boolean {
  if (!sessionId) return false

  const recentMessages = messages
    .filter((msg) => msg.sessionId === sessionId)
    .slice(-5)

  const sentimentCounts: Record<string, number> = {}
  recentMessages.forEach((msg) => {
    const sentiment = (msg.content as any)?.metadata?.sentiment
    if (sentiment) {
      sentimentCounts[sentiment] = (sentimentCounts[sentiment] || 0) + 1
    }
  })

  return Object.values(sentimentCounts).some((count) => count >= 3)
}

/**
 * Check if there's tension (conflicting sentiments)
 */
function checkForTension(messages: any[], sessionId?: string): boolean {
  if (!sessionId) return false

  const recentMessages = messages
    .filter((msg) => msg.sessionId === sessionId)
    .slice(-5)

  let hasPositive = false
  let hasCritical = false

  recentMessages.forEach((msg) => {
    const sentiment = (msg.content as any)?.metadata?.sentiment
    if (sentiment === 'positive') hasPositive = true
    if (sentiment === 'critical' || sentiment === 'cautious') hasCritical = true
  })

  return hasPositive && hasCritical
}
