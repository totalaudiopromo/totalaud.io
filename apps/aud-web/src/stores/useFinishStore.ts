/**
 * Finish Mode Store
 *
 * Zustand store for audio finishing workflow:
 * Upload → Analyse (in the browser) → Results → Finishing notes
 *
 * Analysis runs entirely on the artist's device via the Web Audio API —
 * the audio never leaves the browser. Only the resulting measurements are
 * sent to /api/finish/perspectives for finishing notes.
 *
 * Mastering (process/download) is parked while the engine is rebuilt; its
 * state and actions are kept compiling but are not wired into the UI.
 *
 * No persistence needed -- results are ephemeral per session.
 */

import { create } from 'zustand'
import { logger } from '@/lib/logger'
import type { AnalysisResult, Suggestion, JobStatus } from '@/lib/finisher-client'
import type { FinishingNotes, TrackContext } from '@/lib/finish/perspectives'

const log = logger.scope('Finish Store')

// Types

export type FinishStage = 'upload' | 'analysing' | 'results' | 'processing' | 'complete' | 'error'

export type NotesStatus = 'idle' | 'generating' | 'ready' | 'error'

export interface PresetOption {
  name: string
  description: string
}

export interface MacroSettings {
  loudness: 'streaming' | 'club' | 'radio' | 'quiet' | 'reference'
  tone: 'bright' | 'neutral' | 'warm' | 'dark'
  energy: 'low' | 'med' | 'high' | 'max'
}

interface FinishState {
  // Stage
  stage: FinishStage

  // Upload
  file: File | null
  fileName: string | null
  fileSize: number | null

  // Analysis
  analysis: AnalysisResult | null
  suggestions: Suggestion[]

  // Finishing notes (perspectives)
  trackContext: TrackContext
  finishingNotes: FinishingNotes | null
  notesStatus: NotesStatus
  notesError: string | null

  // Processing config (mastering is parked -- kept compiling, unused)
  selectedPreset: string | null
  selectedPlatform: string | null
  macros: MacroSettings

  // Processing job
  jobId: string | null
  jobStatus: JobStatus | null
  pollTimeoutId: ReturnType<typeof setTimeout> | null

  // Presets cache
  presets: PresetOption[]
  presetsLoaded: boolean

  // Error
  error: string | null

  // Actions
  setFile: (file: File) => void
  analyse: (file?: File) => Promise<void>
  setTrackContext: (context: Partial<TrackContext>) => void
  generatePerspectives: () => Promise<void>
  setPreset: (preset: string | null) => void
  setPlatform: (platform: string | null) => void
  setMacro: <K extends keyof MacroSettings>(key: K, value: MacroSettings[K]) => void
  process: () => Promise<void>
  pollJob: () => Promise<void>
  downloadResult: () => void
  reset: () => void
  loadPresets: () => Promise<void>
}

const DEFAULT_MACROS: MacroSettings = {
  loudness: 'streaming',
  tone: 'neutral',
  energy: 'med',
}

