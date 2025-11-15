/**
 * Meta Slice
 * Manages campaign metadata and persistence state
 */

import type { StateCreator } from 'zustand'
import type { CampaignMeta, ThemeId } from '../campaign.types'
import type { CampaignState } from '../useCampaignState'

export interface MetaSlice {
  meta: CampaignMeta
  isDirty: boolean
  lastSavedAt?: Date
  // Meta operations
  updateCampaignMeta: (updates: Partial<CampaignMeta>) => void
  setTheme: (theme: ThemeId) => void
  markClean: () => void
  markDirty: () => void
}

export const createMetaSlice: StateCreator<
  CampaignState,
  [],
  [],
  MetaSlice
> = (set) => ({
  meta: {
    id: '',
    name: 'Untitled Campaign',
    goal: '',
    currentTheme: 'daw',
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: '',
  },

  isDirty: false,
  lastSavedAt: undefined,

  // Meta operations
  updateCampaignMeta: (updates: Partial<CampaignMeta>) => {
    set((state) => ({
      meta: {
        ...state.meta,
        ...updates,
        updatedAt: new Date(),
      },
      isDirty: true,
    }))
  },

  setTheme: (theme: ThemeId) => {
    set((state) => ({
      meta: {
        ...state.meta,
        currentTheme: theme,
        updatedAt: new Date(),
      },
      isDirty: true,
    }))
  },

  markClean: () => {
    set(() => ({
      isDirty: false,
      lastSavedAt: new Date(),
    }))
  },

  markDirty: () => {
    set(() => ({
      isDirty: true,
    }))
  },
})
