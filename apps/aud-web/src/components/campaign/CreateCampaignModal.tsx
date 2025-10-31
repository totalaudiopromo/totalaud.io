'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { springPresets, motionTokens } from '@aud-web/tokens/motion'
import { semanticColours } from '@aud-web/tokens/colors'
import { playSound } from '@aud-web/tokens/sounds'
import type { Campaign } from '@/contexts/CampaignContext'

interface CreateCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (campaign: Omit<Campaign, 'id' | 'createdAt'>) => void
}

interface FormState {
  release: string
  artist: string
  genre: string
  goals: string
}

/**
 * CreateCampaignModal - Modal for creating new campaigns
 *
 * Design:
 * - Matches Phase 10.2 design system (matte black, Slate Cyan, sharp borders)
 * - Framer Motion animations (240ms transitions)
 * - Honest maker tone in copy
 * - Form validation with clear feedback
 */
export function CreateCampaignModal({ isOpen, onClose, onSubmit }: CreateCampaignModalProps) {
  const [form, setForm] = useState<FormState>({
    release: '',
    artist: '',
    genre: '',
    goals: '',
  })

  const [errors, setErrors] = useState<Partial<FormState>>({})

  const handleInputChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<FormState> = {}

    if (!form.release.trim()) {
      newErrors.release = 'Release name required'
    }
    if (!form.artist.trim()) {
      newErrors.artist = 'Artist/project name required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) {
      playSound('task-failed', { volume: 0.1 })
      return
    }

    playSound('success-soft', { volume: 0.15 })

    onSubmit({
      release: form.release.trim(),
      artist: form.artist.trim(),
      genre: form.genre.trim(),
      goals: form.goals.trim(),
      status: 'planning',
    })

    // Reset form
    setForm({
      release: '',
      artist: '',
      genre: '',
      goals: '',
    })
    setErrors({})
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: motionTokens.normal.duration / 1000 }}
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              className="bg-[#0F1113] border-2 border-[#2C2F33] w-full max-w-lg p-8 pointer-events-auto"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={springPresets.medium}
              onKeyDown={handleKeyDown}
            >
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-xl font-medium text-[#EAECEE] lowercase tracking-wide">
                  create new campaign
                </h2>
                <p className="text-sm text-[#A0A4A8] mt-1 lowercase">
                  start planning when you've got a release ready
                </p>
              </div>

              {/* Form */}
              <div className="space-y-4">
                {/* Release Name */}
                <div>
                  <label htmlFor="release" className="block text-sm text-[#A0A4A8] mb-2 lowercase">
                    release name
                  </label>
                  <input
                    id="release"
                    type="text"
                    value={form.release}
                    onChange={(e) => handleInputChange('release', e.target.value)}
                    className={`w-full bg-[#1A1C1F] border-2 ${
                      errors.release ? 'border-[#FF6B6B]' : 'border-[#2C2F33]'
                    } text-[#EAECEE] px-4 py-3 text-sm focus:outline-none focus:border-[#3AA9BE] transition-colors`}
                    placeholder="e.g. New Single Title"
                    autoFocus
                  />
                  {errors.release && (
                    <p className="text-xs text-[#FF6B6B] mt-1">{errors.release}</p>
                  )}
                </div>

                {/* Artist / Project */}
                <div>
                  <label htmlFor="artist" className="block text-sm text-[#A0A4A8] mb-2 lowercase">
                    artist / project
                  </label>
                  <input
                    id="artist"
                    type="text"
                    value={form.artist}
                    onChange={(e) => handleInputChange('artist', e.target.value)}
                    className={`w-full bg-[#1A1C1F] border-2 ${
                      errors.artist ? 'border-[#FF6B6B]' : 'border-[#2C2F33]'
                    } text-[#EAECEE] px-4 py-3 text-sm focus:outline-none focus:border-[#3AA9BE] transition-colors`}
                    placeholder="e.g. Your Artist Name"
                  />
                  {errors.artist && <p className="text-xs text-[#FF6B6B] mt-1">{errors.artist}</p>}
                </div>

                {/* Genre (optional) */}
                <div>
                  <label htmlFor="genre" className="block text-sm text-[#A0A4A8] mb-2 lowercase">
                    genre <span className="opacity-50">(optional)</span>
                  </label>
                  <input
                    id="genre"
                    type="text"
                    value={form.genre}
                    onChange={(e) => handleInputChange('genre', e.target.value)}
                    className="w-full bg-[#1A1C1F] border-2 border-[#2C2F33] text-[#EAECEE] px-4 py-3 text-sm focus:outline-none focus:border-[#3AA9BE] transition-colors"
                    placeholder="e.g. Electronic, Indie, Hip-Hop"
                  />
                </div>

                {/* Goals (optional) */}
                <div>
                  <label htmlFor="goals" className="block text-sm text-[#A0A4A8] mb-2 lowercase">
                    goals <span className="opacity-50">(optional)</span>
                  </label>
                  <textarea
                    id="goals"
                    value={form.goals}
                    onChange={(e) => handleInputChange('goals', e.target.value)}
                    className="w-full bg-[#1A1C1F] border-2 border-[#2C2F33] text-[#EAECEE] px-4 py-3 text-sm focus:outline-none focus:border-[#3AA9BE] transition-colors resize-none"
                    placeholder="e.g. BBC Radio 1, Spotify Editorial, Music Blogs"
                    rows={3}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-transparent border-2 border-[#2C2F33] text-[#A0A4A8] text-sm lowercase tracking-wide hover:border-[#3AA9BE] hover:text-[#EAECEE] transition-colors"
                >
                  cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-6 py-3 bg-[#3AA9BE] border-2 border-[#3AA9BE] text-[#0F1113] text-sm font-medium lowercase tracking-wide hover:bg-[#6FC8B5] hover:border-[#6FC8B5] transition-colors"
                >
                  create campaign →
                </button>
              </div>

              {/* Keyboard hint */}
              <p className="text-xs text-[#A0A4A8] text-center mt-4 opacity-50">
                ⌘/ctrl + enter to submit · esc to close
              </p>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
