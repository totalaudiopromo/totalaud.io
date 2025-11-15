'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { startFlowSession, endFlowSession, getActiveFlowSession, updateFlowSession } from '@loopos/db'

interface FlowMeterProps {
  userId: string
  onFlowChange?: (inFlow: boolean) => void
}

export function FlowMeter({ userId, onFlowChange }: FlowMeterProps) {
  const [inFlow, setInFlow] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [engagementScore, setEngagementScore] = useState(50)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    checkExistingSession()
  }, [userId])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (inFlow) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
        updateEngagement()
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [inFlow])

  async function checkExistingSession() {
    try {
      const session = await getActiveFlowSession(userId)
      if (session) {
        setInFlow(true)
        setSessionId(session.id)
        const started = new Date(session.started_at).getTime()
        const elapsed = Math.floor((Date.now() - started) / 1000)
        setElapsedSeconds(elapsed)
        setEngagementScore(session.engagement_score || 50)
      }
    } catch (error) {
      console.error('Error checking session:', error)
    }
  }

  async function toggleFlow() {
    if (inFlow) {
      // End session
      if (sessionId) {
        try {
          await endFlowSession(sessionId)
          setInFlow(false)
          setSessionId(null)
          setElapsedSeconds(0)
          onFlowChange?.(false)
        } catch (error) {
          console.error('Error ending session:', error)
        }
      }
    } else {
      // Start session
      try {
        const session = await startFlowSession(userId)
        setInFlow(true)
        setSessionId(session.id)
        setElapsedSeconds(0)
        setEngagementScore(50)
        onFlowChange?.(true)
      } catch (error) {
        console.error('Error starting session:', error)
      }
    }
  }

  function updateEngagement() {
    // Simulate engagement detection (in real implementation, this would track actual activity)
    const variance = Math.random() * 10 - 5
    setEngagementScore((prev) => Math.max(0, Math.min(100, prev + variance)))

    // Deep work detection (> 25 minutes at high engagement)
    if (elapsedSeconds > 1500 && engagementScore > 70) {
      setStreak((prev) => prev + 1)
    }
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h > 0 ? `${h}:` : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <motion.div
        className={`bg-[#0F1113] border rounded-2xl shadow-2xl overflow-hidden ${
          inFlow ? 'border-[#3AA9BE]/40' : 'border-white/10'
        }`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.24 }}
      >
        {/* Wave Visualisation */}
        {inFlow && (
          <div className="h-16 relative overflow-hidden bg-gradient-to-r from-[#3AA9BE]/20 to-[#3AA9BE]/5">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
              <motion.path
                d="M0,50 Q100,30 200,50 T400,50"
                fill="none"
                stroke="#3AA9BE"
                strokeWidth="2"
                opacity="0.6"
                animate={{
                  d: [
                    'M0,50 Q100,30 200,50 T400,50',
                    'M0,50 Q100,70 200,50 T400,50',
                    'M0,50 Q100,30 200,50 T400,50',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </svg>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Flow State</h3>
            <button
              onClick={toggleFlow}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                inFlow
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'bg-[#3AA9BE] text-white hover:bg-[#3AA9BE]/90'
              }`}
            >
              {inFlow ? 'End Session' : 'Start Session'}
            </button>
          </div>

          {/* Stats */}
          {inFlow && (
            <div className="space-y-3">
              {/* Timer */}
              <div className="text-center">
                <div className="text-4xl font-bold text-[#3AA9BE]">{formatTime(elapsedSeconds)}</div>
                <div className="text-xs text-white/40 mt-1">Session Duration</div>
              </div>

              {/* Engagement Score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/60">Engagement</span>
                  <span className="text-sm font-semibold text-white">{Math.round(engagementScore)}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#3AA9BE] to-[#3AA9BE]/60"
                    initial={{ width: 0 }}
                    animate={{ width: `${engagementScore}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>

              {/* Streak */}
              {streak > 0 && (
                <div className="text-center p-3 bg-[#3AA9BE]/10 border border-[#3AA9BE]/20 rounded-lg">
                  <div className="text-2xl font-bold text-[#3AA9BE]">{streak} 🔥</div>
                  <div className="text-xs text-white/60">Deep Work Streak</div>
                </div>
              )}
            </div>
          )}

          {!inFlow && (
            <p className="text-sm text-white/60 text-center">
              Track your creative flow state and build momentum
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
