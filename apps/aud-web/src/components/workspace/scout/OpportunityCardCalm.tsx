/**
 * OpportunityCardCalm
 *
 * Balanced opportunity card - informative but clean
 */

'use client'

import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import type { Opportunity } from '@/types/scout'
import { TYPE_LABELS, TYPE_COLOURS, AUDIENCE_SIZE_LABELS } from '@/types/scout'

interface OpportunityCardCalmProps {
  opportunity: Opportunity
  isAddedToTimeline: boolean
  onAddToTimeline: () => void
  onSelect: () => void
}

export function OpportunityCardCalm({
  opportunity,
  isAddedToTimeline,
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="
        group cursor-pointer
        p-4 rounded-lg
        bg-white/[0.025] border border-white/[0.05]
        hover:bg-white/[0.04] hover:border-white/[0.08]
        transition-colors duration-200
      "
    >
      {/* Header: Type badge + Audience */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <span
          className="text-[10px] font-medium px-2 py-0.5 rounded"
          style={{
            backgroundColor: typeColour.bg,
            color: typeColour.text,
            border: `1px solid ${typeColour.border}`,
          }}
        >
          {TYPE_LABELS[opportunity.type]}
        </span>

        <span className="text-[10px] text-white/30 uppercase tracking-wide">
          {AUDIENCE_SIZE_LABELS[opportunity.audienceSize]}
        </span>
      </div>

      {/* Name */}
      <h3 className="text-sm font-medium text-white/90 leading-snug mb-1 line-clamp-1">
        {opportunity.name}
      </h3>

      {/* Description - always visible but truncated */}
      {opportunity.description && (
        <p className="text-xs text-white/40 leading-relaxed line-clamp-2 mb-3">
          {opportunity.description}
        </p>
      )}

      {/* Footer: Genres + Action */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.04]">
        {/* Genres */}
        <div className="flex gap-1.5 min-w-0 flex-1">
          {opportunity.genres.slice(0, 2).map((genre) => (
            <span
              key={genre}
              className="text-[10px] text-white/30 bg-white/[0.03] px-1.5 py-0.5 rounded truncate"
            >
              {genre}
            </span>
          ))}
          {opportunity.genres.length > 2 && (
            <span className="text-[10px] text-white/20">+{opportunity.genres.length - 2}</span>
          )}
        </div>

        {/* Add button */}
        <motion.button
          onClick={handleAdd}
          disabled={isAddedToTimeline}
          whileTap={{ scale: 0.95 }}
          className={`
            shrink-0 px-3 py-1 rounded text-xs font-medium
            transition-all duration-150
            ${
              isAddedToTimeline
                ? 'bg-emerald-500/10 text-emerald-400/60 cursor-default'
                : 'bg-white/[0.06] text-white/60 hover:bg-[#3AA9BE]/20 hover:text-[#3AA9BE]'
            }
          `}
        >
          {isAddedToTimeline ? 'Added' : '+ Add'}
        </motion.button>
      </div>
    </motion.article>
  )
}
