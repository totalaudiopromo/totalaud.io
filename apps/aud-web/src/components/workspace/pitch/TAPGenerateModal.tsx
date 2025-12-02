/**
 * TAP Generate Modal Component
 * Phase 3: TAP Pitch Integration
 *
 * Modal for generating pitches using TAP Pitch service.
 * Collects artist/track metadata and displays generated result.
 */

'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePitchStore, type TAPTone, type TAPPitchRequest } from '@/stores/usePitchStore'

const TONE_OPTIONS: { value: TAPTone; label: string; description: string }[] = [
  {
    value: 'casual',
    label: 'Casual',
    description: 'Friendly and conversational',
  },
  {
    value: 'professional',
    label: 'Professional',
    description: 'Polished and industry-standard',
  },
  {
    value: 'enthusiastic',
    label: 'Enthusiastic',
    description: 'Energetic and passionate',
  },
]

export function TAPGenerateModal() {
  // Store state and actions
  const isTAPModalOpen = usePitchStore((state) => state.isTAPModalOpen)
  const tapGenerationStatus = usePitchStore((state) => state.tapGenerationStatus)
  const tapPitchResult = usePitchStore((state) => state.tapPitchResult)
  const tapError = usePitchStore((state) => state.tapError)
  const closeTAPModal = usePitchStore((state) => state.closeTAPModal)
  const generateWithTAP = usePitchStore((state) => state.generateWithTAP)
  const applyTAPResult = usePitchStore((state) => state.applyTAPResult)
  const clearTAPResult = usePitchStore((state) => state.clearTAPResult)

  // Form state
  const [artistName, setArtistName] = useState('')
  const [trackTitle, setTrackTitle] = useState('')
  const [genre, setGenre] = useState('')
  const [trackLink, setTrackLink] = useState('')
  const [releaseDate, setReleaseDate] = useState('')
  const [keyHook, setKeyHook] = useState('')
  const [tone, setTone] = useState<TAPTone>('professional')

  const isFormValid = artistName.trim() && trackTitle.trim() && keyHook.trim().length >= 10

  const handleGenerate = useCallback(async () => {
    if (!isFormValid) return

    const request: TAPPitchRequest = {
      artistName: artistName.trim(),
      trackTitle: trackTitle.trim(),
      genre: genre.trim() || undefined,
      trackLink: trackLink.trim() || undefined,
      releaseDate: releaseDate || undefined,
      keyHook: keyHook.trim(),
      tone,
    }

    await generateWithTAP(request)
  }, [
    artistName,
    trackTitle,
    genre,
    trackLink,
    releaseDate,
    keyHook,
    tone,
    isFormValid,
    generateWithTAP,
  ])

  const handleClose = useCallback(() => {
    clearTAPResult()
    closeTAPModal()
    // Reset form
    setArtistName('')
    setTrackTitle('')
    setGenre('')
    setTrackLink('')
    setReleaseDate('')
    setKeyHook('')
    setTone('professional')
  }, [clearTAPResult, closeTAPModal])

  const handleApply = useCallback(() => {
    applyTAPResult()
    // Reset form for next use
    setArtistName('')
    setTrackTitle('')
    setGenre('')
    setTrackLink('')
    setReleaseDate('')
    setKeyHook('')
    setTone('professional')
  }, [applyTAPResult])

  if (!isTAPModalOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 16,
        }}
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 520,
            maxHeight: '90vh',
            backgroundColor: '#1a1c1e',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 12,
            boxShadow: '0 16px 64px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#F7F8F9',
                }}
              >
                Generate with TAP
              </h2>
              <p
                style={{
                  margin: 0,
                  marginTop: 4,
                  fontSize: 13,
                  color: 'rgba(255, 255, 255, 0.5)',
                }}
              >
                Create a pitch using Total Audio Platform
              </p>
            </div>
            <button
              onClick={handleClose}
              style={{
                padding: 8,
                fontSize: 18,
                color: 'rgba(255, 255, 255, 0.4)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div
            style={{
              flex: 1,
              padding: 24,
              overflowY: 'auto',
            }}
          >
            {/* Show result if generated */}
            {tapPitchResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Confidence badge */}
                {tapPitchResult.confidence && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignSelf: 'flex-start',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 10px',
                      backgroundColor:
                        tapPitchResult.confidence === 'High'
                          ? 'rgba(73, 163, 108, 0.15)'
                          : tapPitchResult.confidence === 'Medium'
                            ? 'rgba(196, 160, 82, 0.15)'
                            : 'rgba(249, 115, 22, 0.15)',
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 600,
                      color:
                        tapPitchResult.confidence === 'High'
                          ? '#49A36C'
                          : tapPitchResult.confidence === 'Medium'
                            ? '#C4A052'
                            : '#F97316',
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                    }}
                  >
                    ✓ {tapPitchResult.confidence} Confidence
                  </div>
                )}

                {/* Subject */}
                {tapPitchResult.subject && (
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'rgba(255, 255, 255, 0.5)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: 8,
                      }}
                    >
                      Subject Line
                    </label>
                    <div
                      style={{
                        padding: 12,
                        backgroundColor: 'rgba(58, 169, 190, 0.08)',
                        border: '1px solid rgba(58, 169, 190, 0.2)',
                        borderRadius: 8,
                        fontSize: 14,
                        color: '#F7F8F9',
                        fontWeight: 500,
                      }}
                    >
                      {tapPitchResult.subject}
                    </div>
                  </div>
                )}

                {/* Body */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'rgba(255, 255, 255, 0.5)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: 8,
                    }}
                  >
                    Pitch Body
                  </label>
                  <div
                    style={{
                      padding: 16,
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 8,
                      fontSize: 14,
                      color: 'rgba(255, 255, 255, 0.85)',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      maxHeight: 280,
                      overflowY: 'auto',
                    }}
                  >
                    {tapPitchResult.body}
                  </div>
                </div>

                {/* Signature */}
                {tapPitchResult.signature && (
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'rgba(255, 255, 255, 0.5)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: 8,
                      }}
                    >
                      Signature
                    </label>
                    <div
                      style={{
                        padding: 12,
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 8,
                        fontSize: 13,
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontStyle: 'italic',
                      }}
                    >
                      {tapPitchResult.signature}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Show form if not yet generated */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Artist Name */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 13,
                      fontWeight: 500,
                      color: 'rgba(255, 255, 255, 0.8)',
                      marginBottom: 8,
                    }}
                  >
                    Artist Name <span style={{ color: '#3AA9BE' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    placeholder="Your artist or band name"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      fontSize: 14,
                      color: '#F7F8F9',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 8,
                      outline: 'none',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                {/* Track Title */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 13,
                      fontWeight: 500,
                      color: 'rgba(255, 255, 255, 0.8)',
                      marginBottom: 8,
                    }}
                  >
                    Track Title <span style={{ color: '#3AA9BE' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={trackTitle}
                    onChange={(e) => setTrackTitle(e.target.value)}
                    placeholder="Name of the track you're pitching"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      fontSize: 14,
                      color: '#F7F8F9',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 8,
                      outline: 'none',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                {/* Genre & Release Date row */}
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'rgba(255, 255, 255, 0.8)',
                        marginBottom: 8,
                      }}
                    >
                      Genre
                    </label>
                    <input
                      type="text"
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      placeholder="e.g. Indie Pop, Electronic"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        fontSize: 14,
                        color: '#F7F8F9',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 8,
                        outline: 'none',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'rgba(255, 255, 255, 0.8)',
                        marginBottom: 8,
                      }}
                    >
                      Release Date
                    </label>
                    <input
                      type="date"
                      value={releaseDate}
                      onChange={(e) => setReleaseDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        fontSize: 14,
                        color: '#F7F8F9',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 8,
                        outline: 'none',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>
                </div>

                {/* Track Link */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 13,
                      fontWeight: 500,
                      color: 'rgba(255, 255, 255, 0.8)',
                      marginBottom: 8,
                    }}
                  >
                    Track Link
                  </label>
                  <input
                    type="url"
                    value={trackLink}
                    onChange={(e) => setTrackLink(e.target.value)}
                    placeholder="Spotify, SoundCloud, or private link"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      fontSize: 14,
                      color: '#F7F8F9',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 8,
                      outline: 'none',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                {/* Key Hook */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 13,
                      fontWeight: 500,
                      color: 'rgba(255, 255, 255, 0.8)',
                      marginBottom: 8,
                    }}
                  >
                    Key Hook <span style={{ color: '#3AA9BE' }}>*</span>
                    <span
                      style={{
                        fontWeight: 400,
                        color: 'rgba(255, 255, 255, 0.4)',
                        marginLeft: 8,
                      }}
                    >
                      (min 10 chars)
                    </span>
                  </label>
                  <textarea
                    value={keyHook}
                    onChange={(e) => setKeyHook(e.target.value)}
                    placeholder="What makes this track special? E.g. 'A dreamy synth-pop anthem about finding hope in urban isolation'"
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      fontSize: 14,
                      color: '#F7F8F9',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 8,
                      outline: 'none',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      lineHeight: 1.5,
                    }}
                  />
                </div>

                {/* Tone selector */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 13,
                      fontWeight: 500,
                      color: 'rgba(255, 255, 255, 0.8)',
                      marginBottom: 12,
                    }}
                  >
                    Tone
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {TONE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setTone(option.value)}
                        style={{
                          flex: 1,
                          padding: '10px 12px',
                          fontSize: 13,
                          fontWeight: 500,
                          color: tone === option.value ? '#0F1113' : 'rgba(255, 255, 255, 0.6)',
                          backgroundColor:
                            tone === option.value ? '#3AA9BE' : 'rgba(255, 255, 255, 0.05)',
                          border:
                            tone === option.value
                              ? '1px solid #3AA9BE'
                              : '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: 6,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          fontFamily: 'inherit',
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error display */}
                {tapError && (
                  <div
                    style={{
                      padding: 12,
                      backgroundColor: 'rgba(220, 38, 38, 0.1)',
                      border: '1px solid rgba(220, 38, 38, 0.3)',
                      borderRadius: 8,
                      fontSize: 13,
                      color: 'rgba(255, 255, 255, 0.8)',
                    }}
                  >
                    {tapError}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12,
            }}
          >
            <button
              onClick={handleClose}
              style={{
                padding: '10px 20px',
                fontSize: 13,
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.6)',
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 6,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Cancel
            </button>

            {tapPitchResult ? (
              <>
                <button
                  onClick={() => clearTAPResult()}
                  style={{
                    padding: '10px 20px',
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'rgba(255, 255, 255, 0.6)',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Regenerate
                </button>
                <button
                  onClick={handleApply}
                  style={{
                    padding: '10px 20px',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#0F1113',
                    backgroundColor: '#3AA9BE',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Apply to Pitch
                </button>
              </>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={!isFormValid || tapGenerationStatus === 'loading'}
                style={{
                  padding: '10px 20px',
                  fontSize: 13,
                  fontWeight: 500,
                  color: isFormValid ? '#0F1113' : 'rgba(255, 255, 255, 0.3)',
                  backgroundColor: isFormValid ? '#3AA9BE' : 'rgba(255, 255, 255, 0.05)',
                  border: 'none',
                  borderRadius: 6,
                  cursor:
                    isFormValid && tapGenerationStatus !== 'loading' ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {tapGenerationStatus === 'loading' ? (
                  <>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 14,
                        height: 14,
                        border: '2px solid rgba(15, 17, 19, 0.3)',
                        borderTopColor: '#0F1113',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }}
                    />
                    Generating...
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </>
                ) : (
                  'Generate Pitch'
                )}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
