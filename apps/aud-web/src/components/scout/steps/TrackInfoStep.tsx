'use client'

import type { ScoutWizardState } from '../ScoutWizard'

interface TrackInfoStepProps {
  state: ScoutWizardState
  updateState: (updates: Partial<ScoutWizardState>) => void
}

export function TrackInfoStep({ state, updateState }: TrackInfoStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Step 1 of 5</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-100">
          Tell us about your track
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Scout needs to understand what you're promoting to find the right opportunities.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="trackTitle"
            className="block text-[11px] font-medium uppercase tracking-[0.15em] text-slate-400"
          >
            Track title <span className="text-rose-400">*</span>
          </label>
          <input
            id="trackTitle"
            type="text"
            value={state.trackTitle}
            onChange={(e) => updateState({ trackTitle: e.target.value })}
            placeholder="e.g. Midnight Signals"
            className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="trackDescription"
            className="block text-[11px] font-medium uppercase tracking-[0.15em] text-slate-400"
          >
            Description (optional)
          </label>
          <textarea
            id="trackDescription"
            value={state.trackDescription}
            onChange={(e) => updateState({ trackDescription: e.target.value })}
            placeholder="A brief description of your track - the vibe, story, or anything that makes it stand out..."
            rows={3}
            className="w-full resize-none rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="spotifyUrl"
            className="block text-[11px] font-medium uppercase tracking-[0.15em] text-slate-400"
          >
            Spotify / streaming link (optional)
          </label>
          <input
            id="spotifyUrl"
            type="url"
            value={state.spotifyUrl}
            onChange={(e) => updateState({ spotifyUrl: e.target.value })}
            placeholder="https://open.spotify.com/track/..."
            className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30"
          />
          <p className="text-[10px] text-slate-500">
            Adding a link helps Scout match you with curators who playlist similar tracks.
          </p>
        </div>
      </div>
    </div>
  )
}
