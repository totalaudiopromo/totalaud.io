'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useThemeAudio } from '@/hooks/useThemeAudio'
import { useOS } from '@/components/os/navigation'
import { queueOSBridge } from '@/components/os/navigation/OSBridges'
import { useAgentKernel } from '@/components/agents/useAgentKernel'
import { useOptionalDemo } from '@/components/demo/DemoOrchestrator'
import { useOptionalNarrative } from '@/components/narrative/useNarrative'
import { useAgentTeams } from '@/components/agents/teams/AgentTeamOrchestrator'
import { buildLoopSummary } from '@/components/export/ExportPipeline'
import { useOptionalCompanion } from '@/components/companion/useCompanion'
import { RitualPanel } from '@/components/rituals/RitualPanel'
import type { LoopOSClipData, LoopOSLane, SuggestedClip } from './useLoopOSLocalStore'
import type { SequencedClip } from './engines/sequenceEngine'
import type { MomentumResult } from './engines/momentumEngine'
import { suggestMomentumFixes, suggestNextClips, summariseLoop } from './ai/looposAI'

interface LoopOSInspectorProps {
  loopId: string | null
  clips: LoopOSClipData[]
  selectedClipId: string | null
  sequencedClips: SequencedClip[]
  momentum: MomentumResult | null
  nextActionClips: SequencedClip[]
  playhead: number
  validationWarnings: string[]
  clearValidationWarnings: () => void
  aiSuggestions: {
    clips: SuggestedClip[]
    fixes: string[]
  }
  onSetAISuggestions: (payload: { clips: SuggestedClip[]; fixes: string[] }) => void
  onClearAISuggestions: () => void
  onApplyAISuggestionClip: (id: string) => void
  onApplyAllAISuggestions: () => void
  onUpdateClip: (id: string, partial: Partial<LoopOSClipData>) => void
  onToggleLoopOSReady: (id: string) => void
  onDeleteClip: (id: string) => void
}

