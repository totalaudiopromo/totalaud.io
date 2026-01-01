/**
 * TAP Generate Modal Component
 * Phase 3: TAP Pitch Integration
 *
 * Modal for generating pitches using TAP Pitch service.
 * Collects artist/track metadata and displays generated result.
 */

'use client'

import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePitchStore, type TAPTone, type TAPPitchRequest } from '@/stores/usePitchStore'
import { TapForm } from './tap/TapForm'
import { TapModalFooter } from './tap/TapModalFooter'
import { TapModalHeader } from './tap/TapModalHeader'
import { TapResultView } from './tap/TapResultView'

export function TAPGenerateModal() {
  const isTAPModalOpen = usePitchStore((state) => state.isTAPModalOpen)
  const tapGenerationStatus = usePitchStore((state) => state.tapGenerationStatus)
  const tapPitchResult = usePitchStore((state) => state.tapPitchResult)
  const tapError = usePitchStore((state) => state.tapError)
  const closeTAPModal = usePitchStore((state) => state.closeTAPModal)
  const generateWithTAP = usePitchStore((state) => state.generateWithTAP)
  const applyTAPResult = usePitchStore((state) => state.applyTAPResult)
  const clearTAPResult = usePitchStore((state) => state.clearTAPResult)

  const [artistName, setArtistName] = useState('')
  const [trackTitle, setTrackTitle] = useState('')
  const [genre, setGenre] = useState('')
  const [trackLink, setTrackLink] = useState('')
  const [releaseDate, setReleaseDate] = useState('')
  const [keyHook, setKeyHook] = useState('')
  const [tone, setTone] = useState<TAPTone>('professional')

  const isFormValid = artistName.trim() && trackTitle.trim() && keyHook.trim().length >= 10

  const resetForm = useCallback(() => {
    setArtistName('')
    setTrackTitle('')
    setGenre('')
    setTrackLink('')
    setReleaseDate('')
    setKeyHook('')
    setTone('professional')
  }, [])

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
    resetForm()
  }, [clearTAPResult, closeTAPModal, resetForm])

  const handleApply = useCallback(() => {
    applyTAPResult()
    resetForm()
  }, [applyTAPResult, resetForm])

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
          onClick={(event) => event.stopPropagation()}
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
          <TapModalHeader onClose={handleClose} />

          <div
            style={{
              flex: 1,
              padding: 24,
              overflowY: 'auto',
            }}
          >
            {tapPitchResult ? (
              <TapResultView result={tapPitchResult} />
            ) : (
              <TapForm
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
                tapError={tapError}
              />
            )}
          </div>

          <TapModalFooter
            hasResult={Boolean(tapPitchResult)}
            isFormValid={Boolean(isFormValid)}
            status={tapGenerationStatus}
            onClose={handleClose}
            onGenerate={handleGenerate}
            onRegenerate={clearTAPResult}
            onApply={handleApply}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
