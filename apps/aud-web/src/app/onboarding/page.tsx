'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useThemeAudio } from '@/hooks/useThemeAudio'
import { useProjectEngine } from '@/components/projects/useProjectEngine'
import { useOptionalDemo } from '@/components/demo/DemoOrchestrator'
import { CompanionPicker } from '@/components/companion/CompanionPicker'
import { useCompanion } from '@/components/companion/useCompanion'

type ToneOption = 'neutral' | 'energetic' | 'introspective'

type FocusOption =
  | 'writing-ep'
  | 'launching-single'
  | 'album-cycle'
  | 'campaign-planning'
  | 'creative-development'

type StartSurface = 'analogue' | 'loopos' | 'aqua'

interface AccentPreset {
  id: string
  label: string
  colour: string
}

const ACCENT_PRESETS: AccentPreset[] = [
  { id: 'audio-intel', label: 'Audio Intel — electric blue', colour: '#3b82f6' },
  { id: 'playlist-pulse', label: 'Playlist Pulse — neon green', colour: '#22c55e' },
  { id: 'release-radar', label: 'Release Radar — orange', colour: '#f59e0b' },
  { id: 'trend-track', label: 'Trend Track — purple', colour: '#a855f7' },
  { id: 'content-clone', label: 'Content Clone — hot pink', colour: '#ec4899' },
  { id: 'success-predict', label: 'Success Predict — gold', colour: '#eab308' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const demo = useOptionalDemo()
  const isDemoMode =
    demo?.isDemoMode ||
    (typeof window !== 'undefined' && (window as any).__TA_DEMO__ === true)

  const { play } = useThemeAudio()
  const { createProject } = useProjectEngine()
  const companion = useCompanion()

  const [step, setStep] = useState(0)

  const [projectName, setProjectName] = useState('')
  const [artistName, setArtistName] = useState('')
  const [tone, setTone] = useState<ToneOption>('neutral')
  const [accentId, setAccentId] = useState<string>('audio-intel')

  const [focus, setFocus] = useState<FocusOption>('launching-single')
  const [startSurface, setStartSurface] = useState<StartSurface>('analogue')

  const accentColour = useMemo(() => {
    const preset = ACCENT_PRESETS.find((option) => option.id === accentId)
    return preset?.colour ?? '#3b82f6'
  }, [accentId])

  if (isDemoMode) {
    // In demo mode, onboarding is disabled and users should be steered back to Lana Glass.
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
          Lana Glass demo session
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
          Onboarding is disabled in demo mode
        </h1>
        <p className="max-w-md text-sm text-slate-300">
          You&apos;re currently inside the cinematic Lana Glass walkthrough. Exit the demo to start
          a real project with your own artist or label.
        </p>
        <button
          type="button"
          onClick={() => {
            router.push('/demo/artist')
          }}
          className="mt-2 rounded-full border border-slate-600 bg-slate-900/60 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-slate-100 hover:border-slate-300 hover:text-white"
        >
          back to demo
        </button>
      </div>
    )
  }

  const handleNext = () => {
    play('click')
    setStep((current) => Math.min(2, current + 1))
  }

  const handleBack = () => {
    play('click')
    setStep((current) => Math.max(0, current - 1))
  }

  const handleComplete = () => {
    const safeName = projectName.trim() || artistName.trim() || 'Untitled project'
    const project = createProject(safeName, accentColour)

    // Store a lightweight summary so OS surfaces can optionally reference onboarding choices.
    if (typeof window !== 'undefined') {
      const payload = {
        projectId: project.id,
        projectName: safeName,
        artistName: artistName.trim() || null,
        tone,
        accentColour,
        focus,
      }

      try {
        window.localStorage.setItem('ta_onboarding_summary_v1', JSON.stringify(payload))
      } catch {
        // Non-blocking if storage is unavailable
      }
    }

    play('success')
    router.push(`/os/${startSurface}`)
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">TotalAud.io OS</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-50">
            Set up your project
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            Real onboarding, no fake dashboards. We&apos;ll wire up a project and drop you straight
            into the OS that fits your headspace.
          </p>
        </div>
        <div className="hidden items-center gap-2 text-right text-[11px] text-slate-400 sm:flex">
          <span className="uppercase tracking-[0.18em]">Step</span>
          <span className="rounded-full bg-slate-900/60 px-2 py-[3px] text-xs text-slate-100">
            {step + 1} / 3
          </span>
        </div>
      </header>

      <main className="flex-1">
        {step === 0 && (
          <section className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-slate-100">
                Who are we helping?
              </h2>
              <p className="mt-1 text-xs text-slate-300">
                Set the core project context once. Everything else in the OS orbits around this.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                  Project name
                </label>
                <input
                  className="w-full rounded-md border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-sm text-slate-50 outline-none ring-0 placeholder:text-slate-500 focus:border-sky-400"
                  placeholder="e.g. Lana Glass — Midnight Signals"
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                  Artist / project owner (optional)
                </label>
                <input
                  className="w-full rounded-md border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-sm text-slate-50 outline-none ring-0 placeholder:text-slate-500 focus:border-sky-400"
                  placeholder="Artist, band, label, or agency name"
                  value={artistName}
                  onChange={(event) => setArtistName(event.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[minmax(0,0.8fr),minmax(0,1.2fr)]">
              <div className="space-y-2">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                  Tone
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'neutral', label: 'Neutral' },
                    { id: 'energetic', label: 'Energetic' },
                    { id: 'introspective', label: 'Introspective' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setTone(option.id as ToneOption)}
                      className={`rounded-full border px-3 py-1 text-xs ${
                        tone === option.id
                          ? 'border-sky-400 bg-sky-500/20 text-sky-100'
                          : 'border-slate-700 bg-slate-900/70 text-slate-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                  Accent colour
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {ACCENT_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setAccentId(preset.id)}
                      className={`flex items-center justify-between rounded-md border px-3 py-1.5 text-left text-[11px] ${
                        accentId === preset.id
                          ? 'border-sky-400 bg-slate-900/80 text-slate-50'
                          : 'border-slate-700 bg-slate-950/80 text-slate-300'
                      }`}
                    >
                      <span>{preset.label}</span>
                      <span
                        className="ml-3 inline-flex h-4 w-4 rounded-full border border-slate-300/70"
                        style={{ background: preset.colour }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                  Companion (optional)
                </p>
                <CompanionPicker
                  variant="compact"
                  title={
                    companion.activeCompanion
                      ? `${companion.activeCompanion.name} is riding shotgun`
                      : 'Pick who rides shotgun on this project'
                  }
                  subtitle={undefined}
                />
              </div>
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-slate-100">
                What&apos;s the current focus?
              </h2>
              <p className="mt-1 text-xs text-slate-300">
                We won&apos;t overcomplicate it. Pick the thing you&apos;re actually trying to move
                forward this month.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  id: 'writing-ep',
                  label: 'Writing the EP',
                  description: 'You&apos;re still shaping songs, concepts, and direction.',
                },
                {
                  id: 'launching-single',
                  label: 'Launching a single',
                  description:
                    'You&apos;ve got a track ready and need to actually get it heard, not just uploaded.',
                },
                {
                  id: 'album-cycle',
                  label: 'Album cycle',
                  description: 'Multiple releases, longer timelines, more moving parts.',
                },
                {
                  id: 'campaign-planning',
                  label: 'Campaign planning',
                  description:
                    'You&apos;re building a release or tour plan and need clear loops and actions.',
                },
                {
                  id: 'creative-development',
                  label: 'Creative development',
                  description:
                    'Brand, visuals, and positioning work before you even lock release dates.',
                },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setFocus(option.id as FocusOption)}
                  className={`flex flex-col items-start rounded-lg border px-3 py-2 text-left text-xs ${
                    focus === option.id
                      ? 'border-sky-400 bg-slate-900/80 text-slate-50'
                      : 'border-slate-700 bg-slate-950/80 text-slate-200'
                  }`}
                >
                  <span className="text-[12px] font-medium text-slate-50">{option.label}</span>
                  <span className="mt-1 text-[11px] text-slate-300">{option.description}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-slate-100">
                Where do you want to start?
              </h2>
              <p className="mt-1 text-xs text-slate-300">
                Pick the OS surface that matches how your brain wants to work today. You can switch
                anytime.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  id: 'analogue',
                  label: 'Analogue',
                  description: 'Cards, notes, and loose ideas. Great for early sketching.',
                },
                {
                  id: 'loopos',
                  label: 'LoopOS',
                  description: 'Loops, sequences, and campaign momentum in one view.',
                },
                {
                  id: 'aqua',
                  label: 'Aqua',
                  description: 'Pitch and EPK workbench when you&apos;re close to launch.',
                },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setStartSurface(option.id as StartSurface)}
                  className={`flex flex-col items-start rounded-lg border px-3 py-3 text-left text-xs ${
                    startSurface === option.id
                      ? 'border-sky-400 bg-slate-900/80 text-slate-50'
                      : 'border-slate-700 bg-slate-950/80 text-slate-200'
                  }`}
                >
                  <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {option.label}
                  </span>
                  <span className="mt-2 text-[11px] text-slate-300">{option.description}</span>
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-md border border-dashed border-slate-700 bg-slate-950/70 px-3 py-2 text-[11px] text-slate-300">
              <p className="mb-1 font-medium uppercase tracking-[0.18em] text-slate-400">
                Advanced surfaces
              </p>
              <p>
                ASCII and XP stay in the background for now — think command console and Agent
                Monitor. You can dive into them once your first loop is moving.
              </p>
            </div>
          </section>
        )}
      </main>

      <footer className="mt-8 flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-900/80 px-2 py-[2px] text-[10px] uppercase tracking-[0.18em] text-slate-500">
            Step {step + 1} of 3
          </span>
        </div>

        <div className="flex items-center gap-2">
          {step > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-[11px] text-slate-200 hover:border-slate-400 hover:text-slate-50"
            >
              Back
            </button>
          )}
          {step < 2 && (
            <button
              type="button"
              onClick={handleNext}
              className="rounded-full border border-sky-500 bg-sky-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-100 hover:border-sky-300 hover:text-white"
            >
              Continue
            </button>
          )}
          {step === 2 && (
            <button
              type="button"
              onClick={handleComplete}
              className="rounded-full border border-emerald-500 bg-emerald-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100 hover:border-emerald-300 hover:text-white"
            >
              Start working
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}


