/**
 * Intelligence Slice
 * Phase 15: CIB 2.0 - Time Travel & Analytics
 */

import type { StateCreator } from 'zustand'
import type { ThemeId, OSIdentitySnapshot } from '../campaign.types'

/**
 * Time range modes for intelligence view
 */
export type IntelligenceTimeMode = 'live' | 'range' | 'point'

/**
 * Time range selection
 */
export interface IntelligenceTimeRange {
  mode: IntelligenceTimeMode
  from?: string // ISO timestamp
  to?: string // ISO timestamp
  at?: string // specific point in time (ISO)
}

/**
 * Time series data point
 */
export interface TimeSeriesPoint {
  at: string // ISO timestamp
  value: number
}

/**
 * Relationship time series
 */
export interface RelationshipSeries {
  osA: ThemeId
  osB: ThemeId
  trustSeries: TimeSeriesPoint[]
  tensionSeries: TimeSeriesPoint[]
  synergySeries: TimeSeriesPoint[]
}

/**
 * Evolution time series
 */
export interface EvolutionSeries {
  os: ThemeId
  series: Array<{
    at: string
    confidence: number
    riskTolerance: number
    empathy: number
    verbosity: number
    tempo?: number
  }>
}

/**
 * Metric types for analytics
 */
export type IntelligenceMetric =
  | 'trust'
  | 'tension'
  | 'synergy'
  | 'cohesion'
  | 'confidence'
  | 'risk'
  | 'empathy'
  | 'tempo'

/**
 * Intelligence state
 */
export interface IntelligenceState {
  timeRange: IntelligenceTimeRange
  isLoadingIntelligence: boolean
  selectedOS?: ThemeId | 'all'
  selectedMetric?: IntelligenceMetric
  snapshots: OSIdentitySnapshot[]
  evolutionSeries: EvolutionSeries[]
  relationshipSeries: RelationshipSeries[]
}

/**
 * Intelligence actions
 */
export interface IntelligenceSliceActions {
  intelligence: IntelligenceState
  setTimeRange: (range: IntelligenceTimeRange) => void
  setSelectedOS: (os?: ThemeId | 'all') => void
  setSelectedMetric: (metric?: IntelligenceMetric) => void
  setSnapshots: (snapshots: OSIdentitySnapshot[]) => void
  setEvolutionSeries: (series: EvolutionSeries[]) => void
  setRelationshipSeries: (series: RelationshipSeries[]) => void
  setIsLoadingIntelligence: (loading: boolean) => void
  resetIntelligence: () => void
}

/**
 * Initial intelligence state
 */
const initialIntelligenceState: IntelligenceState = {
  timeRange: {
    mode: 'live',
  },
  isLoadingIntelligence: false,
  selectedOS: 'all',
  selectedMetric: undefined,
  snapshots: [],
  evolutionSeries: [],
  relationshipSeries: [],
}

/**
 * Create intelligence slice
 */
export const createIntelligenceSlice: StateCreator<
  IntelligenceSliceActions,
  [],
  [],
  IntelligenceSliceActions
> = (set) => ({
  intelligence: initialIntelligenceState,

  setTimeRange: (range) =>
    set((state) => ({
      intelligence: {
        ...state.intelligence,
        timeRange: range,
      },
    })),

  setSelectedOS: (os) =>
    set((state) => ({
      intelligence: {
        ...state.intelligence,
        selectedOS: os,
      },
    })),

  setSelectedMetric: (metric) =>
    set((state) => ({
      intelligence: {
        ...state.intelligence,
        selectedMetric: metric,
      },
    })),

  setSnapshots: (snapshots) =>
    set((state) => ({
      intelligence: {
        ...state.intelligence,
        snapshots,
      },
    })),

  setEvolutionSeries: (series) =>
    set((state) => ({
      intelligence: {
        ...state.intelligence,
        evolutionSeries: series,
      },
    })),

  setRelationshipSeries: (series) =>
    set((state) => ({
      intelligence: {
        ...state.intelligence,
        relationshipSeries: series,
      },
    })),

  setIsLoadingIntelligence: (loading) =>
    set((state) => ({
      intelligence: {
        ...state.intelligence,
        isLoadingIntelligence: loading,
      },
    })),

  resetIntelligence: () =>
    set(() => ({
      intelligence: initialIntelligenceState,
    })),
})
