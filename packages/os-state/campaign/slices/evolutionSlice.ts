/**
 * Evolution Slice
 * Phase 13A: OS personality drift over time
 */

import type { StateCreator } from 'zustand'
import type {
  EvolutionState,
  EvolvedOSProfile,
  OSEvolutionEvent,
  ThemeId,
  EvolutionEventType,
} from '../campaign.types'

export interface EvolutionSliceActions {
  evolution: EvolutionState

  // Profile management
  loadEvolutionProfiles: (userId: string, campaignId?: string) => Promise<void>
  getOSProfile: (os: ThemeId) => EvolvedOSProfile | undefined
  setEvolutionProfiles: (profiles: EvolvedOSProfile[]) => void
  resetEvolution: (os: ThemeId, campaignId?: string) => Promise<void>

  // Event management
  applyEvolutionDelta: (
    os: ThemeId,
    eventType: EvolutionEventType,
    meta?: Record<string, any>
  ) => Promise<void>
  addEvolutionEvent: (event: OSEvolutionEvent) => void
  setEvolutionEvents: (events: OSEvolutionEvent[]) => void

  // Loading state
  setEvolutionLoading: (loading: boolean) => void
  setLastEvolutionEventAt: (timestamp: string) => void

  // Getters
  getEvolutionEvents: (os?: ThemeId, limit?: number) => OSEvolutionEvent[]
  hasSignificantDrift: (os: ThemeId) => boolean
}

const initialEvolutionState: EvolutionState = {
  profiles: [],
  events: [],
  isLoadingProfiles: false,
  lastEvolutionEventAt: null,
}

export const createEvolutionSlice: StateCreator<EvolutionSliceActions> = (set, get) => ({
  evolution: initialEvolutionState,

  // Profile management
  loadEvolutionProfiles: async (userId: string, campaignId?: string) => {
    set((state) => ({
      evolution: {
        ...state.evolution,
        isLoadingProfiles: true,
      },
    }))

    try {
      // Lazy load evolution engine
      const { getEvolutionProfile } = await import('@totalaud/agents/evolution')

      const osIds: ThemeId[] = ['ascii', 'xp', 'aqua', 'daw', 'analogue']
      const profiles: EvolvedOSProfile[] = []

      for (const os of osIds) {
        const profile = await getEvolutionProfile(userId, os, campaignId)
        if (profile) {
          // Map to EvolvedOSProfile type
          profiles.push({
            id: crypto.randomUUID(),
            userId,
            campaignId: campaignId || null,
            os: os as ThemeId,
            confidenceLevel: profile.confidenceLevel,
            verbosity: profile.verbosity,
            riskTolerance: profile.riskTolerance,
            empathyLevel: profile.empathyLevel,
            emotionalBias: profile.emotionalBias,
            tempoPreference: profile.tempoPreference,
            driftHistory: [],
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          })
        }
      }

      set((state) => ({
        evolution: {
          ...state.evolution,
          profiles,
          isLoadingProfiles: false,
        },
      }))
    } catch (error) {
      console.error('[EvolutionSlice] Failed to load profiles:', error)
      set((state) => ({
        evolution: {
          ...state.evolution,
          isLoadingProfiles: false,
        },
      }))
    }
  },

  getOSProfile: (os: ThemeId) => {
    return get().evolution.profiles.find((profile) => profile.os === os)
  },

  setEvolutionProfiles: (profiles) => {
    set((state) => ({
      evolution: {
        ...state.evolution,
        profiles,
      },
    }))
  },

  resetEvolution: async (os: ThemeId, campaignId?: string) => {
    try {
      // Lazy load evolution engine
      const { resetEvolutionProfile } = await import('@totalaud/agents/evolution')

      // Get user ID from state (assuming it's available)
      const userId = get().evolution.profiles[0]?.userId
      if (!userId) {
        console.error('[EvolutionSlice] No user ID available for reset')
        return
      }

      const success = await resetEvolutionProfile(userId, os, campaignId)
      if (success) {
        // Reload profiles
        await get().loadEvolutionProfiles(userId, campaignId)
      }
    } catch (error) {
      console.error('[EvolutionSlice] Failed to reset evolution:', error)
    }
  },

  // Event management
  applyEvolutionDelta: async (os: ThemeId, eventType: EvolutionEventType, meta?: Record<string, any>) => {
    try {
      // Lazy load evolution engine
      const { processEvolutionEvent } = await import('@totalaud/agents/evolution')

      // Get user ID and campaign ID from current profile
      const profile = get().getOSProfile(os)
      if (!profile) {
        console.error('[EvolutionSlice] No profile found for OS:', os)
        return
      }

      const event = {
        type: eventType,
        os,
        meta,
        timestamp: new Date().toISOString(),
      }

      const updatedProfile = await processEvolutionEvent(
        event,
        profile.userId,
        profile.campaignId || undefined
      )

      if (updatedProfile) {
        // Update profile in state
        set((state) => ({
          evolution: {
            ...state.evolution,
            profiles: state.evolution.profiles.map((p) =>
              p.os === os
                ? {
                    ...p,
                    confidenceLevel: updatedProfile.confidenceLevel,
                    verbosity: updatedProfile.verbosity,
                    riskTolerance: updatedProfile.riskTolerance,
                    empathyLevel: updatedProfile.empathyLevel,
                    emotionalBias: updatedProfile.emotionalBias,
                    tempoPreference: updatedProfile.tempoPreference,
                    updatedAt: new Date().toISOString(),
                  }
                : p
            ),
            lastEvolutionEventAt: new Date().toISOString(),
          },
        }))
      }
    } catch (error) {
      console.error('[EvolutionSlice] Failed to apply delta:', error)
    }
  },

  addEvolutionEvent: (event) => {
    set((state) => ({
      evolution: {
        ...state.evolution,
        events: [...state.evolution.events, event],
      },
    }))
  },

  setEvolutionEvents: (events) => {
    set((state) => ({
      evolution: {
        ...state.evolution,
        events,
      },
    }))
  },

  // Loading state
  setEvolutionLoading: (loading) => {
    set((state) => ({
      evolution: {
        ...state.evolution,
        isLoadingProfiles: loading,
      },
    }))
  },

  setLastEvolutionEventAt: (timestamp) => {
    set((state) => ({
      evolution: {
        ...state.evolution,
        lastEvolutionEventAt: timestamp,
      },
    }))
  },

  // Getters
  getEvolutionEvents: (os?: ThemeId, limit: number = 50) => {
    const events = get().evolution.events
    if (!os) {
      return events.slice(-limit)
    }
    return events.filter((event) => event.os === os).slice(-limit)
  },

  hasSignificantDrift: (os: ThemeId) => {
    const profile = get().getOSProfile(os)
    if (!profile) return false

    const SIGNIFICANT_DELTA = 0.1

    // Check if any parameter has drifted significantly from base (0.5)
    const BASE = 0.5
    return (
      Math.abs(profile.confidenceLevel - BASE) > SIGNIFICANT_DELTA ||
      Math.abs(profile.verbosity - BASE) > SIGNIFICANT_DELTA ||
      Math.abs(profile.riskTolerance - BASE) > SIGNIFICANT_DELTA ||
      Math.abs(profile.empathyLevel - BASE) > SIGNIFICANT_DELTA
    )
  },
})
