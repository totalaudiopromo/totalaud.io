/**
 * IdeasToolbar Component
 *
 * Professional toolbar with search, sort, view toggle, export, and filter tabs.
 * Calm, minimal, Apple-like design.
 */

'use client'

import { useCallback, useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useIdeasStore,
  selectCardCountByTag,
  selectFilteredCards,
  buildMarkdownExport,
  buildPlainTextExport,
  type IdeaTag,
  type SortMode,
} from '@/stores/useIdeasStore'

const TAGS: { key: IdeaTag; label: string; colour: string }[] = [
  { key: 'content', label: 'Content', colour: '#3AA9BE' },
  { key: 'brand', label: 'Brand', colour: '#A855F7' },
  { key: 'music', label: 'Music', colour: '#22C55E' },
  { key: 'promo', label: 'Promo', colour: '#F97316' },
]

const SORT_OPTIONS: { key: SortMode; label: string }[] = [
  { key: 'newest', label: 'Newest first' },
  { key: 'oldest', label: 'Oldest first' },
  { key: 'alpha', label: 'A to Z' },
]

// Simple SVG icons
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
)

const GridIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
)

const ListIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
  </svg>
)

const ChevronIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9l6 6 6-6" />
  </svg>
)

export function IdeasToolbar() {
  const filter = useIdeasStore((state) => state.filter)
  const setFilter = useIdeasStore((state) => state.setFilter)
  const addCard = useIdeasStore((state) => state.addCard)
  const cardCounts = useIdeasStore(selectCardCountByTag)
  const totalCards = useIdeasStore((state) => state.cards.length)
  const searchQuery = useIdeasStore((state) => state.searchQuery)
  const setSearchQuery = useIdeasStore((state) => state.setSearchQuery)
  const sortMode = useIdeasStore((state) => state.sortMode)
  const setSortMode = useIdeasStore((state) => state.setSortMode)
  const viewMode = useIdeasStore((state) => state.viewMode)
  const setViewMode = useIdeasStore((state) => state.setViewMode)
  const filteredCards = useIdeasStore(selectFilteredCards)
  const allCards = useIdeasStore((state) => state.cards)
  const clearAllCards = useIdeasStore((state) => state.clearAllCards)

  // Dropdown states
  const [sortOpen, setSortOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [exportFeedback, setExportFeedback] = useState<string | null>(null)
  const [showClearModal, setShowClearModal] = useState(false)
  const [clearConfirmText, setClearConfirmText] = useState('')

  // Refs for click outside
  const sortRef = useRef<HTMLDivElement>(null)
  const exportRef = useRef<HTMLDivElement>(null)

  // Search debounce
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearchQuery(localSearch)
    }, 150)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [localSearch, setSearchQuery])

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false)
      }
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleFilterClick = useCallback(
    (tag: IdeaTag | null) => {
      setFilter(tag)
    },
    [setFilter]
  )

  const handleAddCard = useCallback(() => {
    addCard('New idea...', filter ?? 'content')
  }, [addCard, filter])

  const handleExport = useCallback(
    async (format: 'markdown' | 'text', visibleOnly: boolean) => {
      const ideas = visibleOnly ? filteredCards : allCards
      const content =
        format === 'markdown' ? buildMarkdownExport(ideas) : buildPlainTextExport(ideas)

      try {
        await navigator.clipboard.writeText(content)
        setExportFeedback('Copied')
        setTimeout(() => setExportFeedback(null), 2000)
      } catch {
        setExportFeedback('Failed')
        setTimeout(() => setExportFeedback(null), 2000)
      }
      setExportOpen(false)
    },
    [filteredCards, allCards]
  )

  const handleClearAll = useCallback(() => {
    if (clearConfirmText === 'DELETE') {
      clearAllCards()
      setShowClearModal(false)
      setClearConfirmText('')
    }
  }, [clearConfirmText, clearAllCards])

  const buttonBase = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 10px',
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 400,
    color: 'rgba(255, 255, 255, 0.6)',
    cursor: 'pointer',
    transition: 'all 0.16s ease',
    fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
  } as const

  const dropdownStyle = {
    position: 'absolute' as const,
    top: '100%',
    right: 0,
    marginTop: 4,
    minWidth: 160,
    backgroundColor: 'rgba(15, 17, 19, 0.98)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 6,
    padding: 4,
    zIndex: 50,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  }

  const dropdownItemStyle = {
    display: 'block',
    width: '100%',
    padding: '8px 12px',
    textAlign: 'left' as const,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    transition: 'background-color 0.12s ease',
    fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '12px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          backgroundColor: 'rgba(15, 17, 19, 0.95)',
          backdropFilter: 'blur(8px)',
          minHeight: 56,
        }}
      >
        {/* Left: Filter tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            flexShrink: 0,
            overflowX: 'auto',
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
              borderRadius: 4,
              fontSize: 12,
              fontWeight: filter === null ? 500 : 400,
              color: filter === null ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.5)',
              cursor: 'pointer',
              transition: 'all 0.16s ease',
              fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
              whiteSpace: 'nowrap',
            }}
          >
            All
            <span
              style={{
                fontSize: 10,
                padding: '1px 5px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 8,
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
                borderRadius: 4,
                fontSize: 12,
                fontWeight: filter === tag.key ? 500 : 400,
                color: filter === tag.key ? tag.colour : 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                transition: 'all 0.16s ease',
                fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
                whiteSpace: 'nowrap',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: tag.colour,
                  opacity: filter === tag.key ? 1 : 0.5,
                }}
              />
              {tag.label}
              {cardCounts[tag.key] > 0 && (
                <span
                  style={{
                    fontSize: 10,
                    padding: '1px 5px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 8,
                  }}
                >
                  {cardCounts[tag.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Centre: Search */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flex: '0 1 200px',
            minWidth: 120,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flex: 1,
              padding: '6px 10px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 4,
            }}
          >
            <span style={{ color: 'rgba(255, 255, 255, 0.4)', display: 'flex' }}>
              <SearchIcon />
            </span>
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search ideas..."
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 12,
                color: 'rgba(255, 255, 255, 0.9)',
                fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
              }}
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                style={{
                  padding: 0,
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.4)',
                  cursor: 'pointer',
                  fontSize: 14,
                  lineHeight: 1,
                }}
              >
                x
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexShrink: 0,
          }}
        >
          {/* Sort dropdown */}
          <div ref={sortRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setSortOpen(!sortOpen)}
              style={{
                ...buttonBase,
                backgroundColor: sortOpen ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              }}
            >
              {SORT_OPTIONS.find((o) => o.key === sortMode)?.label}
              <ChevronIcon />
            </button>
            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.16 }}
                  style={dropdownStyle}
                >
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => {
                        setSortMode(option.key)
                        setSortOpen(false)
                      }}
                      style={{
                        ...dropdownItemStyle,
                        backgroundColor:
                          sortMode === option.key ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                        fontWeight: sortMode === option.key ? 500 : 400,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          sortMode === option.key ? 'rgba(255, 255, 255, 0.06)' : 'transparent'
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* View toggle */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderRadius: 4,
              padding: 2,
            }}
          >
            <button
              onClick={() => setViewMode('canvas')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 6,
                backgroundColor: viewMode === 'canvas' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                border: 'none',
                borderRadius: 3,
                color:
                  viewMode === 'canvas' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.4)',
                cursor: 'pointer',
                transition: 'all 0.16s ease',
              }}
              title="Canvas view"
            >
              <GridIcon />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 6,
                backgroundColor: viewMode === 'list' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                border: 'none',
                borderRadius: 3,
                color:
                  viewMode === 'list' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.4)',
                cursor: 'pointer',
                transition: 'all 0.16s ease',
              }}
              title="List view"
            >
              <ListIcon />
            </button>
          </div>

          {/* Export dropdown */}
          <div ref={exportRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setExportOpen(!exportOpen)}
              style={{
                ...buttonBase,
                backgroundColor: exportOpen ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              }}
            >
              {exportFeedback || 'Export'}
              <ChevronIcon />
            </button>
            <AnimatePresence>
              {exportOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.16 }}
                  style={dropdownStyle}
                >
                  <button
                    onClick={() => handleExport('markdown', false)}
                    style={dropdownItemStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    Export all as Markdown
                  </button>
                  <button
                    onClick={() => handleExport('text', false)}
                    style={dropdownItemStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    Export all as Plain text
                  </button>
                  <button
                    onClick={() => handleExport('markdown', true)}
                    style={dropdownItemStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    Export visible as Markdown
                  </button>
                  <div
                    style={{
                      height: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      margin: '4px 0',
                    }}
                  />
                  <button
                    onClick={() => {
                      setExportOpen(false)
                      setShowClearModal(true)
                    }}
                    style={{
                      ...dropdownItemStyle,
                      color: '#EF4444',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    Clear all ideas...
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
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
              padding: '6px 14px',
              backgroundColor: '#3AA9BE',
              border: 'none',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 500,
              color: '#0F1113',
              cursor: 'pointer',
              fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
            }}
          >
            <span style={{ fontSize: 14, lineHeight: 1 }}>+</span>
            Add
          </motion.button>
        </div>
      </div>

      {/* Clear All Confirmation Modal */}
      <AnimatePresence>
        {showClearModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: 24,
            }}
            onClick={() => {
              setShowClearModal(false)
              setClearConfirmText('')
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: 'rgba(15, 17, 19, 0.98)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 8,
                padding: 24,
                maxWidth: 400,
                width: '100%',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  marginBottom: 12,
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#F7F8F9',
                  fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
                }}
              >
                Delete all ideas?
              </h3>
              <p
                style={{
                  margin: 0,
                  marginBottom: 20,
                  fontSize: 13,
                  color: 'rgba(255, 255, 255, 0.6)',
                  lineHeight: 1.5,
                  fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
                }}
              >
                This will permanently delete all {totalCards} ideas. Type{' '}
                <code
                  style={{
                    padding: '2px 6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 4,
                    fontSize: 12,
                  }}
                >
                  DELETE
                </code>{' '}
                to confirm.
              </p>
              <input
                type="text"
                value={clearConfirmText}
                onChange={(e) => setClearConfirmText(e.target.value)}
                placeholder="Type DELETE"
                autoFocus
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: 13,
                  color: '#F7F8F9',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 4,
                  outline: 'none',
                  marginBottom: 16,
                  fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
                }}
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowClearModal(false)
                    setClearConfirmText('')
                  }}
                  style={{
                    padding: '8px 16px',
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'rgba(255, 255, 255, 0.7)',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAll}
                  disabled={clearConfirmText !== 'DELETE'}
                  style={{
                    padding: '8px 16px',
                    fontSize: 13,
                    fontWeight: 500,
                    color: clearConfirmText === 'DELETE' ? '#fff' : 'rgba(255, 255, 255, 0.3)',
                    backgroundColor:
                      clearConfirmText === 'DELETE' ? '#EF4444' : 'rgba(239, 68, 68, 0.2)',
                    border: 'none',
                    borderRadius: 4,
                    cursor: clearConfirmText === 'DELETE' ? 'pointer' : 'not-allowed',
                    fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
                    transition: 'all 0.16s ease',
                  }}
                >
                  Delete all
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
