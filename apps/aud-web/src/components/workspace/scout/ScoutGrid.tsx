/**
 * ScoutGrid Component
 *
 * Phase 3: MVP Pivot - Scout Mode
 *
 * A responsive grid of opportunity cards.
 * Calm, minimal, with loading and empty states.
 */

'use client'

import { useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useScoutStore, selectFilteredOpportunities } from '@/stores/useScoutStore'
import { useTimelineStore } from '@/stores/useTimelineStore'
import { OpportunityCard } from './OpportunityCard'

interface ScoutGridProps {
  className?: string
}

export function ScoutGrid({ className }: ScoutGridProps) {
  const opportunities = useScoutStore(selectFilteredOpportunities)
  const loading = useScoutStore((state) => state.loading)
  const selectOpportunity = useScoutStore((state) => state.selectOpportunity)
  const markAddedToTimeline = useScoutStore((state) => state.markAddedToTimeline)

  // Timeline store integration - subscribe to events for reactivity
  const addFromOpportunity = useTimelineStore((state) => state.addFromOpportunity)
  const timelineEvents = useTimelineStore((state) => state.events)

  // Check if opportunity is already in timeline (reactive)
  const isOpportunityInTimeline = useCallback(
    (opportunityId: string) => timelineEvents.some((e) => e.opportunityId === opportunityId),
    [timelineEvents]
  )

  const handleAddToTimeline = useCallback(
    (opportunity: (typeof opportunities)[0]) => {
      // Add to Timeline store
      addFromOpportunity(opportunity, 'promo')

      // Also mark in Scout store for UI state
      markAddedToTimeline(opportunity.id)
    },
    [addFromOpportunity, markAddedToTimeline]
  )

  // Loading skeleton
  if (loading) {
    return (
      <div
        className={className}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
          padding: 16,
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.04)',
              borderRadius: 8,
              padding: 16,
              height: 200,
              animation: 'pulse 2s ease-in-out infinite',
            }}
          >
            {/* Skeleton content */}
            <div
              style={{
                width: 80,
                height: 20,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 10,
                marginBottom: 16,
              }}
            />
            <div
              style={{
                width: '70%',
                height: 16,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 4,
                marginBottom: 8,
              }}
            />
            <div
              style={{
                width: '100%',
                height: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 4,
                marginBottom: 4,
              }}
            />
            <div
              style={{
                width: '80%',
                height: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 4,
              }}
            />
          </div>
        ))}
      </div>
    )
  }

  // Empty state
  if (opportunities.length === 0) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          minHeight: 400,
          gap: 16,
          padding: 24,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(58, 169, 190, 0.1)',
            border: '1px solid rgba(58, 169, 190, 0.2)',
            borderRadius: 14,
            fontSize: 24,
            color: '#3AA9BE',
          }}
        >
          ◎
        </div>
        <div>
          <h3
            style={{
              margin: 0,
              marginBottom: 8,
              fontSize: 15,
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.8)',
              fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
            }}
          >
            No opportunities match your filters
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: 'rgba(255, 255, 255, 0.4)',
              fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
              maxWidth: 280,
            }}
          >
            Try adjusting your filters or clearing your search to see more results.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16,
        padding: 16,
        overflowY: 'auto',
      }}
    >
      <AnimatePresence mode="popLayout">
        {opportunities.map((opportunity) => (
          <OpportunityCard
            key={opportunity.id}
            opportunity={opportunity}
            isAddedToTimeline={isOpportunityInTimeline(opportunity.id)}
            onSelect={() => selectOpportunity(opportunity.id)}
            onAddToTimeline={() => handleAddToTimeline(opportunity)}
            onCopyEmail={() => {
              // Could track analytics here
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
