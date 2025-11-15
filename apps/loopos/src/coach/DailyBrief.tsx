'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface DailyBriefProps {
  userId: string
}

export function DailyBrief({ userId }: DailyBriefProps) {
  const [loading, setLoading] = useState(false)
  const [brief, setBrief] = useState<string | null>(null)

  async function generateBrief() {
    try {
      setLoading(true)
      const response = await fetch('/api/coach/daily-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) throw new Error('Failed to generate brief')

      const data = await response.json()
      setBrief(data.brief)
    } catch (error) {
      console.error('Error generating brief:', error)
      alert('Failed to generate daily brief')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#3AA9BE]/20 to-[#3AA9BE]/5 border border-[#3AA9BE]/20 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-3">Good morning!</h2>
        <p className="text-white/80 mb-6">
          Let's start the day with clarity and intention. Your AI coach has prepared today's strategic brief.
        </p>
        <button
          onClick={generateBrief}
          disabled={loading}
          className="px-6 py-3 bg-[#3AA9BE] text-white font-semibold rounded-lg hover:bg-[#3AA9BE]/90 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generating...</span>
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
              <span>Generate Daily Brief</span>
            </>
          )}
        </button>
      </div>

      {/* Brief Content */}
      {brief && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-8"
        >
          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-white/90 leading-relaxed">{brief}</div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
