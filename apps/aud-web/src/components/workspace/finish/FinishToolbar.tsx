/**
 * FinishToolbar
 *
 * Controls for the Finish mode: preset selector, platform, macro settings,
 * and the Process button. Only shown after analysis is complete.
 */

'use client'

import { useEffect } from 'react'
import { useFinishStore, type MacroSettings } from '@/stores/useFinishStore'

const PLATFORMS = [
  { value: 'spotify', label: 'Spotify' },
  { value: 'apple', label: 'Apple Music' },
  { value: 'soundcloud', label: 'SoundCloud' },
  { value: 'bandcamp', label: 'Bandcamp' },
  { value: 'radio', label: 'Radio' },
]

const LOUDNESS_OPTIONS: { value: MacroSettings['loudness']; label: string }[] = [
  { value: 'streaming', label: 'Streaming' },
  { value: 'club', label: 'Club' },
  { value: 'radio', label: 'Radio' },
  { value: 'quiet', label: 'Quiet' },
  { value: 'reference', label: 'Reference' },
]

const TONE_OPTIONS: { value: MacroSettings['tone']; label: string }[] = [
  { value: 'bright', label: 'Bright' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'warm', label: 'Warm' },
  { value: 'dark', label: 'Dark' },
]

const ENERGY_OPTIONS: { value: MacroSettings['energy']; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'med', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'max', label: 'Max' },
]

function Select({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string
  value: string | null
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] uppercase tracking-wider text-ta-white/40">{label}</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="bg-ta-panel border border-ta-white/[0.08] rounded-ta-sm px-2 py-1.5 text-xs text-ta-white/80 focus:border-ta-cyan/40 focus:outline-none transition-colors appearance-none cursor-pointer"
      >
        {placeholder && (
          <option value="" className="bg-ta-panel">
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-ta-panel">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function FinishToolbar() {
  const stage = useFinishStore((s) => s.stage)
  const fileName = useFinishStore((s) => s.fileName)
  const fileSize = useFinishStore((s) => s.fileSize)
  const presets = useFinishStore((s) => s.presets)
  const selectedPreset = useFinishStore((s) => s.selectedPreset)
  const selectedPlatform = useFinishStore((s) => s.selectedPlatform)
  const macros = useFinishStore((s) => s.macros)
  const setPreset = useFinishStore((s) => s.setPreset)
  const setPlatform = useFinishStore((s) => s.setPlatform)
  const setMacro = useFinishStore((s) => s.setMacro)
  const process = useFinishStore((s) => s.process)
  const reset = useFinishStore((s) => s.reset)
  const loadPresets = useFinishStore((s) => s.loadPresets)

  useEffect(() => {
    loadPresets()
  }, [loadPresets])

  const presetOptions = presets.map((p) => ({
    value: p.name,
    label: p.name
      .replace('sadact-', '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase()),
  }))

  const showControls = stage === 'results'
  const showProcessButton = stage === 'results'

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-ta-white/[0.06] min-h-[44px] flex-wrap">
      {/* Left: file info */}
      <div className="flex items-center gap-3 min-w-0">
        {fileName && (
          <div className="flex items-center gap-2 min-w-0">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="text-ta-cyan flex-shrink-0"
            >
              <path d="M7 1L2 4v6l5 3 5-3V4L7 1z" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            <span className="text-xs text-ta-white/60 truncate max-w-[200px]">{fileName}</span>
            {fileSize && (
              <span className="text-[10px] text-ta-white/30 flex-shrink-0">
                {(fileSize / (1024 * 1024)).toFixed(1)} MB
              </span>
            )}
          </div>
        )}

        {stage === 'analysing' && (
          <span className="text-xs text-ta-cyan animate-pulse">Analysing...</span>
        )}
      </div>

      {/* Centre: controls (visible after analysis) */}
      {showControls && (
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            label="Genre"
            value={selectedPreset}
            onChange={setPreset}
            options={presetOptions}
            placeholder="Auto"
          />
          <Select
            label="Platform"
            value={selectedPlatform}
            onChange={setPlatform}
            options={PLATFORMS}
            placeholder="Any"
          />
          <Select
            label="Loudness"
            value={macros.loudness}
            onChange={(v) => setMacro('loudness', v as MacroSettings['loudness'])}
            options={LOUDNESS_OPTIONS}
          />
          <Select
            label="Tone"
            value={macros.tone}
            onChange={(v) => setMacro('tone', v as MacroSettings['tone'])}
            options={TONE_OPTIONS}
          />
          <Select
            label="Energy"
            value={macros.energy}
            onChange={(v) => setMacro('energy', v as MacroSettings['energy'])}
            options={ENERGY_OPTIONS}
          />
        </div>
      )}

      {/* Right: actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {showProcessButton && (
          <button
            onClick={process}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-ta-sm bg-ta-cyan text-ta-black text-xs font-medium hover:bg-ta-cyan/90 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            Process
          </button>
        )}

        {fileName && stage !== 'processing' && (
          <button
            onClick={reset}
            className="px-2 py-1.5 rounded-ta-sm text-xs text-ta-white/40 hover:text-ta-white/60 transition-colors"
            title="Clear and start over"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
