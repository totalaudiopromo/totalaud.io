/**
 * useCommandPalette Hook
 * Programmatically control command palette
 */

'use client'

import { create } from 'zustand'

interface CommandPaletteState {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export const useCommandPaletteStore = create<CommandPaletteState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))

export function useCommandPalette() {
  const store = useCommandPaletteStore()

  return {
    isOpen: store.isOpen,
    open: store.open,
    close: store.close,
    toggle: store.toggle,
  }
}
