'use client'

/**
 * Agent Decision Modal
 * Handles agent requests that require user input or decisions
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { agentDialogue, formatMessageForOS } from '@totalaud/agents/dialogue'
import type { AgentMessage } from '@totalaud/agents/dialogue'
import { useCampaignStore } from '@/stores/campaign'
import { X, AlertCircle, HelpCircle, Info } from 'lucide-react'

interface AgentDecisionModalProps {
  onResponse?: (messageId: string, response: string) => void
}

const AGENT_COLOURS: Record<string, string> = {
  scout: '#51CF66',
  coach: '#8B5CF6',
  tracker: '#3AA9BE',
  insight: '#F59E0B',
}

const PRIORITY_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  low: Info,
  medium: HelpCircle,
  high: AlertCircle,
  critical: AlertCircle,
}

export function AgentDecisionModal({ onResponse }: AgentDecisionModalProps) {
  const [pendingMessages, setPendingMessages] = useState<AgentMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState<AgentMessage | null>(null)
  const [customResponse, setCustomResponse] = useState('')

  const currentTheme = useCampaignStore((state) => state.meta.currentTheme)

  // Subscribe to messages requiring decisions
  useEffect(() => {
    const unsubscribe = agentDialogue.subscribe((message) => {
      if (message.requiresUserDecision) {
        setPendingMessages((prev) => [...prev, message])
      }
    })

    // Load any existing pending decisions
    const existing = agentDialogue.getPendingDecisions()
    if (existing.length > 0) {
      setPendingMessages(existing)
    }

    return unsubscribe
  }, [])

  // Show next pending message
  useEffect(() => {
    if (!currentMessage && pendingMessages.length > 0) {
      setCurrentMessage(pendingMessages[0])
    }
  }, [pendingMessages, currentMessage])

  const handleResponse = (response: string) => {
    if (!currentMessage) return

    // Dismiss the message
    agentDialogue.dismissMessage(currentMessage.id)

    // Notify parent component
    onResponse?.(currentMessage.id, response)

    // Remove from pending and clear current
    setPendingMessages((prev) => prev.filter((msg) => msg.id !== currentMessage.id))
    setCurrentMessage(null)
    setCustomResponse('')
  }

  const handleDismiss = () => {
    if (!currentMessage) return

    agentDialogue.dismissMessage(currentMessage.id)
    setPendingMessages((prev) => prev.filter((msg) => msg.id !== currentMessage.id))
    setCurrentMessage(null)
    setCustomResponse('')
  }

  if (!currentMessage) return null

  const agentColour = AGENT_COLOURS[currentMessage.agent] || '#6B7280'
  const PriorityIcon = PRIORITY_ICONS[currentMessage.priority] || HelpCircle
  const formattedMessage = formatMessageForOS(currentMessage, currentTheme)

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-centre justify-centre"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.24 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleDismiss}
        />

        {/* Modal */}
        <motion.div
          className="relative z-10 w-full max-w-lg rounded-lg border border-[var(--flowcore-colour-border)] bg-[var(--flowcore-colour-bg)] shadow-2xl"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          style={{
            borderTop: `4px solid ${agentColour}`,
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[var(--flowcore-colour-border)] p-4">
            <div className="flex items-start gap-3">
              {/* Agent Indicator */}
              <div
                className="flex h-10 w-10 items-centre justify-centre rounded-full font-mono text-sm font-bold uppercase"
                style={{
                  backgroundColor: `${agentColour}20`,
                  color: agentColour,
                }}
              >
                {currentMessage.agent.slice(0, 2)}
              </div>

              {/* Title */}
              <div>
                <div className="flex items-centre gap-2">
                  <h3 className="font-mono font-semibold text-[var(--flowcore-colour-fg)]">
                    {currentMessage.agent.charAt(0).toUpperCase() +
                      currentMessage.agent.slice(1)}{' '}
                    needs your input
                  </h3>
                  <PriorityIcon
                    size={16}
                    className={`${
                      currentMessage.priority === 'critical'
                        ? 'text-[var(--flowcore-colour-error)]'
                        : 'text-[var(--flowcore-colour-fg)]/70'
                    }`}
                  />
                </div>
                <p className="mt-0.5 font-mono text-xs uppercase tracking-wide text-[var(--flowcore-colour-fg)]/50">
                  {currentMessage.priority} priority
                </p>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="rounded p-1 text-[var(--flowcore-colour-fg)]/70 transition-colours hover:bg-[var(--flowcore-colour-fg)]/10 hover:text-[var(--flowcore-colour-fg)]"
            >
              <X size={20} />
            </button>
          </div>

          {/* Message Content */}
          <div className="p-6">
            <p className="font-mono text-sm leading-relaxed text-[var(--flowcore-colour-fg)]">
              {formattedMessage}
            </p>

            {/* Context Info */}
            {currentMessage.context && Object.keys(currentMessage.context).length > 0 && (
              <div className="mt-4 rounded border border-[var(--flowcore-colour-border)] bg-[var(--flowcore-overlay-soft)] p-3">
                <p className="mb-2 font-mono text-xs font-semibold uppercase text-[var(--flowcore-colour-fg)]/70">
                  Context:
                </p>
                <pre className="font-mono text-xs text-[var(--flowcore-colour-fg)]/80">
                  {JSON.stringify(currentMessage.context, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Response Options */}
          <div className="border-t border-[var(--flowcore-colour-border)] p-4">
            {currentMessage.options && currentMessage.options.length > 0 ? (
              <div className="space-y-2">
                <p className="mb-3 font-mono text-xs font-semibold uppercase text-[var(--flowcore-colour-fg)]/70">
                  Choose an option:
                </p>
                {currentMessage.options.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleResponse(option)}
                    className="w-full rounded border border-[var(--flowcore-colour-border)] bg-[var(--flowcore-overlay-soft)] px-4 py-3 font-mono text-sm text-[var(--flowcore-colour-fg)] transition-all hover:border-[var(--flowcore-colour-accent)] hover:bg-[var(--flowcore-colour-accent)]/10"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.12 }}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="font-mono text-xs font-semibold uppercase text-[var(--flowcore-colour-fg)]/70">
                  Your response:
                </p>
                <textarea
                  value={customResponse}
                  onChange={(e) => setCustomResponse(e.target.value)}
                  placeholder="Type your response..."
                  className="w-full rounded border border-[var(--flowcore-colour-border)] bg-[var(--flowcore-overlay-soft)] px-3 py-2 font-mono text-sm text-[var(--flowcore-colour-fg)] placeholder-[var(--flowcore-colour-fg)]/40 outline-none focus:border-[var(--flowcore-colour-accent)]"
                  rows={3}
                />
                <button
                  onClick={() => customResponse.trim() && handleResponse(customResponse)}
                  disabled={!customResponse.trim()}
                  className="w-full rounded bg-[var(--flowcore-colour-accent)] px-4 py-2 font-mono text-sm font-semibold text-white transition-all hover:bg-[var(--flowcore-colour-accent)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ opacity: customResponse.trim() ? 1 : 0.5 }}
                >
                  Submit Response
                </button>
              </div>
            )}
          </div>

          {/* Queue Indicator */}
          {pendingMessages.length > 1 && (
            <div className="border-t border-[var(--flowcore-colour-border)] bg-[var(--flowcore-overlay-soft)] px-4 py-2">
              <p className="font-mono text-xs text-[var(--flowcore-colour-fg)]/60">
                {pendingMessages.length - 1} more decision{pendingMessages.length > 2 ? 's' : ''}{' '}
                pending
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
