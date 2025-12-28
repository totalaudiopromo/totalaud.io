/**
 * IdeasToolbar Component
 *
 * Professional toolbar with search, sort, view toggle, export, and filter tabs.
 * Uses TAP design system tokens for consistent styling.
 */

'use client'

import { useCallback, useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useIdeasStore,
  selectCardCountByTag,
  selectFilteredCards,
  selectSyncStatus,
  buildMarkdownExport,
  buildPlainTextExport,
  type IdeaTag,
  type SortMode,
} from '@/stores/useIdeasStore'
import { useToast } from '@/contexts/ToastContext'
import { useOfflineDetection } from '@/hooks/useOfflineDetection'
import {
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronDownIcon,
  PlusIcon,
  ArrowPathIcon,
  CheckIcon,
  CloudIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

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

  // Toast for feedback
  const { ideaCreated, checkAndCelebrate } = useToast()

  // Offline detection and sync status
  const { isOnline, wasOffline, clearWasOffline } = useOfflineDetection()
  const syncStatus = useIdeasStore(selectSyncStatus)
  const syncToSupabase = useIdeasStore((state) => state.syncToSupabase)

  // Auto-sync when coming back online
  useEffect(() => {
    if (wasOffline && isOnline) {
      syncToSupabase()
      clearWasOffline()
    }
  }, [wasOffline, isOnline, syncToSupabase, clearWasOffline])

  const handleAddCard = useCallback(() => {
    addCard('New idea...', filter ?? 'content')
    ideaCreated()
    // Check for milestone (first idea, 5th, 10th, etc.)
    checkAndCelebrate('ideas', totalCards + 1)
  }, [addCard, filter, ideaCreated, checkAndCelebrate, totalCards])

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

  return (
    <>
      {/* Offline/Error Banner */}
      <AnimatePresence>
        {(!isOnline || syncStatus.error) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex items-center justify-center gap-2 px-3 py-2 text-xs border-b ${
              !isOnline
                ? 'bg-ta-warning/10 border-ta-warning/20 text-ta-warning'
                : 'bg-ta-error/10 border-ta-error/20 text-ta-error'
            }`}
          >
            <span className="font-medium">{!isOnline ? "You're offline" : 'Sync error'}</span>
            <span className="opacity-80">
              {!isOnline ? "— changes will sync when you're back online" : `— ${syncStatus.error}`}
            </span>
            {syncStatus.error && isOnline && (
              <button
                onClick={() => syncToSupabase()}
                className="px-2.5 py-1 text-[11px] font-medium text-ta-error bg-ta-error/15 border border-ta-error/30 rounded-ta-sm cursor-pointer"
              >
                Retry
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-b border-white/5 bg-ta-black/95 backdrop-blur-ta min-h-[52px] flex-wrap">
        {/* Left: Filter tabs - scrollable on mobile */}
        <div
          role="tablist"
          aria-label="Filter ideas by category"
          className="flex items-center gap-0.5 flex-shrink overflow-x-auto scrollbar-none min-w-0 flex-1"
        >
          {/* All tab */}
          <button
            role="tab"
            aria-selected={filter === null}
            aria-controls="ideas-canvas"
            onClick={() => handleFilterClick(null)}
            className={`flex items-center gap-1.5 px-3 py-1.5 border-none rounded-ta-sm text-xs whitespace-nowrap transition-all duration-120 ${
              filter === null
                ? 'bg-white/8 font-medium text-ta-white/90'
                : 'bg-transparent font-normal text-ta-grey/60 hover:text-ta-grey'
            }`}
          >
            All
            <span
              aria-label={`${totalCards} ideas`}
              className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded-ta-pill"
            >
              {totalCards}
            </span>
          </button>

          {/* Tag tabs */}
          {TAGS.map((tag) => (
            <button
              key={tag.key}
              role="tab"
              aria-selected={filter === tag.key}
              aria-controls="ideas-canvas"
              onClick={() => handleFilterClick(tag.key)}
              className={`flex items-center gap-1 px-2.5 py-1.5 border-none rounded-ta-sm text-xs whitespace-nowrap flex-shrink-0 transition-all duration-120 ${
                filter === tag.key
                  ? 'bg-white/8 font-medium'
                  : 'bg-transparent font-normal text-ta-grey/60 hover:text-ta-grey'
              }`}
              style={{ color: filter === tag.key ? tag.colour : undefined }}
            >
              <span
                aria-hidden="true"
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: tag.colour,
                  opacity: filter === tag.key ? 1 : 0.5,
                }}
              />
              {tag.label}
              {cardCounts[tag.key] > 0 && (
                <span
                  aria-label={`${cardCounts[tag.key]} ideas`}
                  className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded-ta-pill"
                >
                  {cardCounts[tag.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Centre: Search - collapses on mobile */}
        <div className="flex items-center gap-2 flex-[0_1_180px] min-w-[100px]">
          <div className="flex items-center gap-2 flex-1 px-2.5 py-1.5 bg-white/5 border border-white/5 rounded-ta-sm">
            <MagnifyingGlassIcon className="h-3.5 w-3.5 text-ta-grey/50" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search ideas..."
              className="flex-1 bg-transparent border-none outline-none text-xs text-ta-white/90 placeholder:text-ta-grey/40"
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                className="p-0 bg-transparent border-none text-ta-grey/50 hover:text-ta-grey cursor-pointer"
              >
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions - compact on mobile */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Sort dropdown - hidden on mobile */}
          <div ref={sortRef} className="relative hidden sm:block">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-ta-grey hover:text-ta-white bg-transparent border border-white/10 hover:border-white/20 rounded-ta-sm transition-all duration-120 ${
                sortOpen ? 'bg-white/8' : ''
              }`}
            >
              {SORT_OPTIONS.find((o) => o.key === sortMode)?.label}
              <ChevronDownIcon className="h-3 w-3" />
            </button>
            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.16 }}
                  className="absolute top-full right-0 mt-1 min-w-[160px] bg-ta-black/98 border border-white/10 rounded-ta-sm p-1 z-50 shadow-ta-lg"
                >
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => {
                        setSortMode(option.key)
                        setSortOpen(false)
                      }}
                      className={`block w-full px-3 py-2 text-left text-xs text-ta-white/70 bg-transparent border-none rounded-ta-sm cursor-pointer transition-colors duration-120 hover:bg-white/5 ${
                        sortMode === option.key ? 'bg-white/5 font-medium' : 'font-normal'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* View toggle */}
          <div className="flex bg-white/5 rounded-ta-sm p-0.5">
            <button
              onClick={() => setViewMode('canvas')}
              className={`flex items-center justify-center p-1.5 border-none rounded-[3px] cursor-pointer transition-all duration-120 ${
                viewMode === 'canvas'
                  ? 'bg-white/10 text-ta-white/90'
                  : 'bg-transparent text-ta-grey/50 hover:text-ta-grey'
              }`}
              title="Canvas view"
            >
              <Squares2X2Icon className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center justify-center p-1.5 border-none rounded-[3px] cursor-pointer transition-all duration-120 ${
                viewMode === 'list'
                  ? 'bg-white/10 text-ta-white/90'
                  : 'bg-transparent text-ta-grey/50 hover:text-ta-grey'
              }`}
              title="List view"
            >
              <ListBulletIcon className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Export dropdown - hidden on mobile */}
          <div ref={exportRef} className="relative hidden sm:block">
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-ta-grey hover:text-ta-white bg-transparent border border-white/10 hover:border-white/20 rounded-ta-sm transition-all duration-120 ${
                exportOpen ? 'bg-white/8' : ''
              }`}
            >
              {exportFeedback || 'Export'}
              <ChevronDownIcon className="h-3 w-3" />
            </button>
            <AnimatePresence>
              {exportOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.16 }}
                  className="absolute top-full right-0 mt-1 min-w-[180px] bg-ta-black/98 border border-white/10 rounded-ta-sm p-1 z-50 shadow-ta-lg"
                >
                  <button
                    onClick={() => handleExport('markdown', false)}
                    className="block w-full px-3 py-2 text-left text-xs text-ta-white/70 bg-transparent border-none rounded-ta-sm cursor-pointer transition-colors duration-120 hover:bg-white/5"
                  >
                    Export all as Markdown
                  </button>
                  <button
                    onClick={() => handleExport('text', false)}
                    className="block w-full px-3 py-2 text-left text-xs text-ta-white/70 bg-transparent border-none rounded-ta-sm cursor-pointer transition-colors duration-120 hover:bg-white/5"
                  >
                    Export all as Plain text
                  </button>
                  <button
                    onClick={() => handleExport('markdown', true)}
                    className="block w-full px-3 py-2 text-left text-xs text-ta-white/70 bg-transparent border-none rounded-ta-sm cursor-pointer transition-colors duration-120 hover:bg-white/5"
                  >
                    Export visible as Markdown
                  </button>
                  <div className="h-px bg-white/5 my-1" />
                  <button
                    onClick={() => {
                      setExportOpen(false)
                      setShowClearModal(true)
                    }}
                    className="block w-full px-3 py-2 text-left text-xs text-ta-error bg-transparent border-none rounded-ta-sm cursor-pointer transition-colors duration-120 hover:bg-ta-error/10"
                  >
                    Clear all ideas...
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sync status indicator - hidden when offline (banner shows) */}
          {isOnline && !syncStatus.error && (
            <div
              aria-live="polite"
              aria-label={
                syncStatus.isLoading
                  ? 'Loading ideas'
                  : syncStatus.isSyncing
                    ? 'Syncing changes'
                    : 'All changes saved'
              }
              className={`hidden sm:flex items-center gap-1 px-2 py-1 text-[11px] ${
                syncStatus.isLoading || syncStatus.isSyncing
                  ? 'text-ta-grey/60'
                  : 'text-ta-success/80'
              }`}
            >
              {syncStatus.isLoading ? (
                <>
                  <ArrowPathIcon className="h-3 w-3 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : syncStatus.isSyncing ? (
                <>
                  <ArrowPathIcon className="h-3 w-3 animate-spin" />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-ta-success/15">
                    <CheckIcon className="h-2.5 w-2.5" />
                  </span>
                  <span>Saved</span>
                </>
              )}
            </div>
          )}

          {/* Add button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddCard}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-ta-cyan border-none rounded-ta-sm text-xs font-medium text-ta-black cursor-pointer"
          >
            <PlusIcon className="h-3.5 w-3.5" />
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
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-modal-title"
            aria-describedby="clear-modal-description"
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] p-6"
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
              className="w-full max-w-sm p-6 bg-ta-panel border border-white/10 rounded-ta shadow-ta-lg"
            >
              <h3 id="clear-modal-title" className="m-0 mb-3 text-base font-semibold text-ta-white">
                Delete all ideas?
              </h3>
              <p
                id="clear-modal-description"
                className="m-0 mb-5 text-[13px] text-ta-grey/70 leading-relaxed"
              >
                This will permanently delete all {totalCards} ideas. Type{' '}
                <code className="px-1.5 py-0.5 bg-white/10 rounded-ta-sm text-xs">DELETE</code> to
                confirm.
              </p>
              <input
                type="text"
                value={clearConfirmText}
                onChange={(e) => setClearConfirmText(e.target.value)}
                placeholder="Type DELETE"
                autoFocus
                className="w-full px-3 py-2.5 text-[13px] text-ta-white bg-white/5 border border-white/10 rounded-ta-sm outline-none focus:border-ta-cyan/50 mb-4"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowClearModal(false)
                    setClearConfirmText('')
                  }}
                  className="px-4 py-2 text-[13px] font-medium text-ta-grey/70 bg-transparent border border-white/10 rounded-ta-sm hover:border-white/20 cursor-pointer transition-all duration-120"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAll}
                  disabled={clearConfirmText !== 'DELETE'}
                  className={`px-4 py-2 text-[13px] font-medium border-none rounded-ta-sm transition-all duration-120 ${
                    clearConfirmText === 'DELETE'
                      ? 'bg-ta-error text-white cursor-pointer'
                      : 'bg-ta-error/20 text-ta-grey/40 cursor-not-allowed'
                  }`}
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
