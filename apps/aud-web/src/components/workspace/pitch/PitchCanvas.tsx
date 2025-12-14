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

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { usePitchStore, type PitchType, type CoachAction } from '@/stores/usePitchStore'
import { TAPGenerateModal } from './TAPGenerateModal'
import { useAuthGate } from '@/components/auth'
import { useToast } from '@/contexts/ToastContext'
import { TypingIndicator } from '@/components/ui/EmptyState'

import { CopyButton } from '@/components/ui/CopyButton'

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
    description: 'Start from scratch with AI assistance',
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
  } = usePitchStore()

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
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: '24px 16px',
          overflowY: 'auto',
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        }}
      >
        <h2
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: '#F7F8F9',
            marginBottom: 8,
            letterSpacing: '-0.02em',
            textAlign: 'center',
          }}
        >
          Choose your pitch type
        </h2>
        <p
          style={{
            fontSize: 14,
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: 32,
            maxWidth: 400,
            textAlign: 'center',
            padding: '0 16px',
          }}
        >
          Select a template to get started. Our AI coach will help you craft the perfect pitch.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 12,
            maxWidth: 600,
            width: '100%',
          }}
        >
          {PITCH_TYPES.map((type) => (
            <motion.button
              key={type.key}
              onClick={() => selectType(type.key)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: 24,
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 12,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.2s ease, background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(58, 169, 190, 0.4)'
                e.currentTarget.style.backgroundColor = 'rgba(58, 169, 190, 0.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#F7F8F9',
                  marginBottom: 8,
                }}
              >
                {type.label}
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: 'rgba(255, 255, 255, 0.5)',
                  lineHeight: 1.4,
                }}
              >
                {type.description}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  // Pitch editor view
  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        position: 'relative',
      }}
    >
      {/* Main editor */}
      <div
        style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
        }}
      >
        {/* Back button */}
        <button
          onClick={() => resetPitch()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 12px',
            marginBottom: 24,
            fontSize: 13,
            color: 'rgba(255, 255, 255, 0.5)',
            backgroundColor: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 6,
            cursor: 'pointer',
            transition: 'color 0.2s ease, border-color 0.2s ease',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#3AA9BE'
            e.currentTarget.style.borderColor = 'rgba(58, 169, 190, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
          }}
        >
          ← Back to templates
        </button>

        {/* Pitch type header with TAP generate button */}
        <div
          style={{
            marginBottom: 32,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                marginBottom: 8,
                fontSize: 22,
                fontWeight: 600,
                color: '#F7F8F9',
              }}
            >
              {PITCH_TYPES.find((t) => t.key === currentType)?.label}
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                color: 'rgba(255, 255, 255, 0.5)',
              }}
            >
              {PITCH_TYPES.find((t) => t.key === currentType)?.description}
            </p>
          </div>

          {/* Generate with TAP button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenTAPModal}
            title={
              !isAuthenticated
                ? 'Sign up to generate pitches with TAP'
                : 'Generate a pitch using TAP AI'
            }
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              fontSize: 13,
              fontWeight: 500,
              color: showAuthPrompt ? '#F97316' : '#3AA9BE',
              backgroundColor: showAuthPrompt
                ? 'rgba(249, 115, 22, 0.1)'
                : 'rgba(58, 169, 190, 0.1)',
              border: `1px solid ${showAuthPrompt ? 'rgba(249, 115, 22, 0.3)' : 'rgba(58, 169, 190, 0.3)'}`,
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              fontFamily: 'inherit',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              if (!showAuthPrompt) {
                e.currentTarget.style.backgroundColor = 'rgba(58, 169, 190, 0.15)'
                e.currentTarget.style.borderColor = 'rgba(58, 169, 190, 0.5)'
              }
            }}
            onMouseLeave={(e) => {
              if (!showAuthPrompt) {
                e.currentTarget.style.backgroundColor = 'rgba(58, 169, 190, 0.1)'
                e.currentTarget.style.borderColor = 'rgba(58, 169, 190, 0.3)'
              }
            }}
          >
            <span style={{ fontSize: 14 }}>{'✦'}</span>
            {showAuthPrompt ? 'Sign up to unlock' : 'Generate with TAP'}
          </motion.button>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              style={{
                backgroundColor:
                  selectedSectionId === section.id
                    ? 'rgba(58, 169, 190, 0.05)'
                    : 'rgba(255, 255, 255, 0.02)',
                border:
                  selectedSectionId === section.id
                    ? '1px solid rgba(58, 169, 190, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 10,
                overflow: 'hidden',
                transition: 'border-color 0.2s ease, background-color 0.2s ease',
              }}
            >
              {/* Section header with coach actions */}
              <div
                style={{
                  padding: '14px 20px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#3AA9BE',
                    }}
                  >
                    {section.title}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: 'rgba(255, 255, 255, 0.3)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {index + 1}/{sections.length}
                  </span>
                </div>

                {/* Coach action buttons */}
                <div style={{ display: 'flex', gap: 4 }}>
                  {/* Copy button */}
                  {section.content && (
                    <CopyButton
                      text={section.content}
                      onCopy={pitchCopied}
                      className="text-xs py-1 px-2"
                    />
                  )}
                  {(['improve', 'suggest', 'rewrite'] as CoachAction[]).map((action) => (
                    <button
                      key={action}
                      onClick={() => requestCoach(section.id, action)}
                      disabled={isCoachLoading}
                      style={{
                        padding: '4px 10px',
                        fontSize: 11,
                        fontWeight: 500,
                        color: 'rgba(255, 255, 255, 0.5)',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 4,
                        cursor: isCoachLoading ? 'wait' : 'pointer',
                        opacity: isCoachLoading ? 0.5 : 1,
                        transition: 'all 0.15s ease',
                        fontFamily: 'inherit',
                        textTransform: 'capitalize',
                      }}
                      onMouseEnter={(e) => {
                        if (!isCoachLoading) {
                          e.currentTarget.style.color = '#3AA9BE'
                          e.currentTarget.style.borderColor = 'rgba(58, 169, 190, 0.4)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>

              {/* Placeholder hint (only when empty) */}
              {!section.content && (
                <div
                  style={{
                    padding: '12px 20px',
                    backgroundColor: 'rgba(58, 169, 190, 0.05)',
                    borderBottom: '1px solid rgba(58, 169, 190, 0.1)',
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      color: 'rgba(58, 169, 190, 0.9)',
                      lineHeight: 1.5,
                      fontStyle: 'italic',
                    }}
                  >
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
                style={{
                  width: '100%',
                  minHeight: 120,
                  padding: '16px 20px',
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: '#F7F8F9',
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* AI Coach sidebar */}
      <AnimatePresence>
        {isCoachOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 340, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              borderLeft: '1px solid rgba(255, 255, 255, 0.06)',
              backgroundColor: 'rgba(15, 17, 19, 0.95)',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <div style={{ padding: 24, width: 340, height: '100%', overflowY: 'auto' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 20,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#F7F8F9',
                  }}
                >
                  AI Coach
                </h3>
                <button
                  onClick={() => closeCoach()}
                  style={{
                    padding: '4px 8px',
                    fontSize: 12,
                    color: 'rgba(255, 255, 255, 0.4)',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Close
                </button>
              </div>

              {/* Loading state */}
              {isCoachLoading && (
                <div
                  style={{
                    padding: 16,
                    backgroundColor: 'rgba(58, 169, 190, 0.08)',
                    border: '1px solid rgba(58, 169, 190, 0.2)',
                    borderRadius: 8,
                    fontSize: 13,
                    color: 'rgba(255, 255, 255, 0.7)',
                    lineHeight: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <TypingIndicator />
                  <span>AI Coach is thinking...</span>
                </div>
              )}

              {/* Error state */}
              {coachError && !isCoachLoading && (
                <div
                  style={{
                    padding: 16,
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    border: '1px solid rgba(220, 38, 38, 0.3)',
                    borderRadius: 8,
                    fontSize: 13,
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: 1.5,
                  }}
                >
                  {coachError}
                </div>
              )}

              {/* Coach response */}
              {coachResponse && !isCoachLoading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div
                    style={{
                      padding: 16,
                      backgroundColor: 'rgba(58, 169, 190, 0.08)',
                      border: '1px solid rgba(58, 169, 190, 0.2)',
                      borderRadius: 8,
                      fontSize: 13,
                      color: 'rgba(255, 255, 255, 0.85)',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
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
                      style={{
                        padding: '10px 16px',
                        fontSize: 13,
                        fontWeight: 500,
                        color: '#0F1113',
                        backgroundColor: '#3AA9BE',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer',
                        transition: 'opacity 0.15s ease',
                        fontFamily: 'inherit',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.9'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1'
                      }}
                    >
                      Apply to section
                    </button>
                  )}
                </div>
              )}

              {/* Default state */}
              {!isCoachLoading && !coachResponse && !coachError && (
                <div
                  style={{
                    padding: 16,
                    backgroundColor: 'rgba(58, 169, 190, 0.08)',
                    border: '1px solid rgba(58, 169, 190, 0.2)',
                    borderRadius: 8,
                    fontSize: 13,
                    color: 'rgba(255, 255, 255, 0.7)',
                    lineHeight: 1.5,
                  }}
                >
                  Click <strong>Improve</strong>, <strong>Suggest</strong>, or{' '}
                  <strong>Rewrite</strong> on any section to get AI coaching feedback.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coach toggle button (when closed) */}
      {!isCoachOpen && (
        <button
          onClick={() => openCoach()}
          style={{
            position: 'absolute',
            right: 24,
            bottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 18px',
            fontSize: 14,
            fontWeight: 500,
            color: '#0F1113',
            backgroundColor: '#3AA9BE',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(58, 169, 190, 0.3)',
            transition: 'transform 0.12s ease, box-shadow 0.12s ease',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(58, 169, 190, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(58, 169, 190, 0.3)'
          }}
        >
          Ask AI Coach
        </button>
      )}

      {/* TAP Generate Modal */}
      <TAPGenerateModal />
    </div>
  )
}
