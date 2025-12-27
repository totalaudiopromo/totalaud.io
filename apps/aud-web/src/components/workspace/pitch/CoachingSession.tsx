/**
 * Coaching Session Component
 * Phase 1.5: Intelligence Navigator - Multi-turn Q&A coaching
 *
 * Provides guided conversations with the AI coach:
 * - Quick Tips mode for fast feedback
 * - Guided mode for deep-dive coaching sessions
 * - Phase progression (Foundation → Refinement → Optimisation)
 * - Follow-up suggestions for continued dialogue
 */

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  usePitchStore,
  selectCoachingSession,
  type CoachingMode,
  type CoachingMessage,
} from '@/stores/usePitchStore'
import { TypingIndicator } from '@/components/ui/EmptyState'

// Phase labels and descriptions
const PHASE_INFO: Record<string, { label: string; description: string }> = {
  foundation: {
    label: 'Foundation',
    description: 'Understanding your sound and story',
  },
  refinement: {
    label: 'Refinement',
    description: 'Shaping your message',
  },
  optimisation: {
    label: 'Optimisation',
    description: 'Final polish',
  },
}

// Mode labels
const MODE_LABELS: Record<CoachingMode, { label: string; icon: string; description: string }> = {
  quick: {
    label: 'Quick Tips',
    icon: '⚡',
    description: 'Fast, actionable feedback',
  },
  guided: {
    label: 'Deep Dive',
    icon: '🎯',
    description: 'Guided coaching conversation',
  },
}

export function CoachingSession() {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Store selectors
  const {
    session: messages,
    mode,
    phase,
    isActive,
    isLoading,
    error,
  } = usePitchStore(selectCoachingSession)

  const startCoachingSession = usePitchStore((s) => s.startCoachingSession)
  const endCoachingSession = usePitchStore((s) => s.endCoachingSession)
  const sendSessionMessage = usePitchStore((s) => s.sendSessionMessage)
  const clearCoachingSession = usePitchStore((s) => s.clearCoachingSession)
  const selectedSectionId = usePitchStore((s) => s.selectedSectionId)
  const closeCoach = usePitchStore((s) => s.closeCoach)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Focus input when session starts
  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isActive])

  // Handle sending a message
  const handleSend = useCallback(async () => {
    const content = inputValue.trim()
    if (!content || isLoading) return

    setInputValue('')
    await sendSessionMessage(content, selectedSectionId || undefined)
  }, [inputValue, isLoading, sendSessionMessage, selectedSectionId])

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Handle clicking a suggestion
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    inputRef.current?.focus()
  }

  // Mode selection view
  if (!isActive) {
    return (
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold text-tap-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-tap-cyan" aria-hidden="true" />
            AI Coach
          </h3>
          <button
            onClick={() => closeCoach()}
            aria-label="Close AI coach panel"
            className="text-xs text-tap-grey hover:text-white transition-colors"
          >
            Close
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <p className="text-xs text-tap-grey text-center mb-6 leading-relaxed">
            Choose how you'd like to work with your coach today
          </p>

          <div className="space-y-3">
            {(Object.entries(MODE_LABELS) as [CoachingMode, typeof MODE_LABELS.quick][]).map(
              ([modeKey, info]) => (
                <motion.button
                  key={modeKey}
                  onClick={() => startCoachingSession(modeKey)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-4 rounded-xl bg-[#161A1D] border border-white/5 hover:border-tap-cyan/30 hover:shadow-[0_0_20px_-10px_rgba(58,169,190,0.3)] transition-all duration-300 text-left group"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-lg" aria-hidden="true">
                      {info.icon}
                    </span>
                    <span className="text-sm font-medium text-tap-white group-hover:text-white">
                      {info.label}
                    </span>
                  </div>
                  <p className="text-xs text-tap-grey pl-8">{info.description}</p>
                </motion.button>
              )
            )}
          </div>
        </div>
      </div>
    )
  }

  // Active session view
  return (
    <div className="flex flex-col h-full">
      {/* Header with phase indicator */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-tap-cyan animate-pulse" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-tap-white">
              {mode && MODE_LABELS[mode].label}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => clearCoachingSession()}
              aria-label="Clear conversation"
              className="text-[10px] text-tap-grey hover:text-white transition-colors"
            >
              Clear
            </button>
            <button
              onClick={() => endCoachingSession()}
              aria-label="End session"
              className="text-[10px] text-tap-grey hover:text-white transition-colors"
            >
              End
            </button>
          </div>
        </div>

        {/* Phase indicator (guided mode only) */}
        {mode === 'guided' && phase && (
          <div className="flex items-center gap-2">
            <span
              className={`
                px-2 py-0.5 text-[10px] font-medium rounded-full
                ${phase === 'foundation' ? 'bg-blue-500/20 text-blue-400' : ''}
                ${phase === 'refinement' ? 'bg-amber-500/20 text-amber-400' : ''}
                ${phase === 'optimisation' ? 'bg-green-500/20 text-green-400' : ''}
              `}
            >
              {PHASE_INFO[phase].label}
            </span>
            <span className="text-[10px] text-tap-grey">{PHASE_INFO[phase].description}</span>
          </div>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* Welcome message */}
        {messages.length === 0 && (
          <div className="p-4 rounded-xl bg-tap-cyan/5 border border-tap-cyan/10 text-xs text-tap-cyan/80 leading-relaxed">
            {mode === 'quick' ? (
              <>
                Ready for quick tips! Ask me anything about your pitch and I'll give you fast,
                actionable feedback.
              </>
            ) : (
              <>
                Let's dive deep into your pitch together. I'll ask questions to understand your
                music and help you find your authentic voice. What would you like to work on?
              </>
            )}
          </div>
        )}

        {/* Message history */}
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onSuggestionClick={handleSuggestionClick}
            />
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3"
          >
            <TypingIndicator />
            <span className="text-xs text-tap-cyan/70">Coach is thinking...</span>
          </motion.div>
        )}

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-tap-white/90"
          >
            {error}
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-white/5">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={mode === 'quick' ? 'Ask for quick tips...' : 'Share your thoughts...'}
            disabled={isLoading}
            rows={2}
            className="flex-1 px-3 py-2 text-sm text-tap-white bg-[#161A1D] border border-white/10 rounded-lg resize-none outline-none focus:border-tap-cyan/30 focus:ring-1 focus:ring-tap-cyan/20 placeholder:text-tap-grey/50 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
            aria-label="Send message"
            className="px-4 py-2 text-sm font-medium text-tap-black bg-tap-cyan rounded-lg hover:bg-tap-cyan/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_-5px_rgba(58,169,190,0.5)]"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

// Message bubble component
function MessageBubble({
  message,
  onSuggestionClick,
}: {
  message: CoachingMessage
  onSuggestionClick: (suggestion: string) => void
}) {
  const isCoach = message.role === 'coach'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex ${isCoach ? 'justify-start' : 'justify-end'}`}
    >
      <div
        className={`
          max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed
          ${
            isCoach
              ? 'bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/5 text-tap-white/90'
              : 'bg-tap-cyan/10 border border-tap-cyan/20 text-tap-white'
          }
        `}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>

        {/* Follow-up suggestions */}
        {isCoach && message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <p className="text-[10px] text-tap-grey mb-2">Suggested follow-ups:</p>
            <div className="flex flex-wrap gap-1.5">
              {message.suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => onSuggestionClick(suggestion)}
                  className="px-2 py-1 text-[10px] text-tap-cyan bg-tap-cyan/5 hover:bg-tap-cyan/10 border border-tap-cyan/20 rounded-full transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
