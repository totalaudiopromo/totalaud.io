/**
 * ScoutCalmGrid
 *
 * Balanced Scout grid - calm but not empty
 * - 3 columns on desktop, responsive
 * - 12 items initially, then load more
 * - Full width usage
 */

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useScoutStore, selectFilteredOpportunities } from '@/stores/useScoutStore'
import { useTimelineStore } from '@/stores/useTimelineStore'
import { useToast } from '@/contexts/ToastContext'
import { OpportunityCardCalm } from './OpportunityCardCalm'
import { ScoutPreview } from './ScoutPreview'
import { EmptyState, emptyStates } from '@/components/ui/EmptyState'

const ITEMS_PER_PAGE = 12

interface ScoutCalmGridProps {
  className?: string
}

export function ScoutCalmGrid({ className }: ScoutCalmGridProps) {
  const opportunities = useScoutStore(selectFilteredOpportunities)
  const loading = useScoutStore((state) => state.loading)
  const error = useScoutStore((state) => state.error)
  const hasFetched = useScoutStore((state) => state.hasFetched)
  const fetchOpportunities = useScoutStore((state) => state.fetchOpportunities)
  const selectOpportunity = useScoutStore((state) => state.selectOpportunity)
  const markAddedToTimeline = useScoutStore((state) => state.markAddedToTimeline)
  const filters = useScoutStore((state) => state.filters)

  const addFromOpportunity = useTimelineStore((state) => state.addFromOpportunity)
  const timelineEvents = useTimelineStore((state) => state.events)

  const { addedToTimeline: showAddedToast, checkAndCelebrate } = useToast()

  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE)
  }, [filters])

  useEffect(() => {
    if (!hasFetched && !loading) {
      fetchOpportunities()
    }
  }, [hasFetched, loading, fetchOpportunities])

  const isInTimeline = useCallback(
    (id: string) => timelineEvents.some((e) => e.opportunityId === id),
    [timelineEvents]
  )

  const handleAddToTimeline = useCallback(
    (opportunity: (typeof opportunities)[0]) => {
      addFromOpportunity(opportunity, 'promo')
      markAddedToTimeline(opportunity.id)
      showAddedToast()
      // Check for timeline milestone
      checkAndCelebrate('timeline', timelineEvents.length + 1)
    },
    [
      addFromOpportunity,
      markAddedToTimeline,
      showAddedToast,
      checkAndCelebrate,
      timelineEvents.length,
    ]
  )

  const visibleOpportunities = useMemo(
    () => opportunities.slice(0, visibleCount),
    [opportunities, visibleCount]
  )
  const hasMore = opportunities.length > visibleCount

  if (error === 'Sign in to access opportunities') {
    return (
      <div className={className} style={{ height: '100%' }}>
        <ScoutPreview />
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`${className} p-5`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-lg bg-white/[0.02] border border-white/[0.04] animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  if (opportunities.length === 0) {
    const hasFilters = filters.type || filters.genres.length > 0 || filters.searchQuery

    return (
      <div className={`${className} flex items-center justify-center h-full`}>
        <EmptyState
          title={hasFilters ? emptyStates.scout.noResults.title : emptyStates.scout.firstTime.title}
          description={
            hasFilters
              ? emptyStates.scout.noResults.description
              : emptyStates.scout.firstTime.description
          }
          variant="minimal"
        />
      </div>
    )
  }

  return (
    <div className={`${className} p-5`}>
      {/* Grid - 3 columns on desktop, fills width */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence mode="popLayout">
          {visibleOpportunities.map((opp, index) => (
            <motion.div
              key={opp.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, delay: index * 0.02 }}
            >
              <OpportunityCardCalm
                opportunity={opp}
                isAddedToTimeline={isInTimeline(opp.id)}
                onAddToTimeline={() => handleAddToTimeline(opp)}
                onSelect={() => selectOpportunity(opp.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setVisibleCount((v) => v + ITEMS_PER_PAGE)}
            className="
              px-4 py-2 text-sm text-white/40 
              hover:text-white/60 transition-colors
              border border-white/[0.06] rounded-lg
              hover:border-white/[0.1]
            "
          >
            Show more ({opportunities.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  )
}
