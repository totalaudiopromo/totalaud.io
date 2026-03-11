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

import { TAPResultView } from './TAPResultView'
import { TAPFormView } from './TAPFormView'

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
          role="dialog"
          aria-modal="true"
          aria-labelledby="tap-modal-title"
          aria-describedby="tap-modal-description"
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
                id="tap-modal-title"
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
                id="tap-modal-description"
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
              aria-label="Close modal"
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
              <span aria-hidden="true">×</span>
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
              <TAPResultView result={tapPitchResult} />
            ) : (
              /* Show form if not yet generated */
              <TAPFormView
                artistName={artistName}
                setArtistName={setArtistName}
                trackTitle={trackTitle}
                setTrackTitle={setTrackTitle}
                genre={genre}
                setGenre={setGenre}
                trackLink={trackLink}
                setTrackLink={setTrackLink}
                releaseDate={releaseDate}
                setReleaseDate={setReleaseDate}
                keyHook={keyHook}
                setKeyHook={setKeyHook}
                tone={tone}
                setTone={setTone}
                error={tapError}
              />
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
