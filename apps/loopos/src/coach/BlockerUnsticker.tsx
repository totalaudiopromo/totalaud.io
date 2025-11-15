'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface BlockerUnstickerProps {
  userId: string
}

export function BlockerUnsticker({ userId }: BlockerUnstickerProps) {
  const [blocker, setBlocker] = useState('')
  const [loading, setLoading] = useState(false)
  const [solution, setSolution] = useState<string | null>(null)

  async function unstickBlocker() {
    if (!blocker) {
      alert('Please describe your blocker')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/coach/unstick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, blocker }),
      })

      if (!response.ok) throw new Error('Failed to unstick blocker')

      const data = await response.json()
      setSolution(data.solution)
    } catch (error) {
      console.error('Error unsticking blocker:', error)
      alert('Failed to generate solution')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-3">Stuck on something?</h2>
        <p className="text-white/60 mb-6">
          Describe your blocker and AI will help you find a way forward with concrete next steps.
        </p>

        <div className="space-y-4">
          <textarea
            value={blocker}
            onChange={(e) => setBlocker(e.target.value)}
            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#3AA9BE] resize-none"
            rows={6}
            placeholder="e.g., I can't figure out how to pitch to Spotify playlists..."
          />

          <button
            onClick={unstickBlocker}
            disabled={loading || !blocker}
            className="w-full px-6 py-3 bg-[#3AA9BE] text-white font-semibold rounded-lg hover:bg-[#3AA9BE]/90 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Unsticking...' : 'Unstick This Blocker'}
          </button>
        </div>
      </div>

      {solution && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-[#3AA9BE]/20 to-[#3AA9BE]/5 border border-[#3AA9BE]/20 rounded-2xl p-8"
        >
          <div className="whitespace-pre-wrap text-white/90 leading-relaxed">{solution}</div>
        </motion.div>
      )}
    </div>
  )
}
