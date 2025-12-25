'use client'

import { useEffect, useState } from 'react'
import {
  AquaAppIcon,
  AquaAppWindow,
  AquaButton,
  AquaContainer,
  AquaDock,
  AquaPanel,
} from '@/components/os/aqua'
import type { AquaAppName } from '@/components/os/aqua/AquaAppIcon'
import { useOS } from '@/components/os/navigation'
import { consumeOSBridges, queueOSBridge } from '@/components/os/navigation/OSBridges'
import { useAgentKernel } from '@/components/agents/useAgentKernel'
import { useOptionalDemo } from '@/components/demo/DemoOrchestrator'
import { registerAquaController } from '@/components/demo/director/DirectorEngine'
import { useOptionalNarrative, type NarrativeFlags } from '@/components/narrative/useNarrative'
import { useAgentTeams } from '@/components/agents/teams/AgentTeamOrchestrator'
import { useProjectEngine } from '@/components/projects/useProjectEngine'
import { useOptionalCompanion } from '@/components/companion/useCompanion'

/**
 * Aqua OS Surface - Cinematic Glass Workspace
 * Route: /os/aqua
 */
export default function AquaOSPage() {
  const { registerHooks, setOS } = useOS()
  const demo = useOptionalDemo()
  const narrative = useOptionalNarrative()
  const isDemoMode =
    demo?.isDemoMode || (typeof window !== 'undefined' && (window as any).__TA_DEMO__ === true)
  const [activeApp, setActiveApp] = useState<AquaAppName | null>('studio')
  const [artistName, setArtistName] = useState('')
  const [releaseName, setReleaseName] = useState('')
  const [elevatorPitch, setElevatorPitch] = useState('')
  const [story, setStory] = useState('')
  const [structure, setStructure] = useState<string[]>([])
  const [importNotes, setImportNotes] = useState<string[]>([])
  const { spawnAgentRun } = useAgentKernel()
  const { runTeam } = useAgentTeams()
  const { currentProject } = useProjectEngine()
  const companion = useOptionalCompanion()

  const buildAquaCoachPrompt = ({
    artistName,
    releaseName,
    elevatorPitch,
    story,
    flags,
  }: {
    artistName: string
    releaseName: string
    elevatorPitch: string
    story: string
    flags: NarrativeFlags | null
  }): string => {
    const lines = [
      `Artist: ${artistName || 'Unknown artist'}`,
      `Release: ${releaseName || 'Untitled release'}`,
      `Pitch: ${elevatorPitch || 'No elevator pitch yet.'}`,
      story ? `Story: ${story}` : '',
    ].filter(Boolean)

    const summary = lines.join('\n')

    if (flags?.shortPitch) {
      return [
        'Here is an EPK / pitch draft.',
        '',
        summary,
        '',
        'Turn this into a tight, 1–2 sentence media-friendly pitch Lana could send to press or playlists.',
      ].join('\n')
    }

    if (flags?.longStory) {
      return [
        'Here is an EPK / pitch draft.',
        '',
        summary,
        '',
        'Turn this into a slightly longer, narrative-style paragraph about the EP that still feels grounded and real.',
      ].join('\n')
    }

    return [
      'Here is an EPK / pitch draft. Suggest sharper structure and phrasing.',
      '',
      summary,
    ].join('\n')
  }

  useEffect(() => {
    const unregister = registerHooks('aqua', {
      onEnter: () => {
        // Placeholder: open a floating Aqua panel when this OS becomes active
      },
      onExit: () => {},
      onFocus: () => {},
    })

    return unregister
  }, [registerHooks])

  useEffect(() => {
    if (!isDemoMode) return

    setArtistName('LANA GLASS')
    setReleaseName('MIDNIGHT SIGNALS')
    setElevatorPitch(
      'Left-field electronic pop that feels like tuning into a pirate station after midnight.'
    )
    setStory(
      [
        '“Midnight Signals” is LANA GLASS’s EP about late-night frequency drift – glitchy drums, glassy pads, and hooks that sit between club and pop.',
        'It’s built for underground playlists, small venues, and the people who still check radio tracklists at 2am.',
      ].join(' ')
    )
  }, [isDemoMode])

  useEffect(() => {
    const payloads = consumeOSBridges('aqua')
    if (!payloads.length) return

    payloads.forEach((payload) => {
      if (payload.kind === 'analogue-to-aqua') {
        setArtistName(payload.artistName)
        setStory(payload.story)
        setImportNotes((previous) => [...previous, payload.note])
      }

      if (payload.kind === 'ascii-sendnote-aqua') {
        setStory((previous) => (previous ? `${previous}\n\n${payload.story}` : payload.story))
        setImportNotes((previous) => [...previous, 'Received note from ASCII.'])
      }

      if (payload.kind === 'daw-to-aqua') {
        setStory((previous) => (previous ? `${previous}\n\n${payload.story}` : payload.story))
        setImportNotes((previous) => [...previous, 'Imported clip notes from DAW.'])
      }
    })
  }, [])

  const title =
    activeApp === 'studio'
      ? 'EPK / Pitch Workbench'
      : activeApp === 'notes'
        ? 'EPK Notes'
        : activeApp === 'flow'
          ? 'Pitch Flow'
          : 'EPK / Pitch Workbench'

  const handleGenerateStructure = () => {
    setStructure(['Hook', 'Context', 'Support', 'Close'])
  }

  const buildSummary = () => {
    const lines = [
      `Artist: ${artistName || 'Unknown artist'}`,
      `Release: ${releaseName || 'Untitled release'}`,
      `Pitch: ${elevatorPitch || 'No elevator pitch yet.'}`,
      story ? `Story: ${story}` : '',
    ].filter(Boolean)

    return lines.join('\n')
  }

  const handleCopySummary = () => {
    const summary = buildSummary()

     
    console.log('[Aqua EPK] EPK summary copied (stub):', summary.replace(/\n/g, ' | '))
  }

  const handleSendSummaryToXp = () => {
    const summary = buildSummary()

    queueOSBridge('xp', {
      kind: 'aqua-to-xp',
      clipboardText: summary,
    })

    setOS('xp')
  }

  const handleCreateDawClip = () => {
    const name =
      artistName && releaseName
        ? `${artistName}: ${releaseName}`
        : artistName || releaseName || 'Untitled clip'
    const notes = elevatorPitch || story || 'Created from Aqua EPK workbench.'

    queueOSBridge('daw', {
      kind: 'aqua-to-daw',
      name,
      notes,
      lane: 'creative',
    })

    setOS('daw')
  }

  const handleSaveBackToAnalogue = () => {
    if (!artistName && !story) return

    queueOSBridge('analogue', {
      kind: 'aqua-to-analogue',
      title: artistName || 'Untitled project',
      body: story || 'EPK story to refine in Analogue.',
      tag: 'idea',
    })

    setOS('analogue')
  }

  const askCoachAboutPitch = () => {
    const flags = narrative?.flags ?? null
    const prompt = buildAquaCoachPrompt({
      artistName,
      releaseName,
      elevatorPitch,
      story,
      flags,
    })

    spawnAgentRun({
      role: 'coach',
      originOS: 'aqua',
      input: prompt,
    })
  }

  const runPromoTeamOnPitchDraft = () => {
    const flags = narrative?.flags ?? null
    const prompt = buildAquaCoachPrompt({
      artistName,
      releaseName,
      elevatorPitch,
      story,
      flags,
    })

    runTeam({
      teamId: 'promo_team',
      originOS: 'aqua',
      instruction: prompt,
    })
  }

  useEffect(() => {
    if (!isDemoMode) {
      registerAquaController(null)
      return
    }

    registerAquaController({
      askCoachAboutPitch,
    })

    return () => {
      registerAquaController(null)
    }
  }, [askCoachAboutPitch, isDemoMode])

  return (
    <AquaContainer>
      {/* Primary window slightly above center */}
      <div className="mt-[-40px] w-full max-w-xl">
        <AquaAppWindow
          title={title}
          isOpen={Boolean(activeApp)}
          onClose={() => {
            setActiveApp(null)
          }}
        >
          <div className="grid gap-6 md:grid-cols-[minmax(0,1.7fr),minmax(0,1fr)]">
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-sm font-semibold tracking-wide text-slate-100/90">
                  Build a press-ready pitch
                </h2>
                <p className="text-xs leading-relaxed text-slate-300/80">
                  Lock in the story once, reuse it across your EPK, emails, and socials. No AI
                  hallucinations, just your words.
                </p>
                {currentProject && (
                  <p className="text-[11px] text-slate-400/90">
                    <span className="uppercase tracking-[0.18em] text-sky-300/80">Project</span>{' '}
                    <span className="text-slate-300/90">{currentProject.name}</span>
                  </p>
                )}
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium uppercase tracking-[0.18em] text-sky-200/90">
                    Artist
                  </label>
                  <input
                    className="w-full rounded-md border border-sky-500/40 bg-slate-950/40 px-3 py-1.5 text-xs text-slate-50 outline-none ring-0 placeholder:text-slate-500 focus:border-sky-300/80"
                    placeholder="Artist or project name"
                    value={artistName}
                    onChange={(event) => setArtistName(event.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-medium uppercase tracking-[0.18em] text-sky-200/90">
                    Release
                  </label>
                  <input
                    className="w-full rounded-md border border-sky-500/40 bg-slate-950/40 px-3 py-1.5 text-xs text-slate-50 outline-none ring-0 placeholder:text-slate-500 focus:border-sky-300/80"
                    placeholder="Track, EP, or album title"
                    value={releaseName}
                    onChange={(event) => setReleaseName(event.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-medium uppercase tracking-[0.18em] text-sky-200/90">
                    One-line elevator pitch
                  </label>
                  <input
                    className="w-full rounded-md border border-sky-500/40 bg-slate-950/40 px-3 py-1.5 text-xs text-slate-50 outline-none ring-0 placeholder:text-slate-500 focus:border-sky-300/80"
                    placeholder="e.g. A dark disco cut for late-night playlists and festival trailers."
                    value={elevatorPitch}
                    onChange={(event) => setElevatorPitch(event.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-medium uppercase tracking-[0.18em] text-sky-200/90">
                    Story / context
                  </label>
                  <textarea
                    className="min-h-[120px] w-full resize-none rounded-md border border-sky-500/40 bg-slate-950/40 px-3 py-2 text-xs text-slate-50 outline-none ring-0 placeholder:text-slate-500 focus:border-sky-300/80"
                    placeholder="Tell the honest story: why this release matters, who it’s for, and what makes it different."
                    value={story}
                    onChange={(event) => setStory(event.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <AquaButton label="Generate structure" onClick={handleGenerateStructure} />
                <AquaButton
                  label="Copy summary (stub)"
                  onClick={handleCopySummary}
                  className="bg-slate-900/60 !text-[13px]"
                />
                <AquaButton
                  label="Send summary to XP"
                  onClick={handleSendSummaryToXp}
                  className="bg-emerald-500/20 !text-[13px]"
                />
                <AquaButton
                  label="Create DAW sequence clip"
                  onClick={handleCreateDawClip}
                  className="bg-fuchsia-500/20 !text-[13px]"
                />
                <AquaButton
                  label="Save back to Analogue"
                  onClick={handleSaveBackToAnalogue}
                  className="bg-amber-500/20 !text-[13px]"
                />
                <button
                  type="button"
                  onClick={askCoachAboutPitch}
                  className="text-[11px] text-sky-100/80 underline-offset-2 hover:underline"
                >
                  {companion?.activeCompanion
                    ? `Ask ${companion.activeCompanion.name.split(' ')[0]} for phrasing ideas`
                    : 'Ask Coach about this pitch'}
                </button>
                <button
                  type="button"
                  onClick={runPromoTeamOnPitchDraft}
                  className="text-[11px] text-emerald-100/80 underline-offset-2 hover:underline"
                >
                  Run Promo Team on pitch draft
                </button>
              </div>
            </div>

            <AquaPanel floatDelay={0.2} className="h-full px-4 py-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-100/90">
                    Pitch structure
                  </p>
                  <p className="text-[11px] text-slate-200/80">
                    Keep it simple: hook them, ground them, prove it, close it.
                  </p>
                </div>
                <span className="rounded-full bg-emerald-400/20 px-2 py-[2px] text-[10px] font-medium text-emerald-200">
                  draft only
                </span>
              </div>

              <div className="mt-3 space-y-1.5">
                {(structure.length ? structure : ['Hook', 'Context', 'Support', 'Close']).map(
                  (item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between rounded-md border border-sky-500/40 bg-slate-900/70 px-2 py-1.5"
                    >
                      <span className="text-[11px] font-medium text-sky-100/90">{item}</span>
                      <span className="text-[10px] text-slate-300/80">
                        {item === 'Hook'
                          ? 'Lead with the most interesting thing.'
                          : item === 'Context'
                            ? 'What scene, moment, or audience is this for?'
                            : item === 'Support'
                              ? 'Proof, wins, or story beats that back it up.'
                              : 'Give them a clear, low-friction next step.'}
                      </span>
                    </div>
                  )
                )}
                {importNotes.length > 0 && (
                  <div className="mt-3 space-y-1 border-t border-sky-500/30 pt-2 text-[11px] text-slate-200/80">
                    <p className="font-semibold uppercase tracking-[0.18em] text-sky-100/80">
                      imports
                    </p>
                    {importNotes.map((note) => (
                      <p key={note}>{note}</p>
                    ))}
                  </div>
                )}
              </div>
            </AquaPanel>
          </div>
        </AquaAppWindow>
      </div>

      {/* Dock */}
      <AquaDock
        onSelectApp={(app) => {
          setActiveApp(app)
        }}
      >
        <AquaAppIcon app="studio" />
        <AquaAppIcon app="notes" />
        <AquaAppIcon app="flow" />
      </AquaDock>
    </AquaContainer>
  )
}
