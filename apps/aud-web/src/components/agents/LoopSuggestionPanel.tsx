'use client'

/**
 * Loop Suggestion Panel
 * Display and manage loop suggestions from agents
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLoops } from '@totalaud/os-state/campaign'
import type { LoopSuggestion, LoopInterval } from '@totalaud/os-state/campaign'
import { X, Check, Edit, Lightbulb, AlertCircle, TrendingUp } from 'lucide-react'

interface LoopSuggestionPanelProps {
  isOpen: boolean
  onClose: () => void
  onAccept?: (suggestion: LoopSuggestion) => void
  onModify?: (suggestion: LoopSuggestion) => void
}

const AGENT_COLOURS: Record<string, string> = {
  scout: '#51CF66',
  coach: '#8B5CF6',
  tracker: '#3AA9BE',
  insight: '#F59E0B',
}

const INTERVAL_LABELS: Record<LoopInterval, string> = {
  '5m': '5 min',
  '15m': '15 min',
  '1h': '1 hour',
  'daily': 'Daily',
}

const SUGGESTION_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  improvement: TrendingUp,
  exploration: Lightbulb,
  healthcheck: AlertCircle,
  emotion: Lightbulb,
  prediction: TrendingUp,
}

export function LoopSuggestionPanel({
  isOpen,
  onClose,
  onAccept,
  onModify,
}: LoopSuggestionPanelProps) {
  const { loops, updateLoopSuggestion, removeLoopSuggestion } = useLoops()
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all')

  const filteredSuggestions = loops.loopSuggestions.filter((suggestion) => {
    if (filter === 'all') return true
    return suggestion.status === filter
  })

  const handleAccept = (suggestion: LoopSuggestion) => {
    updateLoopSuggestion(suggestion.id, 'accepted')
    onAccept?.(suggestion)
  }

  const handleDecline = (suggestion: LoopSuggestion) => {
    updateLoopSuggestion(suggestion.id, 'declined')
  }

  const handleModify = (suggestion: LoopSuggestion) => {
    onModify?.(suggestion)
  }

  const handleDismiss = (suggestionId: string) => {
    removeLoopSuggestion(suggestionId)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

        {/* Panel */}
        <motion.div
          className="relative z-10 flex h-[600px] w-full max-w-lg flex-col border-l border-t border-[var(--flowcore-colour-border)] bg-[var(--flowcore-colour-bg)] shadow-2xl"
          initial={{ x: '100%', y: '100%' }}
          animate={{ x: 0, y: 0 }}
          exit={{ x: '100%', y: '100%' }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Header */}
          <div className="flex items-centre justify-between border-b border-[var(--flowcore-colour-border)] p-4">
            <div>
              <h2 className="font-mono text-lg font-semibold text-[var(--flowcore-colour-fg)]">
                Loop Suggestions
              </h2>
              <p className="mt-0.5 font-mono text-xs text-[var(--flowcore-colour-fg)]/70">
                {filteredSuggestions.length} suggestions
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded p-2 text-[var(--flowcore-colour-fg)]/70 transition-colours hover:bg-[var(--flowcore-colour-fg)]/10 hover:text-[var(--flowcore-colour-fg)]"
              aria-label="Close panel"
            >
              <X size={20} />
            </button>
          </div>

          {/* Filter */}
          <div className="border-b border-[var(--flowcore-colour-border)] p-4">
            <div className="flex gap-2">
              {(['all', 'pending', 'accepted', 'declined'] as const).map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`rounded px-3 py-1.5 font-mono text-xs font-semibold uppercase transition-all ${
                    filter === filterOption
                      ? 'bg-[var(--flowcore-colour-accent)] text-white'
                      : 'bg-[var(--flowcore-overlay-soft)] text-[var(--flowcore-colour-fg)]/70 hover:bg-[var(--flowcore-colour-fg)]/10'
                  }`}
                >
                  {filterOption}
                </button>
              ))}
            </div>
          </div>

          {/* Suggestions List */}
          <div className="flex-1 overflow-y-auto p-4">
            {filteredSuggestions.length === 0 ? (
              <div className="flex h-full items-centre justify-centre text-[var(--flowcore-colour-fg)]/50">
                <div className="text-centre">
                  <Lightbulb size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="font-mono text-sm">No loop suggestions</p>
                  <p className="mt-1 font-mono text-xs">
                    Agents will suggest autonomous loops based on campaign activity
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSuggestions.map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onAccept={() => handleAccept(suggestion)}
                    onDecline={() => handleDecline(suggestion)}
                    onModify={() => handleModify(suggestion)}
                    onDismiss={() => handleDismiss(suggestion.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

interface SuggestionCardProps {
  suggestion: LoopSuggestion
  onAccept: () => void
  onDecline: () => void
  onModify: () => void
  onDismiss: () => void
}

function SuggestionCard({
  suggestion,
  onAccept,
  onDecline,
  onModify,
  onDismiss,
}: SuggestionCardProps) {
  const agentColour = AGENT_COLOURS[suggestion.agent] || '#6B7280'
  const Icon = SUGGESTION_ICONS[suggestion.loopType] || Lightbulb

  const isPending = suggestion.status === 'pending'
  const isAccepted = suggestion.status === 'accepted'
  const isDeclined = suggestion.status === 'declined'

  return (
    <motion.div
      className="rounded-lg border border-[var(--flowcore-colour-border)] bg-[var(--flowcore-overlay-soft)] p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.12 }}
      layout
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className="flex h-10 w-10 items-centre justify-centre rounded-full"
            style={{
              backgroundColor: `${agentColour}20`,
              color: agentColour,
            }}
          >
            <Icon size={18} />
          </div>

          {/* Agent & Type */}
          <div>
            <div className="flex items-centre gap-2">
              <span
                className="font-mono text-sm font-semibold uppercase"
                style={{ color: agentColour }}
              >
                {suggestion.agent}
              </span>
              <span className="font-mono text-xs text-[var(--flowcore-colour-fg)]/50">•</span>
              <span className="font-mono text-xs uppercase text-[var(--flowcore-colour-fg)]/70">
                {suggestion.loopType}
              </span>
            </div>
            <p className="mt-0.5 font-mono text-xs text-[var(--flowcore-colour-fg)]/60">
              {INTERVAL_LABELS[suggestion.suggestedInterval]}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className="rounded px-2 py-0.5 font-mono text-[10px] uppercase"
          style={{
            backgroundColor:
              isAccepted
                ? '#51CF6620'
                : isDeclined
                  ? '#EF444420'
                  : `${agentColour}20`,
            color: isAccepted ? '#51CF66' : isDeclined ? '#EF4444' : agentColour,
          }}
        >
          {suggestion.status}
        </span>
      </div>

      {/* Reason */}
      <p className="mb-4 font-mono text-sm leading-relaxed text-[var(--flowcore-colour-fg)]">
        {suggestion.reason}
      </p>

      {/* Confidence */}
      {suggestion.confidence !== undefined && (
        <div className="mb-4">
          <div className="mb-1 flex items-centre justify-between">
            <span className="font-mono text-xs uppercase text-[var(--flowcore-colour-fg)]/70">
              Confidence
            </span>
            <span className="font-mono text-xs font-semibold" style={{ color: agentColour }}>
              {Math.round(suggestion.confidence * 100)}%
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--flowcore-colour-fg)]/10">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: agentColour }}
              initial={{ width: 0 }}
              animate={{ width: `${suggestion.confidence * 100}%` }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      {isPending && (
        <div className="flex gap-2">
          <motion.button
            onClick={onAccept}
            className="flex flex-1 items-centre justify-centre gap-2 rounded border border-[var(--flowcore-colour-border)] bg-[var(--flowcore-colour-bg)] px-3 py-2 font-mono text-sm font-semibold transition-all hover:border-[#51CF66] hover:bg-[#51CF6610] hover:text-[#51CF66]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Check size={14} />
            Accept
          </motion.button>

          <motion.button
            onClick={onModify}
            className="flex items-centre justify-centre gap-2 rounded border border-[var(--flowcore-colour-border)] bg-[var(--flowcore-colour-bg)] px-3 py-2 font-mono text-sm font-semibold transition-all hover:bg-[var(--flowcore-colour-accent)]/10 hover:text-[var(--flowcore-colour-accent)]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Edit size={14} />
          </motion.button>

          <motion.button
            onClick={onDecline}
            className="flex items-centre justify-centre gap-2 rounded border border-[var(--flowcore-colour-border)] bg-[var(--flowcore-colour-bg)] px-3 py-2 font-mono text-sm font-semibold text-[var(--flowcore-colour-fg)]/70 transition-all hover:border-[#EF4444] hover:bg-[#EF444410] hover:text-[#EF4444]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <X size={14} />
          </motion.button>
        </div>
      )}

      {(isAccepted || isDeclined) && (
        <button
          onClick={onDismiss}
          className="w-full rounded border border-[var(--flowcore-colour-border)] px-3 py-2 font-mono text-xs font-semibold text-[var(--flowcore-colour-fg)]/70 transition-all hover:bg-[var(--flowcore-colour-fg)]/10"
        >
          Dismiss
        </button>
      )}
    </motion.div>
  )
}
