/**
 * Identity Panel Component
 *
 * Collapsible panel in Pitch Mode showing artist identity:
 * - One-liner and bio preview
 * - Brand voice summary
 * - "Generate Identity" / "Refresh" button
 * - "Apply to Pitch" for auto-filling sections
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useIdentityStore,
  selectHasIdentity,
  selectOneLiner,
  selectShortBio,
  selectIdentityStatus,
} from '@/stores/useIdentityStore'
import { usePitchStore } from '@/stores/usePitchStore'
import { useAuth } from '@/hooks/useAuth'

export function IdentityPanel() {
  const { user, loading: isAuthLoading } = useAuth()
  const [isExpanded, setIsExpanded] = useState(false)
  const [showApplied, setShowApplied] = useState(false)

  // Identity store
  const identity = useIdentityStore((s) => s.identity)
  const loadFromSupabase = useIdentityStore((s) => s.loadFromSupabase)
  const generateIdentity = useIdentityStore((s) => s.generateIdentity)
  const hasIdentity = useIdentityStore(selectHasIdentity)
  const oneLiner = useIdentityStore(selectOneLiner)
  const shortBio = useIdentityStore(selectShortBio)
  const status = useIdentityStore(selectIdentityStatus)

  // Pitch store
  const updateSection = usePitchStore((s) => s.updateSection)
  const sections = usePitchStore((s) => s.sections)

  // Load identity on mount
  useEffect(() => {
    if (user && !isAuthLoading) {
      loadFromSupabase()
    }
  }, [user, isAuthLoading, loadFromSupabase])

  // Apply identity to pitch sections
  const applyToPitch = useCallback(() => {
    if (!identity) return

    // Apply one-liner to hook section if empty
    const hookSection = sections.find((s) => s.id === 'hook')
    if (hookSection && !hookSection.content && identity.epkFragments.pitchHook) {
      updateSection('hook', identity.epkFragments.pitchHook)
    }

    // Apply short bio to story section if empty
    const storySection = sections.find((s) => s.id === 'story')
    if (storySection && !storySection.content && shortBio) {
      updateSection('story', shortBio)
    }

    // Apply comparisons to sound section if empty
    const soundSection = sections.find((s) => s.id === 'sound')
    if (
      soundSection &&
      !soundSection.content &&
      identity.epkFragments.comparisons &&
      identity.epkFragments.comparisons.length > 0
    ) {
      const comparisonsText = `Think ${identity.epkFragments.comparisons.join(' meets ')}.`
      updateSection('sound', comparisonsText)
    }

    // Show feedback
    setShowApplied(true)
    setTimeout(() => setShowApplied(false), 2000)
  }, [identity, sections, updateSection, shortBio])

  // Don't render if not authenticated
  if (!user) return null

  return (
    <div className="mb-4">
      {/* Collapsed state - clickable header */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200
          ${
            isExpanded
              ? 'bg-[#161A1D] border-ta-cyan/20'
              : 'bg-[#161A1D]/50 border-white/5 hover:border-white/10'
          }
        `}
        aria-expanded={isExpanded}
        aria-controls="identity-panel-content"
      >
        <div className="flex items-center gap-3">
          <span
            className={`
              w-2 h-2 rounded-full transition-colors
              ${hasIdentity ? 'bg-ta-cyan' : 'bg-ta-grey/50'}
            `}
            aria-hidden="true"
          />
          <span className="text-sm font-medium text-ta-white">Your Identity</span>
          {hasIdentity && oneLiner && !isExpanded && (
            <span className="text-xs text-ta-grey truncate max-w-[200px]">{oneLiner}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {status.isGenerating && (
            <span className="text-xs text-ta-cyan animate-pulse">Generating...</span>
          )}
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-ta-grey"
            aria-hidden="true"
          >
            ↓
          </motion.span>
        </div>
      </motion.button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            id="identity-panel-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-4 pb-2 px-4 space-y-4">
              {/* No identity yet */}
              {!hasIdentity && (
                <div className="space-y-4">
                  <p className="text-xs text-ta-grey leading-relaxed">
                    Generate your artist identity from your pitch history. This helps create
                    consistent bios, one-liners, and pitch hooks.
                  </p>

                  <button
                    onClick={() => generateIdentity()}
                    disabled={status.isGenerating}
                    className={`
                      w-full py-2.5 text-xs font-semibold rounded-lg transition-all duration-200
                      ${
                        status.isGenerating
                          ? 'bg-ta-cyan/20 text-ta-cyan/50 cursor-wait'
                          : 'bg-ta-cyan text-ta-black hover:bg-ta-cyan/90 shadow-[0_0_15px_-5px_rgba(58,169,190,0.5)]'
                      }
                    `}
                  >
                    {status.isGenerating ? 'Analysing your pitches...' : 'Generate Identity'}
                  </button>
                </div>
              )}

              {/* Has identity */}
              {hasIdentity && identity && (
                <div className="space-y-4">
                  {/* One-liner */}
                  {oneLiner && (
                    <div>
                      <h4 className="text-[10px] uppercase tracking-wider text-ta-grey mb-1.5">
                        One-liner
                      </h4>
                      <p className="text-sm text-ta-white leading-relaxed italic">{oneLiner}</p>
                    </div>
                  )}

                  {/* Brand tone + themes */}
                  {(identity.brandVoice.tone ||
                    (identity.brandVoice.themes && identity.brandVoice.themes.length > 0)) && (
                    <div>
                      <h4 className="text-[10px] uppercase tracking-wider text-ta-grey mb-1.5">
                        Brand Voice
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {identity.brandVoice.tone && (
                          <span className="px-2 py-0.5 text-xs bg-ta-cyan/10 text-ta-cyan rounded-full border border-ta-cyan/20">
                            {identity.brandVoice.tone}
                          </span>
                        )}
                        {identity.brandVoice.themes?.map((theme) => (
                          <span
                            key={theme}
                            className="px-2 py-0.5 text-xs bg-white/5 text-ta-grey rounded-full border border-white/10"
                          >
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Comparisons */}
                  {identity.epkFragments.comparisons &&
                    identity.epkFragments.comparisons.length > 0 && (
                      <div>
                        <h4 className="text-[10px] uppercase tracking-wider text-ta-grey mb-1.5">
                          Sounds Like
                        </h4>
                        <p className="text-xs text-ta-white/80">
                          {identity.epkFragments.comparisons.join(' meets ')}
                        </p>
                      </div>
                    )}

                  {/* Short bio preview */}
                  {shortBio && (
                    <div>
                      <h4 className="text-[10px] uppercase tracking-wider text-ta-grey mb-1.5">
                        Short Bio
                      </h4>
                      <p className="text-xs text-ta-white/70 leading-relaxed line-clamp-3">
                        {shortBio}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={applyToPitch}
                      disabled={showApplied}
                      className={`
                        flex-1 py-2 text-xs font-medium rounded-lg transition-all duration-200
                        ${
                          showApplied
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-ta-cyan text-ta-black hover:bg-ta-cyan/90'
                        }
                      `}
                    >
                      {showApplied ? '✓ Applied' : 'Apply to Pitch'}
                    </button>

                    <button
                      onClick={() => generateIdentity()}
                      disabled={status.isGenerating}
                      className="px-3 py-2 text-xs font-medium text-ta-grey hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5"
                    >
                      {status.isGenerating ? '...' : 'Refresh'}
                    </button>
                  </div>

                  {/* Error state */}
                  {status.error && <p className="text-xs text-red-400 mt-2">{status.error}</p>}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
