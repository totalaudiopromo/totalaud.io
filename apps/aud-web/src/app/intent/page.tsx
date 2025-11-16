/**
 * Intent Engine Page
 * Phase 20 - Creative Intent Interface
 *
 * Main interface for the Intent Engine:
 * - Input creative intent text
 * - Parse into IntentMap
 * - Compose into CreativeScore
 * - Export and perform
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  parseIntentText,
  composeCreativeScore,
  type IntentMap,
  type CreativeScore,
} from '@total-audio/agents/intent'
import { IntentInputPanel } from '@/components/intent/IntentInputPanel'
import { IntentMapPreview } from '@/components/intent/IntentMapPreview'
import { CreativeScorePreview } from '@/components/intent/CreativeScorePreview'
import { IntentActionsPanel } from '@/components/intent/IntentActionsPanel'
import { toast } from 'sonner'

export default function IntentPage() {
  const router = useRouter()
  const [intentText, setIntentText] = useState('')
  const [intentMap, setIntentMap] = useState<IntentMap | null>(null)
  const [creativeScore, setCreativeScore] = useState<CreativeScore | null>(null)

  const handleParse = () => {
    if (!intentText.trim()) {
      toast.error('Please enter some intent text')
      return
    }

    try {
      const parsed = parseIntentText(intentText)
      setIntentMap(parsed)
      setCreativeScore(null) // Reset score when parsing new intent
      toast.success('Intent parsed successfully')
    } catch (error) {
      console.error('Parse error:', error)
      toast.error('Failed to parse intent')
    }
  }

  const handleCompose = () => {
    if (!intentMap) {
      toast.error('Please parse an intent first')
      return
    }

    try {
      const score = composeCreativeScore(intentMap)
      setCreativeScore(score)
      toast.success('Creative score composed')
    } catch (error) {
      console.error('Compose error:', error)
      toast.error('Failed to compose score')
    }
  }

  const handleGenerateShowreel = () => {
    if (!creativeScore) {
      toast.error('Please compose a score first')
      return
    }

    // Store score in sessionStorage for showreel page
    sessionStorage.setItem('intentScore', JSON.stringify(creativeScore))
    router.push('/intent/showreel')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      {/* Header */}
      <div className="border-b border-neutral-800 bg-neutral-950/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2"
          >
            <h1 className="bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-400 bg-clip-text text-4xl font-bold text-transparent">
              Intent Engine
            </h1>
            <p className="text-neutral-400">
              Transform creative vision into orchestrated performance
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <IntentInputPanel
                value={intentText}
                onChange={setIntentText}
                onParse={handleParse}
              />
            </motion.div>

            {/* Intent Map Preview */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <IntentMapPreview intentMap={intentMap} />
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <IntentActionsPanel
                score={creativeScore}
                intentMap={intentMap}
                onCompose={handleCompose}
                onGenerateShowreel={handleGenerateShowreel}
              />
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Creative Score Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <CreativeScorePreview score={creativeScore} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mx-auto max-w-7xl px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-lg border border-neutral-800 bg-neutral-900/30 p-6"
        >
          <h3 className="text-lg font-semibold text-neutral-200">How It Works</h3>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-4">
            <div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-bold text-cyan-400">
                1
              </div>
              <div className="mt-2 text-sm font-medium text-neutral-300">Enter Intent</div>
              <div className="mt-1 text-xs text-neutral-500">
                Describe your creative vision using natural language
              </div>
            </div>
            <div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20 text-sm font-bold text-purple-400">
                2
              </div>
              <div className="mt-2 text-sm font-medium text-neutral-300">Parse</div>
              <div className="mt-1 text-xs text-neutral-500">
                System analyses style, arc, palette, and OS roles
              </div>
            </div>
            <div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 text-sm font-bold text-amber-400">
                3
              </div>
              <div className="mt-2 text-sm font-medium text-neutral-300">Compose</div>
              <div className="mt-1 text-xs text-neutral-500">
                Generate structured performance with scenes and events
              </div>
            </div>
            <div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 text-sm font-bold text-green-400">
                4
              </div>
              <div className="mt-2 text-sm font-medium text-neutral-300">Export</div>
              <div className="mt-1 text-xs text-neutral-500">
                Download or perform your creative score
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
