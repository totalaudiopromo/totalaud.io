'use client'

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

const VIBES: { id: VibeOption; label: string }[] = [
  { id: 'energetic', label: 'Energetic' },
  { id: 'chill', label: 'Chill' },
  { id: 'dark', label: 'Dark' },
  { id: 'uplifting', label: 'Uplifting' },
  { id: 'experimental', label: 'Experimental' },
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#6B7280]">
          Step 2 of 5
        </p>
        <h2 className="mt-3 text-[18px] font-semibold tracking-[-0.01em] text-[#E8EAED]">
          Genre and vibe
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-[#A9B3BF]">
          Help Scout understand the sound so it can find the right curators and blogs.
        </p>
      </div>

      {/* Genre selection */}
      <div className="space-y-3">
        <label className="block text-[13px] font-medium text-[#A9B3BF]">
          Genres <span className="text-[#C45252]">*</span>
          <span className="ml-2 font-normal text-[#6B7280]">(select all that apply)</span>
        </label>
        <div className="rounded-[6px] border border-[#1F2327] bg-[#131619] p-4">
          <div className="flex flex-wrap gap-2">
            {GENRES.map((genre) => {
              const isSelected = state.genres.includes(genre)
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className={`rounded-[4px] px-3 py-1.5 text-[13px] font-medium transition-all duration-[120ms] ${
                    isSelected
                      ? 'border border-[#3AA9BE] bg-[rgba(58,169,190,0.1)] text-[#3AA9BE]'
                      : 'border border-[#1F2327] bg-[#1A1D21] text-[#A9B3BF] hover:border-[#2A2E33] hover:text-[#E8EAED]'
                  }`}
                >
                  {genre}
                </button>
              )
            })}
          </div>
        </div>
        {state.genres.length > 0 && (
          <p className="text-[12px] text-[#6B7280]">Selected: {state.genres.join(', ')}</p>
        )}
      </div>

      {/* Vibe selection */}
      <div className="space-y-3">
        <label className="block text-[13px] font-medium text-[#A9B3BF]">Overall vibe</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {VIBES.map((vibe) => {
            const isSelected = state.vibe === vibe.id
            return (
              <button
                key={vibe.id}
                type="button"
                onClick={() => updateState({ vibe: vibe.id })}
                className={`rounded-[6px] border px-3 py-3 text-center transition-all duration-[120ms] ${
                  isSelected
                    ? 'border-[#3AA9BE] bg-[rgba(58,169,190,0.1)]'
                    : 'border-[#1F2327] bg-[#131619] hover:border-[#2A2E33]'
                }`}
              >
                <span
                  className={`text-[13px] font-medium ${
                    isSelected ? 'text-[#3AA9BE]' : 'text-[#A9B3BF]'
                  }`}
                >
                  {vibe.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
