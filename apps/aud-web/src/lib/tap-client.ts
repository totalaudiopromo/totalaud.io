/**
 * Total Audio Platform (TAP) API Client
 *
 * Local client utility for totalaud.io to communicate with TAP services.
 * Mirrors the @total-audio/api-client SDK interface.
 *
 * Usage:
 *   import { tapClient } from '@/lib/tap-client'
 *   const contacts = await tapClient.intel.enrichContacts([...])
 */

import { logger } from './logger'

const log = logger.scope('TAPClient')

// ============================================================================
// Types (mirrored from @total-audio/api-types)
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

// Intel Types
export interface EnrichContactInput {
  id?: string
  name: string
  email: string
  outlet?: string
  role?: string
  genre_tags?: string[]
}

export interface EnrichedContact {
  id: string
  name: string
  email: string
  outlet?: string | null
  role?: string | null
  genre_tags?: string[] | null
  contactIntelligence?: string
  researchConfidence?: 'High' | 'Medium' | 'Low'
  lastResearched?: string
  errors?: string[]
}

export interface EmailValidationResult {
  email: string
  isValid: boolean
  confidence: number
  checks: {
    syntax: boolean
    domain: boolean
    mx: boolean
    disposable: boolean
    roleAccount: boolean
  }
  classification?: 'safe' | 'risky' | 'invalid'
}

// Pitch Types
export interface GeneratePitchRequest {
  contactId: string
  contact?: {
    name: string
    email?: string
    outlet?: string
  }
  artistName: string
  trackTitle: string
  genre?: string
  trackLink?: string
  releaseDate?: string
  keyHook: string
  tone?: 'casual' | 'professional' | 'enthusiastic'
}

export interface GeneratedPitch {
  id: string
  subject_line: string
  pitch_body: string
  suggested_send_time?: string | null
  contact_name: string
  artist_name: string
  track_title: string
}

export interface PitchAnalysis {
  score: number
  grade: 'excellent' | 'good' | 'needs_work' | 'poor'
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  toneAnalysis: {
    formality: 'too_formal' | 'professional' | 'casual' | 'too_casual'
    enthusiasm: 'high' | 'moderate' | 'low'
    personalisation: 'high' | 'moderate' | 'low'
  }
  lengthAnalysis: {
    wordCount: number
    isOptimal: boolean
    recommendation: string
  }
}

// Tracker Types
export type CampaignStatus = 'planning' | 'active' | 'completed' | 'paused' | 'draft'
export type CampaignPlatform =
  | 'spotify'
  | 'apple_music'
  | 'youtube'
  | 'tiktok'
  | 'radio'
  | 'press'
  | 'social'
export type CampaignTargetType = 'playlist' | 'station' | 'blog' | 'influencer' | 'press'

export interface Campaign {
  id: string
  user_id: string
  name: string
  artist_name?: string | null
  status: CampaignStatus
  platform?: CampaignPlatform | null
  genre?: string | null
  target_type?: CampaignTargetType | null
  notes?: string | null
  start_date?: string | null
  end_date?: string | null
  budget?: number | null
  target_reach?: number | null
  actual_reach?: number | null
  success_rate?: number
  created_at: string
  updated_at: string
}

export interface CampaignWithInsights extends Campaign {
  insights?: {
    performanceScore?: number
    recommendations?: string[]
    benchmarkComparison?: { aboveAverage: boolean; percentile: number }
    predictedOutcome?: { estimatedReach: number; confidence: number }
  }
}

export interface CreateCampaignRequest {
  name: string
  artist_name?: string
  status?: CampaignStatus
  platform?: CampaignPlatform | string // TAP DB validates this
  genre?: string
  target_type?: CampaignTargetType | string // TAP DB validates this
  notes?: string
  start_date?: string
  end_date?: string
  budget?: number
  target_reach?: number
}

