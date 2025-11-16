/**
 * Social Graph Slice
 * Phase 14: OS relationship and identity tracking
 */

import type { StateCreator } from 'zustand'
import type {
  SocialGraphState,
  OSRelationship,
  OSIdentitySnapshot,
  ThemeId,
  SocialSummary,
} from '../campaign.types'

export interface SocialGraphSliceActions {
  socialGraph: SocialGraphState

  // Relationship management
  setRelationships: (relationships: OSRelationship[]) => void
  updateRelationship: (relationship: OSRelationship) => void
  getRelationship: (osA: ThemeId, osB: ThemeId) => OSRelationship | undefined
  getTrustMatrix: () => Record<ThemeId, Record<ThemeId, number>>

  // Snapshot management
  setSnapshots: (snapshots: OSIdentitySnapshot[]) => void
  addSnapshot: (snapshot: OSIdentitySnapshot) => void
  getLatestSnapshot: () => OSIdentitySnapshot | undefined

  // Loading state
  setSocialGraphLoading: (loading: boolean) => void
  setLastSnapshotAt: (timestamp: string) => void

  // Computed properties
  getCohesionScore: () => number
  getSocialSummary: () => SocialSummary
}

const initialSocialGraphState: SocialGraphState = {
  relationships: [],
  snapshots: [],
  isLoadingSocialGraph: false,
  lastSnapshotAt: null,
}

export const createSocialGraphSlice: StateCreator<SocialGraphSliceActions> = (set, get) => ({
  socialGraph: initialSocialGraphState,

  // Relationship management
  setRelationships: (relationships) => {
    set((state) => ({
      socialGraph: {
        ...state.socialGraph,
        relationships,
      },
    }))
  },

  updateRelationship: (relationship) => {
    set((state) => {
      const existing = state.socialGraph.relationships.findIndex(
        (r) =>
          (r.osA === relationship.osA && r.osB === relationship.osB) ||
          (r.osA === relationship.osB && r.osB === relationship.osA)
      )

      const newRelationships = [...state.socialGraph.relationships]

      if (existing >= 0) {
        newRelationships[existing] = relationship
      } else {
        newRelationships.push(relationship)
      }

      return {
        socialGraph: {
          ...state.socialGraph,
          relationships: newRelationships,
        },
      }
    })
  },

  getRelationship: (osA, osB) => {
    const relationships = get().socialGraph.relationships

    // Try both orderings since we store alphabetically
    return relationships.find(
      (r) =>
        (r.osA === osA && r.osB === osB) ||
        (r.osA === osB && r.osB === osA)
    )
  },

  getTrustMatrix: () => {
    const relationships = get().socialGraph.relationships
    const allOSs: ThemeId[] = ['ascii', 'xp', 'aqua', 'daw', 'analogue']

    const matrix: Record<ThemeId, Record<ThemeId, number>> = {} as any

    // Initialize matrix
    allOSs.forEach((osA) => {
      matrix[osA] = {} as any
      allOSs.forEach((osB) => {
        if (osA === osB) {
          matrix[osA][osB] = 1 // Self-trust is 1
        } else {
          matrix[osA][osB] = 0 // Default to 0
        }
      })
    })

    // Fill from relationships
    relationships.forEach((rel) => {
      matrix[rel.osA][rel.osB] = rel.trust
      matrix[rel.osB][rel.osA] = rel.trust // Symmetric
    })

    return matrix
  },

  // Snapshot management
  setSnapshots: (snapshots) => {
    set((state) => ({
      socialGraph: {
        ...state.socialGraph,
        snapshots,
      },
    }))
  },

  addSnapshot: (snapshot) => {
    set((state) => ({
      socialGraph: {
        ...state.socialGraph,
        snapshots: [...state.socialGraph.snapshots, snapshot],
        lastSnapshotAt: snapshot.takenAt,
      },
    }))
  },

  getLatestSnapshot: () => {
    const snapshots = get().socialGraph.snapshots
    if (snapshots.length === 0) return undefined

    return snapshots.reduce((latest, current) =>
      new Date(current.takenAt) > new Date(latest.takenAt) ? current : latest
    )
  },

  // Loading state
  setSocialGraphLoading: (loading) => {
    set((state) => ({
      socialGraph: {
        ...state.socialGraph,
        isLoadingSocialGraph: loading,
      },
    }))
  },

  setLastSnapshotAt: (timestamp) => {
    set((state) => ({
      socialGraph: {
        ...state.socialGraph,
        lastSnapshotAt: timestamp,
      },
    }))
  },

  // Computed properties
  getCohesionScore: () => {
    const relationships = get().socialGraph.relationships
    if (relationships.length === 0) return 1

    const avgTension =
      relationships.reduce((sum, rel) => sum + rel.tension, 0) / relationships.length

    return Math.max(0, Math.min(1, 1 - avgTension))
  },

  getSocialSummary: () => {
    const relationships = get().socialGraph.relationships
    const allOSs: ThemeId[] = ['ascii', 'xp', 'aqua', 'daw', 'analogue']

    if (relationships.length === 0) {
      return {
        leaderOS: undefined,
        supportOS: [],
        rebelOS: [],
        cohesionScore: 1,
      }
    }

    // Calculate scores for each OS
    const osScores: Record<ThemeId, { leadership: number; tension: number }> = {} as any

    allOSs.forEach((os) => {
      const relatedToOS = relationships.filter((r) => r.osA === os || r.osB === os)

      if (relatedToOS.length === 0) {
        osScores[os] = { leadership: 0, tension: 0 }
        return
      }

      const avgTrust =
        relatedToOS.reduce((sum, r) => sum + r.trust, 0) / relatedToOS.length
      const avgSynergy =
        relatedToOS.reduce((sum, r) => sum + r.synergy, 0) / relatedToOS.length
      const avgTension =
        relatedToOS.reduce((sum, r) => sum + r.tension, 0) / relatedToOS.length

      // Leadership score = high trust + synergy, low tension
      const leadership = avgTrust + avgSynergy - avgTension

      osScores[os] = { leadership, tension: avgTension }
    })

    // Find leader (highest leadership score)
    let leaderOS: ThemeId | undefined
    let maxLeadership = -Infinity

    allOSs.forEach((os) => {
      if (osScores[os].leadership > maxLeadership) {
        maxLeadership = osScores[os].leadership
        leaderOS = os
      }
    })

    // Support OSs: moderate leadership, low tension
    const supportOS = allOSs.filter(
      (os) =>
        os !== leaderOS &&
        osScores[os].leadership > 0.2 &&
        osScores[os].tension < 0.5
    )

    // Rebel OSs: high average tension
    const rebelOS = allOSs.filter(
      (os) => os !== leaderOS && osScores[os].tension > 0.5
    )

    return {
      leaderOS,
      supportOS,
      rebelOS,
      cohesionScore: get().getCohesionScore(),
    }
  },
})
