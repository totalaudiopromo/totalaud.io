/**
 * Intelligence API Client
 * Wraps all intelligence endpoint calls
 */

const API_BASE = '/api/intelligence'

export interface NavigatorQuestion {
  question: string
}

export interface NavigatorAnswer {
  answer: string
  evidence: unknown[]
  deepLinks: string[]
  recommendedActions: string[]
  confidence: number
}

export interface CorrelationResult {
  correlations: Record<string, { correlation: number; replyRate?: number; openRate?: number }>
  highlights: string[]
  patterns: string[]
  recommendations: string[]
  confidence: number
}

export interface TrajectoryForecast {
  forecast: Record<string, unknown>
  opportunityWindows: Array<{ start: string; end: string; reason: string }>
  riskIndicators: string[]
  confidence: number
}

export interface AutomationPayload {
  action: string
  payload: Record<string, unknown>
}

export interface AutomationResult {
  success: boolean
  result: Record<string, unknown>
  executionTimeMs: number
  error?: string
}

export interface IdentityProfile {
  brandVoice: {
    tone?: string
    themes?: string[]
    style?: string
  }
  creativeProfile: {
    primaryMotifs?: string[]
    emotionalRange?: string
    structuralSignature?: string
  }
  narrativeProfile: unknown
  sceneIdentity: {
    primaryScene?: string
    secondaryScenes?: string[]
    geographicRoots?: string
  }
  microgenreMap: unknown
  epkFragments: {
    oneLiner?: string
    pressAngle?: string
    pitchHook?: string
  }
  bioShort: string
  bioLong: string
}

export interface CoverageFusionData {
  events: unknown[]
  geographicClusters: unknown[]
  temporalDensity: unknown[]
  coverage: unknown
  visualizations: unknown
}

export interface BenchmarkSnapshot {
  snapshotDate: Date
  metrics: unknown
  artistComparisons: unknown[]
  insights: string[]
  topPerformers: unknown[]
  improvementAreas: unknown[]
}

export interface SignalThread {
  threadType: string
  thread: unknown
  events: Array<{
    id: string
    date: Date
    type: string
    title: string
    description: string
    significance: number
  }>
  milestones: Array<{
    id: string
    date: Date
    title: string
    description: string
    impact: string
  }>
  narrativeSummary: string
  insights: string[]
}

export interface ModeRecommendation {
  recommendedMode: string
  insights: string[]
}

// Helper: fetch with graceful handling of missing endpoints (404 → null)
async function fetchAPI<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (res.status === 404) {
    throw new Error('Endpoint not yet available')
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

// API functions
export const intelligenceAPI = {
  // Navigator
  async askNavigator(question: string): Promise<NavigatorAnswer> {
    return fetchAPI(`${API_BASE}/navigator/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    })
  },

  // Correlations
  async getCorrelations(artistSlug: string, windowDays = 90): Promise<CorrelationResult> {
    return fetchAPI(`${API_BASE}/correlations/${artistSlug}?windowDays=${windowDays}`)
  },

  // Trajectory
  async getTrajectory(artistSlug: string, forecastDays = 90): Promise<TrajectoryForecast> {
    return fetchAPI(`${API_BASE}/trajectory/${artistSlug}?forecastDays=${forecastDays}`)
  },

  // Automations
  async runAutomation(action: string, payload: Record<string, unknown>): Promise<AutomationResult> {
    return fetchAPI(`${API_BASE}/automations/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload }),
    })
  },

  // Identity
  async getIdentity(artistSlug: string): Promise<IdentityProfile> {
    return fetchAPI(`${API_BASE}/identity/${artistSlug}`)
  },

  // Coverage Fusion
  async getCoverageFusion(
    artistSlug: string,
    startDate?: string,
    endDate?: string
  ): Promise<CoverageFusionData> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    const query = params.toString() ? `?${params.toString()}` : ''

    return fetchAPI(`${API_BASE}/coverage-fusion/${artistSlug}${query}`)
  },

  // Benchmarks
  async getBenchmarks(workspaceId: string): Promise<BenchmarkSnapshot> {
    return fetchAPI(`${API_BASE}/benchmarks/${workspaceId}`)
  },

  // Signal Threads
  async getSignalThread(artistSlug: string, threadType = 'narrative'): Promise<SignalThread> {
    return fetchAPI(`${API_BASE}/signal-threads/${artistSlug}?threadType=${threadType}`)
  },

  // Modes
  async getModeRecommendation(mode?: string): Promise<ModeRecommendation> {
    const query = mode ? `?mode=${mode}` : ''
    return fetchAPI(`${API_BASE}/modes/recommend${query}`)
  },
}
