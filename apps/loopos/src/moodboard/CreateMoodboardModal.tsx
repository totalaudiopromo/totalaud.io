'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createMoodboard, type DbMoodboard } from '@loopos/db'

interface CreateMoodboardModalProps {
  userId: string
  onClose: () => void
  onMoodboardCreated: (moodboard: DbMoodboard) => void
}

export function CreateMoodboardModal({ userId, onClose, onMoodboardCreated }: CreateMoodboardModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)

  async function handleCreate() {
    if (!name) {
      alert('Please enter a name')
      return
    }

    try {
      setCreating(true)

      const newMoodboard: Omit<DbMoodboard, 'id' | 'created_at' | 'updated_at'> = {
        user_id: userId,
        name,
        description,
        colour_palette: [],
        tags: [],
        is_archived: false,
      }

      const created = await createMoodboard(newMoodboard)
      onMoodboardCreated(created)
    } catch (error) {
      console.error('Error creating moodboard:', error)
      alert('Failed to create moodboard')
    } finally {
      setCreating(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-8"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="bg-[#0F1113] border border-white/20 rounded-2xl max-w-md w-full p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Create Moodboard</h2>
              <p className="text-white/60">Collect visual inspiration</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#3AA9BE]"
                placeholder="e.g., Album Artwork Inspiration"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-white/80 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#3AA9BE] resize-none"
                rows={3}
                placeholder="What is this moodboard for?"
              />
            </div>

            <button
              onClick={handleCreate}
              disabled={creating || !name}
              className="w-full px-6 py-3 bg-[#3AA9BE] text-white font-semibold rounded-lg hover:bg-[#3AA9BE]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {creating ? 'Creating...' : 'Create Moodboard'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
