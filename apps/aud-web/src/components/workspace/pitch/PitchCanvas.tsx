/**
 * Pitch Canvas Component
 * Phase 5: AI-powered pitch builder with coach integration
 *
 * Helps artists craft compelling stories for radio, press, and playlists
 * Now integrated with usePitchStore for persistence and AI coaching
 *
 * Integrates with:
 * - Local AI Coach (Claude) for section-level improvements
 * - TAP Pitch service for full pitch generation from metadata
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCurrentTrackId } from '@/hooks/useCurrentTrackId'
import { motion, AnimatePresence } from 'framer-motion'
import { usePitchStore, type CoachAction } from '@/stores/usePitchStore'
import { useTrackContext } from '@/hooks/useTrackContext'
import { TAPGenerateModal } from './TAPGenerateModal'
import { IdentityPanel } from './IdentityPanel'
import { CoachingSession } from './CoachingSession'
import { useAuthGate } from '@/components/auth'
import { useToast } from '@/contexts/ToastContext'
import { TypingIndicator } from '@/components/ui/EmptyState'
import { StaggeredEntrance } from '@/components/ui/StaggeredEntrance'

// Pitch template options
import { PITCH_TYPES } from './PitchUtils'
import { PitchStepSelection } from './PitchStepSelection'
import { PitchSection } from './PitchSection'

export function PitchCanvas() {
  const router = useRouter()
  const { canAccess: isAuthenticated, requireAuth } = useAuthGate()
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const { pitchCopied } = useToast()

  // Get state and actions from store
  const {
    currentType,
    sections,
    selectedSectionId,
    isCoachOpen,
    isCoachLoading,
    coachResponse,
    coachError,
    isSessionActive, // Intelligence Navigator (Phase 1.5)
    selectType,
    updateSection,
    selectSection,
    openCoach,
    closeCoach,
    setCoachLoading,
    setCoachResponse,
    setCoachError,
    applyCoachSuggestion,
    resetPitch,
    // TAP Pitch actions
    openTAPModal,
    setTrackId,
  } = usePitchStore()

  const trackId = useCurrentTrackId()

  // Sync trackId to store for API consumption
  useEffect(() => {
    setTrackId(trackId)
  }, [trackId, setTrackId])

  // Get track memory context
  const { intent } = useTrackContext()

  // Gated TAP modal opener
  const handleOpenTAPModal = () => {
    if (!requireAuth(() => setShowAuthPrompt(true))) {
      // Show brief prompt, then redirect
      setTimeout(() => {
        setShowAuthPrompt(false)
        router.push('/signup?feature=pitch-generator')
      }, 1500)
      return
    }
    openTAPModal()
  }

  // Request AI coach feedback
  const requestCoach = async (sectionId: string, action: CoachAction) => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section || !currentType) return

    selectSection(sectionId)
    setCoachLoading(true)
    openCoach()

    try {
      const response = await fetch('/api/pitch/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          sectionId: section.id,
          sectionTitle: section.title,
          content: section.content,
          pitchType: currentType,
          allSections: sections.map((s) => ({ title: s.title, content: s.content })),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setCoachResponse(data.suggestion)
      } else {
        setCoachError(data.error || 'Something went wrong')
      }
    } catch {
      setCoachError('Failed to connect to coach')
    } finally {
      setCoachLoading(false)
    }
  }

  // Template selection view
  if (!currentType) {
    return <PitchStepSelection onSelect={selectType} />
  }

  // Pitch editor view
  return (
    <div className="flex h-full relative font-sans" role="region" aria-label="Pitch editor">
      {/* Main editor */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        {/* Back button */}
        <button
          onClick={() => resetPitch()}
          aria-label="Back to pitch templates"
          className="flex items-center gap-2 px-3 py-2 mb-6 text-xs text-ta-grey hover:text-white transition-colors rounded-lg hover:bg-white/5"
        >
          <span aria-hidden="true">←</span> Back to templates
        </button>

        {/* Identity Panel - collapsible */}
        <IdentityPanel />

        {/* Track Context Anchor (Silent Read-Side Integration) */}
        {intent?.content && intent.content.trim().length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-xl bg-ta-cyan/[0.03] border border-ta-cyan/10"
          >
            <h3 className="text-[10px] uppercase tracking-wider text-ta-cyan/60 mb-1.5 font-semibold">
              Original Release Intent
            </h3>
            <p className="text-sm text-ta-white/80 leading-relaxed italic">
              "This release began with{' '}
              {intent.content.charAt(0).toLowerCase() + intent.content.slice(1)}"
            </p>
          </motion.div>
        )}

        {/* Pitch type header with TAP generate button */}
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-semibold text-ta-white mb-2 tracking-tight">
              {PITCH_TYPES.find((t) => t.key === currentType)?.label}
            </h2>
            <p className="text-sm text-ta-grey">
              {PITCH_TYPES.find((t) => t.key === currentType)?.description}
            </p>
          </div>

          {/* Generate with TAP button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenTAPModal}
            aria-label={
              !isAuthenticated
                ? 'Sign up to generate pitches with TAP AI'
                : 'Generate a pitch using TAP AI'
            }
            className={`
              flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-lg border transition-all duration-200
              ${
                showAuthPrompt
                  ? 'bg-orange-500/10 border-orange-500/30 text-orange-500'
                  : 'bg-ta-cyan/10 border-ta-cyan/30 text-ta-cyan hover:bg-ta-cyan/20 hover:border-ta-cyan/50'
              }
            `}
          >
            <span className="text-sm" aria-hidden="true">
              ✦
            </span>
            {showAuthPrompt ? 'Sign up to unlock' : 'Generate with TAP'}
          </motion.button>
        </div>

        {/* Sections */}
        <StaggeredEntrance className="flex flex-col gap-6">
          {sections.map((section) => (
            <PitchSection
              key={section.id}
              section={section}
              isSelected={selectedSectionId === section.id}
              isCoachLoading={isCoachLoading}
              onSelect={() => selectSection(section.id)}
              onUpdate={(content) => updateSection(section.id, content)}
              onCoachAction={(action) => requestCoach(section.id, action)}
              onCopy={pitchCopied}
            />
          ))}
        </StaggeredEntrance>
      </div>

      {/* AI Coach sidebar - Intelligence Navigator (Phase 1.5) */}
      <AnimatePresence>
        {isCoachOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 360, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="border-l border-white/5 bg-[#0F1113]/95 backdrop-blur-xl flex-shrink-0 relative z-20"
          >
            <div className="h-full w-[360px]">
              {/* Show CoachingSession for multi-turn conversations */}
              {isSessionActive ? (
                <CoachingSession />
              ) : (
                <div className="p-6 h-full overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-semibold text-ta-white flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full bg-ta-cyan animate-pulse"
                        aria-hidden="true"
                      />
                      Second Opinion
                    </h3>
                    <button
                      onClick={() => closeCoach()}
                      aria-label="Close second opinion panel"
                      className="text-xs text-ta-grey hover:text-white transition-colors"
                    >
                      Close
                    </button>
                  </div>

                  {/* Loading state */}
                  {isCoachLoading && (
                    <div className="p-4 rounded-xl bg-ta-cyan/5 border border-ta-cyan/10 flex items-center gap-3">
                      <TypingIndicator />
                      <span className="text-xs text-ta-cyan/80">Working...</span>
                    </div>
                  )}

                  {/* Error state */}
                  {coachError && !isCoachLoading && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-ta-white/90">
                      {coachError}
                    </div>
                  )}

                  {/* Coach response (legacy one-shot) */}
                  {coachResponse && !isCoachLoading && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/5 text-sm text-ta-white/90 leading-relaxed whitespace-pre-wrap shadow-inner">
                        {coachResponse}
                      </div>

                      {/* Apply button (for rewrite action) */}
                      {selectedSectionId && (
                        <button
                          onClick={() => {
                            if (selectedSectionId && coachResponse) {
                              applyCoachSuggestion(selectedSectionId, coachResponse)
                            }
                          }}
                          aria-label="Apply suggestion to selected section"
                          className="w-full py-2.5 text-xs font-semibold text-ta-black bg-ta-cyan hover:bg-ta-cyan/90 rounded-lg transition-colors shadow-[0_0_15px_-5px_rgba(58,169,190,0.5)]"
                        >
                          Apply to section
                        </button>
                      )}
                    </div>
                  )}

                  {/* Default state with session starter */}
                  {!isCoachLoading && !coachResponse && !coachError && <CoachingSession />}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coach toggle button (when closed) */}
      {!isCoachOpen && (
        <motion.button
          onClick={() => openCoach()}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Open second opinion panel"
          className="absolute right-6 bottom-6 flex items-center gap-2 px-4 py-3 text-sm font-semibold text-ta-black bg-ta-cyan rounded-full shadow-[0_4px_20px_rgba(58,169,190,0.4)] z-10"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
          Get a Second Opinion
        </motion.button>
      )}

      {/* TAP Generate Modal */}
      <TAPGenerateModal />
    </div>
  )
}
