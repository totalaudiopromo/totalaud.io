import { create } from 'zustand'
import type { LoopNode, TimelineState } from '@/types'

interface CanvasStore {
  // Nodes
  nodes: LoopNode[]
  selectedNodeId: string | null

  // Timeline
  timeline: TimelineState

  // Actions
  addNode: (node: LoopNode) => void
  updateNode: (id: string, updates: Partial<LoopNode>) => void
  removeNode: (id: string) => void
  selectNode: (id: string | null) => void

  // Timeline Actions
  setZoom: (zoom: number) => void
  setPlayheadPosition: (position: number) => void
  togglePlayback: () => void
  setLoopRegion: (start: number, end: number) => void
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  nodes: [],
  selectedNodeId: null,

  timeline: {
    zoom: 0.1, // 10 pixels per second
    playheadPosition: 0,
    isPlaying: false,
    loopStart: 0,
    loopEnd: 30,
    duration: 60,
  },

  addNode: (node) =>
    set((state) => ({
      nodes: [...state.nodes, node],
    })),

  updateNode: (id, updates) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, ...updates, updatedAt: new Date() } : node
      ),
    })),

  removeNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    })),

  selectNode: (id) =>
    set(() => ({
      selectedNodeId: id,
    })),

  setZoom: (zoom) =>
    set((state) => ({
      timeline: { ...state.timeline, zoom },
    })),

  setPlayheadPosition: (position) =>
    set((state) => ({
      timeline: { ...state.timeline, playheadPosition: position },
    })),

  togglePlayback: () =>
    set((state) => ({
      timeline: { ...state.timeline, isPlaying: !state.timeline.isPlaying },
    })),

  setLoopRegion: (start, end) =>
    set((state) => ({
      timeline: { ...state.timeline, loopStart: start, loopEnd: end },
    })),
}))
