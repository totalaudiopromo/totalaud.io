'use client'

/**
 * Agent Suggestions Palette
 * Displays agent-suggested clips next to the timeline
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTimeline, useCampaignMeta } from '@totalaud/os-state/campaign'
import type { AgentSuggestion } from '@totalaud/os-state/campaign'
import {
  generateAllSuggestions,
  filterByConfidence,
} from '@totalaud/agents/suggestions/suggestClips'
import { Sparkles, Plus, X, Filter } from 'lucide-react'

const AGENT_COLOURS = {
  scout: '#51CF66',
  coach: '#8B5CF6',
  tracker: '#3AA9BE',
  insight: '#F59E0B',
}

const AGENT_ICONS = {
  scout: '🔍',
  coach: '✍️',
  tracker: '📊',
  insight: '💡',
}

export function AgentSuggestionsPalette() {
  const { timeline, addClip } = useTimeline()
  const { meta } = useCampaignMeta()
  const [suggestions, setSuggestions] = useState<AgentSuggestion[]>([])
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [minConfidence, setMinConfidence] = useState(0.7)

  // Generate suggestions based on current timeline state
  useEffect(() => {
    const context = {
      campaignGoal: meta.goal,
      currentPhase: 'active',
      recentActions: timeline.clips.map((c) => c.name),
      timelineLength: timeline.duration,
    }

    const allSuggestions = generateAllSuggestions(context)
    const filtered = filterByConfidence(allSuggestions, minConfidence)
    setSuggestions(filtered)
  }, [timeline.clips.length, timeline.duration, meta.goal, minConfidence])

  const handleAcceptSuggestion = (suggestion: AgentSuggestion) => {
    // Find an available track or create one
    let targetTrack = timeline.tracks[0]

    if (!targetTrack) {
      // No tracks exist - need to create one first
      return
    }

    addClip({
      trackId: targetTrack.id,
      name: suggestion.clipName,
      startTime: suggestion.suggestedStartTime || timeline.duration,
      duration: suggestion.suggestedDuration,
      colour: AGENT_COLOURS[suggestion.agentType],
      agentSource: suggestion.agentType,
      cardLinks: [],
    })

    // Remove suggestion after accepting
    setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id))
  }

  const handleDismissSuggestion = (suggestionId: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId))
  }

  const filteredSuggestions = selectedAgent
    ? suggestions.filter((s) => s.agentType === selectedAgent)
    : suggestions

  if (timeline.tracks.length === 0) {
    return null // Don't show until tracks exist
  }

  return (
    <motion.div
      className="fixed right-4 top-20 z-20 w-80 rounded-lg border border-[var(--flowcore-colour-border)] bg-[var(--flowcore-overlay-strong)] shadow-xl"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.24 }}
    >
      {/* Header */}
      <div className="border-b border-[var(--flowcore-colour-border)] p-4">
        <div className="flex items-centre gap-2">
          <Sparkles size={16} className="text-[var(--flowcore-colour-accent)]" />
          <h3 className="font-mono text-sm font-semibold text-[var(--flowcore-colour-fg)]">
            Agent Suggestions
          </h3>
        </div>
        <p className="mt-1 font-mono text-xs text-[var(--flowcore-colour-fg)]/70">
          {filteredSuggestions.length} suggestions
        </p>
      </div>

      {/* Filters */}
      <div className="border-b border-[var(--flowcore-colour-border)] p-4">
        <div className="mb-3">
          <label className="mb-2 flex items-centre gap-2 font-mono text-xs uppercase text-[var(--flowcore-colour-fg)]/70">
            <Filter size={12} />
            Agent Type
          </label>
          <div className="flex gap-2">
            {(['scout', 'coach', 'tracker', 'insight'] as const).map((agent) => (
              <button
                key={agent}
                onClick={() => setSelectedAgent(selectedAgent === agent ? null : agent)}
                className={`flex-1 rounded px-2 py-1 font-mono text-xs transition-colours ${
                  selectedAgent === agent
                    ? 'text-white'
                    : 'text-[var(--flowcore-colour-fg)]/70 hover:text-[var(--flowcore-colour-fg)]'
                }`}
                style={{
                  backgroundColor:
                    selectedAgent === agent ? AGENT_COLOURS[agent] : 'transparent',
                  border: `1px solid ${AGENT_COLOURS[agent]}40`,
                }}
              >
                {AGENT_ICONS[agent]}
              </button>
            ))}
          </div>
        </div>

        {/* Confidence slider */}
        <div>
          <label className="mb-2 block font-mono text-xs uppercase text-[var(--flowcore-colour-fg)]/70">
            Min. Confidence: {Math.round(minConfidence * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={minConfidence}
            onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Suggestions list */}
      <div className="max-h-96 overflow-y-auto p-4">
        <AnimatePresence>
          {filteredSuggestions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-centre font-mono text-xs text-[var(--flowcore-colour-fg)]/50"
            >
              No suggestions available
            </motion.div>
          ) : (
            filteredSuggestions.map((suggestion) => (
              <motion.div
                key={suggestion.id}
                className="mb-3 rounded-lg border p-3"
                style={{
                  borderColor: `${AGENT_COLOURS[suggestion.agentType]}40`,
                  backgroundColor: `${AGENT_COLOURS[suggestion.agentType]}08`,
                }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 20 }}
                layout
              >
                {/* Agent badge */}
                <div className="mb-2 flex items-centre justify-between">
                  <div className="flex items-centre gap-2">
                    <span className="text-sm">{AGENT_ICONS[suggestion.agentType]}</span>
                    <span
                      className="font-mono text-xs font-semibold uppercase"
                      style={{ color: AGENT_COLOURS[suggestion.agentType] }}
                    >
                      {suggestion.agentType}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-[var(--flowcore-colour-fg)]/50">
                    {Math.round(suggestion.confidence * 100)}%
                  </div>
                </div>

                {/* Clip name */}
                <h4 className="mb-1 font-mono text-sm font-semibold text-[var(--flowcore-colour-fg)]">
                  {suggestion.clipName}
                </h4>

                {/* Rationale */}
                <p className="mb-3 text-xs leading-relaxed text-[var(--flowcore-colour-fg)]/70">
                  {suggestion.rationale}
                </p>

                {/* Duration */}
                <div className="mb-3 font-mono text-xs text-[var(--flowcore-colour-fg)]/50">
                  Duration: {suggestion.suggestedDuration}s
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptSuggestion(suggestion)}
                    className="flex flex-1 items-centre justify-centre gap-1 rounded bg-[var(--flowcore-colour-accent)] px-3 py-1.5 font-mono text-xs font-semibold text-white transition-colours hover:bg-[var(--flowcore-colour-accent-hover)]"
                  >
                    <Plus size={12} />
                    Add to Timeline
                  </button>
                  <button
                    onClick={() => handleDismissSuggestion(suggestion.id)}
                    className="rounded border border-[var(--flowcore-colour-border)] p-1.5 text-[var(--flowcore-colour-fg)]/70 transition-colours hover:bg-[var(--flowcore-colour-fg)]/10 hover:text-[var(--flowcore-colour-fg)]"
                    title="Dismiss"
                  >
                    <X size={12} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
