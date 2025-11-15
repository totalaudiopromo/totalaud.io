'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DailyBrief } from '@/coach/DailyBrief'
import { BlockerUnsticker } from '@/coach/BlockerUnsticker'
import { WeeklyRecap } from '@/coach/WeeklyRecap'

export default function CoachPage() {
  const [activeTab, setActiveTab] = useState<'daily' | 'blockers' | 'weekly'>('daily')

  return (
    <div className="min-h-screen bg-[#0F1113] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">AI Coach</h1>
          <p className="text-white/60">Your personal creative guide and motivator</p>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'daily'
                ? 'bg-[#3AA9BE] text-white'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            Daily Brief
          </button>
          <button
            onClick={() => setActiveTab('blockers')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'blockers'
                ? 'bg-[#3AA9BE] text-white'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            Blocker Unsticker
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'weekly'
                ? 'bg-[#3AA9BE] text-white'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            Weekly Recap
          </button>
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24 }}
        >
          {activeTab === 'daily' && <DailyBrief userId="placeholder-user-id" />}
          {activeTab === 'blockers' && <BlockerUnsticker userId="placeholder-user-id" />}
          {activeTab === 'weekly' && <WeeklyRecap userId="placeholder-user-id" />}
        </motion.div>
      </div>
    </div>
  )
}
