/**
 * IdeasToolbar Component
 *
 * Phase 6: MVP Pivot - Ideas Canvas
 *
 * Filter tabs and add button for Ideas mode.
 */

'use client'

import { useCallback } from 'react'
import { motion } from 'framer-motion'
import { useIdeasStore, selectCardCountByTag, type IdeaTag } from '@/stores/useIdeasStore'

const TAGS: { key: IdeaTag; label: string; colour: string }[] = [
  { key: 'content', label: 'Content', colour: '#3AA9BE' },
  { key: 'brand', label: 'Brand', colour: '#A855F7' },
  { key: 'music', label: 'Music', colour: '#22C55E' },
  { key: 'promo', label: 'Promo', colour: '#F97316' },
]

export function IdeasToolbar() {
  const filter = useIdeasStore((state) => state.filter)
  const setFilter = useIdeasStore((state) => state.setFilter)
  const addCard = useIdeasStore((state) => state.addCard)
  const cardCounts = useIdeasStore(selectCardCountByTag)
  const totalCards = useIdeasStore((state) => state.cards.length)

  const handleFilterClick = useCallback(
    (tag: IdeaTag | null) => {
      setFilter(tag)
    },
    [setFilter]
  )

  const handleAddCard = useCallback(() => {
    addCard('New idea...', filter ?? 'content')
  }, [addCard, filter])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '12px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        backgroundColor: 'rgba(15, 17, 19, 0.95)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Filter tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {/* All tab */}
        <button
          onClick={() => handleFilterClick(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            backgroundColor: filter === null ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
            border: 'none',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: filter === null ? 500 : 400,
            color: filter === null ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.5)',
            cursor: 'pointer',
            transition: 'all 0.12s ease',
            fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
          }}
        >
          All
          <span
            style={{
              fontSize: 11,
              padding: '1px 6px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 10,
            }}
          >
            {totalCards}
          </span>
        </button>

        {/* Tag tabs */}
        {TAGS.map((tag) => (
          <button
            key={tag.key}
            onClick={() => handleFilterClick(tag.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              backgroundColor: filter === tag.key ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              border: 'none',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: filter === tag.key ? 500 : 400,
              color: filter === tag.key ? tag.colour : 'rgba(255, 255, 255, 0.5)',
              cursor: 'pointer',
              transition: 'all 0.12s ease',
              fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: tag.colour,
                opacity: filter === tag.key ? 1 : 0.5,
              }}
            />
            {tag.label}
            {cardCounts[tag.key] > 0 && (
              <span
                style={{
                  fontSize: 11,
                  padding: '1px 6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 10,
                }}
              >
                {cardCounts[tag.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Add button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAddCard}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 16px',
          backgroundColor: '#3AA9BE',
          border: 'none',
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 500,
          color: '#0F1113',
          cursor: 'pointer',
          fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
        }}
      >
        <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
        Add idea
      </motion.button>
    </div>
  )
}
