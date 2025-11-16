/**
 * Intent Input Panel
 * Phase 20 - Intent Engine UI
 *
 * Provides text input and preset selection for creative intent
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { INTENT_PRESETS, type IntentPreset } from '@total-audio/agents/intent'

interface IntentInputPanelProps {
  value: string
  onChange: (value: string) => void
  onParse: () => void
}

export function IntentInputPanel({ value, onChange, onParse }: IntentInputPanelProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  const handlePresetSelect = (preset: IntentPreset) => {
    onChange(preset.intentText)
    setSelectedPreset(preset.id)
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-neutral-700 bg-neutral-900/50 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-100">Creative Intent</h2>
        <button
          onClick={onParse}
          className="rounded bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colours hover:bg-cyan-700"
        >
          Parse Intent
        </button>
      </div>

      {/* Presets */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-neutral-400">Presets</label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {INTENT_PRESETS.map((preset) => (
            <motion.button
              key={preset.id}
              onClick={() => handlePresetSelect(preset)}
              className={`rounded-lg border p-3 text-left transition-all ${
                selectedPreset === preset.id
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-neutral-700 bg-neutral-800/50 hover:border-neutral-600'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-sm font-medium text-neutral-100">{preset.name}</div>
              <div className="mt-1 text-xs text-neutral-400">{preset.description}</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {preset.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-neutral-700/50 px-1.5 py-0.5 text-xs text-neutral-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Text Input */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-neutral-400">
          Describe your creative intent
        </label>
        <textarea
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setSelectedPreset(null)
          }}
          placeholder="Example: A calm arc that grows into clarity led by Aqua..."
          className="min-h-[120px] rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3 font-mono text-sm text-neutral-100 placeholder-neutral-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
        />
        <div className="text-xs text-neutral-500">
          Tip: Mention OS names (ASCII, XP, Aqua, DAW, Analogue), emotional arcs (rise, fall,
          resolve), and styles (calm, intense, fragmented).
        </div>
      </div>
    </div>
  )
}
