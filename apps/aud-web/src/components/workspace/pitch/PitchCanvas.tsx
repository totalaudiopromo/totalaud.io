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

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCurrentTrackId } from '@/hooks/useCurrentTrackId'
import { motion, AnimatePresence } from 'framer-motion'
import { usePitchStore, type PitchType, type CoachAction } from '@/stores/usePitchStore'
import { useTrackContext } from '@/hooks/useTrackContext'
import { TAPGenerateModal } from './TAPGenerateModal'
import { IdentityPanel } from './IdentityPanel'
import { CoachingSession } from './CoachingSession'
import { useAuthGate } from '@/components/auth'
import { useToast } from '@/contexts/ToastContext'
import { TypingIndicator } from '@/components/ui/EmptyState'
import { StaggeredEntrance, StaggerItem } from '@/components/ui/StaggeredEntrance'

import { CopyButton } from '@/components/ui/CopyButton'
import { CrossModePrompt } from '@/components/workspace/CrossModePrompt'

// Pitch template options
const PITCH_TYPES: { key: PitchType; label: string; description: string }[] = [
  {
    key: 'radio',
    label: 'Radio Pitch',
    description: 'For BBC Radio 1, 6 Music, specialist shows',
  },
  {
    key: 'press',
    label: 'Press Release',
    description: 'For music blogs, magazines, and media outlets',
  },
  {
    key: 'playlist',
    label: 'Playlist Pitch',
    description: 'For Spotify editorial and curator submissions',
  },
  {
    key: 'custom',
    label: 'Custom Pitch',
    description: 'Start from scratch with helpful prompts',
  },
]

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
  const { intent, isLoading: isMemoryLoading } = useTrackContext()

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
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[500px] h-full p-6 overflow-y-auto"
        role="region"
        aria-label="Pitch type selection"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl font-semibold text-ta-white mb-2 tracking-tight">
            Choose your pitch type
          </h2>
          <p className="text-sm text-ta-grey max-w-md mx-auto">
            Select a template to get started. You'll have help shaping your pitch along the way.
          </p>
        </motion.div>

        <div role="radiogroup" aria-label="Pitch type options">
          <StaggeredEntrance className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 max-w-2xl w-full">
            {PITCH_TYPES.map((type) => (
              <StaggerItem key={type.key} className="h-full">
                <motion.button
                  onClick={() => selectType(type.key)}
                  aria-label={`${type.label}: ${type.description}`}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group w-full h-full flex flex-col items-start text-left p-6 rounded-xl bg-[#161A1D] border border-white/5 hover:border-ta-cyan/30 hover:shadow-[0_4px_20px_-10px_rgba(58,169,190,0.3)] transition-all duration-300 relative overflow-hidden"
                >
                  {/* Hover Gradient */}
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-ta-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    aria-hidden="true"
                  />

                  <span className="relative z-10 text-base font-semibold text-ta-white group-hover:text-white mb-2 block">
                    {type.label}
                  </span>
                  <span className="relative z-10 text-xs text-ta-grey leading-relaxed">
                    {type.description}
                  </span>
                </motion.button>
              </StaggerItem>
            ))}
          </StaggeredEntrance>
        </div>

        {/* Cross-mode prompt */}
        <CrossModePrompt currentMode="pitch" />
      </div>
    )
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
            <StaggerItem
              key={section.id}
              className={`
                group rounded-xl border transition-all duration-300 overflow-hidden
                ${
                  selectedSectionId === section.id
                    ? 'bg-[#161A1D]/80 border-ta-cyan/30 shadow-[0_0_20px_-10px_rgba(58,169,190,0.2)]'
                    : 'bg-transparent border-white/5 hover:border-white/10'
                }
              `}
            >
              {/* Section header with coach actions */}
              <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-ta-cyan">{section.title}</span>
                </div>

                {/* Coach action buttons */}
                <div
                  className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  role="group"
                  aria-label="Pitch refinement actions"
                >
                  {section.content && (
                    <CopyButton
                      text={section.content}
                      onCopy={pitchCopied}
                      className="text-[10px] py-1 px-2 h-auto"
                    />
                  )}
                  {(['improve', 'suggest', 'rewrite'] as CoachAction[]).map((action) => (
                    <button
                      key={action}
                      onClick={() => requestCoach(section.id, action)}
                      disabled={isCoachLoading}
                      aria-label={`${action} ${section.title}`}
                      className="px-2.5 py-1 text-[10px] font-medium text-ta-grey hover:text-white hover:bg-white/10 rounded transition-colors capitalize disabled:opacity-50 disabled:cursor-wait"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>

              {/* Placeholder hint (only when empty) */}
              {!section.content && (
                <div
                  id={`${section.id}-hint`}
                  className="px-5 py-3 bg-ta-cyan/[0.03] border-b border-ta-cyan/5"
                >
                  <span className="text-xs text-ta-cyan/70 italic leading-relaxed">
                    {section.placeholder}
                  </span>
                </div>
              )}

              {/* Content textarea */}
              <textarea
                value={section.content}
                onChange={(e) => updateSection(section.id, e.target.value)}
                onFocus={() => selectSection(section.id)}
                placeholder="Start writing..."
                aria-label={`${section.title} content`}
                aria-describedby={!section.content ? `${section.id}-hint` : undefined}
                className="w-full min-h-[120px] p-5 text-sm leading-relaxed text-ta-white bg-transparent border-none outline-none resize-none placeholder:text-ta-grey/30 focus:bg-white/[0.01] transition-colors"
                style={{ resize: 'vertical' }}
              />
            </StaggerItem>
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
