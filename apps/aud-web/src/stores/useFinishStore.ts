/**
 * Finish Mode Store
 *
 * Zustand store for audio finishing workflow:
 * Upload → Analyse → Configure → Process → Download
 *
 * No persistence needed -- results are ephemeral per session.
 */

import { create } from 'zustand'
import { logger } from '@/lib/logger'
import type { AnalysisResult, Suggestion, JobStatus } from '@/lib/finisher-client'

const log = logger.scope('Finish Store')

// Types

export type FinishStage = 'upload' | 'analysing' | 'results' | 'processing' | 'complete' | 'error'

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

  // Processing config
  selectedPreset: string | null
  selectedPlatform: string | null
  macros: MacroSettings

  // Processing job
  jobId: string | null
  jobStatus: JobStatus | null

  // Presets cache
  presets: PresetOption[]
  presetsLoaded: boolean

  // Error
  error: string | null

  // Actions
  setFile: (file: File) => void
  analyze: () => Promise<void>
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
  selectedPreset: null,
  selectedPlatform: null,
  macros: { ...DEFAULT_MACROS },
  jobId: null,
  jobStatus: null,
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
      jobId: null,
      jobStatus: null,
      error: null,
    })
  },

  analyze: async () => {
    const { file, selectedPlatform } = get()
    if (!file) return

    set({ stage: 'analysing', error: null })

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (selectedPlatform) {
        formData.append('platform', selectedPlatform)
      }

      const response = await fetch('/api/finish/analyze', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Analysis failed' }))
        throw new Error(err.error || `Analysis failed: ${response.status}`)
      }

      const body = await response.json()
      const data = body.data || body

      set({
        stage: 'results',
        analysis: data,
        suggestions: data.suggestions || [],
      })

      log.info('Analysis complete', {
        lufs: data.integrated_lufs,
        suggestions: data.suggestions?.length,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Analysis failed'
      log.error('Analysis failed', error)
      set({ stage: 'error', error: message })
    }
  },

  setPreset: (preset: string | null) => set({ selectedPreset: preset }),

  setPlatform: (platform: string | null) => set({ selectedPlatform: platform }),

  setMacro: (key, value) =>
    set((state) => ({
      macros: { ...state.macros, [key]: value },
    })),

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
    const { jobId } = get()
    if (!jobId) return

    const poll = async () => {
      try {
        const response = await fetch(`/api/finish/jobs/${encodeURIComponent(jobId)}`)

        if (!response.ok) {
          throw new Error(`Job status failed: ${response.status}`)
        }

        const body = await response.json()
        const data = body.data || body

        set({ jobStatus: data })

        if (data.status === 'complete') {
          set({ stage: 'complete' })
          log.info('Processing complete', { jobId, outputLufs: data.output_lufs })
          return
        }

        if (data.status === 'failed') {
          set({ stage: 'error', error: data.error || 'Processing failed' })
          return
        }

        // Still processing -- poll again in 1.5s
        setTimeout(poll, 1500)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Job polling failed'
        log.error('Poll failed', error)
        set({ stage: 'error', error: message })
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
    set({
      stage: 'upload',
      file: null,
      fileName: null,
      fileSize: null,
      analysis: null,
      suggestions: [],
      selectedPreset: null,
      selectedPlatform: null,
      macros: { ...DEFAULT_MACROS },
      jobId: null,
      jobStatus: null,
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
