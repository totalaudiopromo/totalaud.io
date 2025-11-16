/**
 * Fusion Interrupt Modal
 * Phase 12B: Real-Time Multi-OS Collaboration
 *
 * Shows urgent OS insights for high-severity events
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { liveEventBus, type LiveEventPayload } from '@totalaud/agents/events'
import { AlertTriangle, CheckCircle, X, Brain } from 'lucide-react'

const OS_COLOURS: Record<string, string> = {
  ascii: '#00ff99',
  xp: '#3478f6',
  aqua: '#3b82f6',
  daw: '#ff8000',
  analogue: '#ff1aff',
}

const OS_LABELS: Record<string, string> = {
  ascii: 'ASCII',
  xp: 'XP',
  aqua: 'Aqua',
  daw: 'DAW',
  analogue: 'Analogue',
}

interface InterruptData {
  event: LiveEventPayload
  message: string
  actions: Array<{
    label: string
    onClick: () => void
  }>
}

const COOLDOWN_MS = 60000 // 1 minute cooldown between interrupts

export function FusionInterruptModal() {
  const [interrupt, setInterrupt] = useState<InterruptData | null>(null)
  const [lastInterruptAt, setLastInterruptAt] = useState(0)

  const handleEvent = useCallback((event: LiveEventPayload) => {
    // Only show for high-severity events
    if (event.severity !== 'warning' && event.severity !== 'critical') {
      return
    }

    // Check cooldown
    const now = Date.now()
    if (now - lastInterruptAt < COOLDOWN_MS) {
      console.log('[FusionInterrupt] Cooldown active, ignoring event')
      return
    }

    // Create interrupt data
    const interruptData = createInterruptData(event)
    if (!interruptData) return

    setInterrupt(interruptData)
    setLastInterruptAt(now)

    // Auto-dismiss after 15 seconds
    setTimeout(() => {
      setInterrupt(null)
    }, 15000)
  }, [lastInterruptAt])

  useEffect(() => {
    const unsubscribe = liveEventBus.subscribe(handleEvent)
    return () => unsubscribe()
  }, [handleEvent])

  const handleDismiss = () => {
    setInterrupt(null)
  }

  if (!interrupt) return null

  const osColour = interrupt.event.osHint
    ? OS_COLOURS[interrupt.event.osHint]
    : flowCoreColours.slateCyan
  const osLabel = interrupt.event.osHint
    ? OS_LABELS[interrupt.event.osHint]
    : 'System'
  const SeverityIcon = interrupt.event.severity === 'critical' ? AlertTriangle : CheckCircle

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
        onClick={handleDismiss}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: flowCoreColours.matteBlack,
            border: `1px solid ${osColour}`,
            borderRadius: '8px',
            maxWidth: '480px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: `0 0 32px ${osColour}40`,
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: `${osColour}20`,
                    border: `2px solid ${osColour}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Brain size={20} strokeWidth={1.6} style={{ color: osColour }} />
                </div>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '16px',
                      fontWeight: 600,
                      color: osColour,
                      marginBottom: '4px',
                    }}
                  >
                    {osLabel} has an insight
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <SeverityIcon
                      size={14}
                      strokeWidth={1.6}
                      style={{
                        color:
                          interrupt.event.severity === 'critical'
                            ? flowCoreColours.errorRed
                            : osColour,
                      }}
                    />
                    <span
                      style={{
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        color:
                          interrupt.event.severity === 'critical'
                            ? flowCoreColours.errorRed
                            : osColour,
                        letterSpacing: '0.5px',
                      }}
                    >
                      {interrupt.event.severity}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: flowCoreColours.textTertiary,
                  cursor: 'pointer',
                  padding: '4px',
                  lineHeight: 1,
                }}
                aria-label="Dismiss"
              >
                <X size={18} strokeWidth={1.6} />
              </button>
            </div>
          </div>

          {/* Message */}
          <div style={{ padding: '20px' }}>
            <p
              style={{
                margin: 0,
                fontSize: '14px',
                lineHeight: 1.6,
                color: flowCoreColours.textPrimary,
              }}
            >
              {interrupt.message}
            </p>
          </div>

          {/* Actions */}
          {interrupt.actions.length > 0 && (
            <div
              style={{
                padding: '16px 20px',
                borderTop: `1px solid ${flowCoreColours.borderSubtle}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {interrupt.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    action.onClick()
                    handleDismiss()
                  }}
                  style={{
                    padding: '10px 16px',
                    background: index === 0 ? osColour : 'transparent',
                    border: `1px solid ${osColour}`,
                    borderRadius: '4px',
                    color: index === 0 ? flowCoreColours.matteBlack : osColour,
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all var(--flowcore-motion-fast) ease',
                  }}
                  onMouseEnter={(e) => {
                    if (index !== 0) {
                      e.currentTarget.style.background = `${osColour}20`
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (index !== 0) {
                      e.currentTarget.style.background = 'transparent'
                    }
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              padding: '12px 20px',
              borderTop: `1px solid ${flowCoreColours.borderSubtle}`,
              fontSize: '11px',
              color: flowCoreColours.textTertiary,
              textAlign: 'center',
            }}
          >
            This insight will auto-dismiss in 15 seconds
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * Create interrupt data from event
 */
function createInterruptData(event: LiveEventPayload): InterruptData | null {
  switch (event.type) {
    case 'agent_warning':
      return {
        event,
        message: `I've detected a potential issue with ${event.entityType || 'this campaign'}. You might want to review it.`,
        actions: [
          {
            label: 'Open Fusion Mode',
            onClick: () => {
              // TODO: Open fusion mode
              console.log('Open fusion mode')
            },
          },
          {
            label: 'View details',
            onClick: () => {
              // TODO: Navigate to entity
              console.log('View details')
            },
          },
          {
            label: 'Ignore for now',
            onClick: () => {
              // No-op, just dismiss
            },
          },
        ],
      }

    case 'loop_suggestion_created':
      return {
        event,
        message: `I've got a suggestion that could improve your campaign. Want to hear it?`,
        actions: [
          {
            label: 'Show suggestion',
            onClick: () => {
              // TODO: Open loop suggestions
              console.log('Show suggestion')
            },
          },
          {
            label: 'Ignore for now',
            onClick: () => {
              // No-op
            },
          },
        ],
      }

    case 'fusion_message_created':
      // Only show if consensus or tension
      const metadata = event.meta as any
      if (metadata?.sentiment === 'critical') {
        return {
          event,
          message: `Multiple perspectives are highlighting a critical point. This might need your attention.`,
          actions: [
            {
              label: 'Open Fusion Mode',
              onClick: () => {
                // TODO: Open fusion mode
                console.log('Open fusion mode')
              },
            },
            {
              label: 'Ignore for now',
              onClick: () => {
                // No-op
              },
            },
          ],
        }
      }
      return null

    default:
      return null
  }
}
