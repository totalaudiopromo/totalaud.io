'use client'

import type { ScoutWizardState } from '../ScoutWizard'

interface TrackInfoStepProps {
  state: ScoutWizardState
  updateState: (updates: Partial<ScoutWizardState>) => void
}

export function TrackInfoStep({ state, updateState }: TrackInfoStepProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#6B7280]">
          Step 1 of 5
        </p>
        <h2 className="mt-3 text-[18px] font-semibold tracking-[-0.01em] text-[#E8EAED]">
          Tell us about your track
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-[#A9B3BF]">
          Scout needs to understand what you're promoting to find the right opportunities.
        </p>
      </div>

      {/* Form */}
      <div className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="trackTitle" className="block text-[13px] font-medium text-[#A9B3BF]">
            Track title <span className="text-[#C45252]">*</span>
          </label>
          <input
            id="trackTitle"
            type="text"
            value={state.trackTitle}
            onChange={(e) => updateState({ trackTitle: e.target.value })}
            placeholder="e.g. Midnight Signals"
            className="w-full rounded-[4px] border border-[#1F2327] bg-[#131619] px-3 py-2.5 text-[14px] text-[#E8EAED] outline-none transition-colors placeholder:text-[#4B5563] focus:border-[#3AA9BE] focus:bg-[#151719]"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="trackDescription"
            className="block text-[13px] font-medium text-[#A9B3BF]"
          >
            Description <span className="text-[#6B7280]">(optional)</span>
          </label>
          <textarea
            id="trackDescription"
            value={state.trackDescription}
            onChange={(e) => updateState({ trackDescription: e.target.value })}
            placeholder="A brief description of your track - the vibe, story, or anything that makes it stand out..."
            rows={3}
            className="w-full resize-none rounded-[4px] border border-[#1F2327] bg-[#131619] px-3 py-2.5 text-[14px] text-[#E8EAED] outline-none transition-colors placeholder:text-[#4B5563] focus:border-[#3AA9BE] focus:bg-[#151719]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="spotifyUrl" className="block text-[13px] font-medium text-[#A9B3BF]">
            Spotify / streaming link <span className="text-[#6B7280]">(optional)</span>
          </label>
          <input
            id="spotifyUrl"
            type="url"
            value={state.spotifyUrl}
            onChange={(e) => updateState({ spotifyUrl: e.target.value })}
            placeholder="https://open.spotify.com/track/..."
            className="w-full rounded-[4px] border border-[#1F2327] bg-[#131619] px-3 py-2.5 text-[14px] text-[#E8EAED] outline-none transition-colors placeholder:text-[#4B5563] focus:border-[#3AA9BE] focus:bg-[#151719]"
          />
          <p className="text-[12px] text-[#6B7280]">
            Adding a link helps Scout match you with curators who playlist similar tracks.
          </p>
        </div>
      </div>
    </div>
  )
}