export function LoopOSInspector({
  loopId,
  clips,
  selectedClipId,
  sequencedClips,
  momentum,
  nextActionClips,
  playhead,
  validationWarnings,
  clearValidationWarnings,
  aiSuggestions,
  onSetAISuggestions,
  onClearAISuggestions,
  onApplyAISuggestionClip,
  onApplyAllAISuggestions,
  onUpdateClip,
  onToggleLoopOSReady,
  onDeleteClip,
}: LoopOSInspectorProps) {
  const { play } = useThemeAudio()
  const { setOS } = useOS()
  const prefersReducedMotion = useReducedMotion()
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [aiError, setAIError] = useState<string | null>(null)
  const { spawnAgentRun } = useAgentKernel()
  const { runTeam } = useAgentTeams()
  const [agentError, setAgentError] = useState<string | null>(null)
  const [agentRole, setAgentRole] = useState<'coach' | 'scout' | 'tracker' | 'insight'>('coach')
  const demo = useOptionalDemo()
  const narrative = useOptionalNarrative()
  const companion = useOptionalCompanion()

  const isDemoMode =
    demo?.isDemoMode ||
    (typeof window !== 'undefined' && (window as any).__TA_DEMO__ === true)

  const selectedClip = useMemo(
    () => clips.find((clip) => clip.id === selectedClipId) ?? null,
    [clips, selectedClipId],
  )

  useEffect(() => {
    if (!validationWarnings.length) return

    const timeout = window.setTimeout(() => {
      clearValidationWarnings()
    }, 6000)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [validationWarnings, clearValidationWarnings])

  const handleLaneChange = (lane: LoopOSLane) => {
    if (!selectedClip) return
    onUpdateClip(selectedClip.id, { lane })
  }

  const handleGenerateSuggestions = async () => {
    if (!sequencedClips.length) {
      setAIError('Add a few clips first so AI has something real to react to.')
      return
    }

    setIsGeneratingAI(true)
    setAIError(null)

    try {
      const [clipSuggestions, fixes] = await Promise.all([
        suggestNextClips(sequencedClips as unknown as LoopOSClipData[], momentum),
        suggestMomentumFixes(sequencedClips as unknown as LoopOSClipData[], momentum),
      ])

      const clips: SuggestedClip[] = clipSuggestions.map((clip, index) => ({
        id: `ai-${Date.now().toString(36)}-${index}`,
        lane: clip.lane as LoopOSLane,
        start: clip.start,
        length: clip.length,
        name: clip.name,
        notes: clip.notes,
        loopOSReady: clip.loopOSReady ?? false,
        source: 'ai',
      }))

      onSetAISuggestions({
        clips,
        fixes: fixes ?? [],
      })
    } catch (error) {
      console.warn('[LoopOS] AI suggestions failed', error)
      setAIError('AI unavailable right now. Try again in a minute.')
      onClearAISuggestions()
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const handleDismissAISuggestion = (id: string) => {
    const remaining = aiSuggestions.clips.filter((clip) => clip.id !== id)
    onSetAISuggestions({
      clips: remaining,
      fixes: aiSuggestions.fixes,
    })
  }

  const handleApplyAISuggestion = (id: string) => {
    onApplyAISuggestionClip(id)
  }

  const handleApplyAllAISuggestions = () => {
    onApplyAllAISuggestions()
    onClearAISuggestions()
  }

  const handleSendToAqua = () => {
    if (!selectedClip) return
    play('click')

    queueOSBridge('aqua', {
      kind: 'loopos-to-aqua',
      name: selectedClip.name,
      notes:
        selectedClip.notes ||
        `LoopOS segment from ${selectedClip.lane} lane. Ready for EPK shaping in Aqua.`,
      lane: selectedClip.lane,
    })

    setOS('aqua')
  }

  const handleSendToAnalogue = () => {
    if (!selectedClip) return
    play('click')

    queueOSBridge('analogue', {
      kind: 'loopos-to-analogue',
      title: selectedClip.name,
      body:
        selectedClip.notes ||
        `LoopOS segment from ${selectedClip.lane} lane. Capture this as a notebook card.`,
      lane: selectedClip.lane,
    })

    setOS('analogue')
  }

  const handleSendToXP = () => {
    if (!selectedClip) return
    play('click')

    const text = [
      `LoopOS clip: ${selectedClip.name}`,
      `Lane: ${selectedClip.lane}`,
      `Loop ready: ${selectedClip.loopOSReady ? 'yes' : 'no'}`,
      selectedClip.notes,
    ]
      .filter(Boolean)
      .join('\n')

    queueOSBridge('xp', {
      kind: 'loopos-to-xp',
      clipboardText: text,
    })

    setOS('xp')
  }

  const handleSendSummaryToAqua = async () => {
    play('click')

    try {
      const summary = await summariseLoop({
        clips,
        momentum,
        nextActionClips: sequencedClips as unknown as LoopOSClipData[],
        selectedClip: selectedClip ?? undefined,
      })

      const fallbackText =
        summary ||
        `LoopOS loop summary:\n\nClips: ${clips.length}\nMomentum: ${
          momentum ? `${Math.round(momentum.score * 100)}% (${momentum.label})` : 'n/a'
        }`

      const artifact = buildLoopSummary(
        {
          name: selectedClip?.name ?? 'LoopOS loop',
          bpm: null,
          lanes: clips.map((clip) => clip.lane),
        },
        {
          headline: momentum?.label
            ? `Momentum: ${momentum.label}`
            : undefined,
          details: fallbackText,
        },
      )

      queueOSBridge('aqua', {
        kind: 'loopos-to-aqua',
        name: artifact.title,
        notes: artifact.body,
        lane: selectedClip?.lane ?? 'analysis',
        summaryText: artifact.body,
        momentumLabel: momentum?.label,
        source: 'loopos',
      })

      setOS('aqua')
    } catch (error) {
      console.warn('[LoopOS] failed to send summary to Aqua', error)
    }
  }

  const handleSendSummaryToAnalogue = async () => {
    play('click')

    try {
      const summary = await summariseLoop({
        clips,
        momentum,
        nextActionClips: sequencedClips as unknown as LoopOSClipData[],
        selectedClip: selectedClip ?? undefined,
      })

      const fallbackText =
        summary ||
        `LoopOS loop summary:\n\nClips: ${clips.length}\nMomentum: ${
          momentum ? `${Math.round(momentum.score * 100)}% (${momentum.label})` : 'n/a'
        }`

      const artifact = buildLoopSummary(
        {
          name: 'LoopOS loop overview',
          bpm: null,
          lanes: clips.map((clip) => clip.lane),
        },
        {
          headline: momentum?.label
            ? `Momentum: ${momentum.label}`
            : undefined,
          details: fallbackText,
        },
      )

      const tag: 'idea' | 'campaign' =
        momentum && momentum.score > 0.6 ? 'campaign' : 'idea'

      queueOSBridge('analogue', {
        kind: 'loopos-to-analogue',
        title: artifact.title,
        body: artifact.body,
        lane: selectedClip?.lane ?? 'analysis',
        summaryText: artifact.body,
        momentumLabel: momentum?.label,
        tag,
        source: 'loopos',
      })

      setOS('analogue')
    } catch (error) {
      console.warn('[LoopOS] failed to send summary to Analogue', error)
    }
  }

  const handleSendSummaryToXP = async () => {
    play('click')

    try {
      const summary = await summariseLoop({
        clips,
        momentum,
        nextActionClips: sequencedClips as unknown as LoopOSClipData[],
        selectedClip: selectedClip ?? undefined,
      })

      const fallbackText =
        summary ||
        `LoopOS loop summary:\n\nClips: ${clips.length}\nMomentum: ${
          momentum ? `${Math.round(momentum.score * 100)}% (${momentum.label})` : 'n/a'
        }`

      const artifact = buildLoopSummary(
        {
          name: 'LoopOS loop summary',
          bpm: null,
          lanes: clips.map((clip) => clip.lane),
        },
        {
          headline: momentum?.label
            ? `Momentum: ${momentum.label}`
            : undefined,
          details: fallbackText,
        },
      )

      queueOSBridge('xp', {
        kind: 'loopos-to-xp',
        clipboardText: artifact.body,
        summaryText: artifact.body,
        momentumLabel: momentum?.label,
        source: 'loopos',
      })

      setOS('xp')
    } catch (error) {
      console.warn('[LoopOS] failed to send summary to XP', error)
    }
  }

  const handleMarkLoopOSReady = () => {
    if (!selectedClip) return
    play('click')
    onToggleLoopOSReady(selectedClip.id)
  }

  const handleDeleteClip = () => {
    if (!selectedClip) return
    play('click')
    onDeleteClip(selectedClip.id)
  }

  const emphasiseMomentum =
    isDemoMode && narrative?.activeBeat && narrative.activeBeat.emphasiseMomentum

  return (
    <aside className="relative z-10 w-full shrink-0 border-l border-slate-800/80 bg-slate-950/85 px-4 py-3 text-xs text-slate-200 shadow-[0_18px_50px_rgba(0,0,0,0.9)] lg:w-80">
      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-200">
            LoopOS inspector
          </p>
          <p className="text-[11px] text-slate-400">
            Edit one block in the loop. Engines are live and driving this view.
          </p>
        </div>
        <span className="rounded-full bg-[#3AA9BE]/15 px-2 py-[2px] text-[10px] text-[#E5F9FF]">
          engine v1
        </span>
      </div>

      <div className="mt-3 space-y-3">
        <div className="rounded-md border border-[#3AA9BE]/60 bg-slate-950/80 p-2 shadow-[0_0_0_1px_rgba(15,23,42,0.9),0_0_32px_rgba(59,130,246,0.35)]">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-300">
              🤖 AI suggestions
            </p>
            <div className="flex items-center gap-1">
              {isGeneratingAI && (
                <span className="text-[9px] uppercase tracking-[0.18em] text-slate-500">
                  thinking...
                </span>
              )}
              <button
                type="button"
                onClick={handleGenerateSuggestions}
                className="rounded-full border border-slate-700 bg-slate-900 px-2 py-[2px] text-[10px] text-slate-100 hover:border-[#3AA9BE]/80 hover:text-[#E5F9FF]"
              >
                Generate
              </button>
              <button
                type="button"
                onClick={handleApplyAllAISuggestions}
                disabled={!aiSuggestions.clips.length}
                className={`rounded-full border px-2 py-[2px] text-[10px] ${
                  aiSuggestions.clips.length
                    ? 'border-emerald-500/80 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/25'
                    : 'cursor-not-allowed border-slate-700 bg-slate-900/70 text-slate-500'
                }`}
              >
                Apply all
              </button>
            </div>
          </div>

          {aiError && (
            <p className="mt-1 text-[10px] text-amber-300">{aiError}</p>
          )}

          {aiSuggestions.clips.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {aiSuggestions.clips.map((clip) => (
                <li
                  key={clip.id}
                  className="rounded border border-[#3AA9BE]/50 bg-slate-950/90 p-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-2 py-[1px] text-[9px] uppercase tracking-[0.22em] ${
                        clip.lane === 'creative'
                          ? 'bg-sky-500/20 text-sky-200'
                          : clip.lane === 'action'
                            ? 'bg-emerald-500/20 text-emerald-200'
                            : clip.lane === 'promo'
                              ? 'bg-lime-500/20 text-lime-200'
                              : clip.lane === 'analysis'
                                ? 'bg-indigo-500/20 text-indigo-200'
                                : 'bg-fuchsia-500/20 text-fuchsia-200'
                      }`}
                    >
                      {clip.lane}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {clip.start.toFixed(1)}u →{' '}
                      {(clip.start + clip.length).toFixed(1)}u
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[11px] font-medium text-slate-50">
                    {clip.name}
                  </p>
                  <p className="mt-1 line-clamp-3 text-[10px] text-slate-300">
                    {clip.notes}
                  </p>
                  <div className="mt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyAISuggestion(clip.id)}
                      className="rounded-full border border-emerald-400/80 bg-emerald-500/15 px-2 py-[2px] text-[10px] text-emerald-50 hover:bg-emerald-500/25"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDismissAISuggestion(clip.id)}
                      className="rounded-full border border-slate-700 bg-slate-900 px-2 py-[2px] text-[10px] text-slate-300 hover:border-slate-500 hover:text-slate-50"
                    >
                      Dismiss
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-[10px] text-slate-500">
              Hit generate to let LoopOS suggest the next few bars in your loop.
            </p>
          )}

          {aiSuggestions.fixes.length > 0 && (
            <div className="mt-2 rounded border border-slate-700 bg-slate-950/95 p-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-300">
                Momentum tips
              </p>
              <ul className="mt-1 list-disc space-y-[2px] pl-4 text-[10px] text-slate-400">
                {aiSuggestions.fixes.map((fix) => (
                  <li key={fix}>{fix}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-3">
          <RitualPanel variant="compact" title="LoopOS micro-rituals" />
        </div>

        <AnimatePresence>
          {validationWarnings.length > 0 && (
            <motion.div
              key="loopos-warning-panel"
              className="rounded-r-md border-l-2 border-amber-400 bg-[#1a1d1f] p-3"
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 4 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
              transition={{ type: 'tween', duration: 0.18 }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-300">
                ⚠ Timeline issue
              </p>
              <ul className="mt-1 list-disc space-y-[2px] pl-4 text-[10px] text-amber-200">
                {validationWarnings.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className={`rounded-md p-2 ${
            emphasiseMomentum
              ? 'border border-cyan-400/80 bg-slate-950/80 shadow-[0_0_0_1px_rgba(34,211,238,0.5),0_0_32px_rgba(34,211,238,0.35)]'
              : 'border border-slate-800/80 bg-slate-950/70'
          }`}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Momentum snapshot
          </p>
          {momentum ? (
            <div className="mt-1 space-y-1 text-[10px] text-slate-300">
              <p className="flex items-center justify-between">
                <span className="text-slate-400">Score</span>
                <span className="tabular-nums text-slate-100">
                  {(momentum.score * 100).toFixed(0)}%
                </span>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-slate-400">Label</span>
                <span className="uppercase tracking-[0.18em] text-slate-200">
                  {momentum.label}
                </span>
              </p>
              {momentum.reasons.length > 0 && (
                <ul className="mt-1 list-disc space-y-[2px] pl-4 text-[10px] text-slate-400">
                  {momentum.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <p className="mt-1 text-[10px] text-slate-500">
              Add a few clips across lanes to start generating real momentum.
            </p>
          )}
        </div>

        <div className="rounded-md border border-slate-800/80 bg-slate-950/70 p-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Ask an agent
          </p>
          <p className="mt-1 text-[10px] text-slate-500">
            Route this loop into the multi-agent brain without leaving LoopOS. Results land in the XP
            Agent Monitor.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <label className="text-[10px] text-slate-400">
              Role:
              <select
                className="ml-1 rounded border border-slate-700 bg-slate-950/90 px-1.5 py-[2px] text-[10px] text-slate-50 outline-none ring-0 focus:border-[#3AA9BE]"
                value={agentRole}
                onChange={(event) => {
                  const value = event.target.value
                  if (
                    value === 'coach' ||
                    value === 'scout' ||
                    value === 'tracker' ||
                    value === 'insight'
                  ) {
                    setAgentError(null)
                    setAgentRole(value)
                  }
                }}
              >
                <option value="coach">Coach</option>
                <option value="scout">Scout</option>
                <option value="tracker">Tracker</option>
                <option value="insight">Insight</option>
              </select>
            </label>
          </div>
          {agentError && (
            <p className="mt-1 text-[10px] text-amber-300">{agentError}</p>
          )}
          <div className="mt-2 grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={async () => {
                if (!selectedClip) {
                  setAgentError('Select a clip first to ask about it.')
                  return
                }
                setAgentError(null)
                play('click')

                const momentumLine = momentum
                  ? `Momentum: ${momentum.label} (${(momentum.score * 100).toFixed(0)}%)`
                  : 'Momentum: n/a'

                const inputLines = [
                  `Ask role: ${agentRole}`,
                  `Clip: ${selectedClip.name} (${selectedClip.lane})`,
                  momentumLine,
                  '',
                  'Notes:',
                  selectedClip.notes || '(no notes yet)',
                  '',
                  'Question: Suggest the next few moves for this clip in the wider loop.',
                ]

                await spawnAgentRun({
                  role: agentRole,
                  originOS: 'loopos',
                  target: {
                    loopId: loopId ?? undefined,
                    clipId: selectedClip.id,
                    osSlug: 'loopos',
                  },
                  input: inputLines.join('\n'),
                }).catch(() => {
                  setAgentError('Agent request failed. Try again in a moment.')
                })
              }}
              className="w-full rounded-md border border-emerald-400/70 bg-emerald-500/20 px-2 py-1 text-[11px] font-medium text-emerald-100 hover:bg-emerald-500/30"
            >
              Ask about selected clip
            </button>
            <button
              type="button"
              onClick={async () => {
                setAgentError(null)
                play('click')

                try {
                  const summary = await summariseLoop({
                    clips,
                    momentum,
                    nextActionClips: sequencedClips as unknown as LoopOSClipData[],
                    selectedClip: selectedClip ?? undefined,
                  })

                  const fallbackSummary =
                    summary ||
                    `Loop overview:\n- Clips: ${clips.length}\n- Momentum: ${
                      momentum ? `${Math.round(momentum.score * 100)}% (${momentum.label})` : 'n/a'
                    }`

                  const prompt = [
                    `Ask role: ${agentRole}`,
                    '',
                    'Loop summary:',
                    fallbackSummary,
                    '',
                    'Question: Suggest the next 3–5 moves to progress this loop without burning out the artist.',
                  ].join('\n')

                  await spawnAgentRun({
                    role: agentRole,
                    originOS: 'loopos',
                    target: {
                      loopId: loopId ?? undefined,
                      osSlug: 'loopos',
                    },
                    input: prompt,
                  })
                } catch {
                  setAgentError('Agent summary request failed. Try again in a moment.')
                }
              }}
              className="w-full rounded-md border border-sky-400/70 bg-sky-500/20 px-2 py-1 text-[11px] font-medium text-sky-100 hover:bg-sky-500/30"
            >
              {companion?.activeCompanion
                ? `Ask ${companion.activeCompanion.name.split(' ')[0]} about the whole loop`
                : 'Ask about the whole loop'}
            </button>
          </div>
        </div>

        <div className="rounded-md border border-slate-800/80 bg-slate-950/70 p-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Ask team about clip
          </p>
          <p className="mt-1 text-[10px] text-slate-500">
            Run the LoopOS Team (Scout → Insight → Coach) on the current loop and selected clip.
          </p>
          <button
            type="button"
            className="mt-2 w-full rounded-md border border-cyan-400/70 bg-cyan-500/20 px-2 py-1 text-[11px] font-medium text-cyan-100 hover:bg-cyan-500/30"
            onClick={() => {
              if (!loopId) {
                setAgentError('Loop is not initialised yet.')
                return
              }

              const momentumLine = momentum
                ? `Momentum: ${momentum.label} (${(momentum.score * 100).toFixed(0)}%)`
                : 'Momentum: n/a'

              const clipLine = selectedClip
                ? `Selected clip: ${selectedClip.name} (${selectedClip.lane})`
                : 'Selected clip: (none)'

              const instructionLines = [
                'Look at this LoopOS campaign loop and suggest the next few concrete moves.',
                '',
                momentumLine,
                clipLine,
              ]

              runTeam({
                teamId: 'loopos_team',
                originOS: 'loopos',
                target: {
                  loopId,
                  clipId: selectedClip?.id,
                  osSlug: 'loopos',
                },
                loopMomentum: momentum?.score,
                instruction: instructionLines.join('\n'),
              }).catch(() => {
                setAgentError('Team request failed. Try again in a moment.')
              })
            }}
          >
            Ask LoopOS Team
          </button>
        </div>

        <div className="rounded-md border border-slate-800/80 bg-slate-950/70 p-2">
          <p className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            <span>Next actions</span>
            <span className="text-slate-500">
              Playhead @ {playhead.toFixed(1)}u
            </span>
          </p>
          {nextActionClips.length ? (
            <ul className="mt-1 space-y-1">
              {nextActionClips.map((clip) => {
                const readyNow = clip.start <= playhead + 0.1
                return (
                  <li
                    key={clip.id}
                    className="flex items-center justify-between rounded border border-slate-800/80 bg-slate-950/80 px-2 py-[3px] text-[10px]"
                  >
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[10px] font-medium text-slate-100">
                        {clip.name}
                      </span>
                      <span className="text-[9px] text-slate-400">
                        {clip.lane} • starts at {clip.start.toFixed(1)}u
                      </span>
                    </div>
                    <span
                      className={`ml-2 rounded-full px-2 py-[1px] text-[9px] uppercase tracking-[0.22em] ${
                        readyNow
                          ? 'border border-emerald-400/80 bg-emerald-500/20 text-emerald-100'
                          : 'border border-slate-700/80 bg-slate-900/80 text-slate-300'
                      }`}
                    >
                      {readyNow ? 'Ready now' : 'Queued'}
                    </span>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="mt-1 text-[10px] text-slate-500">
              No ready clips just yet. Add or unblock clips ahead of the playhead to see them here.
            </p>
          )}
        </div>

        <div className="space-y-2 border-t border-slate-800/80 pt-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Export loop summary
          </p>
          <div className="mt-1 grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={handleSendSummaryToAqua}
              className="w-full rounded-md border border-sky-400/70 bg-sky-500/20 px-2 py-1 text-[11px] font-medium text-sky-50 hover:bg-sky-500/30"
            >
              Send summary to Aqua
            </button>
            <button
              type="button"
              onClick={handleSendSummaryToAnalogue}
              className="w-full rounded-md border border-amber-400/70 bg-amber-500/20 px-2 py-1 text-[11px] font-medium text-amber-50 hover:bg-amber-500/30"
            >
              Send summary to Analogue
            </button>
            <button
              type="button"
              onClick={handleSendSummaryToXP}
              className="w-full rounded-md border border-indigo-400/70 bg-indigo-500/20 px-2 py-1 text-[11px] font-medium text-indigo-50 hover:bg-indigo-500/30"
            >
              Send summary to XP
            </button>
          </div>
        </div>

        {selectedClip ? (
          <div className="space-y-3 border-t border-slate-800/80 pt-2">
          <div className="space-y-1">
            <label className="block text-[11px] text-slate-400">Name</label>
            <input
              className="w-full rounded-md border border-slate-700 bg-slate-950/90 px-2 py-1 text-xs text-slate-50 outline-none ring-0 placeholder:text-slate-500 focus:border-[#3AA9BE]"
              value={selectedClip.name}
              onChange={(event) =>
                onUpdateClip(selectedClip.id, { name: event.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] text-slate-400">Lane</label>
            <select
              className="w-full rounded-md border border-slate-700 bg-slate-950/90 px-2 py-1 text-xs text-slate-50 outline-none ring-0 focus:border-[#3AA9BE]"
              value={selectedClip.lane}
              onChange={(event) => handleLaneChange(event.target.value as LoopOSLane)}
            >
              <option value="creative">Creative</option>
              <option value="action">Action</option>
              <option value="promo">Promo</option>
              <option value="analysis">Analysis</option>
              <option value="refine">Refine</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] text-slate-400">Notes</label>
            <textarea
              className="min-h-[80px] w-full resize-none rounded-md border border-slate-700 bg-slate-950/90 px-2 py-1 text-xs text-slate-50 outline-none ring-0 placeholder:text-slate-500 focus:border-[#3AA9BE]"
              placeholder="What happens in this segment of the loop? Content, actions, checks, or analysis."
              value={selectedClip.notes}
              onChange={(event) =>
                onUpdateClip(selectedClip.id, { notes: event.target.value })
              }
            />
          </div>

          <button
            type="button"
            onClick={handleMarkLoopOSReady}
            className={`w-full rounded-md border px-2 py-1 text-[11px] font-medium ${
              selectedClip.loopOSReady
                ? 'border-emerald-400/80 bg-emerald-500/20 text-emerald-200'
                : 'border-[#3AA9BE]/80 bg-[#020617] text-[#E5F9FF]'
            }`}
          >
            {selectedClip.loopOSReady ? 'Unmark LoopOS-ready' : 'Mark for LoopOS'}
          </button>

          <div className="space-y-2 border-t border-slate-800/80 pt-2">
            <button
              type="button"
              onClick={handleSendToAqua}
              className="w-full rounded-md border border-sky-400/70 bg-sky-500/20 px-2 py-1 text-[11px] font-medium text-sky-50 hover:bg-sky-500/30"
            >
              Send to Aqua
            </button>
            <button
              type="button"
              onClick={handleSendToAnalogue}
              className="w-full rounded-md border border-amber-400/70 bg-amber-500/20 px-2 py-1 text-[11px] font-medium text-amber-50 hover:bg-amber-500/30"
            >
              Send to Analogue
            </button>
            <button
              type="button"
              onClick={handleSendToXP}
              className="w-full rounded-md border border-indigo-400/70 bg-indigo-500/20 px-2 py-1 text-[11px] font-medium text-indigo-50 hover:bg-indigo-500/30"
            >
              Send to XP
            </button>
          </div>

          <div className="space-y-2 border-t border-slate-800/80 pt-2">
            <button
              type="button"
              onClick={handleDeleteClip}
              className="w-full rounded-md border border-red-500/70 bg-red-600/20 px-2 py-1 text-[11px] font-medium text-red-100 hover:bg-red-600/30"
            >
              Delete clip
            </button>
          </div>
          </div>
        ) : (
          <div className="space-y-2 text-[11px] text-slate-400">
            <p>Select a clip on any lane to edit its details.</p>
            <p className="text-slate-500">
              Engines are already sequencing clips and scoring momentum – this panel will deepen in later phases.
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}


