'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Opportunity, GoalOption } from '../ScoutWizard'

interface OpportunityCardProps {
  opportunity: Opportunity
  isSelected: boolean
  onToggleSelect: () => void
}

// Text-based type labels instead of emojis
const TYPE_LABELS: Record<GoalOption, string> = {
  playlist: 'PL',
  blog: 'BG',
  radio: 'RD',
  youtube: 'YT',
  podcast: 'PC',
}

// Muted, premium colours for type badges
const TYPE_STYLES: Record<GoalOption, { text: string; bg: string; border: string }> = {
  playlist: { text: '#49A36C', bg: 'rgba(73,163,108,0.08)', border: 'rgba(73,163,108,0.2)' },
  blog: { text: '#9B8AC4', bg: 'rgba(155,138,196,0.08)', border: 'rgba(155,138,196,0.2)' },
  radio: { text: '#C4A052', bg: 'rgba(196,160,82,0.08)', border: 'rgba(196,160,82,0.2)' },
  youtube: { text: '#C45252', bg: 'rgba(196,82,82,0.08)', border: 'rgba(196,82,82,0.2)' },
  podcast: { text: '#3AA9BE', bg: 'rgba(58,169,190,0.08)', border: 'rgba(58,169,190,0.2)' },
}

export function OpportunityCard({ opportunity, isSelected, onToggleSelect }: OpportunityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const typeStyle = TYPE_STYLES[opportunity.type]

  const scoreColour =
    opportunity.relevanceScore >= 80
      ? '#49A36C'
      : opportunity.relevanceScore >= 60
        ? '#C4A052'
        : '#6B7280'

  return (
    <div
      className={`group rounded-[6px] border transition-all duration-[120ms] ${
        isSelected
          ? 'border-[#3AA9BE]/40 bg-[rgba(58,169,190,0.04)]'
          : 'border-[#1F2327] bg-[#131619] hover:border-[#2A2E33]'
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Checkbox */}
        <button
          type="button"
          onClick={onToggleSelect}
          className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] border transition-all duration-[120ms] ${
            isSelected
              ? 'border-[#3AA9BE] bg-[#3AA9BE] text-white'
              : 'border-[#2A2E33] bg-[#1A1D21] hover:border-[#3AA9BE]/50'
          }`}
        >
          {isSelected && <span className="text-[10px] font-medium">+</span>}
        </button>

        {/* Type badge */}
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] border text-[10px] font-semibold uppercase tracking-[0.05em]"
          style={{
            color: typeStyle.text,
            backgroundColor: typeStyle.bg,
            borderColor: typeStyle.border,
          }}
        >
          {TYPE_LABELS[opportunity.type]}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-[14px] font-medium text-[#E8EAED]">{opportunity.name}</h3>
              {opportunity.contact.name && (
                <p className="mt-0.5 text-[12px] text-[#6B7280]">{opportunity.contact.name}</p>
              )}
            </div>

            {/* Relevance score */}
            <div className="shrink-0 text-right">
              <p className="text-[14px] font-semibold" style={{ color: scoreColour }}>
                {opportunity.relevanceScore}%
              </p>
              <p className="text-[10px] uppercase tracking-[0.08em] text-[#4B5563]">match</p>
            </div>
          </div>

          {/* Genres */}
          <div className="mt-2 flex flex-wrap gap-1">
            {opportunity.genres.slice(0, 4).map((genre) => (
              <span
                key={genre}
                className="rounded-[3px] bg-[#1A1D21] px-2 py-0.5 text-[11px] text-[#6B7280]"
              >
                {genre}
              </span>
            ))}
            {opportunity.genres.length > 4 && (
              <span className="text-[11px] text-[#4B5563]">
                +{opportunity.genres.length - 4} more
              </span>
            )}
          </div>

          {/* Expandable details */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-[12px] text-[#3AA9BE] transition-colors duration-[120ms] hover:text-[#4FBDD0]"
          >
            {isExpanded ? 'Hide details' : 'Show details'}
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-3 border-t border-[#1F2327] pt-3">
                  {/* Contact info */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#4B5563]">
                      Contact
                    </p>
                    {opportunity.contact.email && (
                      <a
                        href={`mailto:${opportunity.contact.email}`}
                        className="block text-[13px] text-[#3AA9BE] transition-colors duration-[120ms] hover:text-[#4FBDD0]"
                      >
                        {opportunity.contact.email}
                      </a>
                    )}
                    {opportunity.contact.submissionUrl && (
                      <a
                        href={opportunity.contact.submissionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-[13px] text-[#3AA9BE] transition-colors duration-[120ms] hover:text-[#4FBDD0]"
                      >
                        Submission link
                      </a>
                    )}
                    {!opportunity.contact.email && !opportunity.contact.submissionUrl && (
                      <p className="text-[13px] text-[#4B5563]">No contact info available</p>
                    )}
                  </div>

                  {/* Pitch tips */}
                  {opportunity.pitchTips && opportunity.pitchTips.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#4B5563]">
                        Pitch tips
                      </p>
                      <ul className="space-y-1">
                        {opportunity.pitchTips.map((tip, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-[12px] leading-relaxed text-[#A9B3BF]"
                          >
                            <span className="mt-1 text-[#49A36C]">-</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Source */}
                  <p className="text-[10px] uppercase tracking-[0.08em] text-[#4B5563]">
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