export const useFinishStore = create<FinishState>((set, get) => ({
  // Initial state
  stage: 'upload',
  file: null,
  fileName: null,
  fileSize: null,
  analysis: null,
  suggestions: [],
  trackContext: {},
  finishingNotes: null,
  notesStatus: 'idle',
  notesError: null,
  selectedPreset: null,
  selectedPlatform: null,
  macros: { ...DEFAULT_MACROS },
  jobId: null,
  jobStatus: null,
  pollTimeoutId: null,
  presets: [],
  presetsLoaded: false,
  error: null,

  // Actions

  setFile: (file: File) => {
    set({
      file,
      fileName: file.name,
      fileSize: file.size,
      stage: 'upload',
      analysis: null,
      suggestions: [],
      finishingNotes: null,
      notesStatus: 'idle',
      notesError: null,
      jobId: null,
      jobStatus: null,
      error: null,
    })
  },

  analyse: async (file?: File) => {
    const state = get()
    const target = file ?? state.file
    if (!target || state.stage === 'analysing') return

    set({
      stage: 'analysing',
      error: null,
      finishingNotes: null,
      notesStatus: 'idle',
      notesError: null,
    })

    try {
      // Client-only module -- decodes and analyses the audio in the browser.
      // The audio never leaves the device.
      const { analyseAudioFile } = await import('@/lib/finish/analyse-client')
      const analysis = await analyseAudioFile(target)

      set({
        stage: 'results',
        analysis,
        suggestions: analysis.suggestions || [],
      })

      log.info('Analysis complete', {
        lufs: analysis.integrated_lufs,
        suggestions: analysis.suggestions?.length,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Analysis failed'
      log.error('Analysis failed', error)
      set({ stage: 'error', error: message })
    }
  },

  setTrackContext: (context: Partial<TrackContext>) =>
    set((state) => ({
      trackContext: { ...state.trackContext, ...context },
    })),

  generatePerspectives: async () => {
    const { analysis, trackContext, notesStatus } = get()
    if (!analysis || notesStatus === 'generating') return

    set({ notesStatus: 'generating', notesError: null })

    try {
      const response = await fetch('/api/finish/perspectives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis, context: trackContext }),
      })

      if (!response.ok) {
        const err = await response
          .json()
          .catch(() => ({ error: 'Finishing notes are taking a moment — try again shortly' }))
        throw new Error(err.error || `Finishing notes failed: ${response.status}`)
      }

      const body = await response.json()

      set({ finishingNotes: body.notes, notesStatus: 'ready' })

      log.info('Finishing notes ready', {
        perspectives: body.notes?.perspectives?.length,
      })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Finishing notes are taking a moment — try again shortly'
      log.error('Finishing notes failed', error)
      set({ notesStatus: 'error', notesError: message })
    }
  },

  setPreset: (preset: string | null) => set({ selectedPreset: preset }),

  setPlatform: (platform: string | null) => set({ selectedPlatform: platform }),

  setMacro: (key, value) =>
    set((state) => ({
      macros: { ...state.macros, [key]: value },
    })),

  // Mastering is parked while the engine is rebuilt. The actions below are
  // intentionally kept compiling but are not wired into the UI.
  process: async () => {
    const { file, macros, selectedPlatform, selectedPreset } = get()
    if (!file) return

    set({ stage: 'processing', error: null })

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('loudness', macros.loudness)
      formData.append('tone', macros.tone)
      formData.append('energy', macros.energy)
      if (selectedPlatform) formData.append('platform', selectedPlatform)
      if (selectedPreset) formData.append('genre', selectedPreset)

      const response = await fetch('/api/finish/process', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Processing failed' }))
        throw new Error(err.error || `Processing failed: ${response.status}`)
      }

      const body = await response.json()
      const data = body.data || body

      set({ jobId: data.job_id })

      log.info('Processing started', { jobId: data.job_id })

      // Start polling
      get().pollJob()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Processing failed'
      log.error('Process failed', error)
      set({ stage: 'error', error: message })
    }
  },

  pollJob: async () => {
    const { pollTimeoutId } = get()
    if (pollTimeoutId) clearTimeout(pollTimeoutId)

    const poll = async () => {
      // Read fresh state each iteration to avoid stale closures
      const { jobId, stage } = get()
      if (!jobId || stage !== 'processing') return

      try {
        const response = await fetch(`/api/finish/jobs/${encodeURIComponent(jobId)}`)

        if (!response.ok) {
          throw new Error(`Job status failed: ${response.status}`)
        }

        const body = await response.json()
        const data = body.data || body

        set({ jobStatus: data })

        if (data.status === 'complete') {
          set({ stage: 'complete', pollTimeoutId: null })
          log.info('Processing complete', { jobId, outputLufs: data.output_lufs })
          return
        }

        if (data.status === 'failed') {
          set({ stage: 'error', error: data.error || 'Processing failed', pollTimeoutId: null })
          return
        }

        // Still processing -- poll again in 1.5s
        const tid = setTimeout(poll, 1500)
        set({ pollTimeoutId: tid })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Job polling failed'
        log.error('Poll failed', error)
        set({ stage: 'error', error: message, pollTimeoutId: null })
      }
    }

    poll()
  },

  downloadResult: () => {
    const { jobId } = get()
    if (!jobId) return

    // Trigger browser download
    const a = document.createElement('a')
    a.href = `/api/finish/jobs/${encodeURIComponent(jobId)}/download`
    a.download = `mastered_${get().fileName || 'output.wav'}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  },

  reset: () => {
    // Cancel any active polling before resetting
    const { pollTimeoutId } = get()
    if (pollTimeoutId) clearTimeout(pollTimeoutId)

    set({
      stage: 'upload',
      file: null,
      fileName: null,
      fileSize: null,
      analysis: null,
      suggestions: [],
      trackContext: {},
      finishingNotes: null,
      notesStatus: 'idle',
      notesError: null,
      selectedPreset: null,
      selectedPlatform: null,
      macros: { ...DEFAULT_MACROS },
      jobId: null,
      jobStatus: null,
      pollTimeoutId: null,
      error: null,
    })
  },

  loadPresets: async () => {
    if (get().presetsLoaded) return

    try {
      const response = await fetch('/api/finish/presets')
      if (!response.ok) return

      const body = await response.json()
      const data = body.data || body
      set({ presets: data.presets || [], presetsLoaded: true })
    } catch {
      log.error('Failed to load presets')
    }
  },
}))
