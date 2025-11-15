'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface WeeklyRecapProps {
  userId: string
}

export function WeeklyRecap({ userId }: WeeklyRecapProps) {
  const [loading, setLoading] = useState(false)
  const [recap, setRecap] = useState<{
    summary: string
    wins: string[]
    challenges: string[]
    nextWeek: string[]
  } | null>(null)

  async function generateRecap() {
    try {
      setLoading(true)
      const response = await fetch('/api/coach/weekly-recap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) throw new Error('Failed to generate recap')

      const data = await response.json()
      setRecap(data.recap)
    } catch (error) {
      console.error('Error generating recap:', error)
      alert('Failed to generate weekly recap')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-3">Weekly Recap</h2>
        <p className="text-white/60 mb-6">
          Reflect on your week's progress with AI-generated insights and plan for next week.
        </p>

        <button
          onClick={generateRecap}
          disabled={loading}
          className="px-6 py-3 bg-[#3AA9BE] text-white font-semibold rounded-lg hover:bg-[#3AA9BE]/90 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Generating...' : 'Generate Weekly Recap'}
        </button>
      </div>

      {recap && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          {/* Summary */}
          <div className="bg-gradient-to-br from-[#3AA9BE]/20 to-[#3AA9BE]/5 border border-[#3AA9BE]/20 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-3">Summary</h3>
            <p className="text-white/90">{recap.summary}</p>
          </div>

          {/* Wins */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-4">Wins This Week</h3>
            <ul className="space-y-2">
              {recap.wins.map((win, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span className="text-white/90">{win}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Challenges */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-4">Challenges</h3>
            <ul className="space-y-2">
              {recap.challenges.map((challenge, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">→</span>
                  <span className="text-white/90">{challenge}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Next Week */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-4">Focus for Next Week</h3>
            <ul className="space-y-2">
              {recap.nextWeek.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#3AA9BE] mt-1">•</span>
                  <span className="text-white/90">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  )
}
