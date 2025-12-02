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

// API functions
export const intelligenceAPI = {
  // Navigator
  async askNavigator(question: string): Promise<NavigatorAnswer> {
    const res = await fetch(`${API_BASE}/navigator/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    })
    if (!res.ok) throw new Error('Navigator request failed')
    return res.json()
  },

  // Correlations
  async getCorrelations(artistSlug: string, windowDays = 90): Promise<CorrelationResult> {
    const res = await fetch(`${API_BASE}/correlations/${artistSlug}?windowDays=${windowDays}`)
    if (!res.ok) throw new Error('Correlations request failed')
    return res.json()
  },

  // Trajectory
  async getTrajectory(artistSlug: string, forecastDays = 90): Promise<TrajectoryForecast> {
    const res = await fetch(`${API_BASE}/trajectory/${artistSlug}?forecastDays=${forecastDays}`)
    if (!res.ok) throw new Error('Trajectory request failed')
    return res.json()
  },

  // Automations
  async runAutomation(action: string, payload: Record<string, unknown>): Promise<AutomationResult> {
    const res = await fetch(`${API_BASE}/automations/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload }),
    })
    if (!res.ok) throw new Error('Automation request failed')
    return res.json()
  },

  // Identity
  async getIdentity(artistSlug: string): Promise<IdentityProfile> {
    const res = await fetch(`${API_BASE}/identity/${artistSlug}`)
    if (!res.ok) throw new Error('Identity request failed')
    return res.json()
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

    const res = await fetch(`${API_BASE}/coverage-fusion/${artistSlug}${query}`)
    if (!res.ok) throw new Error('Coverage Fusion request failed')
    return res.json()
  },

  // Benchmarks
  async getBenchmarks(workspaceId: string): Promise<BenchmarkSnapshot> {
    const res = await fetch(`${API_BASE}/benchmarks/${workspaceId}`)
    if (!res.ok) throw new Error('Benchmarks request failed')
    return res.json()
  },

  // Signal Threads
  async getSignalThread(artistSlug: string, threadType = 'narrative'): Promise<SignalThread> {
    const res = await fetch(`${API_BASE}/signal-threads/${artistSlug}?threadType=${threadType}`)
    if (!res.ok) throw new Error('Signal Thread request failed')
    return res.json()
  },

  // Modes
  async getModeRecommendation(mode?: string): Promise<ModeRecommendation> {
    const query = mode ? `?mode=${mode}` : ''
    const res = await fetch(`${API_BASE}/modes/recommend${query}`)
    if (!res.ok) throw new Error('Mode recommendation request failed')
    return res.json()
  },
}
