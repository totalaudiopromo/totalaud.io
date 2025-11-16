/**
 * Intent Actions Panel
 * Phase 20 - Actions for CreativeScore
 */

'use client'

import { motion } from 'framer-motion'
import type { CreativeScore } from '@total-audio/agents/intent'
import { downloadCreativeScore } from '@total-audio/agents/intent'
import { Download, Play, Film, FileText } from 'lucide-react'

interface IntentActionsPanelProps {
  score: CreativeScore | null
  intentMap: any
  onCompose: () => void
  onPerform?: () => void
  onGenerateShowreel?: () => void
}

export function IntentActionsPanel({
  score,
  intentMap,
  onCompose,
  onPerform,
  onGenerateShowreel,
}: IntentActionsPanelProps) {
  const handleDownload = (format: 'json' | 'markdown' | 'csv') => {
    if (score) {
      downloadCreativeScore(score, format)
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-neutral-700 bg-neutral-900/50 p-6">
      <h2 className="text-lg font-semibold text-neutral-100">Actions</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Compose Score */}
        <motion.button
          onClick={onCompose}
          disabled={!intentMap}
          className="flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-3 font-medium text-white transition-all hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
          whileHover={{ scale: intentMap ? 1.02 : 1 }}
          whileTap={{ scale: intentMap ? 0.98 : 1 }}
        >
          <FileText size={18} />
          Compose Score
        </motion.button>

        {/* Perform */}
        <motion.button
          onClick={onPerform}
          disabled={!score || !onPerform}
          className="flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-3 font-medium text-white transition-all hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
          whileHover={{ scale: score && onPerform ? 1.02 : 1 }}
          whileTap={{ scale: score && onPerform ? 0.98 : 1 }}
        >
          <Play size={18} />
          Perform (Coming Soon)
        </motion.button>

        {/* Generate Showreel */}
        <motion.button
          onClick={onGenerateShowreel}
          disabled={!score || !onGenerateShowreel}
          className="flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-3 font-medium text-white transition-all hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
          whileHover={{ scale: score && onGenerateShowreel ? 1.02 : 1 }}
          whileTap={{ scale: score && onGenerateShowreel ? 0.98 : 1 }}
        >
          <Film size={18} />
          Generate Showreel
        </motion.button>
      </div>

      {/* Export Options */}
      {score && (
        <div className="mt-2 border-t border-neutral-700 pt-4">
          <div className="text-sm font-medium text-neutral-400">Export Score</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => handleDownload('json')}
              className="flex items-center gap-2 rounded bg-neutral-800 px-3 py-2 text-sm text-neutral-300 transition-colours hover:bg-neutral-700"
            >
              <Download size={14} />
              JSON
            </button>
            <button
              onClick={() => handleDownload('markdown')}
              className="flex items-center gap-2 rounded bg-neutral-800 px-3 py-2 text-sm text-neutral-300 transition-colours hover:bg-neutral-700"
            >
              <Download size={14} />
              Markdown
            </button>
            <button
              onClick={() => handleDownload('csv')}
              className="flex items-center gap-2 rounded bg-neutral-800 px-3 py-2 text-sm text-neutral-300 transition-colours hover:bg-neutral-700"
            >
              <Download size={14} />
              CSV
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
