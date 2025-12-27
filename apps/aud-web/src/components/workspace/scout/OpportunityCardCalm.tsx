'use client'

import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import type { Opportunity } from '@/types/scout'
import { TYPE_LABELS, TYPE_COLOURS, AUDIENCE_SIZE_LABELS } from '@/types/scout'
import { PlusIcon, CheckIcon } from '@heroicons/react/24/outline'

interface OpportunityCardCalmProps {
  opportunity: Opportunity
  isAddedToTimeline: boolean
  isPitched: boolean
  onAddToTimeline: () => void
  onSelect: () => void
}

export function OpportunityCardCalm({
  opportunity,
  isAddedToTimeline,
  isPitched,
  onAddToTimeline,
  onSelect,
}: OpportunityCardCalmProps) {
  const [isHovered, setIsHovered] = useState(false)
  const typeColour = TYPE_COLOURS[opportunity.type]

  const handleAdd = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (!isAddedToTimeline) {
        onAddToTimeline()
      }
    },
    [isAddedToTimeline, onAddToTimeline]
  )

  return (
    <motion.article
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`${opportunity.name}, ${TYPE_LABELS[opportunity.type]}${isAddedToTimeline ? ', added to timeline' : ''}${isPitched ? ', pitched' : ''}`}
      data-testid="opportunity-card"
      className="group relative h-full flex flex-col p-5 rounded-xl bg-[#161A1D] border border-white/5 overflow-hidden transition-all duration-300 hover:border-tap-cyan/30"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -2 }}
    >
      {/* Ambient Glow on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-tap-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider border"
              style={{
                backgroundColor: `${typeColour.bg}05`, // Very subtle
                color: typeColour.text,
                borderColor: `${typeColour.border}40`,
              }}
            >
              {TYPE_LABELS[opportunity.type]}
            </span>

            {isPitched && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Pitched
              </span>
            )}
          </div>

          <span className="text-[10px] text-tap-grey/60 font-mono uppercase tracking-wide">
            {AUDIENCE_SIZE_LABELS[opportunity.audienceSize]}
          </span>
        </div>

        {/* Title & Desc */}
        <h3 className="text-base font-medium text-tap-white leading-snug mb-2 line-clamp-1 group-hover:text-white transition-colors">
          {opportunity.name}
        </h3>

        <p className="text-xs text-tap-grey leading-relaxed line-clamp-2 mb-4">
          {opportunity.description || 'No description available for this contact.'}
        </p>

        {/* Footer */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5 group-hover:border-white/10 transition-colors">
          {/* Genre Tags */}
          <div className="flex flex-wrap gap-1.5 min-w-0 pr-4">
            {opportunity.genres.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="text-[10px] text-tap-grey/80 bg-white/5 px-1.5 py-0.5 rounded border border-transparent group-hover:border-white/5 transition-all"
              >
                {genre}
              </span>
            ))}
            {opportunity.genres.length > 2 && (
              <span className="text-[10px] text-tap-grey/50 self-center">
                +{opportunity.genres.length - 2}
              </span>
            )}
          </div>

          {/* Action Button */}
          <motion.button
            onClick={handleAdd}
            disabled={isAddedToTimeline}
            aria-label={isAddedToTimeline ? 'Added to timeline' : 'Add to timeline'}
            whileTap={{ scale: 0.95 }}
            className={`
              flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-200
              ${
                isAddedToTimeline
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 cursor-default'
                  : 'bg-white/5 border-white/10 text-tap-grey hover:bg-tap-cyan hover:border-tap-cyan hover:text-tap-black hover:shadow-[0_0_12px_rgba(58,169,190,0.4)]'
              }
            `}
          >
            {isAddedToTimeline ? (
              <CheckIcon className="w-4 h-4" />
            ) : (
              <PlusIcon className="w-4 h-4" />
            )}
          </motion.button>
        </div>
      </div>
    </motion.article>
  )
}
