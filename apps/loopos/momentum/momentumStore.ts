import { create } from 'zustand'

interface MomentumStore {
  // Momentum value (0-100)
  momentum: number

  // Streak tracking
  currentStreak: number
  longestStreak: number
  lastActionDate: string | null

  // Actions
  gainMomentum: (amount: number) => void
  loseMomentum: (amount: number) => void
  recordAction: () => void
  resetMomentum: () => void

  // Computed
  getMomentumLevel: () => 'Low' | 'Building' | 'Strong' | 'Peak'
  getMomentumColour: () => string
}

export const useMomentumStore = create<MomentumStore>((set, get) => ({
  momentum: 65, // Start with some momentum
  currentStreak: 3,
  longestStreak: 7,
  lastActionDate: new Date().toISOString().split('T')[0],

  gainMomentum: (amount: number) =>
    set((state) => ({
      momentum: Math.min(100, state.momentum + amount),
    })),

  loseMomentum: (amount: number) =>
    set((state) => ({
      momentum: Math.max(0, state.momentum - amount),
    })),

  recordAction: () => {
    const today = new Date().toISOString().split('T')[0]
    const lastAction = get().lastActionDate

    set((state) => {
      // Check if it's a new day
      const isNewDay = lastAction !== today

      // If new day, increment streak or reset
      const newStreak = isNewDay ? state.currentStreak + 1 : state.currentStreak

      return {
        lastActionDate: today,
        currentStreak: newStreak,
        longestStreak: Math.max(state.longestStreak, newStreak),
        momentum: Math.min(100, state.momentum + 5), // Small momentum gain
      }
    })
  },

  resetMomentum: () =>
    set({
      momentum: 0,
      currentStreak: 0,
    }),

  getMomentumLevel: () => {
    const { momentum } = get()
    if (momentum < 25) return 'Low'
    if (momentum < 50) return 'Building'
    if (momentum < 75) return 'Strong'
    return 'Peak'
  },

  getMomentumColour: () => {
    const { momentum } = get()
    if (momentum < 25) return '#737373' // Grey
    if (momentum < 50) return '#F59E0B' // Amber
    if (momentum < 75) return '#3AA9BE' // Cyan
    return '#10B981' // Emerald
  },
}))

// Decay momentum over time (call this on app mount)
export function startMomentumDecay() {
  setInterval(() => {
    const store = useMomentumStore.getState()
    // Decay 0.5 points per minute
    store.loseMomentum(0.5)
  }, 60000) // Every minute
}
