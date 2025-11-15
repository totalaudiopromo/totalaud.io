import { create } from 'zustand'
import type { MomentumState, SequenceProgress } from '@/types'

interface MomentumStore {
  momentum: MomentumState
  sequence: SequenceProgress
  creativeModeEnabled: boolean

  // Actions
  updateMomentum: (momentum: number) => void
  updateSequence: (updates: Partial<SequenceProgress>) => void
  toggleCreativeMode: () => void
}

export const useMomentumStore = create<MomentumStore>((set) => ({
  momentum: {
    current: 0,
    trend: 'stable',
    lastUpdated: new Date(),
  },

  sequence: {
    phase: 'planning',
    completedNodes: [],
    activeNodes: [],
    blockedNodes: [],
  },

  creativeModeEnabled: false,

  updateMomentum: (momentum) =>
    set((state) => {
      const trend =
        momentum > state.momentum.current
          ? 'increasing'
          : momentum < state.momentum.current
            ? 'decreasing'
            : 'stable'

      return {
        momentum: {
          current: momentum,
          trend,
          lastUpdated: new Date(),
        },
      }
    }),

  updateSequence: (updates) =>
    set((state) => ({
      sequence: { ...state.sequence, ...updates },
    })),

  toggleCreativeMode: () =>
    set((state) => ({
      creativeModeEnabled: !state.creativeModeEnabled,
    })),
}))
