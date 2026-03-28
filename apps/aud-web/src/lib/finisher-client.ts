/**
 * Finisher API Client (server-side only)
 *
 * Communicates with the finisher mastering engine API.
 * Used by Next.js API routes to proxy requests, keeping the API key server-side.
 */

import { logger } from './logger'

const log = logger.scope('FinisherClient')

// Types matching finisher API responses

export interface AnalysisResult {
  integrated_lufs: number
  true_peak_dbfs: number
  loudness_range_lu: number
  dynamic_range_db: number
  crest_factor_db: number
  rms_db: number
  stereo_width: number
  mid_side_ratio: number
  correlation: number
  dc_offset: number
  silence_ratio: number
  sample_rate: number
  channels: number
  duration_seconds: number
  spectral_centroid_hz: number
  spectral_rolloff_hz: number
  qc_passed: boolean
  qc_warnings: string[]
  suggestions: Suggestion[]
}

export interface Suggestion {
  category: string
  severity: 'critical' | 'warning' | 'info'
  message: string
  action: string
  metric_name: string | null
  current_value: number | null
  target_value: number | null
}

export interface SuggestResult {
  integrated_lufs: number
  true_peak_dbfs: number
  qc_passed: boolean
  suggestions: Suggestion[]
}

export interface PresetInfo {
  name: string
  description: string
}

export interface ProcessJobResponse {
  job_id: string
  status: 'processing'
}

export interface JobStatus {
  job_id: string
  status: 'processing' | 'complete' | 'failed'
  error?: string
  input_lufs?: number
  output_lufs?: number
  input_true_peak?: number
  output_true_peak?: number
  qc_passed?: boolean
  suggestions?: Suggestion[]
  download_url?: string
}

// Client

const getConfig = () => ({
  apiUrl: process.env.FINISHER_API_URL || 'https://finisher-production.up.railway.app',
  apiKey: process.env.FINISHER_API_KEY || '',
})

function headers(): Record<string, string> {
  const { apiKey } = getConfig()
  const h: Record<string, string> = {}
  if (apiKey) {
    h['X-API-Key'] = apiKey
  }
  return h
}

function baseUrl(): string {
  return getConfig().apiUrl
}

export async function analyzeAudio(file: File | Blob, platform?: string): Promise<AnalysisResult> {
  const formData = new FormData()
  formData.append('file', file)
  if (platform) {
    formData.append('platform', platform)
  }

  const response = await fetch(`${baseUrl()}/analyze`, {
    method: 'POST',
    headers: headers(),
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Analysis failed' }))
    log.error('Analysis failed', undefined, { status: response.status })
    throw new Error(error.detail || `Analysis failed: ${response.status}`)
  }

  return response.json()
}

export async function suggestForAudio(
  file: File | Blob,
  platform?: string
): Promise<SuggestResult> {
  const formData = new FormData()
  formData.append('file', file)
  if (platform) {
    formData.append('platform', platform)
  }

  const response = await fetch(`${baseUrl()}/suggest`, {
    method: 'POST',
    headers: headers(),
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Suggest failed' }))
    throw new Error(error.detail || `Suggest failed: ${response.status}`)
  }

  return response.json()
}

export async function listPresets(): Promise<PresetInfo[]> {
  const response = await fetch(`${baseUrl()}/presets`)

  if (!response.ok) {
    throw new Error(`Failed to list presets: ${response.status}`)
  }

  const data = await response.json()
  return data.presets
}

export async function processAudio(
  file: File | Blob,
  options: {
    loudness?: string
    tone?: string
    energy?: string
    platform?: string
    genre?: string
  }
): Promise<ProcessJobResponse> {
  const formData = new FormData()
  formData.append('file', file)
  if (options.loudness) formData.append('loudness', options.loudness)
  if (options.tone) formData.append('tone', options.tone)
  if (options.energy) formData.append('energy', options.energy)
  if (options.platform) formData.append('platform', options.platform)
  if (options.genre) formData.append('genre', options.genre)

  const response = await fetch(`${baseUrl()}/process`, {
    method: 'POST',
    headers: headers(),
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Process failed' }))
    throw new Error(error.detail || `Process failed: ${response.status}`)
  }

  return response.json()
}

export async function getJobStatus(jobId: string): Promise<JobStatus> {
  const response = await fetch(`${baseUrl()}/jobs/${encodeURIComponent(jobId)}`, {
    headers: headers(),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Job not found' }))
    throw new Error(error.detail || `Job status failed: ${response.status}`)
  }

  return response.json()
}

export async function downloadJob(jobId: string): Promise<Response> {
  const response = await fetch(`${baseUrl()}/jobs/${encodeURIComponent(jobId)}/download`, {
    headers: headers(),
  })

  if (!response.ok) {
    throw new Error(`Download failed: ${response.status}`)
  }

  return response
}
