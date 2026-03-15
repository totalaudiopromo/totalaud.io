/**
 * OpportunityDetailPanel Component
 *
 * Slide-in panel showing full opportunity details.
 * Shows when clicking an opportunity card in Scout mode.
 *
 * Features:
 * - Full details (name, type, genres, audience, description)
 * - Contact info (if available)
 * - "Add to Timeline" button
 * - "Create Pitch" button
 * - Link to outlet
 */

'use client'

import { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ExternalLink,
  Calendar,
  Mail,
  User,
  MessageSquare,
  CheckCircle,
  Loader2,
} from 'lucide-react'
import { useScoutStore } from '@/stores/useScoutStore'
import { useTimelineStore } from '@/stores/useTimelineStore'
import { useToast } from '@/contexts/ToastContext'
import { useCredits } from '@/hooks/useCredits'
import { useScoutToPitch } from '@/hooks/useScoutToPitch'
import { useTelemetry } from '@/hooks/useTelemetry'
import type { EnrichmentStatus, EnrichedContact } from '@/types/scout'
import { TYPE_LABELS, TYPE_COLOURS, AUDIENCE_SIZE_LABELS } from '@/types/scout'
import { logger } from '@/lib/logger'
import { ContactEnrichment } from './ContactEnrichment'

const log = logger.scope('OpportunityDetail')

