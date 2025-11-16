/**
 * Loop Slice
 * Manages autonomous loop state
 */

import type { StateCreator } from 'zustand'
import type { AgentLoop, LoopEvent, LoopSuggestion, LoopMetrics, LoopState } from '../campaign.types'
import type { CampaignState } from '../useCampaignState'

export interface LoopSliceActions {
  loops: LoopState

  // Loop operations
  setLoops: (loops: AgentLoop[]) => void
  addLoop: (loop: AgentLoop) => void
  updateLoop: (loopId: string, updates: Partial<AgentLoop>) => void
  removeLoop: (loopId: string) => void

  // Loop event operations
  addLoopEvent: (event: LoopEvent) => void
  clearLoopEvents: () => void

  // Loop suggestion operations
  addLoopSuggestion: (suggestion: LoopSuggestion) => void
  updateLoopSuggestion: (suggestionId: string, status: LoopSuggestion['status']) => void
  removeLoopSuggestion: (suggestionId: string) => void

  // Loop metrics
  setLoopMetrics: (metrics: LoopMetrics) => void
  updateLoopHealthScore: (score: number) => void

  // Utility
  getLoop: (loopId: string) => AgentLoop | undefined
  getLoopsByAgent: (agent: AgentLoop['agent']) => AgentLoop[]
  getActiveLoops: () => AgentLoop[]
}

export const createLoopSlice: StateCreator<
  CampaignState,
  [],
  [],
  LoopSliceActions
> = (set, get) => ({
  loops: {
    loops: [],
    loopEvents: [],
    loopSuggestions: [],
    loopMetrics: null,
    nextLoopRun: null,
    loopHealthScore: 100,
  },

  // Set all loops
  setLoops: (loops: AgentLoop[]) => {
    set((state) => ({
      loops: {
        ...state.loops,
        loops,
        nextLoopRun: loops.length > 0 ? loops.sort((a, b) =>
          new Date(a.nextRun).getTime() - new Date(b.nextRun).getTime()
        )[0].nextRun : null,
      },
    }))
  },

  // Add a new loop
  addLoop: (loop: AgentLoop) => {
    set((state) => ({
      loops: {
        ...state.loops,
        loops: [...state.loops.loops, loop],
      },
    }))
  },

  // Update a loop
  updateLoop: (loopId: string, updates: Partial<AgentLoop>) => {
    set((state) => ({
      loops: {
        ...state.loops,
        loops: state.loops.loops.map((loop) =>
          loop.id === loopId
            ? { ...loop, ...updates, updatedAt: new Date().toISOString() }
            : loop
        ),
      },
    }))
  },

  // Remove a loop
  removeLoop: (loopId: string) => {
    set((state) => ({
      loops: {
        ...state.loops,
        loops: state.loops.loops.filter((loop) => loop.id !== loopId),
        loopEvents: state.loops.loopEvents.filter((event) => event.loopId !== loopId),
      },
    }))
  },

  // Add a loop event
  addLoopEvent: (event: LoopEvent) => {
    set((state) => ({
      loops: {
        ...state.loops,
        loopEvents: [event, ...state.loops.loopEvents].slice(0, 100), // Keep last 100 events
      },
    }))
  },

  // Clear loop events
  clearLoopEvents: () => {
    set((state) => ({
      loops: {
        ...state.loops,
        loopEvents: [],
      },
    }))
  },

  // Add a loop suggestion
  addLoopSuggestion: (suggestion: LoopSuggestion) => {
    set((state) => ({
      loops: {
        ...state.loops,
        loopSuggestions: [...state.loops.loopSuggestions, suggestion],
      },
    }))
  },

  // Update a loop suggestion status
  updateLoopSuggestion: (suggestionId: string, status: LoopSuggestion['status']) => {
    set((state) => ({
      loops: {
        ...state.loops,
        loopSuggestions: state.loops.loopSuggestions.map((suggestion) =>
          suggestion.id === suggestionId ? { ...suggestion, status } : suggestion
        ),
      },
    }))
  },

  // Remove a loop suggestion
  removeLoopSuggestion: (suggestionId: string) => {
    set((state) => ({
      loops: {
        ...state.loops,
        loopSuggestions: state.loops.loopSuggestions.filter(
          (suggestion) => suggestion.id !== suggestionId
        ),
      },
    }))
  },

  // Set loop metrics
  setLoopMetrics: (metrics: LoopMetrics) => {
    set((state) => ({
      loops: {
        ...state.loops,
        loopMetrics: metrics,
        loopHealthScore: metrics.loopHealthScore,
        nextLoopRun: metrics.nextLoopRun,
      },
    }))
  },

  // Update loop health score
  updateLoopHealthScore: (score: number) => {
    set((state) => ({
      loops: {
        ...state.loops,
        loopHealthScore: Math.max(0, Math.min(100, score)),
      },
    }))
  },

  // Get a single loop by ID
  getLoop: (loopId: string) => {
    return get().loops.loops.find((loop) => loop.id === loopId)
  },

  // Get loops by agent
  getLoopsByAgent: (agent: AgentLoop['agent']) => {
    return get().loops.loops.filter((loop) => loop.agent === agent)
  },

  // Get active loops (not disabled)
  getActiveLoops: () => {
    return get().loops.loops.filter((loop) => loop.status !== 'disabled')
  },
})
