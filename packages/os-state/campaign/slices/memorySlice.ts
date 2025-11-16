/**
 * Memory Slice
 * Long-term OS and agent memory state management
 */

import type { StateCreator } from 'zustand'
import type { OSMemory, MemoryLink, MemoryState, ThemeId } from '../campaign.types'
import type { AgentName } from '../campaign.types'

export interface MemorySliceActions {
  memory: MemoryState

  // Memory management
  setMemories: (memories: OSMemory[]) => void
  addMemory: (memory: OSMemory) => void
  updateMemory: (memoryId: string, updates: Partial<OSMemory>) => void
  removeMemory: (memoryId: string) => void

  // Memory links
  addMemoryLink: (link: MemoryLink) => void
  setMemoryLinks: (links: MemoryLink[]) => void
  removeMemoryLink: (linkId: string) => void

  // Loading state
  setMemoryLoading: (loading: boolean) => void

  // Batch operations
  loadMemoriesForCampaign: (campaignId: string) => void
  loadMemoriesForEntity: (entityType: string, entityId: string) => void
  clearMemoryState: () => void

  // Getters
  getMemory: (memoryId: string) => OSMemory | undefined
  getMemoriesByOS: (os: ThemeId) => OSMemory[]
  getMemoriesByAgent: (agent: AgentName) => OSMemory[]
  getMemoriesForEntity: (entityType: string, entityId: string) => OSMemory[]
  getRecentMemories: (limit?: number) => OSMemory[]
  getImportantMemories: (minImportance?: number) => OSMemory[]
}

const initialMemoryState: MemoryState = {
  memories: [],
  memoryLinks: [],
  isLoadingMemories: false,
}

export const createMemorySlice: StateCreator<MemorySliceActions> = (set, get) => ({
  memory: initialMemoryState,

  // Memory management
  setMemories: (memories) => {
    set((state) => ({
      memory: {
        ...state.memory,
        memories,
      },
    }))
  },

  addMemory: (memory) => {
    set((state) => ({
      memory: {
        ...state.memory,
        memories: [memory, ...state.memory.memories],
      },
    }))
  },

  updateMemory: (memoryId, updates) => {
    set((state) => ({
      memory: {
        ...state.memory,
        memories: state.memory.memories.map((memory) =>
          memory.id === memoryId ? { ...memory, ...updates } : memory
        ),
      },
    }))
  },

  removeMemory: (memoryId) => {
    set((state) => ({
      memory: {
        ...state.memory,
        memories: state.memory.memories.filter((memory) => memory.id !== memoryId),
        // Also remove associated links
        memoryLinks: state.memory.memoryLinks.filter((link) => link.memoryId !== memoryId),
      },
    }))
  },

  // Memory links
  addMemoryLink: (link) => {
    set((state) => ({
      memory: {
        ...state.memory,
        memoryLinks: [...state.memory.memoryLinks, link],
      },
    }))
  },

  setMemoryLinks: (links) => {
    set((state) => ({
      memory: {
        ...state.memory,
        memoryLinks: links,
      },
    }))
  },

  removeMemoryLink: (linkId) => {
    set((state) => ({
      memory: {
        ...state.memory,
        memoryLinks: state.memory.memoryLinks.filter((link) => link.id !== linkId),
      },
    }))
  },

  // Loading state
  setMemoryLoading: (loading) => {
    set((state) => ({
      memory: {
        ...state.memory,
        isLoadingMemories: loading,
      },
    }))
  },

  // Batch operations
  loadMemoriesForCampaign: async (campaignId) => {
    // This would typically call an API
    // For now, it's a placeholder that components can override
    set((state) => ({
      memory: {
        ...state.memory,
        isLoadingMemories: true,
      },
    }))
  },

  loadMemoriesForEntity: async (entityType, entityId) => {
    // This would typically call an API
    set((state) => ({
      memory: {
        ...state.memory,
        isLoadingMemories: true,
      },
    }))
  },

  clearMemoryState: () => {
    set(() => ({
      memory: initialMemoryState,
    }))
  },

  // Getters
  getMemory: (memoryId) => {
    return get().memory.memories.find((memory) => memory.id === memoryId)
  },

  getMemoriesByOS: (os) => {
    return get()
      .memory.memories.filter((memory) => memory.os === os)
      .sort((a, b) => b.importance - a.importance)
  },

  getMemoriesByAgent: (agent) => {
    return get()
      .memory.memories.filter((memory) => memory.agent === agent)
      .sort((a, b) => b.importance - a.importance)
  },

  getMemoriesForEntity: (entityType, entityId) => {
    const links = get().memory.memoryLinks.filter(
      (link) => link.entityType === entityType && link.entityId === entityId
    )

    const memoryIds = new Set(links.map((link) => link.memoryId))

    return get()
      .memory.memories.filter((memory) => memoryIds.has(memory.id))
      .sort((a, b) => b.importance - a.importance)
  },

  getRecentMemories: (limit = 20) => {
    return get()
      .memory.memories.slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
  },

  getImportantMemories: (minImportance = 4) => {
    return get()
      .memory.memories.filter((memory) => memory.importance >= minImportance)
      .sort((a, b) => b.importance - a.importance)
  },
})
