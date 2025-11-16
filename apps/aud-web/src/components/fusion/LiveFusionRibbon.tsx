/**
 * Live Fusion Ribbon
 * Phase 12B: Real-Time Multi-OS Collaboration
 *
 * Shows last 3 fusion messages as a ticker/ribbon
 */

'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { useCampaignState } from '@totalaud/os-state/campaign'
import { Brain, X } from 'lucide-react'

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

export interface LiveFusionRibbonProps {
  onOpenFusion?: (os?: string) => void
}

export function LiveFusionRibbon({ onOpenFusion }: LiveFusionRibbonProps) {
  const fusion = useCampaignState((state) => state.fusion)
  const setLiveEnabled = useCampaignState((state) => state.setLiveEnabled)
  const [recentMessages, setRecentMessages] = useState<any[]>([])

  useEffect(() => {
    if (!fusion.currentSession || !fusion.liveEnabled) {
      setRecentMessages([])
      return
    }

    // Get last 3 messages from current session
    const sessionMessages = fusion.messages
      .filter((msg) => msg.sessionId === fusion.currentSession?.id)
      .slice(-3)
      .reverse()

    setRecentMessages(sessionMessages)
  }, [fusion.messages, fusion.currentSession, fusion.liveEnabled])

  // Don't show ribbon if:
  // - No active session
  // - Live fusion is disabled
  // - No recent messages
  if (!fusion.currentSession || !fusion.liveEnabled || recentMessages.length === 0) {
    return null
  }

  const handleToggleLive = () => {
    setLiveEnabled(false)
  }

  const handleMessageClick = (os: string) => {
    if (onOpenFusion) {
      onOpenFusion(os)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: `${flowCoreColours.matteBlack}f5`,
          backdropFilter: 'blur(12px)',
          borderTop: `1px solid ${flowCoreColours.borderSubtle}`,
          zIndex: 50,
          padding: '12px 20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            maxWidth: '1400px',
            margin: '0 auto',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexShrink: 0,
            }}
          >
            <Brain size={16} strokeWidth={1.6} style={{ color: flowCoreColours.slateCyan }} />
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                color: flowCoreColours.slateCyan,
                letterSpacing: '0.5px',
              }}
            >
              Live Fusion
            </span>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              gap: '12px',
              overflow: 'hidden',
            }}
          >
            {recentMessages.map((message, index) => {
              const osColour = OS_COLOURS[message.os] || flowCoreColours.slateCyan
              const osLabel = OS_LABELS[message.os] || message.os
              const content =
                typeof message.content === 'string'
                  ? message.content
                  : message.content?.message || ''
              const truncated = content.length > 80 ? `${content.slice(0, 80)}...` : content

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleMessageClick(message.os)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    background: `${osColour}10`,
                    border: `1px solid ${osColour}30`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    flexShrink: 0,
                    maxWidth: '320px',
                    transition: 'all var(--flowcore-motion-fast) ease',
                  }}
                  whileHover={{
                    borderColor: osColour,
                    background: `${osColour}20`,
                  }}
                >
                  {/* OS Badge */}
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: osColour,
                      padding: '2px 6px',
                      background: `${osColour}30`,
                      borderRadius: '3px',
                      flexShrink: 0,
                    }}
                  >
                    {osLabel}
                  </span>

                  {/* Message */}
                  <span
                    style={{
                      fontSize: '12px',
                      color: flowCoreColours.textSecondary,
                      lineHeight: 1.4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {truncated}
                  </span>
                </motion.div>
              )
            })}
          </div>

          {/* Close Button */}
          <button
            onClick={handleToggleLive}
            style={{
              background: 'transparent',
              border: 'none',
              color: flowCoreColours.textTertiary,
              cursor: 'pointer',
              padding: '4px',
              lineHeight: 1,
              flexShrink: 0,
            }}
            aria-label="Disable live fusion"
          >
            <X size={16} strokeWidth={1.6} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
