/**
 * OS Evolution Panel
 * Phase 13A: OS Evolution System
 *
 * Slide-over panel showing OS personality drift over time
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp, TrendingDown, Minus, Brain } from 'lucide-react'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { useEvolution } from '@totalaud/os-state/campaign'
import type { ThemeId, EvolvedOSProfile } from '@totalaud/os-state/campaign'

const OS_COLOURS: Record<ThemeId, string> = {
  ascii: '#00ff99',
  xp: '#3478f6',
  aqua: '#3b82f6',
  daw: '#ff8000',
  analogue: '#ff1aff',
}

const OS_LABELS: Record<ThemeId, string> = {
  ascii: 'ASCII',
  xp: 'XP',
  aqua: 'Aqua',
  daw: 'DAW',
  analogue: 'Analogue',
}

interface OSEvolutionPanelProps {
  isOpen: boolean
  onClose: () => void
  selectedOS?: ThemeId
}

export function OSEvolutionPanel({ isOpen, onClose, selectedOS }: OSEvolutionPanelProps) {
  const { evolution, getOSProfile, getEvolutionEvents } = useEvolution()
  const [activeOS, setActiveOS] = useState<ThemeId>(selectedOS || 'ascii')

  useEffect(() => {
    if (selectedOS) {
      setActiveOS(selectedOS)
    }
  }, [selectedOS])

  if (!isOpen) return null

  const profile = getOSProfile(activeOS)
  const events = getEvolutionEvents(activeOS, 10)
  const osColour = OS_COLOURS[activeOS]
  const osLabel = OS_LABELS[activeOS]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          zIndex: 100,
        }}
      >
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '480px',
            maxWidth: '100%',
            background: flowCoreColours.matteBlack,
            borderLeft: `1px solid ${flowCoreColours.borderSubtle}`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '20px',
              borderBottom: `1px solid ${flowCoreColours.borderSubtle}`,
              background: `${osColour}10`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <Brain size={24} strokeWidth={1.6} style={{ color: osColour }} />
                  <h2
                    style={{
                      margin: 0,
                      fontSize: '20px',
                      fontWeight: 600,
                      color: osColour,
                    }}
                  >
                    OS Evolution
                  </h2>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '13px',
                    color: flowCoreColours.textSecondary,
                  }}
                >
                  Personality drift over time
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: flowCoreColours.textTertiary,
                  cursor: 'pointer',
                  padding: '4px',
                  lineHeight: 1,
                }}
                aria-label="Close panel"
              >
                <X size={20} strokeWidth={1.6} />
              </button>
            </div>
          </div>

          {/* OS Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              padding: '12px 20px',
              borderBottom: `1px solid ${flowCoreColours.borderSubtle}`,
              overflowX: 'auto',
            }}
          >
            {(['ascii', 'xp', 'aqua', 'daw', 'analogue'] as ThemeId[]).map((os) => (
              <button
                key={os}
                onClick={() => setActiveOS(os)}
                style={{
                  padding: '6px 12px',
                  background: activeOS === os ? `${OS_COLOURS[os]}20` : 'transparent',
                  border: `1px solid ${activeOS === os ? OS_COLOURS[os] : flowCoreColours.borderSubtle}`,
                  borderRadius: '4px',
                  color: activeOS === os ? OS_COLOURS[os] : flowCoreColours.textSecondary,
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 120ms ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {OS_LABELS[os]}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            {!profile ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: flowCoreColours.textTertiary }}>
                <p>No evolution data for {osLabel} yet.</p>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>
                  Personality drift will appear as the OS interacts with your campaign.
                </p>
              </div>
            ) : (
              <>
                {/* Personality Parameters */}
                <section style={{ marginBottom: '32px' }}>
                  <h3
                    style={{
                      margin: '0 0 16px 0',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: flowCoreColours.textPrimary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Personality Parameters
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <RadialGauge
                      label="Confidence"
                      value={profile.confidenceLevel}
                      colour={osColour}
                      baseline={0.5}
                    />
                    <RadialGauge
                      label="Verbosity"
                      value={profile.verbosity}
                      colour={osColour}
                      baseline={0.5}
                    />
                    <RadialGauge
                      label="Risk Tolerance"
                      value={profile.riskTolerance}
                      colour={osColour}
                      baseline={0.5}
                    />
                    <RadialGauge
                      label="Empathy"
                      value={profile.empathyLevel}
                      colour={osColour}
                      baseline={0.5}
                    />
                  </div>
                </section>

                {/* Emotional Bias */}
                <section style={{ marginBottom: '32px' }}>
                  <h3
                    style={{
                      margin: '0 0 16px 0',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: flowCoreColours.textPrimary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Emotional Bias
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {Object.entries(profile.emotionalBias).map(([emotion, weight]) => (
                      <EmotionBar
                        key={emotion}
                        emotion={emotion}
                        weight={weight}
                        colour={osColour}
                      />
                    ))}
                  </div>
                </section>

                {/* Recent Events */}
                {events.length > 0 && (
                  <section>
                    <h3
                      style={{
                        margin: '0 0 16px 0',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: flowCoreColours.textPrimary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Recent Evolution Events
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {events.map((event) => (
                        <EvolutionEventCard key={event.id} event={event} colour={osColour} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * Radial Gauge Component
 */
interface RadialGaugeProps {
  label: string
  value: number
  colour: string
  baseline: number
}

function RadialGauge({ label, value, colour, baseline }: RadialGaugeProps) {
  const delta = value - baseline
  const DeltaIcon = delta > 0.05 ? TrendingUp : delta < -0.05 ? TrendingDown : Minus

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 500, color: flowCoreColours.textSecondary }}>
          {label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <DeltaIcon
            size={14}
            strokeWidth={1.6}
            style={{
              color:
                delta > 0.05
                  ? colour
                  : delta < -0.05
                    ? flowCoreColours.errorRed
                    : flowCoreColours.textTertiary,
            }}
          />
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: flowCoreColours.textTertiary,
            }}
          >
            {(value * 100).toFixed(0)}%
          </span>
        </div>
      </div>
      <div
        style={{
          height: '8px',
          background: `${flowCoreColours.borderSubtle}`,
          borderRadius: '4px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${value * 100}%`,
            background: colour,
            borderRadius: '4px',
            transition: 'width 240ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
        {/* Baseline indicator */}
        <div
          style={{
            position: 'absolute',
            left: `${baseline * 100}%`,
            top: 0,
            bottom: 0,
            width: '2px',
            background: flowCoreColours.textTertiary,
            opacity: 0.4,
          }}
        />
      </div>
    </div>
  )
}

/**
 * Emotion Bar Component
 */
interface EmotionBarProps {
  emotion: string
  weight: number
  colour: string
}

function EmotionBar({ emotion, weight, colour }: EmotionBarProps) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 500,
            color: flowCoreColours.textSecondary,
            textTransform: 'capitalize',
          }}
        >
          {emotion}
        </span>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: flowCoreColours.textTertiary,
          }}
        >
          {(weight * 100).toFixed(0)}%
        </span>
      </div>
      <div
        style={{
          height: '6px',
          background: `${flowCoreColours.borderSubtle}`,
          borderRadius: '3px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${weight * 100}%`,
            background: `${colour}60`,
            borderRadius: '3px',
            transition: 'width 240ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      </div>
    </div>
  )
}

/**
 * Evolution Event Card Component
 */
interface EvolutionEventCardProps {
  event: any
  colour: string
}

function EvolutionEventCard({ event, colour }: EvolutionEventCardProps) {
  const timeAgo = getRelativeTime(event.createdAt)

  return (
    <div
      style={{
        padding: '12px',
        background: `${colour}08`,
        border: `1px solid ${colour}20`,
        borderRadius: '6px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 600,
            textTransform: 'uppercase',
            color: colour,
            letterSpacing: '0.5px',
          }}
        >
          {event.eventType.replace(/_/g, ' ')}
        </span>
        <span
          style={{
            fontSize: '10px',
            color: flowCoreColours.textTertiary,
          }}
        >
          {timeAgo}
        </span>
      </div>
      <p
        style={{
          margin: 0,
          fontSize: '12px',
          lineHeight: 1.5,
          color: flowCoreColours.textSecondary,
        }}
      >
        {event.reasoning}
      </p>
    </div>
  )
}

/**
 * Get relative time string
 */
function getRelativeTime(timestamp: string): string {
  const now = Date.now()
  const then = new Date(timestamp).getTime()
  const diffSecs = Math.floor((now - then) / 1000)

  if (diffSecs < 60) return `${diffSecs}s ago`
  if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`
  if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`
  return `${Math.floor(diffSecs / 86400)}d ago`
}
