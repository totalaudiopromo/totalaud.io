/**
 * ScoutGrid Component
 *
 * Phase 3: MVP Pivot - Scout Mode
 *
 * A responsive grid of opportunity cards.
 * Calm, minimal, with loading and empty states.
 */

'use client'

import { useCallback, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import {
  useScoutStore,
  selectFilteredOpportunities,
  selectEnrichedContact,
  selectEnrichmentStatus,
  selectEnrichmentError,
} from '@/stores/useScoutStore'
import { useTimelineStore } from '@/stores/useTimelineStore'
import { OpportunityCard } from './OpportunityCard'
import { ScoutPreview } from './ScoutPreview'

interface ScoutGridProps {
  className?: string
}

export function ScoutGrid({ className }: ScoutGridProps) {
  const opportunities = useScoutStore(selectFilteredOpportunities)
  const loading = useScoutStore((state) => state.loading)
  const error = useScoutStore((state) => state.error)
  const hasFetched = useScoutStore((state) => state.hasFetched)
  const fetchOpportunities = useScoutStore((state) => state.fetchOpportunities)
  const selectOpportunity = useScoutStore((state) => state.selectOpportunity)
  const markAddedToTimeline = useScoutStore((state) => state.markAddedToTimeline)
  const validateContact = useScoutStore((state) => state.validateContact)

  // Enrichment state selectors
  const enrichedById = useScoutStore((state) => state.enrichedById)
  const enrichmentStatusById = useScoutStore((state) => state.enrichmentStatusById)
  const enrichmentErrorById = useScoutStore((state) => state.enrichmentErrorById)

  // Fetch opportunities on mount (if not already fetched)
  useEffect(() => {
    if (!hasFetched && !loading) {
      fetchOpportunities()
    }
  }, [hasFetched, loading, fetchOpportunities])

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

  // Auth error state - show blurred preview with CTA
  if (error === 'Sign in to access opportunities') {
    return (
      <div className={className} style={{ height: '100%' }}>
        <ScoutPreview />
      </div>
    )
  }

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

  // Get filter/search state for empty state differentiation
  const filters = useScoutStore((state) => state.filters)
  const hasActiveFilters = filters.searchQuery.trim() !== '' || filters.type !== null

  // Empty state
  if (opportunities.length === 0) {
    // First-use empty state (no filters active)
    if (!hasActiveFilters && hasFetched) {
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
                fontSize: 18,
                fontWeight: 600,
                color: '#F7F8F9',
                fontFamily: 'var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif)',
              }}
            >
              Discover opportunities
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: 'rgba(255, 255, 255, 0.5)',
                fontFamily: 'var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif)',
                maxWidth: 320,
                lineHeight: 1.5,
              }}
            >
              Find radio DJs, playlist curators, and press contacts. Add them to your Timeline to
              plan your campaign.
            </p>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255, 255, 255, 0.3)' }}>
            Opportunities are loaded from your account
          </div>
        </div>
      )
    }

    // Filter/search empty state
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
              fontFamily: 'var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif)',
            }}
          >
            No opportunities match your filters
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: 'rgba(255, 255, 255, 0.4)',
              fontFamily: 'var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif)',
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
            enrichedData={enrichedById[opportunity.id] || null}
            enrichmentStatus={enrichmentStatusById[opportunity.id] || 'idle'}
            enrichmentError={enrichmentErrorById[opportunity.id] || null}
            onSelect={() => selectOpportunity(opportunity.id)}
            onAddToTimeline={() => handleAddToTimeline(opportunity)}
            onCopyEmail={() => {
              // Could track analytics here
            }}
            onValidateContact={() => validateContact(opportunity.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
