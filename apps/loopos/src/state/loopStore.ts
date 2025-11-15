import { create } from 'zustand'
import type { Node } from '@total-audio/loopos-db'

type SyncState = 'idle' | 'syncing' | 'synced' | 'error'

interface LoopStore {
  // State
  nodes: Node[]
  syncState: SyncState
  error: string | null

  // Actions
  setNodes: (nodes: Node[]) => void
  addNode: (node: Node) => void
  updateNode: (id: string, updates: Partial<Node>) => void
  removeNode: (id: string) => void
  setSyncState: (state: SyncState) => void
  setError: (error: string | null) => void

  // Derived getters
  getNodesByStatus: (status: 'upcoming' | 'active' | 'completed') => Node[]
  getNodesByType: (
    type: 'create' | 'promote' | 'analyse' | 'refine'
  ) => Node[]
}

export const useLoopStore = create<LoopStore>((set, get) => ({
  // Initial state
  nodes: [],
  syncState: 'idle',
  error: null,

  // Actions
  setNodes: (nodes) => set({ nodes, syncState: 'synced', error: null }),

  addNode: (node) =>
    set((state) => ({
      nodes: [node, ...state.nodes],
    })),

  updateNode: (id, updates) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, ...updates } : node
      ),
    })),

  removeNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
    })),

  setSyncState: (syncState) => set({ syncState }),

  setError: (error) => set({ error, syncState: 'error' }),

  // Derived getters
  getNodesByStatus: (status) =>
    get().nodes.filter((node) => node.status === status),

  getNodesByType: (type) => get().nodes.filter((node) => node.type === type),
}))
