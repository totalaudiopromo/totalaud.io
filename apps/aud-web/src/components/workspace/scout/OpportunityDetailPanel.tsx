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

import { useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ExternalLink,
  Calendar,
  Mail,
  User,
  MessageSquare,
  CheckCircle,
  Search,
  AlertCircle,
  CreditCard,
  Loader2,
  ShieldCheck,
} from 'lucide-react'
import { useScoutStore } from '@/stores/useScoutStore'
import { useTimelineStore } from '@/stores/useTimelineStore'
import { useToast } from '@/contexts/ToastContext'
import { useCredits } from '@/hooks/useCredits'
import type { Opportunity, EnrichmentStatus, EnrichedContact } from '@/types/scout'
import { TYPE_LABELS, TYPE_COLOURS, AUDIENCE_SIZE_LABELS } from '@/types/scout'

export function OpportunityDetailPanel() {
  const router = useRouter()
  const { addedToTimeline: showAddedToast, checkAndCelebrate } = useToast()

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

  const opportunity = selectedId ? opportunities.find((o) => o.id === selectedId) : null
  const isAddedToTimeline = selectedId ? addedToTimelineSet.has(selectedId) : false

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
  ])

  const handleCreatePitch = useCallback(() => {
    // Navigate to pitch mode - could pre-fill with opportunity info later
    router.push('/workspace?mode=pitch')
    handleClose()
  }, [router, handleClose])

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
                    <div className="mt-3 pt-3 border-t border-white/6">
                      {/* Idle State - Show validate button */}
                      {enrichmentStatus === 'idle' && (
                        <>
                          {hasSufficientCredits ? (
                            <button
                              onClick={handleValidateContact}
                              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white/5 rounded-lg border border-white/10 hover:border-ta-cyan/30 hover:bg-ta-cyan/5 transition-all text-sm text-white/70 hover:text-white"
                            >
                              <Search size={14} />
                              Validate Contact
                              <span className="text-white/40">•</span>
                              <span className="text-ta-cyan">{formatPounds(enrichmentCost)}</span>
                            </button>
                          ) : (
                            <div className="space-y-2">
                              <button
                                disabled
                                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white/3 rounded-lg border border-white/6 text-sm text-white/40 cursor-not-allowed"
                              >
                                <Search size={14} />
                                Validate Contact
                                <span>•</span>
                                <span>{formatPounds(enrichmentCost)}</span>
                              </button>
                              <p className="text-xs text-white/40 text-center">
                                No credits available.{' '}
                                <button
                                  onClick={() => {
                                    /* TODO: Navigate to credits purchase */
                                  }}
                                  className="text-ta-cyan hover:underline"
                                >
                                  Add credits
                                </button>
                              </p>
                            </div>
                          )}
                        </>
                      )}

                      {/* Loading State */}
                      {enrichmentStatus === 'loading' && (
                        <div className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white/3 rounded-lg border border-white/6 text-sm text-white/50">
                          <Loader2 size={14} className="animate-spin" />
                          Validating contact...
                        </div>
                      )}

                      {/* Error State */}
                      {enrichmentStatus === 'error' && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 px-3 py-2.5 bg-red-500/10 rounded-lg border border-red-500/20 text-sm text-red-400">
                            <AlertCircle size={14} />
                            {enrichmentError || 'Validation failed'}
                          </div>
                          <button
                            onClick={handleValidateContact}
                            className="w-full text-xs text-white/50 hover:text-white transition-colors"
                          >
                            Try again
                          </button>
                        </div>
                      )}

                      {/* Success State - Show enrichment results */}
                      {enrichmentStatus === 'success' && enrichedData && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-emerald-400">
                            <ShieldCheck size={14} />
                            Contact Validated
                          </div>

                          {/* Confidence Score */}
                          {enrichedData.researchConfidence && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-white/40">Confidence</span>
                              <span
                                className={
                                  enrichedData.researchConfidence === 'High'
                                    ? 'text-emerald-400'
                                    : enrichedData.researchConfidence === 'Medium'
                                      ? 'text-amber-400'
                                      : 'text-red-400'
                                }
                              >
                                {enrichedData.researchConfidence}
                              </span>
                            </div>
                          )}

                          {/* Email Validation */}
                          {enrichedData.emailValidation && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-white/40">Email</span>
                              <span
                                className={
                                  enrichedData.emailValidation.isValid
                                    ? 'text-emerald-400'
                                    : 'text-red-400'
                                }
                              >
                                {enrichedData.emailValidation.isValid ? 'Verified' : 'Invalid'}
                                {enrichedData.emailValidation.confidence && (
                                  <span className="text-white/30 ml-1">
                                    ({Math.round(enrichedData.emailValidation.confidence * 100)}%)
                                  </span>
                                )}
                              </span>
                            </div>
                          )}

                          {/* Contact Intelligence */}
                          {enrichedData.contactIntelligence && (
                            <div className="text-xs text-white/50 leading-relaxed mt-2 p-2 bg-white/3 rounded-lg">
                              {enrichedData.contactIntelligence}
                            </div>
                          )}

                          {/* Last Researched */}
                          {enrichedData.lastResearched && (
                            <div className="text-xs text-white/30">
                              Last researched:{' '}
                              {new Date(enrichedData.lastResearched).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
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

              {/* Create Pitch */}
              <button
                onClick={handleCreatePitch}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <MessageSquare size={16} />
                Create Pitch
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
