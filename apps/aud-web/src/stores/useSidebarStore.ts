/**
 * Sidebar Store
 *
 * Manages sidebar open/close state and first-visit discoverability.
 * P2 Fix: Added hasSeenSidebar tracking for pulsing indicator.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarStore {
  isOpen: boolean
  /** Whether the user has ever opened the sidebar (for discoverability) */
  hasSeenSidebar: boolean
  toggle: () => void
  open: () => void
  close: () => void
  /** Mark sidebar as seen (stops pulsing indicator) */
  markAsSeen: () => void
}

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      isOpen: false,
      hasSeenSidebar: false,
      toggle: () =>
        set((state) => ({
          isOpen: !state.isOpen,
          // Mark as seen when user opens sidebar for the first time
          hasSeenSidebar: state.hasSeenSidebar || !state.isOpen,
        })),
      open: () => set({ isOpen: true, hasSeenSidebar: true }),
      close: () => set({ isOpen: false }),
      markAsSeen: () => set({ hasSeenSidebar: true }),
    }),
    {
      name: 'ta_sidebar_state',
      partialize: (state) => ({ hasSeenSidebar: state.hasSeenSidebar }),
    }
  )
)
