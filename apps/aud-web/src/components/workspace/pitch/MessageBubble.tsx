import React from 'react'
import { motion } from 'framer-motion'
import { CoachingMessage } from '@/stores/usePitchStore'

interface MessageBubbleProps {
  message: CoachingMessage
  onSuggestionClick: (suggestion: string) => void
}

export function MessageBubble({ message, onSuggestionClick }: MessageBubbleProps) {
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