export function OpportunityDetailPanel() {
  const { addedToTimeline: showAddedToast, checkAndCelebrate } = useToast()
  const { track } = useTelemetry()

  // Get selected opportunity
  const selectedId = useScoutStore((state) => state.selectedOpportunityId)
  const opportunities = useScoutStore((state) => state.opportunities)
  const selectOpportunity = useScoutStore((state) => state.selectOpportunity)
  const markAddedToTimeline = useScoutStore((state) => state.markAddedToTimeline)
  const addedToTimelineSet = useScoutStore((state) => state.addedToTimeline)
  const validateContact = useScoutStore((state) => state.validateContact)
  const enrichmentStatusById = useScoutStore((state) => state.enrichmentStatusById)
  const enrichedById = useScoutStore((state) => state.enrichedById)
  const enrichmentErrorById = useScoutStore((state) => state.enrichmentErrorById)

  // Credits
  const { balance, hasSufficientCredits, deductForEnrichment, formatPounds } = useCredits()

  // Timeline actions
  const addFromOpportunity = useTimelineStore((state) => state.addFromOpportunity)
  const timelineEvents = useTimelineStore((state) => state.events)

  // Scout→Pitch automation
  const { handlePitchOpportunity } = useScoutToPitch()

  const opportunity = selectedId ? opportunities.find((o) => o.id === selectedId) : null
  const isAddedToTimeline = selectedId ? addedToTimelineSet.has(selectedId) : false
  const pitchedIds = useScoutStore((state) => state.pitchedIds)
  const isPitched = selectedId ? pitchedIds.has(selectedId) : false

  // Enrichment state for selected opportunity
  const enrichmentStatus: EnrichmentStatus = selectedId
    ? enrichmentStatusById[selectedId] || 'idle'
    : 'idle'
  const enrichedData: EnrichedContact | null = selectedId ? enrichedById[selectedId] || null : null
  const enrichmentError: string | null = selectedId ? enrichmentErrorById[selectedId] || null : null

  const handleClose = useCallback(() => {
    selectOpportunity(null)
  }, [selectOpportunity])

  const handleAddToTimeline = useCallback(() => {
    if (!opportunity || isAddedToTimeline) return

    addFromOpportunity(opportunity, 'post-release')
    markAddedToTimeline(opportunity.id)
    track('opportunity_add_to_timeline', { opportunityId: opportunity.id, type: opportunity.type })
    showAddedToast()
    checkAndCelebrate('timeline', timelineEvents.length + 1)
  }, [
    opportunity,
    isAddedToTimeline,
    addFromOpportunity,
    markAddedToTimeline,
    showAddedToast,
    checkAndCelebrate,
    timelineEvents.length,
    track,
  ])

  const handleCreatePitch = useCallback(() => {
    if (!opportunity) return
    // DESSA Phase 3: Pre-generate pitch from opportunity
    handlePitchOpportunity(opportunity)
  }, [opportunity, handlePitchOpportunity])

  const [isSyncing, setIsSyncing] = useState(false)
  const handleSyncToTracker = useCallback(async () => {
    if (!opportunity || isSyncing) return

    setIsSyncing(true)
    try {
      track('opportunity_sync_start', { opportunityId: opportunity.id })
      const response = await fetch('/api/tap/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityId: opportunity.id,
          campaignName: `${opportunity.name} Outreach`,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to sync')

      track('opportunity_sync_success', {
        opportunityId: opportunity.id,
        campaignId: data.campaign?.id,
      })
      checkAndCelebrate('scout', 1)
      showAddedToast() // Reuse toast or create new one
    } catch (error) {
      log.error('Sync to tracker failed', error)
      track('opportunity_sync_error', {
        opportunityId: opportunity.id,
        error: (error as Error).message,
      })
    } finally {
      setIsSyncing(false)
    }
  }, [opportunity, isSyncing, checkAndCelebrate, showAddedToast, track])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    },
    [handleClose]
  )

  // Handle contact validation with credit deduction
  const handleValidateContact = useCallback(async () => {
    if (!opportunity || !selectedId) return
    if (!opportunity.contactEmail) return
    if (enrichmentStatus === 'loading' || enrichmentStatus === 'success') return

    // Check if user has sufficient credits
    if (!hasSufficientCredits) {
      // Could navigate to credits purchase page here
      return
    }

    // Deduct credits first
    const deductionSuccess = await deductForEnrichment(selectedId, opportunity.name)
    if (!deductionSuccess) {
      // Deduction failed (insufficient funds or error)
      return
    }

    // Then validate the contact
    await validateContact(selectedId)
  }, [
    opportunity,
    selectedId,
    enrichmentStatus,
    hasSufficientCredits,
    deductForEnrichment,
    validateContact,
  ])

  // Cost display
  const enrichmentCost = balance?.enrichmentCostPence || 20

  if (!opportunity) {
    return null
  }

  const typeColour = TYPE_COLOURS[opportunity.type]

  return (
    <AnimatePresence>
      {selectedId && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            onKeyDown={handleKeyDown}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#1A1D21] border-l border-white/8 z-50 flex flex-col overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="panel-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/6">
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider border"
                  style={{
                    backgroundColor: `${typeColour.bg}`,
                    color: typeColour.text,
                    borderColor: typeColour.border,
                  }}
                >
                  {TYPE_LABELS[opportunity.type]}
                </span>
                <span className="text-xs text-white/40 font-mono uppercase tracking-wide">
                  {AUDIENCE_SIZE_LABELS[opportunity.audienceSize]}
                </span>
              </div>

              <button
                onClick={handleClose}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                aria-label="Close panel"
              >
                <X size={16} className="text-white/60" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Title */}
              <div>
                <h2
                  id="panel-title"
                  className="text-xl font-semibold text-white leading-tight mb-2"
                >
                  {opportunity.name}
                </h2>
                {opportunity.description && (
                  <p className="text-sm text-white/60 leading-relaxed">{opportunity.description}</p>
                )}
              </div>

              {/* Genres */}
              {opportunity.genres.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
                    Genres
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {opportunity.genres.map((genre) => (
                      <span
                        key={genre}
                        className="px-2.5 py-1 text-xs text-white/70 bg-white/5 rounded-full border border-white/8"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Vibes */}
              {opportunity.vibes.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
                    Vibes
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {opportunity.vibes.map((vibe) => (
                      <span
                        key={vibe}
                        className="px-2.5 py-1 text-xs text-white/70 bg-white/5 rounded-full border border-white/8"
                      >
                        {vibe}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Info */}
              {(opportunity.contactName || opportunity.contactEmail) && (
                <div className="p-4 bg-white/3 rounded-xl border border-white/6">
                  <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
                    Contact
                  </h3>

                  {opportunity.contactName && (
                    <div className="flex items-center gap-2 mb-2">
                      <User size={14} className="text-white/40" />
                      <span className="text-sm text-white/80">{opportunity.contactName}</span>
                    </div>
                  )}

                  {opportunity.contactEmail && (
                    <div className="flex items-center gap-2 mb-3">
                      <Mail size={14} className="text-white/40" />
                      <a
                        href={`mailto:${opportunity.contactEmail}`}
                        className="text-sm text-ta-cyan hover:underline"
                      >
                        {opportunity.contactEmail}
                      </a>
                    </div>
                  )}

                  {/* Enrichment Section */}
                  {opportunity.contactEmail && (
                    <ContactEnrichment
                      status={enrichmentStatus}
                      data={enrichedData}
                      error={enrichmentError}
                      cost={enrichmentCost}
                      hasCredits={hasSufficientCredits}
                      onValidate={handleValidateContact}
                      formatPounds={formatPounds}
                    />
                  )}
                </div>
              )}

              {/* Link */}
              {opportunity.link && (
                <a
                  href={opportunity.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 bg-white/5 rounded-xl border border-white/8 hover:border-ta-cyan/30 hover:bg-ta-cyan/5 transition-all group"
                >
                  <ExternalLink size={16} className="text-white/40 group-hover:text-ta-cyan" />
                  <span className="text-sm text-white/60 group-hover:text-white truncate flex-1">
                    {new URL(opportunity.link).hostname}
                  </span>
                  <span className="text-xs text-white/30 group-hover:text-ta-cyan">Visit</span>
                </a>
              )}

              {/* Source */}
              <div className="text-xs text-white/30">
                Source: {opportunity.source} • Updated{' '}
                {new Date(opportunity.updatedAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-white/6 space-y-3">
              {/* Add to Timeline */}
              <button
                onClick={handleAddToTimeline}
                disabled={isAddedToTimeline}
                className={`
                  w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all
                  ${
                    isAddedToTimeline
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
                      : 'bg-ta-cyan text-ta-black hover:shadow-[0_0_20px_rgba(58,169,190,0.3)]'
                  }
                `}
              >
                {isAddedToTimeline ? (
                  <>
                    <CheckCircle size={16} />
                    Added to Timeline
                  </>
                ) : (
                  <>
                    <Calendar size={16} />
                    Add to Timeline
                  </>
                )}
              </button>

              <button
                onClick={handleSyncToTracker}
                disabled={isSyncing}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 text-white/80 border border-white/10 rounded-xl font-medium text-sm hover:bg-white/10 hover:border-white/20 transition-all"
              >
                {isSyncing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ExternalLink size={16} />
                )}
                Sync to TAP Tracker
              </button>

              {/* Create Pitch */}
              <button
                onClick={handleCreatePitch}
                className={`
                  w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all
                  ${
                    isPitched
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 hover:border-white/20'
                  }
                `}
              >
                <MessageSquare size={16} />
                {isPitched ? 'Pitch Again' : 'Create Pitch'}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
