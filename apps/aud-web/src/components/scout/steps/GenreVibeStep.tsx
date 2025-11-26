'use client'

import { motion } from 'framer-motion'
import type { ScoutWizardState, VibeOption } from '../ScoutWizard'

interface GenreVibeStepProps {
  state: ScoutWizardState
  updateState: (updates: Partial<ScoutWizardState>) => void
}

const GENRES = [
  'Electronic',
  'Pop',
  'Hip-Hop',
  'R&B',
  'Indie',
  'Rock',
  'Alternative',
  'Dance',
  'House',
  'Techno',
  'Drum & Bass',
  'Jazz',
  'Soul',
  'Folk',
  'Acoustic',
  'Ambient',
  'Classical',
  'World',
]

const VIBES: { id: VibeOption; label: string; emoji: string }[] = [
  { id: 'energetic', label: 'Energetic', emoji: '⚡' },
  { id: 'chill', label: 'Chill', emoji: '🌊' },
  { id: 'dark', label: 'Dark', emoji: '🌙' },
  { id: 'uplifting', label: 'Uplifting', emoji: '☀️' },
  { id: 'experimental', label: 'Experimental', emoji: '🔮' },
]

export function GenreVibeStep({ state, updateState }: GenreVibeStepProps) {
  const toggleGenre = (genre: string) => {
    const current = state.genres
    if (current.includes(genre)) {
      updateState({ genres: current.filter((g) => g !== genre) })
    } else {
      updateState({ genres: [...current, genre] })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Step 2 of 5</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-100">Genre and vibe</h2>
        <p className="mt-1 text-sm text-slate-400">
          Help Scout understand the sound so it can find the right curators and blogs.
        </p>
      </div>

      {/* Genre selection */}
      <div className="space-y-3">
        <label className="block text-[11px] font-medium uppercase tracking-[0.15em] text-slate-400">
          Genres <span className="text-rose-400">*</span>
          <span className="ml-2 normal-case tracking-normal text-slate-500">
            (select all that apply)
          </span>
        </label>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((genre) => {
            const isSelected = state.genres.includes(genre)
            return (
              <button
                key={genre}
                type="button"
                onClick={() => toggleGenre(genre)}
                className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition-all ${
                  isSelected
                    ? 'border border-sky-500 bg-sky-500/20 text-sky-100'
                    : 'border border-slate-700 bg-slate-900/70 text-slate-300 hover:border-slate-500'
                }`}
              >
                {genre}
              </button>
            )
          })}
        </div>
        {state.genres.length > 0 && (
          <p className="text-[10px] text-slate-500">Selected: {state.genres.join(', ')}</p>
        )}
      </div>

      {/* Vibe selection */}
      <div className="space-y-3">
        <label className="block text-[11px] font-medium uppercase tracking-[0.15em] text-slate-400">
          Overall vibe
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {VIBES.map((vibe) => {
            const isSelected = state.vibe === vibe.id
            return (
              <motion.button
                key={vibe.id}
                type="button"
                onClick={() => updateState({ vibe: vibe.id })}
                className={`relative flex flex-col items-center gap-1 rounded-lg border px-3 py-3 transition-colors ${
                  isSelected
                    ? 'border-sky-500 bg-sky-500/10'
                    : 'border-slate-700 bg-slate-900/50 hover:border-slate-500'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-lg">{vibe.emoji}</span>
                <span
                  className={`text-[10px] uppercase tracking-[0.12em] ${
                    isSelected ? 'text-sky-100' : 'text-slate-400'
                  }`}
                >
                  {vibe.label}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
