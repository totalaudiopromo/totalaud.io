'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { DbPlaybookChapter } from '@loopos/db'

interface GenerateChapterModalProps {
  userId: string
  onClose: () => void
  onChapterCreated: (chapter: DbPlaybookChapter) => void
}

const CATEGORIES: Array<{ value: DbPlaybookChapter['category']; label: string }> = [
  { value: 'release-strategy', label: 'Release Strategy' },
  { value: 'promo-strategy', label: 'Promo Strategy' },
  { value: 'growth-strategy', label: 'Growth Strategy' },
  { value: 'pr-strategy', label: 'PR Strategy' },
  { value: 'social-strategy', label: 'Social Strategy' },
  { value: 'audience-strategy', label: 'Audience Strategy' },
  { value: 'creative-process', label: 'Creative Process' },
  { value: 'custom', label: 'Custom' },
]

export function GenerateChapterModal({ userId, onClose, onChapterCreated }: GenerateChapterModalProps) {
  const [category, setCategory] = useState<DbPlaybookChapter['category']>('release-strategy')
  const [topic, setTopic] = useState('')
  const [context, setContext] = useState('')
  const [generating, setGenerating] = useState(false)

  async function handleGenerate() {
    if (!topic) {
      alert('Please enter a topic')
      return
    }

    try {
      setGenerating(true)

      const response = await fetch('/api/playbook/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          category,
          topic,
          context,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate chapter')
      }

      const data = await response.json()
      onChapterCreated(data.chapter)
    } catch (error) {
      console.error('Error generating chapter:', error)
      alert('Failed to generate chapter. Please try again.')
    } finally {
      setGenerating(false)
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
          className="bg-[#0F1113] border border-white/20 rounded-2xl max-w-2xl w-full p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Generate Playbook Chapter</h2>
              <p className="text-white/60">AI-powered strategic guide for music promotion</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-white/80 mb-2">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as DbPlaybookChapter['category'])}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#3AA9BE]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Topic */}
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-white/80 mb-2">
                Topic
              </label>
              <input
                id="topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#3AA9BE]"
                placeholder="e.g., How to pitch to Spotify editorial playlists"
              />
            </div>

            {/* Additional Context */}
            <div>
              <label htmlFor="context" className="block text-sm font-medium text-white/80 mb-2">
                Additional Context (Optional)
              </label>
              <textarea
                id="context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#3AA9BE] resize-none"
                rows={4}
                placeholder="Add any specific details, goals, or constraints..."
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={generating || !topic}
              className="w-full px-6 py-4 bg-[#3AA9BE] text-white font-semibold rounded-lg hover:bg-[#3AA9BE]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating chapter...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <span>Generate with AI</span>
                </>
              )}
            </button>
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-[#3AA9BE]/10 border border-[#3AA9BE]/20 rounded-lg">
            <p className="text-[#3AA9BE]/90 text-sm">
              AI will generate a comprehensive strategic guide based on your topic. You can edit the content after generation.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
