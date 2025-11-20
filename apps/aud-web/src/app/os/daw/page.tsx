'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  DawContainer,
  DawGrid,
  DawTrack,
  DawPlayhead,
  DawToolbar,
  DawTransport,
} from '@/components/os/daw'
import { useOS } from '@/components/os/navigation'
import { consumeOSBridges, queueOSBridge } from '@/components/os/navigation/OSBridges'

export default function DawPage() {
  const { registerHooks, setOS } = useOS()
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null)

  type DawLane = 'creative' | 'promo' | 'analysis' | 'refine'

  interface SequenceClip {
    id: string
    lane: DawLane
    name: string
    type: DawLane
    notes: string
    loopOSReady: boolean
  }

  const [clips, setClips] = useState<SequenceClip[]>(() => [
    {
      id: 'creative-1',
      lane: 'creative',
      name: 'Hook sketch',
      type: 'creative',
      notes: '',
      loopOSReady: false,
    },
    {
      id: 'creative-2',
      lane: 'creative',
      name: 'Idea loop',
      type: 'creative',
      notes: '',
      loopOSReady: false,
    },
    {
      id: 'promo-1',
      lane: 'promo',
      name: 'Campaign burst',
      type: 'promo',
      notes: '',
      loopOSReady: false,
    },
    {
      id: 'promo-2',
      lane: 'promo',
      name: 'Radio pass',
      type: 'promo',
      notes: '',
      loopOSReady: false,
    },
    {
      id: 'analysis-1',
      lane: 'analysis',
      name: 'Audience breakdown',
      type: 'analysis',
      notes: '',
      loopOSReady: false,
    },
    {
      id: 'analysis-2',
      lane: 'analysis',
      name: 'Channel check',
      type: 'analysis',
      notes: '',
      loopOSReady: false,
    },
    {
      id: 'refine-1',
      lane: 'refine',
      name: 'Content polish',
      type: 'refine',
      notes: '',
      loopOSReady: false,
    },
    {
      id: 'refine-2',
      lane: 'refine',
      name: 'Copy refine',
      type: 'refine',
      notes: '',
      loopOSReady: false,
    },
  ])

  useEffect(() => {
    const unregister = registerHooks('daw', {
      onEnter: () => {
        // Placeholder: brighten the DAW playhead when this OS becomes active
      },
      onExit: () => {},
      onFocus: () => {},
    })

    return unregister
  }, [registerHooks])

  useEffect(() => {
    const payloads = consumeOSBridges('daw')
    if (!payloads.length) return

    const newClips: SequenceClip[] = []

    payloads.forEach((payload) => {
      if (payload.kind === 'analogue-to-daw') {
        const id = `${payload.lane}-${Date.now().toString(36)}`
        newClips.push({
          id,
          lane: payload.lane,
          name: payload.name,
          type: payload.type,
          notes: payload.notes,
          loopOSReady: false,
        })
      }

      if (payload.kind === 'aqua-to-daw') {
        const id = `creative-${Date.now().toString(36)}`
        newClips.push({
          id,
          lane: payload.lane,
          name: payload.name,
          type: payload.lane,
          notes: payload.notes,
          loopOSReady: false,
        })
      }

      if (payload.kind === 'ascii-sendnote-daw') {
        const id = `creative-${Date.now().toString(36)}`
        newClips.push({
          id,
          lane: payload.lane,
          name: payload.name,
          type: payload.lane,
          notes: '',
          loopOSReady: false,
        })
      }
    })

    if (!newClips.length) return

    const lastClipId = newClips[newClips.length - 1]?.id ?? null

    setClips((previous) => [...previous, ...newClips])
    if (lastClipId) {
      setSelectedClipId(lastClipId)
    }
  }, [])

  const lanes: { id: DawLane; label: string }[] = [
    { id: 'creative', label: 'Creative' },
    { id: 'promo', label: 'Promo' },
    { id: 'analysis', label: 'Analysis' },
    { id: 'refine', label: 'Refine' },
  ]

  const selectedClip = useMemo(
    () => clips.find((clip) => clip.id === selectedClipId) ?? null,
    [clips, selectedClipId]
  )

  const handleUpdateSelectedClip = <K extends keyof SequenceClip>(
    field: K,
    value: SequenceClip[K]
  ) => {
    if (!selectedClipId) return
    setClips((prev) =>
      prev.map((clip) => (clip.id === selectedClipId ? { ...clip, [field]: value } : clip))
    )
  }

  const handleToggleLoopOSReady = () => {
    if (!selectedClipId) return
    setClips((prev) =>
      prev.map((clip) =>
        clip.id === selectedClipId ? { ...clip, loopOSReady: !clip.loopOSReady } : clip
      )
    )
  }

  const handleSendClipToAqua = (clip: SequenceClip | null) => {
    if (!clip) return

    queueOSBridge('aqua', {
      kind: 'daw-to-aqua',
      story: clip.notes || `Imported from DAW: ${clip.name}`,
    })

    setOS('aqua')
  }

  const mapDawTypeToAnalogueTag = (type: DawLane): 'idea' | 'campaign' | 'note' => {
    if (type === 'promo') return 'campaign'
    if (type === 'analysis' || type === 'refine') return 'note'
    return 'idea'
  }

  const handleSendClipToAnalogue = (clip: SequenceClip | null) => {
    if (!clip) return

    queueOSBridge('analogue', {
      kind: 'daw-to-analogue',
      title: clip.name,
      body: clip.notes || 'Sequence notes captured from DAW.',
      tag: mapDawTypeToAnalogueTag(clip.type),
    })

    setOS('analogue')
  }

  const handleOpenLoopOSStub = () => {
    // eslint-disable-next-line no-console
    console.log('[DAW] Open LoopOS (stub) clicked')
  }

  return (
    <DawContainer>
      <DawToolbar />

      <div className="relative flex min-h-0 flex-1 flex-col gap-3 overflow-x-auto lg:flex-row">
        <div className="relative min-w-[960px] flex-1">
          <DawGrid />

          <div className="relative flex flex-col">
            {lanes.map((lane) => (
              <DawTrack
                key={lane.id}
                name={lane.label}
                variant={lane.id}
                clips={clips
                  .filter((clip) => clip.lane === lane.id)
                  .map((clip) => ({
                    id: clip.id,
                    label: clip.name,
                    loopOSReady: clip.loopOSReady,
                  }))}
                selectedClipId={selectedClipId}
                onSelectClip={setSelectedClipId}
              />
            ))}
          </div>

          <DawPlayhead isPlaying={isPlaying} />
        </div>

        <aside className="relative z-10 w-full shrink-0 rounded-xl border border-slate-800/80 bg-slate-950/75 px-4 py-3 text-xs text-slate-200 shadow-[0_18px_50px_rgba(0,0,0,0.85)] lg:w-80">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
                Sequence inspector
              </p>
              <p className="text-[11px] text-slate-400">
                Sketch a loop now, wire it to LoopOS later.
              </p>
            </div>
            <span className="rounded-full bg-cyan-500/15 px-2 py-[2px] text-[10px] text-cyan-300">
              ui only
            </span>
          </div>

          {selectedClip ? (
            <div className="mt-3 space-y-3">
              <div className="space-y-1">
                <label className="block text-[11px] text-slate-400">Name</label>
                <input
                  className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-2 py-1 text-xs text-slate-50 outline-none ring-0 placeholder:text-slate-500 focus:border-cyan-400"
                  value={selectedClip.name}
                  onChange={(event) => handleUpdateSelectedClip('name', event.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] text-slate-400">Type</label>
                <select
                  className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-2 py-1 text-xs text-slate-50 outline-none ring-0 focus:border-cyan-400"
                  value={selectedClip.type}
                  onChange={(event) =>
                    handleUpdateSelectedClip('type', event.target.value as SequenceClip['type'])
                  }
                >
                  <option value="creative">Creative</option>
                  <option value="promo">Promo</option>
                  <option value="analysis">Analysis</option>
                  <option value="refine">Refine</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] text-slate-400">Notes</label>
                <textarea
                  className="min-h-[80px] w-full resize-none rounded-md border border-slate-700 bg-slate-950/80 px-2 py-1 text-xs text-slate-50 outline-none ring-0 placeholder:text-slate-500 focus:border-cyan-400"
                  placeholder="What happens in this part of the loop? (e.g. warm-up content, announce pre-save, pitch playlists…) "
                  value={selectedClip.notes}
                  onChange={(event) => handleUpdateSelectedClip('notes', event.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={handleToggleLoopOSReady}
                className={`w-full rounded-md border px-2 py-1 text-[11px] font-medium ${
                  selectedClip.loopOSReady
                    ? 'border-emerald-400/80 bg-emerald-500/20 text-emerald-200'
                    : 'border-cyan-400/80 bg-cyan-500/15 text-cyan-200'
                }`}
              >
                {selectedClip.loopOSReady ? 'Unmark for LoopOS (stub)' : 'Mark for LoopOS (stub)'}
              </button>

              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => handleSendClipToAqua(selectedClip)}
                  className="w-full rounded-md border border-sky-400/70 bg-sky-500/20 px-2 py-1 text-[11px] font-medium text-sky-100 hover:bg-sky-500/30"
                >
                  Send clip to Aqua
                </button>
                <button
                  type="button"
                  onClick={() => handleSendClipToAnalogue(selectedClip)}
                  className="w-full rounded-md border border-amber-400/70 bg-amber-500/20 px-2 py-1 text-[11px] font-medium text-amber-50 hover:bg-amber-500/30"
                >
                  Send clip to Analogue
                </button>
                <button
                  type="button"
                  onClick={handleOpenLoopOSStub}
                  className="w-full rounded-md border border-emerald-400/70 bg-emerald-500/15 px-2 py-1 text-[11px] font-medium text-emerald-100 hover:bg-emerald-500/25"
                >
                  Open LoopOS (stub)
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3 space-y-2 text-[11px] text-slate-400">
              <p>Select a clip on any lane to edit its details.</p>
              <p className="text-slate-500">
                In LoopOS this panel will drive dependencies, momentum, and actual task firing.
              </p>
            </div>
          )}
        </aside>
      </div>

      <DawTransport onPlayingChange={setIsPlaying} />
    </DawContainer>
  )
}