export interface CampaignMetrics {
  total_campaigns: number
  active_campaigns: number
  completed_campaigns: number
  total_spend: number
  avg_success_rate: number
}

// ============================================================================
// Error Class
// ============================================================================

export class TotalAudioApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'TotalAudioApiError'
  }

  static fromApiError(error: ApiError, status: number): TotalAudioApiError {
    return new TotalAudioApiError(error.message, status, error.code, error.details)
  }
}

// ============================================================================
// Base Client
// ============================================================================

interface ClientConfig {
  apiKey: string
  baseUrl: string
  timeout?: number
}

class BaseClient {
  protected readonly apiKey: string
  protected readonly baseUrl: string
  protected readonly timeout: number

  constructor(config: ClientConfig) {
    this.apiKey = config.apiKey
    this.baseUrl = config.baseUrl
    this.timeout = config.timeout || 30000
  }

  protected async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      log.debug(`${method} ${path}`, { baseUrl: this.baseUrl })

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })

      const rawData = await response.json()

      if (!response.ok || !rawData.success) {
        const error = rawData.error || {
          code: 'UNKNOWN_ERROR',
          message: `Request failed with status ${response.status}`,
        }
        log.error(`TAP API error: ${error.message}`, undefined, { code: error.code, path })
        throw TotalAudioApiError.fromApiError(error, response.status)
      }

      // Handle both response formats:
      // Some APIs return { success, data: {...} }
      // Some APIs return { success, ...fields } directly
      if ('data' in rawData && rawData.data !== undefined) {
        return rawData.data as T
      }

      // Return raw response without success/error fields
      const { success: _success, error: _error, ...rest } = rawData
      return rest as T
    } catch (error) {
      if (error instanceof TotalAudioApiError) throw error
      if (error instanceof Error && error.name === 'AbortError') {
        throw new TotalAudioApiError('Request timed out', 504, 'TIMEOUT')
      }
      throw new TotalAudioApiError(
        error instanceof Error ? error.message : 'Unknown error',
        500,
        'NETWORK_ERROR'
      )
    } finally {
      clearTimeout(timeoutId)
    }
  }

  protected get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path)
  }

  protected post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('POST', path, body)
  }
}

// ============================================================================
// Intel Client
// ============================================================================

class IntelClient extends BaseClient {
  async enrichContacts(
    contacts: EnrichContactInput[],
    options?: { forceRefresh?: boolean; includeConfidence?: boolean }
  ): Promise<EnrichedContact[]> {
    const response = await this.post<{ enriched: EnrichedContact[] }>('/api/enrich-claude', {
      contacts,
      options,
    })
    return response.enriched
  }

  async enrichContact(contact: EnrichContactInput): Promise<EnrichedContact> {
    const results = await this.enrichContacts([contact])
    return results[0]
  }

  async validateEmails(emails: string[]): Promise<{ results: EmailValidationResult[] }> {
    return this.post<{ results: EmailValidationResult[] }>('/api/validate-emails', { emails })
  }

  async validateEmail(email: string): Promise<EmailValidationResult> {
    const response = await this.validateEmails([email])
    return response.results[0]
  }
}

// ============================================================================
// Pitch Client
// ============================================================================

class PitchClient extends BaseClient {
  async generate(
    request: GeneratePitchRequest
  ): Promise<{ pitchId: string; pitch: GeneratedPitch }> {
    return this.post<{ pitchId: string; pitch: GeneratedPitch }>('/api/pitch/generate', request)
  }

  async analyse(request: {
    pitchBody: string
    subjectLine?: string
    contactType?: string
  }): Promise<PitchAnalysis> {
    const response = await this.post<{ analysis: PitchAnalysis }>('/api/pitch/analyze', request)
    return response.analysis
  }

  // Alias for British English
  async analyze(request: {
    pitchBody: string
    subjectLine?: string
    contactType?: string
  }): Promise<PitchAnalysis> {
    return this.analyse(request)
  }
}

// ============================================================================
// Tracker Client
// ============================================================================

