/**
 * Coaching Session Component
 * Phase 1.5: Intelligence Navigator - Multi-turn Q&A coaching
 * Phase 2: DESSA Speed Improvements
 *
 * Provides guided conversations with the AI coach:
 * - Quick Tips mode for fast feedback
 * - Guided mode for deep-dive coaching sessions
 * - Phase progression (Foundation → Refinement → Optimisation)
 * - Follow-up suggestions for continued dialogue
 * - Quick action chips for faster interaction
 *
 * FUTURE ENHANCEMENT: Streaming responses for real-time feedback
 * - Requires API route changes to use ReadableStream
 * - Frontend to handle partial responses
 * - Would significantly improve perceived speed
 */

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  usePitchStore,
  selectCoachingSession,
  type CoachingMode,
  type CoachingPhase,
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
    label: 'Polish',
    description: 'Final refinement',
  },
}

// Mode labels - using SVG icons instead of emojis
const MODE_LABELS: Record<
  CoachingMode,
  { label: string; iconType: 'bolt' | 'target'; description: string }
> = {
  quick: {
    label: 'Quick Tips',
    iconType: 'bolt',
    description: 'Fast, actionable feedback',
  },
  guided: {
    label: 'Deep Dive',
    iconType: 'target',
    description: 'Guided coaching conversation',
  },
}

// Quick action suggestions based on mode and phase (DESSA Phase 2)
const QUICK_ACTIONS: Record<
  CoachingMode,
  Record<CoachingPhase, { label: string; message: string }[]>
> = {
  quick: {
    foundation: [
      { label: 'Improve this section', message: 'Help me improve the section I am working on' },
      { label: 'Check my hook', message: 'Is my hook strong enough?' },
      { label: 'Make it shorter', message: 'Help me make this more concise' },
      { label: 'Add personality', message: 'How can I add more personality to this?' },
    ],
    refinement: [
      { label: 'Make it punchier', message: 'Make this more punchy and impactful' },
      { label: 'Check clarity', message: 'Is my message clear?' },
      { label: 'Improve the hook', message: 'How can I strengthen my hook?' },
      { label: 'Cut the fluff', message: 'What should I remove?' },
    ],
    optimisation: [
      { label: 'Is this ready?', message: 'Is this pitch ready to send?' },
      { label: 'Final polish', message: 'Give me final polish suggestions' },
      { label: 'Check the ask', message: 'Is my ask clear and specific?' },
      { label: 'One last review', message: 'Do a final review of everything' },
    ],
  },
  guided: {
    foundation: [
      { label: 'What makes me unique?', message: 'Help me identify what makes my sound unique' },
      { label: 'My influences', message: 'How should I describe my influences?' },
      { label: 'Target audience', message: 'Who is my ideal listener?' },
      { label: 'My story', message: 'What story should I tell?' },
    ],
    refinement: [
      { label: 'Strengthen the hook', message: 'How can I make my hook more compelling?' },
      { label: 'More vivid language', message: 'Help me use more vivid language' },
      { label: 'What is not working?', message: 'What parts should I cut or change?' },
      { label: 'Does this sound like me?', message: 'Does this feel authentic to my voice?' },
    ],
    optimisation: [
      { label: 'Ready to send?', message: 'Is this pitch ready to send?' },
      { label: 'Check my ask', message: 'Is my ask clear and compelling?' },
      { label: 'Every word counts', message: 'Help me make every word count' },
      { label: 'Match the target', message: 'Does this match my target audience?' },
    ],
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

  // Handle quick action click - send immediately
  const handleQuickActionClick = async (message: string) => {
    if (isLoading) return
    await sendSessionMessage(message, selectedSectionId || undefined)
  }

  // Get quick actions based on current mode and phase
  const quickActions = mode && phase ? QUICK_ACTIONS[mode][phase] : QUICK_ACTIONS.quick.foundation

  // Mode selection view
  if (!isActive) {
    return (
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold text-ta-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-ta-cyan" aria-hidden="true" />
            Second Opinion
          </h3>
          <button
            onClick={() => closeCoach()}
            aria-label="Close second opinion panel"
            className="text-xs text-ta-grey hover:text-white transition-colors"
          >
            Close
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <p className="text-xs text-ta-grey text-center mb-6 leading-relaxed">
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
                  className="w-full p-4 rounded-xl bg-[#161A1D] border border-white/5 hover:border-ta-cyan/30 hover:shadow-[0_0_20px_-10px_rgba(58,169,190,0.3)] transition-all duration-300 text-left group"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span className="w-5 h-5 text-ta-cyan" aria-hidden="true">
                      {info.iconType === 'bolt' ? (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <circle cx="12" cy="12" r="6" />
                          <circle cx="12" cy="12" r="2" />
                        </svg>
                      )}
                    </span>
                    <span className="text-sm font-medium text-ta-white group-hover:text-white">
                      {info.label}
                    </span>
                  </div>
                  <p className="text-xs text-ta-grey pl-8">{info.description}</p>
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
            <span className="w-2 h-2 rounded-full bg-ta-cyan animate-pulse" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-ta-white">
              {mode && MODE_LABELS[mode].label}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => clearCoachingSession()}
              aria-label="Clear conversation"
              className="text-[10px] text-ta-grey hover:text-white transition-colors"
            >
              Clear
            </button>
            <button
              onClick={() => endCoachingSession()}
              aria-label="End session"
              className="text-[10px] text-ta-grey hover:text-white transition-colors"
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
            <span className="text-[10px] text-ta-grey">{PHASE_INFO[phase].description}</span>
          </div>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* Welcome message */}
        {messages.length === 0 && (
          <>
            <div className="p-4 rounded-xl bg-ta-cyan/5 border border-ta-cyan/10 text-xs text-ta-cyan/80 leading-relaxed">
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

            {/* Quick action chips (DESSA Phase 2 - Speed Improvement) */}
            <div className="space-y-2">
              <p className="text-[10px] text-ta-grey px-1">Quick start:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <motion.button
                    key={action.message}
                    onClick={() => handleQuickActionClick(action.message)}
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-3 py-2 text-xs font-medium text-ta-white bg-ta-cyan/10 hover:bg-ta-cyan/15 border border-ta-cyan/20 hover:border-ta-cyan/30 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_-5px_rgba(58,169,190,0.3)]"
                  >
                    {action.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </>
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
            <span className="text-xs text-ta-cyan/70">Working...</span>
          </motion.div>
        )}

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-ta-white/90"
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
            className="flex-1 px-3 py-2 text-sm text-ta-white bg-[#161A1D] border border-white/10 rounded-lg resize-none outline-none focus:border-ta-cyan/30 focus:ring-1 focus:ring-ta-cyan/20 placeholder:text-ta-grey/50 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
            aria-label="Send message"
            className="px-4 py-2 text-sm font-medium text-ta-black bg-ta-cyan rounded-lg hover:bg-ta-cyan/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_-5px_rgba(58,169,190,0.5)]"
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
              ? 'bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/5 text-ta-white/90'
              : 'bg-ta-cyan/10 border border-ta-cyan/20 text-ta-white'
          }
        `}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>

        {/* Follow-up suggestions */}
        {isCoach && message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <p className="text-[10px] text-ta-grey mb-2">Suggested follow-ups:</p>
            <div className="flex flex-wrap gap-1.5">
              {message.suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => onSuggestionClick(suggestion)}
                  className="px-2 py-1 text-[10px] text-ta-cyan bg-ta-cyan/5 hover:bg-ta-cyan/10 border border-ta-cyan/20 rounded-full transition-colors"
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
