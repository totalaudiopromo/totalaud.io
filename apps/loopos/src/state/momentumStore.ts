import { create } from 'zustand'
import type { Momentum } from '@total-audio/loopos-db'

type SyncState = 'idle' | 'syncing' | 'synced' | 'error'

interface MomentumStore {
  // State
  momentum: Momentum | null
  syncState: SyncState
  error: string | null

  // Actions
  setMomentum: (momentum: Momentum) => void
  updateMomentumValue: (value: number) => void
  updateStreak: (streak: number) => void
  setSyncState: (state: SyncState) => void
  setError: (error: string | null) => void
}

export const useMomentumStore = create<MomentumStore>((set) => ({
  // Initial state
  momentum: null,
  syncState: 'idle',
  error: null,

  // Actions
  setMomentum: (momentum) => set({ momentum, syncState: 'synced', error: null }),

  updateMomentumValue: (value) =>
    set((state) => ({
      momentum: state.momentum
        ? { ...state.momentum, momentum: value }
        : null,
    })),

  updateStreak: (streak) =>
    set((state) => ({
      momentum: state.momentum ? { ...state.momentum, streak } : null,
    })),

  setSyncState: (syncState) => set({ syncState }),

  setError: (error) => set({ error, syncState: 'error' }),
}))
