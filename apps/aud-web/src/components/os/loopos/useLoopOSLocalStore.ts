import { create } from 'zustand'
import type { OSBridgePayload } from '@/components/os/navigation/OSBridges'
import {
  computeSequencedClips,
  getNextActionClips,
  type SequencedClip,
  validateClipChange,
} from './engines/sequenceEngine'
import { computeMomentum, type MomentumResult } from './engines/momentumEngine'
import { computePlayheadAdvance, DEFAULT_TIMELINE_UNITS } from './engines/timelineMath'

export type LoopOSLane = 'creative' | 'action' | 'promo' | 'analysis' | 'refine'

export interface LoopOSClipData {
  id: string
  lane: LoopOSLane
  start: number
  length: number
  name: string
  notes: string
  loopOSReady: boolean
}

export type SuggestedClip = Omit<LoopOSClipData, 'id'> & {
  id: string
  source: 'ai'
}

export interface LoopOSPersistedLoop {
  id: string
  userId: string
  name: string
  bpm: number
  zoom: number
}

export interface LoopOSPersistedClipRow {
  id: string
  loop_id: string
  lane: string
  start: number
  length: number
  name: string
  notes: string
  loopos_ready: boolean
}

type DawToLoopOSPayload = Extract<OSBridgePayload, { kind: 'daw-to-loopos' }>

interface LoopOSState {
  activeLoopId: string | null
  availableLoops: { id: string; name: string; createdAt: string }[]
  tracks: LoopOSLane[]
  clips: LoopOSClipData[]
  sequencedClips: SequencedClip[]
  momentum: MomentumResult | null
  nextActionClips: SequencedClip[]
  aiSuggestions: {
    clips: SuggestedClip[]
    fixes: string[]
  }
  validationWarnings: string[]
  selectedClipId: string | null
  playhead: number
  isPlaying: boolean
  bpm: number
  zoom: number
  lastTickTimestamp: number | null
  setBpm: (bpm: number) => void
  addClip: (lane: LoopOSLane, partial?: Partial<Omit<LoopOSClipData, 'id' | 'lane'>>) => void
  updateClip: (id: string, partial: Partial<LoopOSClipData>) => void
  deleteClip: (id: string) => void
  setSelectedClipId: (id: string | null) => void
  toggleLoopOSReady: (id: string) => void
  setPlayhead: (value: number) => void
  setZoom: (zoom: number) => void
  startPlayback: () => void
  stopPlayback: () => void
  engineTick: (now: number) => void
  setValidationWarnings: (reasons: string[]) => void
  clearValidationWarnings: () => void
  addIncomingClip: (payload: DawToLoopOSPayload) => void
  consumeIncoming: (payloads: OSBridgePayload[]) => void
  resetAll: () => void
  /**
   * Persistence wiring (Phase 25)
   *
   * These keep Supabase concerns at the edge of the store so that the
   * core timeline + engine logic stays local-first and instant.
   */
  loadFromPersisted: (payload: {
    loop: LoopOSPersistedLoop
    clips: LoopOSPersistedClipRow[]
  }) => void
  upsertPersistedLoopMeta: (partial: Partial<Pick<LoopOSPersistedLoop, 'bpm' | 'zoom'>>) => void
  setAISuggestions: (payload: { clips: SuggestedClip[]; fixes: string[] }) => void
  clearAISuggestions: () => void
  applyAISuggestionClip: (id: string) => void
  applyAllAISuggestions: () => void
  pendingSaves: number
  markSaving: () => void
  markSaved: () => void
  initialiseDemoLoopIfNeeded: (payload: {
    bpm?: number
    zoom?: number
    clips: Array<{
      lane: LoopOSLane
      start: number
      length: number
      name: string
      notes: string
      loopOSReady?: boolean
    }>
  }) => void
  setAvailableLoops: (loops: { id: string; name: string; createdAt: string }[]) => void
  setActiveLoopId: (id: string | null) => void
  createLoopLocally: (payload: { id: string; name: string; createdAt: string }) => void
  removeLoopLocally: (id: string) => void
  renameLoopLocally: (id: string, newName: string) => void
}