class TrackerClient extends BaseClient {
  async listCampaigns(): Promise<{
    campaigns: CampaignWithInsights[]
    metrics: CampaignMetrics
    patterns: { bestPerformingPlatform?: string; bestPerformingGenre?: string }
  }> {
    return this.get('/api/campaigns')
  }

  async getCampaigns(): Promise<CampaignWithInsights[]> {
    const response = await this.listCampaigns()
    return response.campaigns
  }

  async getMetrics(): Promise<CampaignMetrics> {
    const response = await this.listCampaigns()
    return response.metrics
  }

  async createCampaign(campaign: CreateCampaignRequest): Promise<CampaignWithInsights> {
    return this.post<CampaignWithInsights>('/api/campaigns', campaign)
  }
}

// ============================================================================
// Main Client
// ============================================================================

export interface TotalAudioClientConfig {
  apiKey?: string
  intelApiKey?: string
  pitchApiKey?: string
  trackerApiKey?: string
  intelUrl?: string
  pitchUrl?: string
  trackerUrl?: string
  timeout?: number
}

export class TotalAudioClient {
  public readonly intel: IntelClient
  public readonly pitch: PitchClient
  public readonly tracker: TrackerClient

  private readonly configured: {
    intel: boolean
    pitch: boolean
    tracker: boolean
  }

  constructor(config: TotalAudioClientConfig) {
    const intelKey = config.intelApiKey || config.apiKey || ''
    const pitchKey = config.pitchApiKey || config.apiKey || ''
    const trackerKey = config.trackerApiKey || config.apiKey || ''

    this.intel = new IntelClient({
      apiKey: intelKey,
      baseUrl: config.intelUrl || 'https://intel.totalaudiopromo.com',
      timeout: config.timeout,
    })

    this.pitch = new PitchClient({
      apiKey: pitchKey,
      baseUrl: config.pitchUrl || 'https://pitch.totalaudiopromo.com',
      timeout: config.timeout,
    })

    this.tracker = new TrackerClient({
      apiKey: trackerKey,
      baseUrl: config.trackerUrl || 'https://tracker.totalaudiopromo.com',
      timeout: config.timeout,
    })

    this.configured = {
      intel: !!intelKey,
      pitch: !!pitchKey,
      tracker: !!trackerKey,
    }
  }

  isConfigured(service?: 'intel' | 'pitch' | 'tracker'): boolean {
    if (service) return this.configured[service]
    return Object.values(this.configured).some(Boolean)
  }
}

// ============================================================================
// Singleton Factory
// ============================================================================

let clientInstance: TotalAudioClient | null = null

/**
 * Get or create the TAP client singleton.
 * Uses environment variables for configuration.
 */
export function getTapClient(): TotalAudioClient {
  if (!clientInstance) {
    clientInstance = new TotalAudioClient({
      intelApiKey: process.env.TAP_API_KEY_INTEL || process.env.TAP_API_KEY,
      pitchApiKey: process.env.TAP_API_KEY_PITCH || process.env.TAP_API_KEY,
      trackerApiKey: process.env.TAP_API_KEY_TRACKER || process.env.TAP_API_KEY,
      intelUrl: process.env.TAP_INTEL_URL || process.env.TAP_API_URL,
      pitchUrl: process.env.TAP_PITCH_URL || process.env.TAP_API_URL,
      trackerUrl: process.env.TAP_TRACKER_URL || process.env.TAP_API_URL,
    })
  }
  return clientInstance
}

/**
 * Pre-configured client instance using env vars.
 * Use this for simple imports.
 */
export const tapClient = {
  get intel() {
    return getTapClient().intel
  },
  get pitch() {
    return getTapClient().pitch
  },
  get tracker() {
    return getTapClient().tracker
  },
  isConfigured(service?: 'intel' | 'pitch' | 'tracker') {
    return getTapClient().isConfigured(service)
  },
}
