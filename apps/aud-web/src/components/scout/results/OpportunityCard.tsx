'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Opportunity, GoalOption } from '../ScoutWizard'

interface OpportunityCardProps {
  opportunity: Opportunity
  isSelected: boolean
  onToggleSelect: () => void
}

const TYPE_ICONS: Record<GoalOption, string> = {
  playlist: '📻',
  blog: '✍️',
  radio: '📡',
  youtube: '▶️',
  podcast: '🎙️',
}

const TYPE_COLOURS: Record<GoalOption, string> = {
  playlist: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  blog: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  radio: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  youtube: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  podcast: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
}

export function OpportunityCard({ opportunity, isSelected, onToggleSelect }: OpportunityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const scoreColour =
    opportunity.relevanceScore >= 80
      ? 'text-emerald-400'
      : opportunity.relevanceScore >= 60
        ? 'text-yellow-400'
        : 'text-slate-400'

  return (
    <div
      className={`group rounded-lg border transition-all ${
        isSelected
          ? 'border-sky-500/50 bg-sky-500/5'
          : 'border-slate-700/50 bg-slate-900/50 hover:border-slate-600'
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Checkbox */}
        <button
          type="button"
          onClick={onToggleSelect}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
            isSelected
              ? 'border-sky-500 bg-sky-500 text-white'
              : 'border-slate-600 bg-slate-800 hover:border-slate-500'
          }`}
        >
          {isSelected && <span className="text-xs">✓</span>}
        </button>

        {/* Type badge */}
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${TYPE_COLOURS[opportunity.type]}`}
        >
          <span>{TYPE_ICONS[opportunity.type]}</span>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-medium text-slate-100">{opportunity.name}</h3>
              {opportunity.contact.name && (
                <p className="mt-0.5 text-[11px] text-slate-400">{opportunity.contact.name}</p>
              )}
            </div>

            {/* Relevance score */}
            <div className="shrink-0 text-right">
              <p className={`text-sm font-semibold ${scoreColour}`}>
                {opportunity.relevanceScore}%
              </p>
              <p className="text-[9px] uppercase tracking-[0.1em] text-slate-500">match</p>
            </div>
          </div>

          {/* Genres */}
          <div className="mt-2 flex flex-wrap gap-1">
            {opportunity.genres.slice(0, 4).map((genre) => (
              <span
                key={genre}
                className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400"
              >
                {genre}
              </span>
            ))}
            {opportunity.genres.length > 4 && (
              <span className="text-[10px] text-slate-500">
                +{opportunity.genres.length - 4} more
              </span>
            )}
          </div>

          {/* Expandable details */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-[11px] text-sky-400 hover:text-sky-300"
          >
            {isExpanded ? 'Hide details' : 'Show details'}
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-3 border-t border-slate-800 pt-3">
                  {/* Contact info */}
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">
                      Contact
                    </p>
                    {opportunity.contact.email && (
                      <a
                        href={`mailto:${opportunity.contact.email}`}
                        className="block text-sm text-sky-400 hover:text-sky-300"
                      >
                        {opportunity.contact.email}
                      </a>
                    )}
                    {opportunity.contact.submissionUrl && (
                      <a
                        href={opportunity.contact.submissionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-sky-400 hover:text-sky-300"
                      >
                        Submission link →
                      </a>
                    )}
                    {!opportunity.contact.email && !opportunity.contact.submissionUrl && (
                      <p className="text-sm text-slate-500">No contact info available</p>
                    )}
                  </div>

                  {/* Pitch tips */}
                  {opportunity.pitchTips && opportunity.pitchTips.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">
                        Pitch tips
                      </p>
                      <ul className="space-y-1">
                        {opportunity.pitchTips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                            <span className="text-emerald-400">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Source */}
                  <p className="text-[9px] uppercase tracking-[0.1em] text-slate-600">
                    Source: {opportunity.source}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
