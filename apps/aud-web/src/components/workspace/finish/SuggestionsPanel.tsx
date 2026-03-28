/**
 * SuggestionsPanel
 *
 * Displays actionable suggestions from the analysis engine.
 * Colour-coded by severity: critical (red), warning (amber), info (cyan).
 */

'use client'

import { motion } from 'framer-motion'
import type { Suggestion } from '@/lib/finisher-client'

const SEVERITY_STYLES = {
  critical: {
    bg: 'bg-ta-error/[0.08]',
    border: 'border-ta-error/20',
    icon: 'text-ta-error',
    label: 'Critical',
  },
  warning: {
    bg: 'bg-ta-warning/[0.08]',
    border: 'border-ta-warning/20',
    icon: 'text-ta-warning',
    label: 'Warning',
  },
  info: {
    bg: 'bg-ta-cyan/[0.06]',
    border: 'border-ta-cyan/15',
    icon: 'text-ta-cyan',
    label: 'Info',
  },
}

function SuggestionCard({ suggestion, index }: { suggestion: Suggestion; index: number }) {
  const style = SEVERITY_STYLES[suggestion.severity] || SEVERITY_STYLES.info

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: index * 0.05 }}
      className={`rounded-ta-sm border ${style.bg} ${style.border} p-3 space-y-1.5`}
    >
      <div className="flex items-center gap-2">
        <span className={`text-[10px] uppercase tracking-wider font-medium ${style.icon}`}>
          {style.label}
        </span>
        <span className="text-[10px] text-ta-white/30 uppercase tracking-wider">
          {suggestion.category}
        </span>
      </div>

      <p className="text-xs text-ta-white/80 leading-relaxed">{suggestion.message}</p>

      <p className="text-xs text-ta-white/50 leading-relaxed">{suggestion.action}</p>

      {suggestion.current_value !== null && suggestion.target_value !== null && (
        <div className="flex items-center gap-2 text-[10px] text-ta-white/40 font-mono pt-0.5">
          <span>{suggestion.current_value.toFixed(1)}</span>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className="text-ta-white/20">
            <path d="M1 4h10M8 1l3 3-3 3" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span>{suggestion.target_value.toFixed(1)}</span>
          {suggestion.metric_name && (
            <span className="text-ta-white/25">({suggestion.metric_name})</span>
          )}
        </div>
      )}
    </motion.div>
  )
}

interface SuggestionsPanelProps {
  suggestions: Suggestion[]
}

export function SuggestionsPanel({ suggestions }: SuggestionsPanelProps) {
  if (suggestions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 px-3 py-2 rounded-ta-sm bg-ta-success/10 text-ta-success text-xs"
      >
        No suggestions -- your track looks good as-is.
      </motion.div>
    )
  }

  const critical = suggestions.filter((s) => s.severity === 'critical')
  const warnings = suggestions.filter((s) => s.severity === 'warning')
  const info = suggestions.filter((s) => s.severity === 'info')

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-ta-white/50 border-b border-ta-white/[0.06] pb-1.5">
        Suggestions ({suggestions.length})
      </h4>

      <div className="space-y-2">
        {critical.map((s, i) => (
          <SuggestionCard key={`c-${i}`} suggestion={s} index={i} />
        ))}
        {warnings.map((s, i) => (
          <SuggestionCard key={`w-${i}`} suggestion={s} index={critical.length + i} />
        ))}
        {info.map((s, i) => (
          <SuggestionCard
            key={`i-${i}`}
            suggestion={s}
            index={critical.length + warnings.length + i}
          />
        ))}
      </div>
    </div>
  )
}