const DEFAULT_TRACKS: LoopOSLane[] = ['creative', 'action', 'promo', 'analysis', 'refine']

function nextClipId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4).toString(16)}`
}

function recomputeFromClips(clips: LoopOSClipData[], playhead: number) {
  const sequencedClips = computeSequencedClips(clips)
  const momentum = clips.length ? computeMomentum(sequencedClips) : null
  const nextActionClips = getNextActionClips(sequencedClips, playhead)

  return {
    sequencedClips,
    momentum,
    nextActionClips,
  }
}

export const useLoopOSLocalStore = create<LoopOSState>((set, get) => ({
  activeLoopId: null,
  availableLoops: [],
  tracks: DEFAULT_TRACKS,
  clips: [],
  sequencedClips: [],
  momentum: null,
  nextActionClips: [],
  aiSuggestions: {
    clips: [],
    fixes: [],
  },
  validationWarnings: [],
  selectedClipId: null,
  playhead: 0,
  isPlaying: false,
  bpm: 120,
  zoom: 1,
  lastTickTimestamp: null,
  pendingSaves: 0,

  setBpm: (bpm) =>
    set((state) => {
      const nextBpm = Math.max(60, Math.min(180, bpm))
      return {
        ...state,
        bpm: nextBpm,
      }
    }),

  addClip: (lane, partial) =>
    set((state) => {
      const start = partial?.start ?? 0
      const length = partial?.length && partial.length > 0 ? partial.length : 4

      const clip: LoopOSClipData = {
        id: nextClipId(lane),
        lane,
        start,
        length,
        name: partial?.name ?? 'New loop block',
        notes:
          partial?.notes ??
          'Describe what happens in this part of the loop – content, actions, checks.',
        loopOSReady: partial?.loopOSReady ?? false,
      }

      const clips = [...state.clips, clip]
      const derived = recomputeFromClips(clips, state.playhead)

      return {
        ...state,
        clips,
        selectedClipId: clip.id,
        ...derived,
      }
    }),

  updateClip: (id, partial) =>
    set((state) => {
      const previousClips = state.clips
      const clips = state.clips.map((clip) =>
        clip.id === id
          ? {
              ...clip,
              ...partial,
            }
          : clip
      )

      const derived = recomputeFromClips(clips, state.playhead)

      let validationWarnings = state.validationWarnings
      const updatedClip = clips.find((clip) => clip.id === id)

      if (updatedClip) {
        const result = validateClipChange(previousClips, updatedClip)
        validationWarnings = result.valid ? [] : result.reasons
      }

      return {
        ...state,
        clips,
        ...derived,
        validationWarnings,
      }
    }),

  deleteClip: (id) =>
    set((state) => {
      const clips = state.clips.filter((clip) => clip.id !== id)
      const nextSelected = state.selectedClipId === id ? null : state.selectedClipId
      const derived = recomputeFromClips(clips, state.playhead)

      return {
        ...state,
        clips,
        selectedClipId: nextSelected,
        ...derived,
        validationWarnings: [],
      }
    }),

  setSelectedClipId: (id) =>
    set((state) => ({
      ...state,
      selectedClipId: id,
    })),

  toggleLoopOSReady: (id) =>
    set((state) => {
      const clips = state.clips.map((clip) =>
        clip.id === id ? { ...clip, loopOSReady: !clip.loopOSReady } : clip
      )

      const derived = recomputeFromClips(clips, state.playhead)

      return {
        ...state,
        clips,
        ...derived,
        validationWarnings: [],
      }
    }),

  setPlayhead: (value) =>
    set((state) => {
      const maxEnd =
        state.sequencedClips.length > 0
          ? Math.max(...state.sequencedClips.map((clip) => clip.end))
          : 0
      const timelineUnits = Math.max(DEFAULT_TIMELINE_UNITS, maxEnd + 4)
      const playhead = Math.max(0, Math.min(timelineUnits, value))
      const nextActionClips = getNextActionClips(state.sequencedClips, playhead)

      return {
        ...state,
        playhead,
        nextActionClips,
      }
    }),

  setZoom: (zoom) =>
    set((state) => ({
      ...state,
      zoom: Math.max(0.5, Math.min(2, zoom)),
    })),

  startPlayback: () =>
    set((state) => ({
      ...state,
      isPlaying: true,
      lastTickTimestamp: null,
    })),

  stopPlayback: () =>
    set((state) => ({
      ...state,
      isPlaying: false,
      lastTickTimestamp: null,
    })),

  engineTick: (now) =>
    set((state) => {
      if (!state.isPlaying) return state

      const last = state.lastTickTimestamp
      const deltaMs = last == null ? 0 : now - last
      const advance = computePlayheadAdvance(state.bpm, deltaMs)

      const maxEnd =
        state.sequencedClips.length > 0
          ? Math.max(...state.sequencedClips.map((clip) => clip.end))
          : 0
      const timelineUnits = Math.max(DEFAULT_TIMELINE_UNITS, maxEnd + 4)

      const rawNext = state.playhead + advance
      const playhead = rawNext >= timelineUnits ? rawNext - timelineUnits : rawNext
      const nextActionClips = getNextActionClips(state.sequencedClips, playhead)

      return {
        ...state,
        playhead,
        nextActionClips,
        lastTickTimestamp: now,
      }
    }),

  setValidationWarnings: (reasons) =>
    set((state) => ({
      ...state,
      validationWarnings: reasons,
    })),

  clearValidationWarnings: () =>
    set((state) => ({
      ...state,
      validationWarnings: [],
    })),

  addIncomingClip: (payload) =>
    set((state) => {
      const lane = payload.lane
      const clip: LoopOSClipData = {
        id: nextClipId(lane),
        lane,
        start: 0,
        length: 4,
        name: payload.name,
        notes: payload.notes,
        loopOSReady: false,
      }

      const clips = [...state.clips, clip]
      const derived = recomputeFromClips(clips, state.playhead)

      return {
        ...state,
        clips,
        selectedClipId: clip.id,
        ...derived,
        validationWarnings: [],
      }
    }),

  consumeIncoming: (payloads) => {
    const dawPayloads = payloads.filter(
      (payload): payload is DawToLoopOSPayload => payload.kind === 'daw-to-loopos'
    )

    if (!dawPayloads.length) return

    dawPayloads.forEach((payload) => {
      get().addIncomingClip(payload)
    })
  },

  resetAll: () =>
    set({
      tracks: DEFAULT_TRACKS,
      clips: [],
      sequencedClips: [],
      momentum: null,
      nextActionClips: [],
      aiSuggestions: {
        clips: [],
        fixes: [],
      },
      validationWarnings: [],
      selectedClipId: null,
      playhead: 0,
      isPlaying: false,
      bpm: 120,
      zoom: 1,
      lastTickTimestamp: null,
      pendingSaves: 0,
    }),

  loadFromPersisted: ({ loop, clips }) =>
    set((state) => {
      const localClips: LoopOSClipData[] = clips.map((row) => ({
        id: row.id,
        lane: row.lane as LoopOSLane,
        start: row.start,
        length: row.length,
        name: row.name,
        notes: row.notes,
        loopOSReady: row.loopos_ready,
      }))

      const derived = recomputeFromClips(localClips, 0)

      return {
        ...state,
        activeLoopId: loop.id,
        tracks: DEFAULT_TRACKS,
        clips: localClips,
        sequencedClips: derived.sequencedClips,
        momentum: derived.momentum,
        nextActionClips: derived.nextActionClips,
        aiSuggestions: {
          clips: [],
          fixes: [],
        },
        validationWarnings: [],
        selectedClipId: null,
        playhead: 0,
        isPlaying: false,
        bpm: loop.bpm,
        zoom: loop.zoom,
        lastTickTimestamp: null,
        pendingSaves: 0,
      }
    }),

  upsertPersistedLoopMeta: (partial) =>
    set((state) => ({
      ...state,
      bpm: partial.bpm ?? state.bpm,
      zoom: partial.zoom ?? state.zoom,
    })),

  setAISuggestions: (payload) =>
    set((state) => ({
      ...state,
      aiSuggestions: {
        clips: payload.clips,
        fixes: payload.fixes,
      },
    })),

  clearAISuggestions: () =>
    set((state) => ({
      ...state,
      aiSuggestions: {
        clips: [],
        fixes: [],
      },
    })),

  applyAISuggestionClip: (id) => {
    const { aiSuggestions, addClip } = get()
    const suggestion = aiSuggestions.clips.find((clip) => clip.id === id)
    if (!suggestion) return

    addClip(suggestion.lane, {
      start: suggestion.start,
      length: suggestion.length,
      name: suggestion.name,
      notes: suggestion.notes,
      loopOSReady: suggestion.loopOSReady,
    })

    set((state) => ({
      ...state,
      aiSuggestions: {
        ...state.aiSuggestions,
        clips: state.aiSuggestions.clips.filter((clip) => clip.id !== id),
      },
    }))
  },

  applyAllAISuggestions: () => {
    const { aiSuggestions, addClip } = get()
    if (!aiSuggestions.clips.length) return

    aiSuggestions.clips.forEach((suggestion) => {
      addClip(suggestion.lane, {
        start: suggestion.start,
        length: suggestion.length,
        name: suggestion.name,
        notes: suggestion.notes,
        loopOSReady: suggestion.loopOSReady,
      })
    })

    set((state) => ({
      ...state,
      aiSuggestions: {
        clips: [],
        fixes: state.aiSuggestions.fixes,
      },
    }))
  },

  markSaving: () =>
    set((state) => ({
      ...state,
      pendingSaves: state.pendingSaves + 1,
    })),

  markSaved: () =>
    set((state) => ({
      ...state,
      pendingSaves: Math.max(0, state.pendingSaves - 1),
    })),

  initialiseDemoLoopIfNeeded: (payload) =>
    set((state) => {
      if (state.clips.length > 0) {
        return state
      }

      const clips: LoopOSClipData[] = payload.clips.map((clip) => ({
        id: nextClipId(clip.lane),
        lane: clip.lane,
        start: clip.start,
        length: clip.length,
        name: clip.name,
        notes: clip.notes,
        loopOSReady: clip.loopOSReady ?? false,
      }))

      const derived = recomputeFromClips(clips, 0)

      return {
        ...state,
        activeLoopId: state.activeLoopId ?? 'demo-loop',
        clips,
        sequencedClips: derived.sequencedClips,
        momentum: derived.momentum,
        nextActionClips: derived.nextActionClips,
        bpm: payload.bpm ?? state.bpm,
        zoom: payload.zoom ?? state.zoom,
        validationWarnings: [],
        selectedClipId: clips[0]?.id ?? null,
        playhead: 0,
        isPlaying: false,
      }
    }),

  setAvailableLoops: (loops) =>
    set((state) => ({
      ...state,
      availableLoops: loops,
    })),

  setActiveLoopId: (id) =>
    set((state) => ({
      ...state,
      activeLoopId: id,
    })),

  createLoopLocally: (payload) =>
    set((state) => ({
      ...state,
      availableLoops: [
        ...state.availableLoops,
        { id: payload.id, name: payload.name, createdAt: payload.createdAt },
      ],
      activeLoopId: payload.id,
    })),

  removeLoopLocally: (id) =>
    set((state) => ({
      ...state,
      availableLoops: state.availableLoops.filter((loop) => loop.id !== id),
      activeLoopId: state.activeLoopId === id ? null : state.activeLoopId,
    })),

  renameLoopLocally: (id, newName) =>
    set((state) => ({
      ...state,
      availableLoops: state.availableLoops.map((loop) =>
        loop.id === id
          ? {
              ...loop,
              name: newName,
            }
          : loop
      ),
    })),
}))
